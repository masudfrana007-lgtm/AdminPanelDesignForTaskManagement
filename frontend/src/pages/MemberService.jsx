// src/pages/MemberService.jsx
// ✅ FULLY FIXED — efficient polling + no manual headers (memberApi interceptor)
// ✅ design/layout unchanged
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberService.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";

function pad2(x) {
  return String(x).padStart(2, "0");
}

function toHHMM(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function safeId(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// user scroll behavior: only autoscroll if user is near bottom
function isNearBottom(el, px = 140) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < px;
}

export default function CustomerService() {
  const nav = useNavigate();
  const [channel, setChannel] = useState("direct"); // "direct" | "telegram"
  const [message, setMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const chatRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const TELEGRAM_USERNAME = "@YourSupport";
  const TELEGRAM_LINK = "https://t.me/YourSupport";

  // ✅ DB state
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agentTyping, setAgentTyping] = useState(false);
  const [err, setErr] = useState("");

  // ✅ polling refs (no extra renders)
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);
  const lastSigRef = useRef(""); // signature of latest messages (prevents re-render)
  const stickToBottomRef = useRef(true);
  const visRef = useRef(!document.hidden);
  const focusRef = useRef(document.hasFocus());

  const faqs = useMemo(
    () => [
      {
        q: "How long does a deposit take?",
        a: "Deposits are credited after required network confirmations. Timing depends on the network and congestion.",
      },
      {
        q: "What should I send for faster support?",
        a: "Please provide TXID, amount, network, and a screenshot if possible.",
      },
      {
        q: "Can I change the deposit network?",
        a: "No. Funds must be sent on the same network shown on the deposit page.",
      },
      {
        q: "Why is my withdrawal pending?",
        a: "Withdrawals can be delayed by verification checks or network conditions. Share your withdrawal ID for review.",
      },
    ],
    []
  );

  // ✅ map DB -> UI shape (stable)
  const mapMsgs = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    return a.map((m) => ({
      id: String(m.id),
      from: m.sender_type === "agent" ? "agent" : "user",
      kind: m.kind || "text",
      text: m.text || "",
      time: toHHMM(m.created_at),
      status:
        m.sender_type === "member"
          ? m.read_by_agent
            ? "read"
            : "delivered"
          : undefined,
    }));
  }, []);

  // ✅ cheap signature to avoid unnecessary setMessages()
  const signatureOf = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    if (!a.length) return "0";
    const last = a[a.length - 1];
    return `${a.length}|${last?.id ?? ""}|${last?.created_at ?? ""}|${last?.sender_type ?? ""}|${last?.text ?? ""}`;
  }, []);

  // ✅ single loader used by polling + initial load + manual reload
  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (inFlightRef.current) return; // prevent overlaps
      inFlightRef.current = true;

      try {
        if (!silent) setErr("");

        const token = localStorage.getItem("member_token");
        if (!token) {
          if (!silent) setErr("Session expired. Please login again.");
          nav("/member/login");
          return;
        }

        // create/get conversation (only if missing)
        let cid = conversationId;
        if (!cid) {
          const { data: convo } = await memberApi.get("/member/support/conversation");
          cid = safeId(convo?.id);
          if (!cid) {
            if (!silent) setErr("Conversation not ready. Please reload.");
            return;
          }
          if (!aliveRef.current) return;
          setConversationId(cid);
        }

        // load messages
        const { data: msgs } = await memberApi.get("/member/support/messages", {
          params: { conversation_id: cid },
        });

        const sig = signatureOf(msgs);
        if (!aliveRef.current) return;

        // only update UI if changed
        if (sig !== lastSigRef.current) {
          lastSigRef.current = sig;
          setMessages(mapMsgs(msgs));

          // optional: mark agent msgs read by member (only when changed)
          memberApi.post("/member/support/mark-read", { conversation_id: cid }).catch(() => {});
        }
      } catch (e) {
        if (!aliveRef.current) return;
        const status = e?.response?.status;
        if (!silent) setErr(e?.response?.data?.message || "Failed to load support chat");
        if (status === 401) nav("/member/login");
      } finally {
        inFlightRef.current = false;
      }
    },
    [conversationId, mapMsgs, nav, signatureOf]
  );

  // ✅ scroll listener (so polling doesn't yank user to bottom)
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {
      stickToBottomRef.current = isNearBottom(el);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ auto-scroll only when user is near bottom
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, agentTyping]);

  // ✅ adaptive polling: fast when visible/focused, slower when hidden
  useEffect(() => {
    aliveRef.current = true;

    const pickInterval = () => {
      // fast when user is looking at chat, slow otherwise (saves server)
      const visible = visRef.current;
      const focused = focusRef.current;
      if (channel !== "direct") return 12000; // telegram tab: slow
      if (visible && focused) return 2000;    // best UX
      if (visible && !focused) return 5000;   // tab visible but not focused
      return 15000;                           // hidden
    };

    const tick = async () => {
      if (!aliveRef.current) return;
      await loadAll({ silent: true });
      // schedule next tick with latest interval (adaptive)
      const ms = pickInterval();
      pollTimerRef.current = setTimeout(tick, ms);
    };

    // watch tab visibility/focus to adapt interval immediately
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

    // initial load (not silent so errors show)
    loadAll({ silent: false }).finally(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, loadAll]);

  // ✅ keep your UI buttons but avoid full reload (more efficient than reload)
  const clearChat = () => {
    // you don't have a delete endpoint; keep same behavior:
    window.location.reload();
  };

  const reloadPage = () => {
    // efficient reload (no page refresh)
    lastSigRef.current = ""; // force update even if signature same
    loadAll({ silent: false });
  };

  // ✅ Send message to DB then refresh messages (no full reload)
  const sendText = async () => {
    const text = message.trim();
    if (!text) return;

    const token = localStorage.getItem("member_token");
    if (!token) {
      setErr("Session expired. Please login again.");
      nav("/member/login");
      return;
    }

    if (!conversationId) {
      setErr("Conversation not ready. Please reload.");
      return;
    }

    setErr("");
    setMessage("");

    try {
      await memberApi.post("/member/support/send", { conversation_id: conversationId, text });

      // fast UX: optimistically append (optional)
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          from: "user",
          kind: "text",
          text,
          time: toHHMM(new Date().toISOString()),
          status: "delivered",
        },
      ]);

      // then pull from server to keep canonical order/ids
      lastSigRef.current = "";
      await loadAll({ silent: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
      if (e?.response?.status === 401) nav("/member/login");
    }
  };

  const addFileMessage = () => {
    setErr("Upload is not available right now. Please send text only.");
  };

  const statusIcon = (status) => {
    if (status === "sent") return "✓";
    if (status === "delivered") return "✓✓";
    if (status === "read") return "✓✓";
    return "";
  };

  return (
    <div className="cs-page">
      {/* Header */}
      <header className="cs-header">
        <button className="cs-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="cs-headerText">
          <h1>Customer Service</h1>
          <p>Chat with support or use Telegram service</p>
        </div>

        <div className="cs-headerRight">
          <span className="cs-statusDot" />
          <span className="cs-statusText">Online</span>

          <button className="cs-headBtn" type="button" onClick={() => setHelpOpen(true)}>
            Help Center
          </button>

          <button className="cs-headBtn" type="button" onClick={reloadPage}>
            Reload
          </button>

          <button className="cs-headBtn" type="button" onClick={clearChat}>
            Clear
          </button>
        </div>
      </header>

      {err ? <div style={{ padding: "10px 18px", color: "#b91c1c" }}>{err}</div> : null}

      {/* Switch */}
      <section className="cs-switchWrap">
        <div className="cs-switch">
          <button
            type="button"
            className={"cs-switchBtn " + (channel === "direct" ? "is-active" : "")}
            onClick={() => setChannel("direct")}
          >
            Direct Customer Service
            <span className="cs-switchSub">In-app • Live chat</span>
          </button>

          <button
            type="button"
            className={"cs-switchBtn " + (channel === "telegram" ? "is-active" : "")}
            onClick={() => setChannel("telegram")}
          >
            Telegram Customer Service
            <span className="cs-switchSub">{TELEGRAM_USERNAME}</span>
          </button>
        </div>
      </section>

      {/* Body */}
      <main className="cs-content">
        <section className="cs-main">
          {channel === "direct" ? (
            <>
              <div className="cs-agentBar">
                <div className="cs-agentAvatar">RS</div>
                <div className="cs-agentMeta">
                  <div className="cs-agentNameRow">
                    <span className="cs-agentName">Royal Support</span>
                    <span className="cs-verified" title="Verified">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="cs-agentSub">
                    Reply time: <b>3–10 min</b> • Available 24/7
                  </div>
                </div>
              </div>

              <div className="cs-chat" ref={chatRef}>
                {messages.map((m) => (
                  <div key={m.id} className={"cs-msg " + (m.from === "user" ? "user" : "agent")}>
                    <div className="cs-bubble cs-pop">
                      {m.kind === "text" && <div className="cs-text">{m.text}</div>}

                      {m.kind === "photo" && (
                        <div className="cs-file">
                          <div className="cs-fileIcon">🖼️</div>
                          <div className="cs-fileBody">
                            <div className="cs-fileName">{m.name}</div>
                            <div className="cs-fileMeta">Photo</div>
                          </div>
                        </div>
                      )}

                      {m.kind === "file" && (
                        <div className="cs-file">
                          <div className="cs-fileIcon">📄</div>
                          <div className="cs-fileBody">
                            <div className="cs-fileName">{m.name}</div>
                            <div className="cs-fileMeta">Document</div>
                          </div>
                        </div>
                      )}

                      <div className="cs-metaRow">
                        <span className="cs-time">{m.time}</span>

                        {m.from === "user" && (
                          <span className={"cs-read " + (m.status === "read" ? "is-read" : "")}>
                            {statusIcon(m.status)}
                          </span>
                        )}
                      </div>

                      <span className="cs-tail" aria-hidden="true" />
                    </div>
                  </div>
                ))}

                {agentTyping && (
                  <div className="cs-msg agent">
                    <div className="cs-bubble cs-typing cs-pop">
                      <span className="cs-dot" />
                      <span className="cs-dot" />
                      <span className="cs-dot" />
                      <span className="cs-typingText">Support is typing…</span>
                      <span className="cs-tail" aria-hidden="true" />
                    </div>
                  </div>
                )}
              </div>

              <footer className="cs-inputBar">
                <button className="cs-iconBtn" type="button" title="Upload photo" onClick={addFileMessage}>
                  📷
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={() => addFileMessage()}
                />

                <button className="cs-iconBtn" type="button" title="Upload document" onClick={addFileMessage}>
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={() => addFileMessage()}
                />

                <input
                  className="cs-input"
                  type="text"
                  placeholder="Message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendText()}
                />

                <button className="cs-sendBtn" disabled={!message.trim()} onClick={sendText} type="button">
                  Send
                </button>
              </footer>
            </>
          ) : (
            <div className="cs-telegramCardWrap">
              <div className="cs-tgCard">
                <div className="cs-tgTop">
                  <div className="cs-tgLogo">✈️</div>
                  <div className="cs-tgInfo">
                    <div className="cs-tgNameRow">
                      <div className="cs-tgName">Telegram Support</div>
                      <div className="cs-tgBadge">Verified</div>
                    </div>
                    <div className="cs-tgUser">{TELEGRAM_USERNAME}</div>
                  </div>
                </div>

                <div className="cs-tgRows">
                  <div className="cs-tgRow">
                    <span>Typical reply time</span>
                    <b>3–10 minutes</b>
                  </div>
                  <div className="cs-tgRow">
                    <span>Availability</span>
                    <b>24/7 (VIP priority)</b>
                  </div>
                  <div className="cs-tgRow">
                    <span>Security</span>
                    <b>Never share password/OTP</b>
                  </div>
                </div>

                <div className="cs-tgTips">
                  <div className="cs-tgTipsTitle">Before you message:</div>
                  <ul>
                    <li>Prepare TXID / Order ID and a screenshot.</li>
                    <li>Confirm network (TRC20 / ERC20).</li>
                    <li>Use only the official link below.</li>
                  </ul>
                </div>

                <a className="cs-tgBtn" href={TELEGRAM_LINK} target="_blank" rel="noreferrer">
                  Open Official Telegram Support
                </a>

                <div className="cs-tgFoot">
                  If Telegram does not open, search the username and verify it matches exactly.
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {helpOpen && (
        <div className="cs-modalOverlay" role="dialog" aria-modal="true">
          <div className="cs-modal">
            <div className="cs-modalTop">
              <div>
                <div className="cs-modalTitle">Help Center</div>
                <div className="cs-modalSub">FAQ, tips, and security guidance</div>
              </div>
              <button className="cs-modalClose" type="button" onClick={() => setHelpOpen(false)}>
                ✕
              </button>
            </div>

            <div className="cs-modalBody">
              <div className="cs-helpSectionTitle">FAQ</div>

              {faqs.map((f, i) => (
                <details key={i} className="cs-helpItem">
                  <summary className="cs-helpQ">{f.q}</summary>
                  <div className="cs-helpA">{f.a}</div>
                </details>
              ))}

              <div className="cs-helpSectionTitle">Security</div>
              <ul className="cs-helpList">
                <li>Support will never ask for your password.</li>
                <li>Do not share OTP or 2FA codes.</li>
                <li>Use only official channels.</li>
              </ul>
            </div>

            <div className="cs-modalBottom">
              <button className="cs-modalBtn" type="button" onClick={() => setHelpOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <MemberBottomNav active="service" />
    </div>
  );
}
