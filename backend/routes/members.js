import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * Assign set to member
 * Rule: Only ONE active set per member
 */
router.post("/assign", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    const { member_id, set_id } = req.body;

    if (!member_id || !set_id) {
      return res.status(400).json({ message: "member_id and set_id required" });
    }

    // Check active set
    const existing = await pool.query(
      `SELECT id FROM member_sets 
       WHERE member_id = $1 AND status = 'active'`,
      [member_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Member already has an active set"
      });
    }

    const r = await pool.query(
      `INSERT INTO member_sets 
        (member_id, set_id, assigned_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [member_id, set_id, req.user.id]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * List assigned sets
 * Agent: only their sponsored members
 * Owner: their sponsored members + their agents' sponsored members
 */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    if (req.user.role === "agent") {
      const r = await pool.query(
        `
        SELECT 
          ms.id,
          ms.status,
          ms.current_task_index,
          ms.created_at,
          ms.updated_at,

          m.id AS member_id,
          m.short_id AS member_short_id,
          m.nickname AS member_nickname,
          m.phone AS member_phone,

          s.id AS set_id,
          s.name AS set_name,
          s.max_tasks

        FROM member_sets ms
        JOIN members m ON m.id = ms.member_id
        JOIN sets s ON s.id = ms.set_id
        WHERE m.sponsor_id = $1
        ORDER BY ms.created_at DESC
        `,
        [req.user.id]
      );

      return res.json(r.rows);
    }

    // Owner
    const r = await pool.query(
      `
      SELECT 
        ms.id,
        ms.status,
        ms.current_task_index,
        ms.created_at,
        ms.updated_at,

        m.id AS member_id,
        m.short_id AS member_short_id,
        m.nickname AS member_nickname,
        m.phone AS member_phone,

        s.id AS set_id,
        s.name AS set_name,
        s.max_tasks

      FROM member_sets ms
      JOIN members m ON m.id = ms.member_id
      JOIN sets s ON s.id = ms.set_id
      WHERE 
        m.sponsor_id = $1
        OR m.sponsor_id IN (
          SELECT id FROM users WHERE created_by = $1 AND role = 'agent'
        )
      ORDER BY ms.created_at DESC
      `,
      [req.user.id]
    );

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
