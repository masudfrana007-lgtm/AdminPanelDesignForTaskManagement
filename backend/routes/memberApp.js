import express from "express";
import { pool } from "../db.js";
import { memberAuth } from "../middleware/memberAuth.js";

const router = express.Router();

/**
 * GET /member/me
 * Returns logged in member profile
 */
router.get("/me", memberAuth, async (req, res) => {
  try {
    const r = await pool.query(
      `
      SELECT 
        m.id,
        m.short_id,
        m.nickname,
        m.email,
        m.phone,
        m.ranking,
        m.withdraw_privilege,
        u.short_id AS sponsor_short_id,

        COALESCE(w.balance, 0)::numeric(12,2)        AS balance,
        COALESCE(w.locked_balance, 0)::numeric(12,2) AS locked_balance
      FROM members m
      JOIN users u ON u.id = m.sponsor_id
      LEFT JOIN wallets w ON w.member_id = m.id
      WHERE m.id = $1
      `,
      [req.member.member_id]
    );

    res.json(r.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /member/active-set
 */
router.get("/active-set", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const sponsorRes = await pool.query(
      `
      SELECT u.short_id AS sponsor_short_id
      FROM members m
      LEFT JOIN users u ON u.id = m.sponsor_id
      WHERE m.id = $1
      `,
      [memberId]
    );

    const sponsor_short_id = sponsorRes.rows[0]?.sponsor_short_id || null;

    const msRes = await pool.query(
      `
      SELECT *
      FROM member_sets
      WHERE member_id = $1 AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      `,
      [memberId]
    );

    const ms = msRes.rows[0];
    if (!ms) {
      return res.json({ active: false, message: "No active set assigned" });
    }

    const currentIndex = Number(ms.current_task_index || 0);

    // totals + set amount
    const totalsRes = await pool.query(
      `
      SELECT 
        COUNT(st.task_id)::int AS total_tasks,
        COALESCE(SUM(t.price), 0)::numeric(12,2) AS set_amount
      FROM set_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.set_id = $1
      `,
      [ms.set_id]
    );

    const total_tasks = totalsRes.rows[0]?.total_tasks || 0;
    const set_amount = totalsRes.rows[0]?.set_amount || "0.00";

    // ✅ get ALL tasks of this set (ordered)
    const allTasksRes = await pool.query(
      `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.image_url,
        t.quantity,
        t.rate,
        t.commission_rate,
        t.price
      FROM set_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.set_id = $1
      ORDER BY st.id ASC
      `,
      [ms.set_id]
    );

    const tasks = allTasksRes.rows || [];
    const current_task = tasks[currentIndex] || null;

    const setRes = await pool.query(
      `
      SELECT id, name, max_tasks, created_at
      FROM sets
      WHERE id = $1
      `,
      [ms.set_id]
    );

    res.json({
      active: true,
      sponsor_short_id,
      assignment: {
        id: ms.id,
        status: ms.status,
        current_task_index: ms.current_task_index,
        created_at: ms.created_at,
        updated_at: ms.updated_at,
      },
      set: setRes.rows[0] || null,

      total_tasks,
      set_amount,

      // ✅ IMPORTANT: full tasks list for next/previous
      tasks,

      // keep for compatibility
      last_completed_task_number: currentIndex,
      current_task,
      current_task_amount: current_task?.price ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /member/complete-task
 */
router.post("/complete-task", memberAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.member.member_id;

    await client.query("BEGIN");

    const msRes = await client.query(
      `
      SELECT *
      FROM member_sets
      WHERE member_id = $1 AND status = 'active'
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
      `,
      [memberId]
    );

    const ms = msRes.rows[0];
    if (!ms) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No active set" });
    }

    const totalsRes = await client.query(
      `
      SELECT COUNT(*)::int AS total_tasks
      FROM set_tasks
      WHERE set_id = $1
      `,
      [ms.set_id]
    );

    const totalTasks = totalsRes.rows[0]?.total_tasks || 0;
    if (totalTasks === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This set has no tasks" });
    }

    const currentIndex = Number(ms.current_task_index || 0);
    if (currentIndex >= totalTasks) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Set already completed" });
    }

    const taskRes = await client.query(
      `
      SELECT t.id, t.price, t.commission_rate
      FROM set_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.set_id = $1
      ORDER BY st.id ASC
      OFFSET $2
      LIMIT 1
      `,
      [ms.set_id, currentIndex]
    );

    const t = taskRes.rows[0];
    if (!t) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No current task" });
    }

    const commissionAmount = Number(t.price) * (Number(t.commission_rate) / 100);

    // 1) log task completion
    const histRes = await client.query(
      `
      INSERT INTO member_task_history (member_id, member_set_id, set_id, task_id, commission_amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [memberId, ms.id, ms.set_id, t.id, commissionAmount]
    );

    const historyId = histRes.rows[0].id;

    // 2) ensure wallet exists
    await client.query(
      `INSERT INTO wallets(member_id) VALUES($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    // 3) ledger insert (prevents double credit if API called twice)
    const led = await client.query(
      `
      INSERT INTO wallet_ledger (member_id, type, direction, amount, ref_type, ref_id, note)
      VALUES ($1, 'commission', 'credit', $2, 'task', $3, 'Task commission')
      ON CONFLICT (ref_type, ref_id) DO NOTHING
      RETURNING id
      `,
      [memberId, commissionAmount, historyId]
    );

    // 4) only credit wallet if ledger row was inserted
    if (led.rowCount > 0) {
      await client.query(
        `
        UPDATE wallets
        SET balance = balance + $1,
            updated_at = now()
        WHERE member_id = $2
        `,
        [commissionAmount, memberId]
      );
    }

    // progress forward
    const nextIndex = currentIndex + 1;

    if (nextIndex >= totalTasks) {
      const done = await client.query(
        `
        UPDATE member_sets
        SET status = 'completed',
            current_task_index = $2,
            updated_at = now()
        WHERE id = $1
        RETURNING *
        `,
        [ms.id, totalTasks]
      );

      await client.query("COMMIT");
      return res.json({
        message: "Set completed",
        assignment: done.rows[0],
        logged_task_id: t.id,
        commission_amount: commissionAmount,
      });
    }

    const upd = await client.query(
      `
      UPDATE member_sets
      SET current_task_index = $2,
          updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
      [ms.id, nextIndex]
    );

    await client.query("COMMIT");
    res.json({
      message: "Task completed",
      assignment: upd.rows[0],
      logged_task_id: t.id,
      commission_amount: commissionAmount,
    });
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});


/**
 * GET /member/history
 * Returns completed sets
 */
router.get("/history", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const r = await pool.query(
      `
      SELECT 
        ms.id,
        ms.created_at,
        ms.updated_at,
        s.name AS set_name,
        COUNT(st.task_id)::int AS total_tasks,
        COALESCE(SUM(t.price), 0)::numeric(12,2) AS set_amount
      FROM member_sets ms
      JOIN sets s ON s.id = ms.set_id
      LEFT JOIN set_tasks st ON st.set_id = s.id
      LEFT JOIN tasks t ON t.id = st.task_id
      WHERE ms.member_id = $1
        AND ms.status = 'completed'
      GROUP BY ms.id, s.name
      ORDER BY ms.updated_at DESC
      `,
      [memberId]
    );

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /member/history-summary
 * Today = last 24 hours
 * Week  = last 7 days
 */
router.get("/history-summary", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const q = `
      WITH w AS (
        SELECT
          now() - interval '24 hours' AS since_24h,
          now() - interval '7 days'  AS since_7d
      )
      SELECT
        /* LAST 24 HOURS */
        COUNT(DISTINCT CASE WHEN mth.created_at >= w.since_24h THEN mth.member_set_id END)::int AS today_sets,
        COUNT(CASE WHEN mth.created_at >= w.since_24h THEN mth.id END)::int AS today_tasks,
        COALESCE(SUM(CASE WHEN mth.created_at >= w.since_24h THEN mth.commission_amount END), 0)::numeric(12,2) AS today_commission,

        /* LAST 7 DAYS */
        COUNT(DISTINCT CASE WHEN mth.created_at >= w.since_7d THEN mth.member_set_id END)::int AS week_sets,
        COUNT(CASE WHEN mth.created_at >= w.since_7d THEN mth.id END)::int AS week_tasks,
        COALESCE(SUM(CASE WHEN mth.created_at >= w.since_7d THEN mth.commission_amount END), 0)::numeric(12,2) AS week_commission,

        /* LIFETIME */
        COUNT(DISTINCT mth.member_set_id)::int AS lifetime_sets,
        COUNT(mth.id)::int AS lifetime_tasks,
        COALESCE(SUM(mth.commission_amount), 0)::numeric(12,2) AS lifetime_commission
      FROM member_task_history mth
      CROSS JOIN w
      WHERE mth.member_id = $1
    `;

    const r = await pool.query(q, [memberId]);

    // In case there are no rows at all yet
    res.json(
      r.rows[0] || {
        today_sets: 0,
        today_tasks: 0,
        today_commission: "0.00",
        week_sets: 0,
        week_tasks: 0,
        week_commission: "0.00",
        lifetime_sets: 0,
        lifetime_tasks: 0,
        lifetime_commission: "0.00",
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// MEMBER: create deposit request
router.post("/deposits", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const amount = Number(req.body.amount || 0);
    const method = String(req.body.method || "").trim();
    const tx_ref = String(req.body.tx_ref || "").trim();
    const proof_url = String(req.body.proof_url || "").trim();

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (!method) return res.status(400).json({ message: "Method required" });

    const m = await pool.query(`SELECT approval_status FROM members WHERE id=$1`, [memberId]);
    if (!m.rowCount) return res.status(404).json({ message: "Member not found" });
    if (m.rows[0].approval_status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    const r = await pool.query(
      `INSERT INTO deposits (member_id, amount, method, tx_ref, proof_url)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [memberId, amount, method, tx_ref || null, proof_url || null]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// MEMBER: list my deposits
router.get("/deposits", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const r = await pool.query(
      `SELECT id, amount, method, tx_ref, proof_url, status, admin_note, created_at, reviewed_at
       FROM deposits
       WHERE member_id = $1
       ORDER BY id DESC`,
      [memberId]
    );

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// MEMBER: create withdrawal request (locks money immediately)
router.post("/withdrawals", memberAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const memberId = req.member.member_id;

    const amount = Number(req.body.amount || 0);
    const method = String(req.body.method || "").trim();
    const account_details = String(req.body.account_details || "").trim();

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (!method) return res.status(400).json({ message: "Method required" });
    if (!account_details) return res.status(400).json({ message: "Account details required" });

    const m = await pool.query(
      `SELECT approval_status, withdraw_privilege FROM members WHERE id=$1`,
      [memberId]
    );
    if (!m.rowCount) return res.status(404).json({ message: "Member not found" });
    if (m.rows[0].approval_status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }
    if (!m.rows[0].withdraw_privilege) {
      return res.status(403).json({ message: "Withdraw not allowed" });
    }

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO wallets(member_id) VALUES($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [memberId]
    );

    const w = await client.query(
      `SELECT balance, locked_balance FROM wallets WHERE member_id=$1 FOR UPDATE`,
      [memberId]
    );

    const bal = Number(w.rows[0].balance || 0);
    if (bal < amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient balance" });
    }

    await client.query(
      `UPDATE wallets
       SET balance = balance - $1,
           locked_balance = locked_balance + $1,
           updated_at = now()
       WHERE member_id = $2`,
      [amount, memberId]
    );

    const wd = await client.query(
      `INSERT INTO withdrawals (member_id, amount, method, account_details)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [memberId, amount, method, account_details]
    );

    await client.query("COMMIT");
    res.status(201).json(wd.rows[0]);
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

// MEMBER: list my withdrawals
router.get("/withdrawals", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const r = await pool.query(
      `SELECT id, amount, method, account_details, status, admin_note, created_at, reviewed_at
       FROM withdrawals
       WHERE member_id = $1
       ORDER BY id DESC`,
      [memberId]
    );

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
