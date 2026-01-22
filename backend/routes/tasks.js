import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

// ------------------
// Multer Config
// ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tasks");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

// ------------------
// Create Task (Owner)
// ------------------
router.post("/", auth, allowRoles("owner"), upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      commission_rate,
      rate,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const qty = Number(quantity || 1);
    const commission = Number(commission_rate || 0);
    const r = Number(rate || 0);

    // Auto price calculation
    const price = qty * r + (qty * r * commission) / 100;

    const imageUrl = req.file ? `/uploads/tasks/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO tasks 
        (title, description, image_url, quantity, commission_rate, rate, price, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        title,
        description || null,
        imageUrl,
        qty,
        commission,
        r,
        price,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// Get Tasks
// ------------------
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    if (req.user.role === "owner") {
      const r = await pool.query(
        "SELECT * FROM tasks WHERE created_by = $1 ORDER BY id DESC",
        [req.user.id]
      );
      return res.json(r.rows);
    }

    // Agent → fetch owner's tasks
    const u = await pool.query("SELECT created_by FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const ownerId = u.rows[0]?.created_by;

    if (!ownerId) return res.json([]);

    const r = await pool.query(
      "SELECT * FROM tasks WHERE created_by = $1 ORDER BY id DESC",
      [ownerId]
    );

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
