import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/memberService.css";
import MemberBottomNav from "../components/MemberBottomNav";

function pad2(x) {
  return String(x).padStart(2, "0");
}
function nowTime() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

const LS_KEY = "customer_service_chat_pro_v1";

export default function CustomerService() {
  const [channel, setChannel] = useState("direct"); // "direct" | "telegram"
  const [message, setMessage] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const chatRef = useRef(null);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const TELEGRAM_USERNAME = "@YourSupport";
  const TELEGRAM_LINK = "https://t.me/YourSupport";

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

  const seeded = useMemo(
    () => [
      {
        id: "a1",
        from: "agent",
        kind: "text",
        text: "Hello 👋 How can I help you today?",
        time: "09:12",
      },
      {
        id: "u1",
        from: "user",
        kind: "text",
        text: "My deposit is not showing yet.",
        time: "09:13",
        status: "read", // sent | delivered | read
      },
      {
        id: "a2",
        from: "agent",
        kind: "text",
        text: "Please share TXID and network. A screenshot also helps.",
        time: "09:14",
      },
    ],
    []
  );

  const [messages, setMessages] = useState(seeded);
  const [agentTyping, setAgentTyping] = useState(false);

  // Load chat
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save chat
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, agentTyping]);

  const clearChat = () => {
    localStorage.removeItem(LS_KEY);
    setMessages(seeded);
  };

  // Simulate user message status updates: sent -> delivered -> read
  const simulateStatus = (msgId) => {
    // delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: "delivered" } : m))
      );
    }, 450);

    // read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: "read" } : m))
      );
    }, 1000);
  };

  const agentAutoReply = (text) => {
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          from: "agent",
          kind: "text",
          text,
          time: nowTime(),
        },
      ]);
    }, 1100);
  };

  const sendText = () => {
    const text = message.trim();
    if (!text) return;

    const id = "u-" + Date.now();
    const userMsg = {
      id,
      from: "user",
      kind: "text",
      text,
      time: nowTime(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    simulateStatus(id);
    agentAutoReply("Thanks. Please confirm the network (TRC20 / ERC20) and attach a screenshot if available.");
  };

  const addFileMessage = (file, kind) => {
    if (!file) return;

    const id = "f-" + Date.now();
    const msg = {
      id,
      from: "user",
      kind, // "photo" | "file"
      name: file.name,
      size: file.size,
      time: nowTime(),
      status: "sent",
    };

    setMessages((prev) => [...prev, msg]);
    simulateStatus(id);

    agentAutoReply("Received. We are reviewing your attachment now.");
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
        <button className="cs-back" type="button" aria-label="Back">
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

          <button className="cs-headBtn" type="button" onClick={clearChat}>
            Clear
          </button>
        </div>
      </header>

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
              {/* ✅ Agent profile header */}
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
                            <div className="cs-fileMeta">
                              Photo • {(m.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      )}

                      {m.kind === "file" && (
                        <div className="cs-file">
                          <div className="cs-fileIcon">📄</div>
                          <div className="cs-fileBody">
                            <div className="cs-fileName">{m.name}</div>
                            <div className="cs-fileMeta">
                              Document • {(m.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="cs-metaRow">
                        <span className="cs-time">{m.time}</span>

                        {/* ✅ Read status only for user */}
                        {m.from === "user" && (
                          <span className={"cs-read " + (m.status === "read" ? "is-read" : "")}>
                            {statusIcon(m.status)}
                          </span>
                        )}
                      </div>

                      {/* bubble tail */}
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

              {/* ✅ Sticky input + safe area */}
              <footer className="cs-inputBar">
                <button className="cs-iconBtn" type="button" title="Upload photo" onClick={() => photoInputRef.current?.click()}>
                  📷
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => addFileMessage(e.target.files?.[0], "photo")}
                />

                <button className="cs-iconBtn" type="button" title="Upload document" onClick={() => fileInputRef.current?.click()}>
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => addFileMessage(e.target.files?.[0], "file")}
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
              {/* ✅ Verified channel card */}
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

      {/* ✅ Help Center Modal */}
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

      {/* keep bottom bar exactly */}
      <MemberBottomNav active="menu" />

    </div>
  );
}
