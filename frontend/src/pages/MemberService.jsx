// src/pages/MemberService.jsx
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
function isNearBottom(el, px = 140) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < px;
}

// ✅ MATCH TASKS: always load images from backend directly
const FILE_BASE = "http://159.198.40.145:5010";

// ✅ safe join for image URL
function joinUrl(base, p) {
  const path = String(p || "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const b = String(base || "").replace(/\/+$/, "");
  const u = path.startsWith("/") ? path : `/${path}`;
  return `${b}${u}`;
}

export default function CustomerService() {
  const nav = useNavigate();
  const [channel, setChannel] = useState("direct");
  const [message, setMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const chatRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const TELEGRAM_USERNAME = "@YourSupport";
  const TELEGRAM_LINK = "https://t.me/YourSupport";

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agentTyping, setAgentTyping] = useState(false);
  const [err, setErr] = useState("");

  // upload UI state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // polling refs
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);
  const lastSigRef = useRef("");
  const stickToBottomRef = useRef(true);
  const visRef = useRef(!document.hidden);
  const focusRef = useRef(document.hasFocus());

  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");

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

  const mapMsgs = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    return a.map((m) => ({
      id: String(m.id),
      from: m.sender_type === "agent" ? "agent" : "user",
      kind: m.kind || "text",
      text: m.text || "",
      fileUrl: m.file_url || "",
      fileName: m.file_name || "",
      time: toHHMM(m.created_at),
      status:
        m.sender_type === "member"
          ? m.read_by_agent
            ? "read"
            : "delivered"
          : undefined,
    }));
  }, []);

  const signatureOf = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    if (!a.length) return "0";
    const last = a[a.length - 1];
    return `${a.length}|${last?.id ?? ""}|${last?.created_at ?? ""}|${
      last?.sender_type ?? ""
    }|${last?.kind ?? ""}|${last?.text ?? ""}|${last?.file_url ?? ""}`;
  }, []);

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        if (!silent) setErr("");

        const token = localStorage.getItem("member_token");
        if (!token) {
          if (!silent) setErr("Session expired. Please login again.");
          nav("/member/login");
          return;
        }

        let cid = conversationId;
        if (!cid) {
          const { data: convo } = await memberApi.get(
            "/member/support/conversation"
          );
          cid = safeId(convo?.id);
          if (!cid) {
            if (!silent) setErr("Conversation not ready. Please reload.");
            return;
          }
          if (!aliveRef.current) return;
          setConversationId(cid);
        }

        const { data: msgs } = await memberApi.get("/member/support/messages", {
          params: { conversation_id: cid },
        });

        const sig = signatureOf(msgs);
        if (!aliveRef.current) return;

        if (sig !== lastSigRef.current) {
          lastSigRef.current = sig;
          setMessages(mapMsgs(msgs));

          memberApi
            .post("/member/support/mark-read", { conversation_id: cid })
            .catch(() => {});
        }
      } catch (e) {
        if (!aliveRef.current) return;
        const status = e?.response?.status;
        if (!silent)
          setErr(e?.response?.data?.message || "Failed to load support chat");
        if (status === 401) nav("/member/login");
      } finally {
        inFlightRef.current = false;
      }
    },
    [conversationId, mapMsgs, nav, signatureOf]
  );

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const onScroll = () => (stickToBottomRef.current = isNearBottom(el));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (stickToBottomRef.current)
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, agentTyping]);

  useEffect(() => {
    aliveRef.current = true;

    const pickInterval = () => {
      if (channel !== "direct") return 12000;
      if (visRef.current && focusRef.current) return 2000;
      if (visRef.current && !focusRef.current) return 5000;
      return 15000;
    };

    const tick = async () => {
      if (!aliveRef.current) return;
      await loadAll({ silent: true });
      pollTimerRef.current = setTimeout(tick, pickInterval());
    };

    const onVis = () => {
      visRef.current = !document.hidden;
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };
    const onFocus = () => {
      focusRef.current = true;
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };
    const onBlur = () => {
      focusRef.current = false;
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    loadAll({ silent: false }).finally(() => {
      if (!aliveRef.current) return;
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(tick, 0);
    });

    return () => {
      aliveRef.current = false;
      clearTimeout(pollTimerRef.current);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [channel, loadAll]);

  const reloadPage = () => {
    lastSigRef.current = "";
    loadAll({ silent: false });
  };

  const clearChat = () => window.location.reload();

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
      await memberApi.post("/member/support/send", {
        conversation_id: conversationId,
        text,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          from: "user",
          kind: "text",
          text,
          fileUrl: "",
          time: toHHMM(new Date().toISOString()),
          status: "delivered",
        },
      ]);

      lastSigRef.current = "";
      await loadAll({ silent: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
      if (e?.response?.status === 401) nav("/member/login");
    }
  };

  // ✅ photo upload (match Tasks)
  const uploadPhoto = async (file) => {
    if (!file) return;

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

    if (!/^image\//i.test(file.type || "")) {
      setErr("Please select an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErr("Max photo size is 3MB.");
      return;
    }

    setErr("");
    setUploadingPhoto(true);

    try {
      const fd = new FormData();
      fd.append("conversation_id", String(conversationId));
      fd.append("photo", file);

      // ✅ IMPORTANT: same as Tasks
      const { data } = await memberApi.post("/member/support/send-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = data?.file_url || "";

      setMessages((prev) => [
        ...prev,
        {
          id: String(data?.id || `photo-${Date.now()}`),
          from: "user",
          kind: "photo",
          text: "",
          fileUrl: url,
          time: toHHMM(data?.created_at || new Date().toISOString()),
          status: "delivered",
          fileName: data?.file_name || file.name,
        },
      ]);

      lastSigRef.current = "";
      await loadAll({ silent: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to upload photo");
      if (e?.response?.status === 401) nav("/member/login");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const addPhotoMessage = () => {
    if (uploadingPhoto) return;
    photoInputRef.current?.click();
  };

  const addFileMessage = () => {
    setErr("Document upload is not available right now.");
  };

  const statusIcon = (status) => {
    if (status === "sent") return "✓";
    if (status === "delivered") return "✓✓";
    if (status === "read") return "✓✓";
    return "";
  };

  return (
    <div className="cs-page">
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

      {err ? (
        <div style={{ padding: "10px 18px", color: "#b91c1c" }}>{err}</div>
      ) : null}

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
                  <div
                    key={m.id}
                    className={"cs-msg " + (m.from === "user" ? "user" : "agent")}
                  >
                    <div className="cs-bubble cs-pop">
                      {m.kind === "text" && <div className="cs-text">{m.text}</div>}

                      {m.kind === "photo" && (
                        <div className="cs-file">
                          <button
                            type="button"
                            className="cs-photoBtn"
                            onClick={() => openImage(joinUrl(FILE_BASE, m.fileUrl), m.fileName || "photo")}
                            aria-label="Open photo"
                          >
                            <img
                              className="cs-photoThumb"
                              src={joinUrl(FILE_BASE, m.fileUrl)}
                              alt={m.fileName || "photo"}
                              loading="lazy"
                            />
                          </button>

                          {m.fileName ? (
                            <div className="cs-fileName">{m.fileName}</div>
                          ) : null}
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
                <button
                  className="cs-iconBtn"
                  type="button"
                  title="Upload photo"
                  onClick={addPhotoMessage}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? "⏳" : "📷"}
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => uploadPhoto(e.target.files?.[0])}
                />

                <button
                  className="cs-iconBtn"
                  type="button"
                  title="Upload document"
                  onClick={addFileMessage}
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
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
                  disabled={uploadingPhoto}
                />

                <button
                  className="cs-sendBtn"
                  disabled={!message.trim() || uploadingPhoto}
                  onClick={sendText}
                  type="button"
                >
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

      {imgOpen && (
        <div className="cs-imgOverlay" role="dialog" aria-modal="true" onClick={closeImage}>
          <div className="cs-imgModal" onClick={(e) => e.stopPropagation()}>
            <button className="cs-imgClose" type="button" onClick={closeImage} aria-label="Close">
              ✕
            </button>

            <img className="cs-imgFull" src={imgSrc} alt={imgAlt || "photo"} />
          </div>
        </div>
      )}

      <MemberBottomNav active="service" />
    </div>
  );
}
