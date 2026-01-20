import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { taskCreateSchema } from "../validators.js";

const router = express.Router();

router.post("/", auth, allowRoles("owner"), async (req, res) => {
  const parsed = taskCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { title, description } = parsed.data;

  const r = await pool.query(
    `INSERT INTO tasks (title, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, description || null, req.user.id]
  );
  res.status(201).json(r.rows[0]);
});

router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  if (req.user.role === "owner") {
    const r = await pool.query("SELECT * FROM tasks WHERE created_by = $1 ORDER BY id DESC", [req.user.id]);
    return res.json(r.rows);
  }

  const u = await pool.query("SELECT created_by FROM users WHERE id = $1", [req.user.id]);
  const ownerId = u.rows[0]?.created_by;
  if (!ownerId) return res.json([]);

  const r = await pool.query("SELECT * FROM tasks WHERE created_by = $1 ORDER BY id DESC", [ownerId]);
  res.json(r.rows);
});

export default router;
