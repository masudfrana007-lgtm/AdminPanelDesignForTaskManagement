import express from "express";
import { pool } from "../db.js";
import { memberAuth } from "../middleware/memberAuth.js";

const router = express.Router();

/**
 * GET /member/me
 */
router.get("/me", memberAuth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, short_id, nickname, email, phone, ranking, withdraw_privilege, sponsor_id
       FROM members
       WHERE id = $1`,
      [req.member.member_id]
    );
    res.json(r.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /member/active-set
 * returns:
 * - assignment info (member_sets)
 * - set info
 * - total_tasks (from set_tasks)
 * - set_amount (sum of task.price)
 * - last_completed_task_number (same as current_task_index)
 * - current_task (task details for current index)
 */
router.get("/active-set", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    // Get active assignment
    const msRes = await pool.query(
      `SELECT ms.*
       FROM member_sets ms
       WHERE ms.member_id = $1 AND ms.status = 'active'
       ORDER BY ms.id DESC
       LIMIT 1`,
      [memberId]
    );

    const ms = msRes.rows[0];
    if (!ms) {
      return res.json({ active: false, message: "No active set assigned" });
    }

    // total tasks + sum amount
    const totalsRes = await pool.query(
      `
      SELECT 
        COUNT(st.task_id)::int AS total_tasks,
        COALESCE(SUM(t.price), 0)::numeric(12,2) AS set_amount
      FROM set_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.set_id = $1
      `,
      [ms.set_id]
    );

    const total_tasks = totalsRes.rows[0]?.total_tasks || 0;
    const set_amount = totalsRes.rows[0]?.set_amount || "0.00";

    // Fetch current task (0-based index)
    const currentIndex = Number(ms.current_task_index || 0);

    const currentTaskRes = await pool.query(
      `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.image_url,
        t.quantity,
        t.rate,
        t.commission_rate,
        t.price
      FROM set_tasks st
      JOIN tasks t ON t.id = st.task_id
      WHERE st.set_id = $1
      ORDER BY st.id ASC
      OFFSET $2
      LIMIT 1
      `,
      [ms.set_id, currentIndex]
    );

    const setRes = await pool.query(
      `SELECT id, name, max_tasks, created_by, created_at
       FROM sets
       WHERE id = $1`,
      [ms.set_id]
    );

    res.json({
      active: true,
      assignment: {
        id: ms.id,
        status: ms.status,
        current_task_index: ms.current_task_index,
        created_at: ms.created_at,
        updated_at: ms.updated_at,
      },
      set: setRes.rows[0] || null,
      total_tasks,
      set_amount,
      last_completed_task_number: currentIndex, // you wanted same for now
      current_task: currentTaskRes.rows[0] || null,
      current_task_amount: currentTaskRes.rows[0]?.price ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /member/complete-task
 * - increments current_task_index by 1
 * - updates updated_at
 * - if completed all tasks => status becomes completed
 */
router.post("/complete-task", memberAuth, async (req, res) => {
  try {
    const memberId = req.member.member_id;

    const msRes = await pool.query(
      `SELECT *
       FROM member_sets
       WHERE member_id = $1 AND status = 'active'
       ORDER BY id DESC
       LIMIT 1`,
      [memberId]
    );
    const ms = msRes.rows[0];
    if (!ms) return res.status(400).json({ message: "No active set" });

    // total tasks
    const totalsRes = await pool.query(
      `SELECT COUNT(*)::int AS total_tasks
       FROM set_tasks
       WHERE set_id = $1`,
      [ms.set_id]
    );

    const totalTasks = totalsRes.rows[0]?.total_tasks || 0;
    const nextIndex = Number(ms.current_task_index || 0) + 1;

    if (totalTasks === 0) {
      return res.status(400).json({ message: "This set has no tasks" });
    }

    // If nextIndex >= totalTasks => complete the set
    if (nextIndex >= totalTasks) {
      const done = await pool.query(
        `UPDATE member_sets
         SET status = 'completed',
             current_task_index = $2,
             updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [ms.id, totalTasks] // store totalTasks as final index
      );
      return res.json({ message: "Set completed", assignment: done.rows[0] });
    }

    // Normal progress
    const upd = await pool.query(
      `UPDATE member_sets
       SET current_task_index = $2,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [ms.id, nextIndex]
    );

    res.json({ message: "Task completed", assignment: upd.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
