import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * CREATE MEMBER (admin OR public signup)
 */
router.post("/", async (req, res) => {
  const isAdmin = req.user && ["owner", "agent"].includes(req.user.role);

  const { nickname, phone, country, password, gender, referral_code } = req.body;

  if (!nickname || !phone || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const passHash = await bcrypt.hash(password, 10);
  const approval_status = isAdmin ? "approved" : "pending";

  while (true) {
    try {
      const short_id = nanoid(8);

      const r = await pool.query(
        `INSERT INTO members
         (short_id, nickname, phone, country, password,
          sponsor_id, ranking, withdraw_privilege, approval_status, created_by)
         VALUES
         ($1,$2,$3,$4,$5,$6,'Trial',true,$7,$8)
         RETURNING id, short_id, nickname, phone, country, sponsor_id, ranking, withdraw_privilege, approval_status, created_by, created_at`,
        [
          short_id,
          nickname,
          phone,
          country,
          passHash,
          isAdmin ? req.user.id : null,
          approval_status,
          isAdmin ? req.user.id : null,
        ]
      );

      return res.status(201).json(r.rows[0]);
    } catch (e) {
      if (String(e).includes("members_short_id_key")) continue;
      return res.status(500).json({ message: "Server error" });
    }
  }
});

/**
 * LIST MEMBERS (KEEP ORIGINAL LOGIC)
 * - agent: only members with sponsor_id = agent.id
 * - owner: own + members created by their agents
 */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  if (req.user.role === "agent") {
    const r = await pool.query(
      `SELECT 
         m.id,
         m.short_id,
         m.nickname,
         m.phone,
         m.country,
         u.short_id AS sponsor_short_id,
         m.ranking,
         m.withdraw_privilege,
         m.approval_status,
         m.created_at
       FROM members m
       JOIN users u ON u.id = m.sponsor_id
       WHERE m.sponsor_id = $1
       ORDER BY m.id DESC`,
      [req.user.id]
    );
    return res.json(r.rows);
  }

  // owner
  const r = await pool.query(
    `SELECT 
         m.id,
         m.short_id,
         m.nickname,
         m.phone,
         m.country,
         u.short_id AS sponsor_short_id,
         m.ranking,
         m.withdraw_privilege,
         m.approval_status,
         m.created_at
     FROM members m
     JOIN users u ON u.id = m.sponsor_id
     WHERE m.sponsor_id = $1
        OR m.sponsor_id IN (
          SELECT id FROM users WHERE created_by = $1 AND role = 'agent'
        )
     ORDER BY m.id DESC`,
    [req.user.id]
  );

  return res.json(r.rows);
});

/**
 * APPROVE / REJECT (owner only)
 */
router.patch("/:id/approve", auth, allowRoles("owner"), async (req, res) => {
  await pool.query(
    `UPDATE members SET approval_status='approved' WHERE id=$1`,
    [req.params.id]
  );
  res.json({ ok: true });
});

router.patch("/:id/reject", auth, allowRoles("owner"), async (req, res) => {
  await pool.query(
    `UPDATE members SET approval_status='rejected' WHERE id=$1`,
    [req.params.id]
  );
  res.json({ ok: true });
});

export default router;
