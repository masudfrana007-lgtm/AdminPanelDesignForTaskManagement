// routes/memberSupport.js
import express from "express";
import { pool } from "../db.js";
import { memberAuth } from "../middleware/memberAuth.js"; // ✅ your member auth middleware

const router = express.Router();

// ✅ create / get conversation for this member
router.get("/conversation", memberAuth, async (req, res) => {
  const memberId = req.member?.id; // if your middleware uses req.user, change to req.user.id
  if (!memberId) return res.status(401).json({ message: "Unauthorized" });

  const ex = await pool.query(
    "SELECT * FROM support_conversations WHERE member_id = $1",
    [memberId]
  );
  if (ex.rows[0]) return res.json(ex.rows[0]);

  const created = await pool.query(
    `INSERT INTO support_conversations (member_id, status)
     VALUES ($1, 'open')
     RETURNING *`,
    [memberId]
  );
  res.json(created.rows[0]);
});

// ✅ list messages (member can only read own conversation)
router.get("/messages", memberAuth, async (req, res) => {
  const memberId = req.member?.id;
  const conversationId = Number(req.query.conversation_id);

  if (!memberId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isFinite(conversationId)) {
    return res.status(400).json({ message: "conversation_id required" });
  }

  const ok = await pool.query(
    "SELECT id FROM support_conversations WHERE id = $1 AND member_id = $2",
    [conversationId, memberId]
  );
  if (!ok.rows[0]) return res.status(403).json({ message: "Forbidden" });

  const r = await pool.query(
    `SELECT id, conversation_id, sender_type, kind, text,
            read_by_agent, read_by_member, created_at
     FROM support_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC, id ASC`,
    [conversationId]
  );

  res.json(r.rows);
});

// ✅ send message (text only)
router.post("/send", memberAuth, async (req, res) => {
  const memberId = req.member?.id;
  const { conversation_id, text } = req.body || {};
  const conversationId = Number(conversation_id);

  if (!memberId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isFinite(conversationId)) return res.status(400).json({ message: "conversation_id required" });

  const msg = String(text || "").trim();
  if (!msg) return res.status(400).json({ message: "Message is empty" });

  const ok = await pool.query(
    "SELECT id FROM support_conversations WHERE id = $1 AND member_id = $2",
    [conversationId, memberId]
  );
  if (!ok.rows[0]) return res.status(403).json({ message: "Forbidden" });

  const ins = await pool.query(
    `INSERT INTO support_messages (
      conversation_id, sender_type, sender_member_id,
      kind, text, read_by_agent, read_by_member
    )
    VALUES ($1,'member',$2,'text',$3,false,true)
    RETURNING *`,
    [conversationId, memberId, msg]
  );

  await pool.query(
    `UPDATE support_conversations
     SET last_message_at = now(), status = 'open'
     WHERE id = $1`,
    [conversationId]
  );

  res.status(201).json(ins.rows[0]);
});

// ✅ mark agent messages read by member (optional)
router.post("/mark-read", memberAuth, async (req, res) => {
  const memberId = req.member?.id;
  const conversationId = Number(req.body?.conversation_id);

  if (!memberId) return res.status(401).json({ message: "Unauthorized" });
  if (!Number.isFinite(conversationId)) return res.status(400).json({ message: "conversation_id required" });

  const ok = await pool.query(
    "SELECT id FROM support_conversations WHERE id = $1 AND member_id = $2",
    [conversationId, memberId]
  );
  if (!ok.rows[0]) return res.status(403).json({ message: "Forbidden" });

  await pool.query(
    `UPDATE support_messages
     SET read_by_member = true
     WHERE conversation_id = $1 AND sender_type = 'agent'`,
    [conversationId]
  );

  res.json({ ok: true });
});

export default router;
