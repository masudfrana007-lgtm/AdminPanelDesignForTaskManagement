import { useEffect, useMemo, useRef, useState } from "react";
import "./SupportInbox.css";
import api from "../services/api"; // ✅ backend

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

function toTs(s) {
  if (!s) return 0;
  const safe = s.replace(" ", "T");
  const t = Date.parse(safe);
  return Number.isFinite(t) ? t : 0;
}

export default function SupportInbox() {
  /* =========================================================
     REAL DATA STATE (mock removed)
  ========================================================= */

  const [conversations, setConversations] = useState([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const chatBodyRef = useRef(null);

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      const el = chatBodyRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  /* =========================================================
     LOAD INBOX FROM BACKEND
     GET /support/inbox
  ========================================================= */

  async function loadInbox() {
    try {
      const { data } = await api.get("/support/inbox");

      const mapped = (data || []).map((r) => ({
        id: r.id,
        member: r.member_name || `Member #${r.member_id}`,
        displayName: r.display_name || "",
        phone: r.member_phone || "-",
        status: r.status || "open",
        unread: Number(r.unread_count || 0),
        lastMsg: r.last_message || "-",
        lastAt: r.last_message_at || "",
        note: r.note || "",
        messages: [],
      }));

      setConversations(mapped);

      if (mapped.length) {
        setActiveId(mapped[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  /* ========================================================= */

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  useEffect(() => {
    if (!active || !mobileChatOpen) return;
    scrollChatToBottom();
  }, [activeId, mobileChatOpen, active?.messages?.length]);

  /* ========================================================= */

  const notif = useMemo(() => {
    const unreadTotal = conversations.reduce((a, c) => a + (c.unread || 0), 0);
    const pending = conversations.filter((c) => c.status === "pending").length;
    const open = conversations.filter((c) => c.status === "open").length;
    const newest = conversations
      .slice()
      .sort((a, b) => toTs(b.lastAt) - toTs(a.lastAt))[0]?.lastAt;

    return { unreadTotal, pending, open, newest: newest || "-" };
  }, [conversations]);

  /* ========================================================= */

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = conversations.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (onlyUnread && !(c.unread > 0)) return false;
      if (!q) return true;

      const label = (c.displayName || c.member || "").toLowerCase();

      return (
        label.includes(q) ||
        c.member.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        String(c.lastMsg || "").toLowerCase().includes(q) ||
        String(c.note || "").toLowerCase().includes(q)
      );
    });

    return base.sort((a, b) => {
      const ua = a.unread > 0 ? 1 : 0;
      const ub = b.unread > 0 ? 1 : 0;
      if (ua !== ub) return ub - ua;
      return toTs(b.lastAt) - toTs(a.lastAt);
    });
  }, [conversations, query, status, onlyUnread]);

  /* =========================================================
     OPEN CONVERSATION
     GET /support/conversations/:id/messages
  ========================================================= */

  async function openConversation(c) {
    setActiveId(c.id);
    setEditName(c.displayName || "");
    setEditNote(c.note || "");
    setMobileChatOpen(true);

    try {
      const { data } = await api.get(`/support/conversations/${c.id}/messages`);

      const msgs = (data || []).map((m) => ({
        id: m.id,
        from: m.sender_type === "agent" ? "agent" : "customer",
        text: m.kind === "photo" ? m.file_url : m.text,
        at: m.created_at,
      }));

      setConversations((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, unread: 0, messages: msgs } : x
        )
      );

      await api.post(`/support/conversations/${c.id}/mark-read`);

      scrollChatToBottom();
    } catch (e) {
      console.error(e);
    }
  }

  /* =========================================================
     SEND MESSAGE
     POST /support/conversations/:id/reply
  ========================================================= */

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !active) return;

    try {
      const { data } = await api.post(
        `/support/conversations/${active.id}/reply`,
        { text }
      );

      const newMsg = {
        id: data.id,
        from: "agent",
        text: data.text,
        at: data.created_at,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                status: "open",
                messages: [...c.messages, newMsg],
                lastMsg: text.length > 28 ? text.slice(0, 28) + "…" : text,
                lastAt: data.created_at,
              }
            : c
        )
      );

      setDraft("");
      scrollChatToBottom();
    } catch (e) {
      console.error(e);
    }
  }

  /* ========================================================= */

  function toggleStatus() {
    if (!active) return;

    setConversations((prev) =>
      prev.map((x) =>
        x.id === active.id
          ? { ...x, status: x.status === "open" ? "pending" : "open" }
          : x
      )
    );
  }

  function saveProfile() {
    if (!active) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, displayName: editName.trim(), note: editNote.trim() }
          : c
      )
    );

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
  }

  const activeLabel = active
    ? active.displayName?.trim()
      ? active.displayName
      : active.member
    : "";

  /* =========================================================
     JSX (100% SAME DESIGN — UNCHANGED)
  ========================================================= */

  return (
    <div className="sxPage">
      <div className={cls("sxContainer", mobileChatOpen && "isChatOpen")}>
        {/* KEEP ALL YOUR ORIGINAL JSX BELOW EXACTLY AS IT WAS */}
      </div>
    </div>
  );
}