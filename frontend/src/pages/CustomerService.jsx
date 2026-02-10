import { useEffect, useMemo, useRef, useState } from "react";
import "./CustomerService.css";
import MemberBottomNav from "../components/MemberBottomNav";

function timeHHMM(d = new Date()) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const DEMO_AGENT = {
  name: "Customer Service",
  status: "Online • Reply time: 2–5 min • Available 24/7",
  avatar: "/icons/CS.jpg", // ✅ from public/icons/CS.jpg
};

const DEMO_TG = {
  handle: "@MarketWaySupport",
  title: "Telegram Customer Service",
  desc: "Tap below to chat via Telegram.",
  link: "https://t.me/MarketWaySupport",
};

export default function CustomerService() {
  const [mode, setMode] = useState("direct"); // default direct
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null); // { url, name }
  const [agentTyping, setAgentTyping] = useState(false);

  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      from: "agent",
      type: "text",
      text: "Hi! 👋 How can I help you today?",
      at: timeHHMM(new Date(Date.now() - 1000 * 60 * 8)),
      status: "seen",
    },
    {
      id: "m2",
      from: "agent",
      type: "text",
      text: "You can upload a screenshot for faster support.",
      at: timeHHMM(new Date(Date.now() - 1000 * 60 * 7)),
      status: "seen",
    },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const canSend = useMemo(() => {
    return text.trim().length > 0 || !!filePreview;
  }, [text, filePreview]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, agentTyping]);

  useEffect(() => {
    if (mode === "direct") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [mode]);

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFilePreview({ url, name: file.name });
    e.target.value = "";
  }

  function removePreview() {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
  }

  function bumpReceiptToSeen(sentIds) {
    // sent -> delivered -> seen
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.from !== "me") return m;
          if (!sentIds.includes(m.id)) return m;
          return { ...m, status: "delivered" };
        })
      );
    }, 550);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.from !== "me") return m;
          if (!sentIds.includes(m.id)) return m;
          return { ...m, status: "seen" };
        })
      );
    }, 1600);
  }

  function agentAutoReply() {
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + crypto.randomUUID(),
          from: "agent",
          type: "text",
          text: "Thanks! I’m checking this now. Please wait a moment.",
          at: timeHHMM(),
          status: "seen",
        },
      ]);
    }, 1300);
  }

  function send() {
    if (!canSend) return;

    const createdIds = [];
    const newMsgs = [];

    if (filePreview) {
      const id = "img-" + crypto.randomUUID();
      createdIds.push(id);
      newMsgs.push({
        id,
        from: "me",
        type: "image",
        url: filePreview.url,
        name: filePreview.name,
        at: timeHHMM(),
        status: "sent",
      });
    }

    if (text.trim()) {
      const id = "txt-" + crypto.randomUUID();
      createdIds.push(id);
      newMsgs.push({
        id,
        from: "me",
        type: "text",
        text: text.trim(),
        at: timeHHMM(),
        status: "sent",
      });
    }

    setMessages((prev) => [...prev, ...newMsgs]);
    setText("");
    setFilePreview(null);

    bumpReceiptToSeen(createdIds);
    agentAutoReply();
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function Receipt({ status }) {
    if (!status) return null;
    if (status === "sent") return <span className="rcpt">✓</span>;
    if (status === "delivered") return <span className="rcpt">✓✓</span>;
    if (status === "seen") return <span className="rcpt seen">✓✓</span>;
    return null;
  }

  return (
    <div className="csPage">
      {/* Header: title + tabs beside it (mobile also stays upper) */}
      <div className="csTopBar">
        <div className="csTopLeft">
          <img className="csTopAvatar" src={DEMO_AGENT.avatar} alt="Support" />
          <div className="csTopMeta">
            <div className="csTitle">{DEMO_AGENT.name}</div>

            {/* ✅ Online dot + green Online + new status text */}
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
          >
            Direct
          </button>
          <button
            className={"csTab " + (mode === "telegram" ? "isActive" : "")}
            onClick={() => setMode("telegram")}
            role="tab"
            aria-selected={mode === "telegram"}
          >
            Telegram
          </button>
        </div>
      </div>

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
                        <img src={m.url} alt={m.name || "upload"} />
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

              {/* Typing indicator */}
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
                      <div className="previewHint">Ready to send</div>
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
                    className="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={onPickFile}
                  />
                  <span className="icon">＋</span>
                </label>

                <div className="composerBox">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Type your message…"
                  />
                </div>

                <button
                  className={"sendBtn " + (canSend ? "isReady" : "")}
                  onClick={send}
                  type="button"
                  disabled={!canSend}
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

      <MemberBottomNav active="service" />      
    </div>
  );
}
