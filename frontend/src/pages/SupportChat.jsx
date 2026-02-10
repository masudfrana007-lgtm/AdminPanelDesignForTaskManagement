// src/pages/SupportChat.jsx
// ✅ Images visible + clickable lightbox (no layout redesign)
// ✅ Keeps your adaptive polling and mark-read logic

import { useEffect, useRef, useState, useCallback } from "react";
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

// only autoscroll if user is near bottom
function isNearBottom(el, px = 140) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < px;
}

// ✅ MATCH TASKS: files are served by backend host
const FILE_BASE = "http://159.198.40.145:5010";
function joinUrl(base, p) {
  const path = String(p || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const b = String(base || "").replace(/\/+$/, "");
  const u = path.startsWith("/") ? path : `/${path}`;
  return `${b}${u}`;
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

  // ✅ lightbox state
  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");

  // ✅ polling internals
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);
  const lastSigRef = useRef(""); // prevent useless re-render
  const stickToBottomRef = useRef(true);
  const visRef = useRef(!document.hidden);
  const focusRef = useRef(document.hasFocus());

  function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  const openImage = (src, alt = "photo") => {
    setImgSrc(src);
    setImgAlt(alt);
    setImgOpen(true);
  };
  const closeImage = () => {
    setImgOpen(false);
    setImgSrc("");
    setImgAlt("");
  };

  // ✅ include file_url/file_name in signature too (so UI updates when photo arrives)
  const signatureOf = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    if (!a.length) return "0";
    const last = a[a.length - 1];
    return `${a.length}|${last?.id ?? ""}|${last?.created_at ?? ""}|${last?.sender_type ?? ""}|${last?.kind ?? ""}|${last?.text ?? ""}|${last?.file_url ?? ""}`;
  }, []);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      if (!silent) setErr("");

      const t = getToken();
      if (!t) {
        nav("/cs/login");
        inFlightRef.current = false;
        return;
      }
      if (!Number.isFinite(convoId)) {
        if (!silent) setErr("Invalid conversation id");
        inFlightRef.current = false;
        return;
      }

      if (!silent) setLoading(true);

      try {
        const { data } = await api.get(`/support/conversations/${convoId}/messages`, {
          headers: authHeaders(),
        });

        const arr = Array.isArray(data) ? data : [];
        const sig = signatureOf(arr);

        if (!aliveRef.current) return;

        if (sig !== lastSigRef.current) {
          lastSigRef.current = sig;
          setMessages(arr);

          // mark read only when something changed (best-effort)
          api
            .post(`/support/conversations/${convoId}/mark-read`, {}, { headers: authHeaders() })
            .catch(() => {});
        }
      } catch (e) {
        if (!aliveRef.current) return;
        const status = e?.response?.status;

        if (!silent) {
          setErr(e?.response?.data?.message || "Failed to load messages");
          console.log("LOAD ERROR:", status, e?.response?.data, e);
        }

        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          nav("/cs/login");
        }
      } finally {
        if (!silent) setLoading(false);
        inFlightRef.current = false;
      }
    },
    [convoId, nav, signatureOf]
  );

  // ✅ keep track of whether user is near bottom (polling won't yank)
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {
      stickToBottomRef.current = isNearBottom(el);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ auto scroll only when user is near bottom
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // ✅ adaptive polling (2s focused, 5s visible, 15s hidden)
  useEffect(() => {
    aliveRef.current = true;

    const pickInterval = () => {
      if (!Number.isFinite(convoId)) return 8000;
      if (sending) return 4000; // while sending, slightly slower to avoid overlapping
      if (visRef.current && focusRef.current) return 2000;
      if (visRef.current && !focusRef.current) return 5000;
      return 15000;
    };

    const tick = async () => {
      if (!aliveRef.current) return;
      await load({ silent: true });
      pollTimerRef.current = setTimeout(tick, pickInterval());
    };

    const onVis = () => {
      visRef.current = !document.hidden;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };
    const onFocus = () => {
      focusRef.current = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };
    const onBlur = () => {
      focusRef.current = false;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    // initial visible load
    load({ silent: false }).finally(() => {
      if (!aliveRef.current) return;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    });

    return () => {
      aliveRef.current = false;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [convoId, load, sending]);

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
      await api.post(
        `/support/conversations/${convoId}/reply`,
        { text: msg },
        { headers: authHeaders() }
      );

      setText("");

      // ✅ refresh instantly (no full reload)
      lastSigRef.current = "";
      await load({ silent: true });
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const msg2 =
        (typeof data === "string" ? data : data?.message) || e?.message || "Failed to send reply";

      console.log("SEND ERROR FULL:", { status, data, e });
      setErr(`(${status || "?"}) ${msg2}`);

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

          <button className="btn" type="button" onClick={() => load({ silent: false })} disabled={loading}>
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
            const isPhoto = m.kind === "photo" && m.file_url;

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
                  {/* TEXT */}
                  {m.kind === "text" ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text || ""}</div>
                  ) : null}

                  {/* PHOTO */}
                  {isPhoto ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => openImage(joinUrl(FILE_BASE, m.file_url), m.file_name || "photo")}
                        style={{
                          padding: 0,
                          border: 0,
                          background: "transparent",
                          cursor: "zoom-in",
                          display: "block",
                        }}
                        aria-label="Open photo"
                      >
                        <img
                          src={joinUrl(FILE_BASE, m.file_url)}
                          alt={m.file_name || "photo"}
                          style={{
                            width: 260,
                            maxWidth: "100%",
                            height: "auto",
                            display: "block",
                            borderRadius: 10,
                            border: "1px solid rgba(0,0,0,.12)",
                          }}
                          loading="lazy"
                        />
                      </button>

                      {m.file_name ? (
                        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                          {m.file_name}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* fallback */}
                  {m.kind !== "text" && !isPhoto ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>[Unsupported kind: {m.kind}]</div>
                  ) : null}

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

      {/* ✅ Lightbox */}
      {imgOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeImage}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "96vw",
              maxHeight: "90vh",
            }}
          >
            <button
              type="button"
              onClick={closeImage}
              aria-label="Close"
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 0,
                background: "rgba(255,255,255,0.92)",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>

            <img
              src={imgSrc}
              alt={imgAlt || "photo"}
              style={{
                maxWidth: "96vw",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: 14,
                display: "block",
              }}
            />
          </div>
        </div>
      ) : null}
    </CsLayout>
  );
}
