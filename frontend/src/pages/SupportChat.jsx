// src/pages/SupportChat.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import CsLayout from "../components/CsLayout";
import "../styles/app.css";

function pad2(x) {
  return String(x).padStart(2, "0");
}
function toHHMM(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ✅ same key you store in CsLogin.jsx
function getToken() {
  const raw = localStorage.getItem("token");
  if (!raw) return "";
  return String(raw).replace(/^bearer\s+/i, "").replace(/^"|"$/g, "").trim();
}

export default function SupportChat() {
  const nav = useNavigate();
  const { id } = useParams();
  const convoId = Number(id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const chatRef = useRef(null);

  // ✅ always pass Authorization explicitly (even though interceptor exists)
  function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  const load = async () => {
    setErr("");

    const t = getToken();
    if (!t) {
      nav("/cs/login");
      return;
    }
    if (!Number.isFinite(convoId)) {
      setErr("Invalid conversation id");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/support/conversations/${convoId}/messages`, {
        headers: authHeaders(),
      });
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      const status = e?.response?.status;
      setErr(e?.response?.data?.message || `Failed to load messages`);
      setMessages([]);

      // ✅ show the real error in console too
      console.log("LOAD ERROR:", status, e?.response?.data, e);

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/cs/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(convoId)) return;

    (async () => {
      await load();

      // mark read (best-effort)
      await api
        .post(`/support/conversations/${convoId}/mark-read`, {}, { headers: authHeaders() })
        .catch((e) => console.log("MARK-READ ERROR:", e?.response?.status, e?.response?.data, e));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convoId]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;

    setErr("");

    const t = getToken();
    if (!t) {
      nav("/cs/login");
      return;
    }
    if (!Number.isFinite(convoId)) {
      setErr("Invalid conversation id");
      return;
    }

    setSending(true);
    try {
      console.log("SENDING REPLY:", convoId, msg);

      await api.post(
        `/support/conversations/${convoId}/reply`,
        { text: msg },
        { headers: authHeaders() }
      );

      setText("");
      await load(); // ✅ refresh without reloading the page
    } catch (e) {
      const status = e?.response?.status;
  const data = e?.response?.data;
  const msg =
    (typeof data === "string" ? data : data?.message) ||
    e?.message ||
    "Failed to send reply";

  console.log("SEND ERROR FULL:", { status, data, e });

  setErr(`(${status || "?"}) ${msg}`);

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/cs/login");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <CsLayout title="Support Chat">
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button className="btn" type="button" onClick={() => nav(-1)}>
            ← Back
          </button>

          <button className="btn" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Reload"}
          </button>

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
            disabled={sending}
          />

          <button className="btn" type="button" disabled={!text.trim() || sending} onClick={send}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </CsLayout>
  );
}
