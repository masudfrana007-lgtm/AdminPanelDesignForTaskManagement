import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * LIST withdrawals (owner only)
 */
router.get("/", auth, allowRoles("owner"), async (req, res) => {
  try {
    const r = await pool.query(
      `
      SELECT w.*, m.nickname, m.phone, m.short_id AS member_short_id
      FROM withdrawals w
      JOIN members m ON m.id = w.member_id
      ORDER BY w.id DESC
      `
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * APPROVE withdrawal (owner only)
 */
router.patch("/:id/approve", auth, allowRoles("owner"), async (req, res) => {
  const client = await pool.connect();
  try {
    const wid = Number(req.params.id);
    if (!wid) return res.status(400).json({ message: "Invalid withdrawal id" });

    await client.query("BEGIN");

    const wRes = await client.query(
      `SELECT * FROM withdrawals WHERE id=$1 FOR UPDATE`,
      [wid]
    );
    const w = wRes.rows[0];
    if (!w) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    if (w.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Withdrawal is not pending" });
    }

    await client.query(
      `INSERT INTO wallets(member_id) VALUES($1) ON CONFLICT (member_id) DO NOTHING`,
      [w.member_id]
    );

    const wallet = await client.query(
      `SELECT locked_balance FROM wallets WHERE member_id=$1 FOR UPDATE`,
      [w.member_id]
    );

    const locked = Number(wallet.rows[0].locked_balance || 0);
    if (locked < Number(w.amount)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Locked balance is not enough (data mismatch)" });
    }

    const admin_note = String(req.body.admin_note || "").trim();

    await client.query(
      `UPDATE withdrawals
       SET status='approved', reviewed_by=$1, reviewed_at=now(), admin_note=$2
       WHERE id=$3`,
      [req.user.id, admin_note || null, wid]
    );

    const ins = await client.query(
      `
      INSERT INTO wallet_ledger (member_id, type, direction, amount, ref_type, ref_id, note)
      VALUES ($1,'withdraw','debit',$2,'withdrawal',$3,'Withdrawal approved')
      ON CONFLICT (ref_type, ref_id) DO NOTHING
      RETURNING id
      `,
      [w.member_id, w.amount, w.id]
    );

    if (ins.rowCount > 0) {
      await client.query(
        `UPDATE wallets
         SET locked_balance = locked_balance - $1,
             updated_at = now()
         WHERE member_id = $2`,
        [w.amount, w.member_id]
      );
    }

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * REJECT withdrawal (owner only)
 */
router.patch("/:id/reject", auth, allowRoles("owner"), async (req, res) => {
  const client = await pool.connect();
  try {
    const wid = Number(req.params.id);
    if (!wid) return res.status(400).json({ message: "Invalid withdrawal id" });

    await client.query("BEGIN");

    const wRes = await client.query(
      `SELECT * FROM withdrawals WHERE id=$1 FOR UPDATE`,
      [wid]
    );
    const w = wRes.rows[0];
    if (!w) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    if (w.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Withdrawal is not pending" });
    }

    await client.query(
      `INSERT INTO wallets(member_id) VALUES($1) ON CONFLICT (member_id) DO NOTHING`,
      [w.member_id]
    );

    const wallet = await client.query(
      `SELECT balance, locked_balance FROM wallets WHERE member_id=$1 FOR UPDATE`,
      [w.member_id]
    );

    const locked = Number(wallet.rows[0].locked_balance || 0);
    if (locked < Number(w.amount)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Locked balance is not enough (data mismatch)" });
    }

    const admin_note = String(req.body.admin_note || "").trim();

    await client.query(
      `UPDATE withdrawals
       SET status='rejected', reviewed_by=$1, reviewed_at=now(), admin_note=$2
       WHERE id=$3`,
      [req.user.id, admin_note || null, wid]
    );

    await client.query(
      `UPDATE wallets
       SET locked_balance = locked_balance - $1,
           balance = balance + $1,
           updated_at = now()
       WHERE member_id = $2`,
      [w.amount, w.member_id]
    );

    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

export default router;
