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

  const nickname = String(req.body.nickname || "").trim();
  const phone = String(req.body.phone || "").trim();
  const country = String(req.body.country || "").trim();
  const password = String(req.body.password || "").trim();
  const gender = String(req.body.gender || "").trim();
  const referral_code = String(req.body.referral_code || "").trim();

  // Nothing can be blank
  if (!nickname || !phone || !country || !password || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let sponsor_id = null;

  // ✅ Admin create: sponsor_id = admin id
  if (isAdmin) {
    sponsor_id = req.user.id;
  } else {
    // ✅ Public signup MUST have referral_code
    if (!referral_code) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    // ✅ referral_code must match a users.short_id of owner/agent
    const ref = await pool.query(
      `SELECT id
       FROM users
       WHERE short_id = $1
         AND role IN ('owner','agent')
       LIMIT 1`,
      [referral_code]
    );

    if (!ref.rowCount) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    sponsor_id = ref.rows[0].id; // ✅ sponsor is referrer (owner/agent)
  }

  const passHash = await bcrypt.hash(password, 10);
  const approval_status = isAdmin ? "approved" : "pending";

  while (true) {
    try {
      const short_id = nanoid(8);

      const r = await pool.query(
        `INSERT INTO members
         (short_id, nickname, phone, country, password,
          sponsor_id, ranking, withdraw_privilege, approval_status, created_by, gender)
         VALUES
         ($1,$2,$3,$4,$5,$6,'Trial',true,$7,$8,$9)
         RETURNING id, short_id, nickname, phone, country, sponsor_id,
                  ranking, withdraw_privilege, approval_status, created_by, created_at, gender`,
        [
          short_id,
          nickname,
          phone,
          country,
          passHash,
          sponsor_id,
          approval_status,
          isAdmin ? req.user.id : null,
          gender,
        ]
      );

      return res.status(201).json(r.rows[0]);
    } catch (e) {
      const msg = String(e);

      // retry only if short_id collision
      if (msg.includes("members_short_id_key")) continue;

      // ❌ duplicate username
      if (msg.includes("members_nickname_key")) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // ❌ duplicate phone
      if (msg.includes("members_phone_key")) {
        return res.status(400).json({ message: "Phone number already exists" });
      }

      console.error(e);
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
  await pool.query(`UPDATE members SET approval_status='approved' WHERE id=$1`, [
    req.params.id,
  ]);
  res.json({ ok: true });
});

router.patch("/:id/reject", auth, allowRoles("owner"), async (req, res) => {
  await pool.query(`UPDATE members SET approval_status='rejected' WHERE id=$1`, [
    req.params.id,
  ]);
  res.json({ ok: true });
});

export default router;
