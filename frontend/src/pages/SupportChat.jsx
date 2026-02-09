import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import "../styles/app.css";

function pad2(x) {
  return String(x).padStart(2, "0");
}
function toHHMM(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function SupportChat() {
  const nav = useNavigate();
  const { id } = useParams(); // conversation id
  const convoId = Number(id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const chatRef = useRef(null);

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get(`/support/conversations/${convoId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages");
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(convoId)) return;
    (async () => {
      await load();
      // mark all member messages as read by agent (no polling)
      await api.post(`/support/conversations/${convoId}/mark-read`).catch(() => {});
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convoId]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const msg = text.trim();
    if (!msg) return;
    setErr("");
    setText("");
    try {
      await api.post(`/support/conversations/${convoId}/reply`, { text: msg });
      window.location.reload(); // ✅ your workflow
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send reply");
    }
  };

  return (
    <AppLayout title="Support Chat">
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button className="btn" type="button" onClick={() => nav(-1)}>← Back</button>
          <button className="btn" type="button" onClick={load}>Reload</button>
          {err ? <div style={{ color: "#b91c1c" }}>{err}</div> : null}
        </div>

        <div
          ref={chatRef}
          style={{
            height: 520,
            overflow: "auto",
            border: "1px solid rgba(0,0,0,.08)",
            borderRadius: 12,
            padding: 12,
            background: "#fff",
          }}
        >
          {messages.map((m) => {
            const mine = m.sender_type === "agent";
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,.08)",
                    background: mine ? "rgba(37,99,235,.10)" : "rgba(15,23,42,.06)",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {m.kind === "text" ? (m.text || "") : "[Unsupported kind]"}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7, textAlign: "right" }}>
                    {toHHMM(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          {!messages.length ? <div style={{ opacity: 0.7 }}>No messages.</div> : null}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={text}
            placeholder="Type a reply…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn" type="button" disabled={!text.trim()} onClick={send}>
            Send
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
