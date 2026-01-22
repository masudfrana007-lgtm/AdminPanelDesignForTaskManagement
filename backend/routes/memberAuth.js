import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

/**
 * POST /member-auth/login
 * body: { email, security_pin }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, security_pin } = req.body;

    if (!email || !security_pin) {
      return res.status(400).json({ message: "email and security_pin required" });
    }

    const r = await pool.query(
      `SELECT id, short_id, nickname, email, security_pin, sponsor_id
       FROM members
       WHERE lower(email) = lower($1)
       LIMIT 1`,
      [email]
    );

    const m = r.rows[0];
    if (!m) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(String(security_pin), m.security_pin);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { member_id: m.id, sponsor_id: m.sponsor_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      member: {
        id: m.id,
        short_id: m.short_id,
        nickname: m.nickname,
        email: m.email,
        sponsor_id: m.sponsor_id,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
