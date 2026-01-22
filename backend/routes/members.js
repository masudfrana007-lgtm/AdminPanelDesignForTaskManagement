import express from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { memberCreateSchema } from "../validators.js";

const router = express.Router();

/**
 * Create Member
 * owner/agent can create members
 * sponsor_id = req.user.id (the person who brought the member)
 */
router.post("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  const parsed = memberCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(400).json({ message: "Validation failed", fieldErrors });
  }

  const {
    country,
    phone,
    email,
    nickname,
    password,
    security_pin,
    ranking,
    withdraw_privilege,
  } = parsed.data;

  const passHash = await bcrypt.hash(password, 10);
  const pinHash = await bcrypt.hash(security_pin, 10);

  // short_id uniqueness is enforced by DB; retry on rare collision
  while (true) {
    const shortId = nanoid(8);
    try {
      const r = await pool.query(
        `INSERT INTO members
          (short_id, nickname, email, phone, country, password, security_pin,
           sponsor_id, ranking, withdraw_privilege, created_by)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id, short_id, nickname, email, phone, country, sponsor_id, ranking, withdraw_privilege, created_by, created_at`,
        [
          shortId,
          nickname,
          email || null,
          phone,
          country,
          passHash,
          pinHash,
          req.user.id, // sponsor
          ranking,
          withdraw_privilege === "Enabled",
          req.user.id,
        ]
      );

      return res.status(201).json(r.rows[0]);
    } catch (e) {
      if (String(e).includes("members_short_id_key")) continue; // collision -> retry
      return res.status(500).json({ message: "Server error" });
    }
  }
});

/**
 * List Members
 * agent -> only members they created (sponsor_id = agent)
 * owner -> own members + members created by their agents
 */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  if (req.user.role === "agent") {
    const r = await pool.query(
      `SELECT id, short_id, nickname, email, phone, country, sponsor_id, ranking, withdraw_privilege, created_by, created_at
       FROM members
       WHERE sponsor_id = $1
       ORDER BY id DESC`,
      [req.user.id]
    );
    return res.json(r.rows);
  }

  // owner
  const r = await pool.query(
    `SELECT m.id, m.short_id, m.nickname, m.email, m.phone, m.country,
            m.sponsor_id, m.ranking, m.withdraw_privilege, m.created_by, m.created_at
     FROM members m
     WHERE m.sponsor_id = $1
        OR m.sponsor_id IN (
          SELECT id FROM users WHERE created_by = $1 AND role = 'agent'
        )
     ORDER BY m.id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

export default router;
