import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * LIST deposits (owner only)
 */
router.get("/", auth, allowRoles("owner"), async (req, res) => {
  try {
    const r = await pool.query(
      `
      SELECT d.*, m.nickname, m.phone, m.short_id AS member_short_id
      FROM deposits d
      JOIN members m ON m.id = d.member_id
      ORDER BY d.id DESC
      `
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * APPROVE deposit (owner only)
 */
router.patch("/:id/approve", auth, allowRoles("owner"), async (req, res) => {
  const client = await pool.connect();
  try {
    const depId = Number(req.params.id);
    if (!depId) return res.status(400).json({ message: "Invalid deposit id" });

    await client.query("BEGIN");

    const depRes = await client.query(
      `SELECT * FROM deposits WHERE id=$1 FOR UPDATE`,
      [depId]
    );
    const d = depRes.rows[0];
    if (!d) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Deposit not found" });
    }
    if (d.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Deposit is not pending" });
    }

    const admin_note = String(req.body.admin_note || "").trim();

    await client.query(
      `UPDATE deposits
       SET status='approved', reviewed_by=$1, reviewed_at=now(), admin_note=$2
       WHERE id=$3`,
      [req.user.id, admin_note || null, depId]
    );

    await client.query(
      `INSERT INTO wallets(member_id) VALUES($1)
       ON CONFLICT (member_id) DO NOTHING`,
      [d.member_id]
    );

    const ins = await client.query(
      `
      INSERT INTO wallet_ledger (member_id, type, direction, amount, ref_type, ref_id, note)
      VALUES ($1,'deposit','credit',$2,'deposit',$3,'Deposit approved')
      ON CONFLICT (ref_type, ref_id) DO NOTHING
      RETURNING id
      `,
      [d.member_id, d.amount, d.id]
    );

    if (ins.rowCount > 0) {
      await client.query(
        `UPDATE wallets
         SET balance = balance + $1, updated_at = now()
         WHERE member_id = $2`,
        [d.amount, d.member_id]
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
 * REJECT deposit (owner only)
 */
router.patch("/:id/reject", auth, allowRoles("owner"), async (req, res) => {
  const client = await pool.connect();
  try {
    const depId = Number(req.params.id);
    if (!depId) return res.status(400).json({ message: "Invalid deposit id" });

    await client.query("BEGIN");

    const depRes = await client.query(
      `SELECT * FROM deposits WHERE id=$1 FOR UPDATE`,
      [depId]
    );
    const d = depRes.rows[0];
    if (!d) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Deposit not found" });
    }
    if (d.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Deposit is not pending" });
    }

    const admin_note = String(req.body.admin_note || "").trim();

    await client.query(
      `UPDATE deposits
       SET status='rejected', reviewed_by=$1, reviewed_at=now(), admin_note=$2
       WHERE id=$3`,
      [req.user.id, admin_note || null, depId]
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
