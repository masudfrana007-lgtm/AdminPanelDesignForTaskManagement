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
        u.short_id AS sponsor_short_id
      FROM members m
      JOIN users u ON u.id = m.sponsor_id
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

    const currentIndex = Number(ms.current_task_index || 0);

    const currentTaskRes = await pool.query(
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
      OFFSET $2
      LIMIT 1
      `,
      [ms.set_id, currentIndex]
    );

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
      last_completed_task_number: currentIndex,
      current_task: currentTaskRes.rows[0] || null,
      current_task_amount: currentTaskRes.rows[0]?.price ?? null,
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
  try {
    const memberId = req.member.member_id;

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
    if (!ms) return res.status(400).json({ message: "No active set" });

    const totalsRes = await pool.query(
      `
      SELECT COUNT(*)::int AS total_tasks
      FROM set_tasks
      WHERE set_id = $1
      `,
      [ms.set_id]
    );

    const totalTasks = totalsRes.rows[0]?.total_tasks || 0;

    if (totalTasks === 0) {
      return res.status(400).json({ message: "This set has no tasks" });
    }

    // ✅ current task index BEFORE increment
    const currentIndex = Number(ms.current_task_index || 0);

    // ✅ guard: already beyond last task
    if (currentIndex >= totalTasks) {
      return res.status(400).json({ message: "Set already completed" });
    }

    // ✅ fetch the task that is being completed right now
    const taskRes = await pool.query(
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
    if (!t) return res.status(400).json({ message: "No current task" });

    const commissionAmount =
      Number(t.price) * (Number(t.commission_rate) / 100);

    // ✅ log this task completion (must have member_task_history table)
    await pool.query(
      `
      INSERT INTO member_task_history (member_id, member_set_id, set_id, task_id, commission_amount)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [memberId, ms.id, ms.set_id, t.id, commissionAmount]
    );

    // ✅ now move progress forward
    const nextIndex = currentIndex + 1;

    // if finishing last task => mark set completed
    if (nextIndex >= totalTasks) {
      const done = await pool.query(
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

      return res.json({
        message: "Set completed",
        assignment: done.rows[0],
        logged_task_id: t.id,
        commission_amount: commissionAmount,
      });
    }

    const upd = await pool.query(
      `
      UPDATE member_sets
      SET current_task_index = $2,
          updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
      [ms.id, nextIndex]
    );

    res.json({
      message: "Task completed",
      assignment: upd.rows[0],
      logged_task_id: t.id,
      commission_amount: commissionAmount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
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


export default router;
