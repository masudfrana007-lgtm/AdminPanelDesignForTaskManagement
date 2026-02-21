// src/pages/CustomerService.jsx (NEW UI + OLD backend)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerService.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";

/* ---------------- helpers ---------------- */
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

/* ---------------- UI constants ---------------- */
const DEMO_AGENT = {
  name: "Customer Service",
  avatar: "/icons/CS.jpg",
};

const DEMO_TG = {
  handle: "@MarketWaySupport",
  title: "Telegram Customer Service",
  desc: "Tap below to chat via Telegram.",
  link: "https://t.me/MarketWaySupport",
};

export default function CustomerService() {
  const nav = useNavigate();

  /* ---------------- NEW UI state ---------------- */
  const [mode, setMode] = useState("direct"); // direct | telegram
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null); // { file, url, name }

  /* ---------------- OLD backend state (kept) ---------------- */
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]); // mapped messages for UI
  const [agentTyping, setAgentTyping] = useState(false);
  const [err, setErr] = useState("");

  // upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // refs
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const photoInputRef = useRef(null);

  // polling refs (old)
  const pollTimerRef = useRef(null);
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);
  const lastSigRef = useRef("");
  const stickToBottomRef = useRef(true);
  const visRef = useRef(!document.hidden);
  const focusRef = useRef(document.hasFocus());

  // lightbox (old)
  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");

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

  /* ---------------- backend mapping (old -> new UI fields) ---------------- */
  const mapMsgs = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    return a.map((m) => ({
      id: String(m.id),
      from: m.sender_type === "agent" ? "agent" : "me", // ✅ UI expects me/agent
      type: m.kind === "photo" ? "image" : "text",
      text: m.text || "",
      url: m.file_url || "",
      name: m.file_name || "",
      at: toHHMM(m.created_at),
      status:
        m.sender_type === "member"
          ? m.read_by_agent
            ? "seen"
            : "delivered"
          : undefined,
      _raw: m,
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
          const { data: convo } = await memberApi.get("/member/support/conversation");
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

          // mark read (old)
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

  /* ---------------- scrolling + polling (old) ---------------- */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => (stickToBottomRef.current = isNearBottom(el));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, agentTyping]);

  useEffect(() => {
    aliveRef.current = true;

    const pickInterval = () => {
      if (mode !== "direct") return 12000;
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
  }, [mode, loadAll]);

  /* ---------------- NEW UI file preview -> backend photo upload ---------------- */
  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\//i.test(file.type || "")) {
      setErr("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErr("Max photo size is 3MB.");
      e.target.value = "";
      return;
    }

    setErr("");
    const url = URL.createObjectURL(file);
    setFilePreview({ file, url, name: file.name });
    e.target.value = "";
  }

  function removePreview() {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
  }

  /* ---------------- send text + upload photo (old endpoints) ---------------- */
  const sendTextToBackend = async (payload) => {
    const t = String(payload || "").trim();
    if (!t) return;

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

    await memberApi.post("/member/support/send", {
      conversation_id: conversationId,
      text: t,
    });

    lastSigRef.current = "";
    await loadAll({ silent: true });
  };

  const uploadPhotoToBackend = async (file) => {
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

    const fd = new FormData();
    fd.append("conversation_id", String(conversationId));
    fd.append("photo", file);

    await memberApi.post("/member/support/send-photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    lastSigRef.current = "";
    await loadAll({ silent: true });
  };

  const canSend = useMemo(() => {
    return text.trim().length > 0 || !!filePreview;
  }, [text, filePreview]);

  async function send() {
    if (!canSend || uploadingPhoto) return;

    try {
      setErr("");
      const t = text.trim();
      setText("");

      // photo first
      if (filePreview?.file) {
        setUploadingPhoto(true);
        await uploadPhotoToBackend(filePreview.file);
        removePreview();
      }

      // then text
      if (t) {
        await sendTextToBackend(t);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send");
      if (e?.response?.status === 401) nav("/member/login");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  /* focus on direct mode */
  useEffect(() => {
    if (mode === "direct") setTimeout(() => inputRef.current?.focus(), 120);
  }, [mode]);

  function Receipt({ status }) {
    if (!status) return null;
    if (status === "delivered") return <span className="rcpt">✓✓</span>;
    if (status === "seen") return <span className="rcpt seen">✓✓</span>;
    return <span className="rcpt">✓</span>;
  }

  return (
    <div className="csPage">
      {/* TOP HEADER */}
      <div className="csTopBar">
        <div className="csTopLeft">
          <img className="csTopAvatar" src={DEMO_AGENT.avatar} alt="Support" />
          <div className="csTopMeta">
            <div className="csTitle">{DEMO_AGENT.name}</div>

            <div className="csSub">
              <span className="onlineDot" />
              <span className="onlineText">Online</span>
              <span className="statusSep">•</span>
              Reply time: 2–5 min
              <span className="statusSep">•</span>
              Available 24/7
            </div>
          </div>
        </div>

        <div className="csTabs" role="tablist" aria-label="Support Channels">
          <button
            className={"csTab " + (mode === "direct" ? "isActive" : "")}
            onClick={() => setMode("direct")}
            role="tab"
            aria-selected={mode === "direct"}
            type="button"
          >
            Direct
          </button>
          <button
            className={"csTab " + (mode === "telegram" ? "isActive" : "")}
            onClick={() => setMode("telegram")}
            role="tab"
            aria-selected={mode === "telegram"}
            type="button"
          >
            Telegram
          </button>
        </div>
      </div>

      {err ? (
        <div style={{ padding: "10px 12px", color: "#fecaca", fontWeight: 800 }}>
          {err}
        </div>
      ) : null}

      <div className="csBodyOne">
        {mode === "direct" ? (
          <section className="chatShell">
            {/* Messages */}
            <div className="chatList" ref={listRef}>
              <div className="chatDay">
                <span>Today</span>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={"chatRow " + (m.from === "me" ? "isMe" : "isAgent")}
                >
                  <div className={"bubble " + (m.type === "image" ? "isImage" : "")}>
                    {m.type === "image" ? (
                      <div className="imgWrap">
                        <img
                          src={m.url || "/user.png"}
                          alt={m.name || "upload"}
                          onClick={() =>
                            openImage(m.url || "/user.png", m.name || "photo")
                          }
                          style={{ cursor: "zoom-in" }}
                        />                        
                      </div>
                    ) : (
                      <div className="bubbleText">{m.text}</div>
                    )}

                    <div className="bubbleMeta">
                      <span>{m.at}</span>
                      {m.from === "me" ? <Receipt status={m.status} /> : null}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator (keep state; wire later if you want) */}
              {agentTyping ? (
                <div className="chatRow isAgent">
                  <div className="typingBubble" aria-label="Typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Composer */}
            <div className="composer">
              {filePreview ? (
                <div className="previewBar">
                  <div className="previewLeft">
                    <div
                      className="previewThumb"
                      style={{ backgroundImage: `url("${filePreview.url}")` }}
                      aria-hidden="true"
                    />
                    <div className="previewInfo">
                      <div className="previewName">{filePreview.name}</div>
                      <div className="previewHint">
                        {uploadingPhoto ? "Uploading…" : "Ready to send"}
                      </div>
                    </div>
                  </div>
                  <button className="previewRemove" onClick={removePreview} type="button">
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="composerRow">
                <label className="iconBtn" title="Upload photo">
                  <input
                    ref={photoInputRef}
                    className="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                    disabled={uploadingPhoto}
                  />
                  <span className="icon">{uploadingPhoto ? "⏳" : "＋"}</span>
                </label>

                <div className="composerBox">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Type your message…"
                    disabled={uploadingPhoto}
                  />
                </div>

                <button
                  className={"sendBtn " + (canSend && !uploadingPhoto ? "isReady" : "")}
                  onClick={send}
                  type="button"
                  disabled={!canSend || uploadingPhoto}
                >
                  Send
                </button>
              </div>

              <div className="composerNote">
                Never share passwords. Upload screenshots using the + button.
              </div>
            </div>
          </section>
        ) : (
          <section className="tgShell">
            <div className="tgHero">
              <div className="tgBadge">Telegram</div>
              <div className="tgTitle">{DEMO_TG.title}</div>
              <div className="tgDesc">{DEMO_TG.desc}</div>

              <div className="tgCard">
                <div className="tgRow">
                  <div className="tgLabel">Handle</div>
                  <div className="tgValue">{DEMO_TG.handle}</div>
                </div>
                <div className="tgRow">
                  <div className="tgLabel">Response</div>
                  <div className="tgValue">Typically 5–15 minutes</div>
                </div>
              </div>

              <a className="tgBtn" href={DEMO_TG.link} target="_blank" rel="noreferrer">
                Open Telegram Chat
              </a>

              <div className="tgNote">
                If not opening, search <b>{DEMO_TG.handle}</b> in Telegram.
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {imgOpen ? (
        <div className="cs-imgOverlay" role="dialog" aria-modal="true" onClick={closeImage}>
          <div className="cs-imgModal" onClick={(e) => e.stopPropagation()}>
            <button className="cs-imgClose" type="button" onClick={closeImage} aria-label="Close">
              ✕
            </button>
            <img className="cs-imgFull" src={imgSrc} alt={imgAlt || "photo"} />
          </div>
        </div>
      ) : null}

      <MemberBottomNav active="service" />
    </div>
  );
}
