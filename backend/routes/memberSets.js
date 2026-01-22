// routes/memberSets.js
import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";

const router = express.Router();

/**
 * Helper: check if requester can access a member
 * Agent: member.sponsor_id === agent.id
 * Owner: member.sponsor_id === owner.id OR sponsor is one of owner's agents
 */
async function canAccessMember(user, memberId) {
  // fetch member sponsor
  const m = await pool.query(`SELECT id, sponsor_id FROM members WHERE id = $1`, [memberId]);
  const member = m.rows[0];
  if (!member) return { ok: false, reason: "Member not found" };

  if (user.role === "agent") {
    if (member.sponsor_id !== user.id) return { ok: false, reason: "Not allowed for this member" };
    return { ok: true, member };
  }

  // owner
  if (member.sponsor_id === user.id) return { ok: true, member };

  // owner’s agents
  const a = await pool.query(
    `SELECT 1 FROM users WHERE id = $1 AND created_by = $2 AND role = 'agent' LIMIT 1`,
    [member.sponsor_id, user.id]
  );
  if (a.rowCount > 0) return { ok: true, member };

  return { ok: false, reason: "Not allowed for this member" };
}

/**
 * Assign set to member
 * Rule: Only ONE active set per member
 */
router.post("/assign", auth, allowRoles("owner", "agent"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { member_id, set_id } = req.body;

    if (!member_id || !set_id) {
      return res.status(400).json({ message: "member_id and set_id required" });
    }

    // Permission: must be your member (agent) or your/agent member (owner)
    const perm = await canAccessMember(req.user, Number(member_id));
    if (!perm.ok) return res.status(403).json({ message: perm.reason });

    // Ensure set exists
    const s = await pool.query(`SELECT id FROM sets WHERE id = $1`, [Number(set_id)]);
    if (s.rowCount === 0) return res.status(404).json({ message: "Set not found" });

    await client.query("BEGIN");

    // Check active set for that member
    const existing = await client.query(
      `SELECT id FROM member_sets WHERE member_id = $1 AND status = 'active' LIMIT 1`,
      [Number(member_id)]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Member already has an active set" });
    }

    const r = await client.query(
      `INSERT INTO member_sets (member_id, set_id, assigned_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [Number(member_id), Number(set_id), req.user.id]
    );

    await client.query("COMMIT");
    res.status(201).json(r.rows[0]);
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * List assigned sets
 * Includes:
 * - total_tasks (actual count in set)
 * - set_amount (sum of task prices)
 * - current_task_amount (price of current task based on current_task_index)
 * - status computed (completed if current_task_index >= total_tasks)
 *
 * Agent: only their sponsored members
 * Owner: their sponsored members + their agents' sponsored members
 */
router.get("/", auth, allowRoles("owner", "agent"), async (req, res) => {
  try {
    const params = [];
    let whereSql = "";

    if (req.user.role === "agent") {
      params.push(req.user.id);
      whereSql = `WHERE m.sponsor_id = $1`;
    } else {
      // owner
      params.push(req.user.id);
      whereSql = `
        WHERE
          m.sponsor_id = $1
          OR m.sponsor_id IN (
            SELECT id FROM users WHERE created_by = $1 AND role = 'agent'
          )
      `;
    }

    /**
     * We calculate:
     * total_tasks: COUNT(tasks)
     * set_amount : SUM(tasks.price)
     * current_task_amount : price of task at position (current_task_index + 1) ordered by set_tasks.id
     */
    const q = `
      WITH set_task_rows AS (
        SELECT
          st.set_id,
          st.task_id,
          ROW_NUMBER() OVER (PARTITION BY st.set_id ORDER BY st.id ASC) AS rn
        FROM set_tasks st
      ),
      set_stats AS (
        SELECT
          s.id AS set_id,
          COUNT(t.id)::int AS total_tasks,
          COALESCE(SUM(t.price), 0)::numeric(12,2) AS set_amount
        FROM sets s
        LEFT JOIN set_tasks st ON st.set_id = s.id
        LEFT JOIN tasks t ON t.id = st.task_id
        GROUP BY s.id
      ),
      current_task_price AS (
        SELECT
          ms.id AS member_set_id,
          COALESCE(t.price, 0)::numeric(12,2) AS current_task_amount
        FROM member_sets ms
        LEFT JOIN set_task_rows str
          ON str.set_id = ms.set_id
         AND str.rn = (ms.current_task_index + 1)
        LEFT JOIN tasks t ON t.id = str.task_id
      )
      SELECT
        ms.id,
        ms.current_task_index,
        ms.created_at,
        ms.updated_at,

        m.id AS member_id,
        m.short_id AS member_short_id,
        m.nickname AS member_nickname,
        m.phone AS member_phone,

        s.id AS set_id,
        s.name AS set_name,
        s.max_tasks,

        ss.total_tasks,
        ss.set_amount,
        ctp.current_task_amount,

        CASE
          WHEN ms.current_task_index >= COALESCE(ss.total_tasks, 0) AND COALESCE(ss.total_tasks, 0) > 0
            THEN 'completed'
          ELSE ms.status
        END AS status

      FROM member_sets ms
      JOIN members m ON m.id = ms.member_id
      JOIN sets s ON s.id = ms.set_id
      LEFT JOIN set_stats ss ON ss.set_id = s.id
      LEFT JOIN current_task_price ctp ON ctp.member_set_id = ms.id
      ${whereSql}
      ORDER BY ms.created_at DESC
    `;

    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
