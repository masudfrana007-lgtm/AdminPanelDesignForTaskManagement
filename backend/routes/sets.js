import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { setCreateSchema, setTaskAddSchema } from "../validators.js";

const router = express.Router();

/* =========================
   CREATE SET
   ========================= */
router.post("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  const parsed = setCreateSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { name, max_tasks } = parsed.data;

  const r = await pool.query(
    `INSERT INTO sets (name, max_tasks, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, max_tasks, req.user.id]
  );
  res.status(201).json(r.rows[0]);
});

/* =========================
   LIST SETS
   ========================= */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  if (req.user.role === "agent") {
    const r = await pool.query(
      "SELECT * FROM sets WHERE created_by = $1 ORDER BY id DESC",
      [req.user.id]
    );
    return res.json(r.rows);
  }

  const r = await pool.query(
    `SELECT s.*
     FROM sets s
     WHERE s.created_by = $1
        OR s.created_by IN (
          SELECT id FROM users WHERE created_by = $1 AND role='agent'
        )
     ORDER BY s.id DESC`,
    [req.user.id]
  );

  res.json(r.rows);
});

/* =========================
   GET TASKS IN A SET (ORDERED)
   ========================= */
router.get("/:id/tasks", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.id);
  if (!Number.isFinite(setId))
    return res.status(400).json({ message: "Invalid set id" });

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

/* =========================
   ADD TASK TO SET (append at end)
   ========================= */
router.post("/:id/tasks", auth, allowRoles("owner", "agent"), async (req, res) => {
  const setId = Number(req.params.id);
  if (!Number.isFinite(setId))
    return res.status(400).json({ message: "Invalid set id" });

  const parsed = setTaskAddSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { task_id } = parsed.data;

  const setR = await pool.query("SELECT id, max_tasks FROM sets WHERE id = $1", [
    setId,
  ]);
  const set = setR.rows[0];
  if (!set) return res.status(404).json({ message: "Set not found" });

  const countR = await pool.query(
    "SELECT COUNT(*)::int AS c FROM set_tasks WHERE set_id = $1",
    [setId]
  );
  if (countR.rows[0].c >= set.max_tasks) {
    return res.status(400).json({ message: "Set is full (max tasks reached)" });
  }

  // ✅ next position within this set
  const posR = await pool.query(
    "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM set_tasks WHERE set_id = $1",
    [setId]
  );
  const nextPos = Number(posR.rows[0].next_pos || 1);

  try {
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

/* =========================
   REORDER TASKS IN A SET
   body: { ordered_task_ids: [taskId1, taskId2, ...] }
   ========================= */
router.put(
  "/:id/tasks/reorder",
  auth,
  allowRoles("owner", "agent"),
  async (req, res) => {
    const setId = Number(req.params.id);
    if (!Number.isFinite(setId))
      return res.status(400).json({ message: "Invalid set id" });

    const ordered = req.body?.ordered_task_ids;
    if (!Array.isArray(ordered) || ordered.length === 0) {
      return res.status(400).json({ message: "ordered_task_ids is required" });
    }

    // Ensure ordered list contains ALL tasks in the set (no missing)
    const r = await pool.query("SELECT task_id FROM set_tasks WHERE set_id = $1", [
      setId,
    ]);
    const inSet = new Set(r.rows.map((x) => Number(x.task_id)));

    if (ordered.length !== inSet.size) {
      return res.status(400).json({
        message: "ordered_task_ids must include all tasks in the set",
      });
    }

    for (const id of ordered) {
      if (!inSet.has(Number(id))) {
        return res.status(400).json({ message: "One or more tasks not in set" });
      }
    }

    await pool.query("BEGIN");
    try {
      for (let i = 0; i < ordered.length; i++) {
        await pool.query(
          "UPDATE set_tasks SET position = $1 WHERE set_id = $2 AND task_id = $3",
          [i + 1, setId, Number(ordered[i])]
        );
      }

      await pool.query("COMMIT");
      res.json({ ok: true });
    } catch (e) {
      await pool.query("ROLLBACK");
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   REMOVE TASK FROM SET + RENORMALIZE POSITIONS
   ========================= */
router.delete(
  "/:setId/tasks/:taskId",
  auth,
  allowRoles("owner", "agent"),
  async (req, res) => {
    const setId = Number(req.params.setId);
    const taskId = Number(req.params.taskId);
    if (!Number.isFinite(setId) || !Number.isFinite(taskId))
      return res.status(400).json({ message: "Invalid id" });

    await pool.query("BEGIN");
    try {
      await pool.query("DELETE FROM set_tasks WHERE set_id = $1 AND task_id = $2", [
        setId,
        taskId,
      ]);

      // ✅ renumber positions 1..N so serial stays clean
      await pool.query(
        `
        WITH ordered AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC, id ASC) AS rn
          FROM set_tasks
          WHERE set_id = $1
        )
        UPDATE set_tasks st
        SET position = ordered.rn
        FROM ordered
        WHERE st.id = ordered.id
        `,
        [setId]
      );

      await pool.query("COMMIT");
      res.json({ ok: true });
    } catch (e) {
      await pool.query("ROLLBACK");
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
