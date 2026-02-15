import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { createUserSchema } from "../validators.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(400).json({
      message: "Validation failed",
      fieldErrors,
    });
  }

  const { name, email, password, role } = parsed.data;

  if (req.user.role === "admin" && role !== "owner") {
    return res.status(403).json({ message: "Admin can only create owner" });
  }
  if (req.user.role === "owner" && role !== "agent") {
    return res.status(403).json({ message: "Owner can only create agent" });
  }
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    // ✅ DB trigger generates short_id (Mxxxxx / Axxxxx)
    const r = await pool.query(
      `INSERT INTO users (name, email, password, role, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, short_id, name, email, role, created_by, created_at`,
      [name, email, hash, role, req.user.id]
    );

    return res.status(201).json(r.rows[0]);
  } catch (e) {
    const msg = String(e);

    if (msg.includes("users_email_key")) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // optional: if short_id conflicts (should not happen with your DB loop)
    if (msg.includes("users_short_id_key") || msg.includes("short_id")) {
      return res.status(500).json({ message: "Short ID generation conflict" });
    }

    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, allowRoles("admin", "owner"), async (req, res) => {
  if (req.user.role === "admin") {
    const r = await pool.query(
      "SELECT id, short_id, name, email, role, created_by, created_at FROM users ORDER BY id DESC"
    );
    return res.json(r.rows);
  }

  const r = await pool.query(
    `SELECT id, short_id, name, email, role, created_by, created_at
     FROM users
     WHERE id = $1 OR created_by = $1
     ORDER BY id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

export default router;
