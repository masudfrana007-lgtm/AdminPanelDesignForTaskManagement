import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { setCreateSchema, setTaskAddSchema } from "../validators.js";

const router = express.Router();

router.post("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  const parsed = setCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { name, max_tasks } = parsed.data;

  const r = await pool.query(
    `INSERT INTO sets (name, max_tasks, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, max_tasks, req.user.id]
  );
  res.status(201).json(r.rows[0]);
});

router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  if (req.user.role === "agent") {
    const r = await pool.query("SELECT * FROM sets WHERE created_by = $1 ORDER BY id DESC", [req.user.id]);
    return res.json(r.rows);
  }

  const r = await pool.query(
    `SELECT s.*
     FROM sets s
     WHERE s.created_by = $1
        OR s.created_by IN (SELECT id FROM users WHERE created_by = $1 AND role='agent')
     ORDER BY s.id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

router.get("/:id/tasks", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.id);
  if (!Number.isFinite(setId)) return res.status(400).json({ message: "Invalid set id" });

  const r = await pool.query(
    `SELECT st.id as set_task_id, st.position, t.*
     FROM set_tasks st
     JOIN tasks t ON t.id = st.task_id
     WHERE st.set_id = $1
     ORDER BY st.position ASC, st.id ASC`,
    [setId]
  );

  res.json(r.rows);
});

router.post("/:id/tasks", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.id);
  if (!Number.isFinite(setId)) return res.status(400).json({ message: "Invalid set id" });

  const parsed = setTaskAddSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { task_id } = parsed.data;

  const setR = await pool.query("SELECT id, max_tasks FROM sets WHERE id = $1", [setId]);
  const set = setR.rows[0];
  if (!set) return res.status(404).json({ message: "Set not found" });

  const countR = await pool.query("SELECT COUNT(*)::int AS c FROM set_tasks WHERE set_id = $1", [setId]);
  if (countR.rows[0].c >= set.max_tasks) {
    return res.status(400).json({ message: "Set is full (max tasks reached)" });
  }

  try {
    const posR = await pool.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM set_tasks WHERE set_id = $1",
      [setId]
    );
    const nextPos = Number(posR.rows[0].next_pos || 1);

    const r = await pool.query(
      `INSERT INTO set_tasks (set_id, task_id, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [setId, task_id, nextPos]
    );    
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (String(e).includes("set_tasks_set_id_task_id_key")) {
      return res.status(409).json({ message: "Task already in this set" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:setId/tasks/:taskId/move", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.setId);
  const taskId = Number(req.params.taskId);
  const toPos = Number(req.body?.to_position);

  if (!Number.isFinite(setId) || !Number.isFinite(taskId)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (!Number.isFinite(toPos) || toPos < 1) {
    return res.status(400).json({ message: "to_position must be >= 1" });
  }

  await pool.query("BEGIN");
  try {
    // count tasks in set
    const countR = await pool.query(
      "SELECT COUNT(*)::int AS c FROM set_tasks WHERE set_id = $1",
      [setId]
    );
    const count = countR.rows[0].c;
    if (count === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Set is empty" });
    }

    const newPos = Math.min(toPos, count);

    // current position of the task
    const curR = await pool.query(
      "SELECT position FROM set_tasks WHERE set_id = $1 AND task_id = $2",
      [setId, taskId]
    );
    const cur = curR.rows[0];
    if (!cur) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Task not in set" });
    }

    const fromPos = Number(cur.position || 1);
    if (fromPos === newPos) {
      await pool.query("COMMIT");
      return res.json({ ok: true, position: newPos });
    }

    // Temporarily move target task out of range to avoid unique conflicts
    await pool.query(
      "UPDATE set_tasks SET position = -1000000 - $2 WHERE set_id = $1 AND task_id = $2",
      [setId, taskId]
    );

    if (newPos < fromPos) {
      // moving up: shift [newPos .. fromPos-1] down by 1
      await pool.query(
        `UPDATE set_tasks
         SET position = position + 1
         WHERE set_id = $1
           AND position >= $2
           AND position < $3`,
        [setId, newPos, fromPos]
      );
    } else {
      // moving down: shift [fromPos+1 .. newPos] up by 1
      await pool.query(
        `UPDATE set_tasks
         SET position = position - 1
         WHERE set_id = $1
           AND position > $2
           AND position <= $3`,
        [setId, fromPos, newPos]
      );
    }

    // place task into desired position
    await pool.query(
      "UPDATE set_tasks SET position = $1 WHERE set_id = $2 AND task_id = $3",
      [newPos, setId, taskId]
    );

    await pool.query("COMMIT");
    res.json({ ok: true, position: newPos });
  } catch (e) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:setId/tasks/:taskId", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.setId);
  const taskId = Number(req.params.taskId);
  if (!Number.isFinite(setId) || !Number.isFinite(taskId)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  await pool.query("BEGIN");
  try {
    // delete the row
    await pool.query(
      "DELETE FROM set_tasks WHERE set_id = $1 AND task_id = $2",
      [setId, taskId]
    );

    // ✅ reindex positions to 1..N (so gaps are removed)
    await pool.query(
      `
      WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC, id ASC) AS rn
        FROM set_tasks
        WHERE set_id = $1
      )
      UPDATE set_tasks st
      SET position = -ordered.rn
      FROM ordered
      WHERE st.id = ordered.id
      `,
      [setId]
    );

    await pool.query(
      `
      UPDATE set_tasks
      SET position = -position
      WHERE set_id = $1
        AND position < 0
      `,
      [setId]
    );

    await pool.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
