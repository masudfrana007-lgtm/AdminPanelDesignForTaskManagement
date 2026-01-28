import { useMemo, useRef, useState } from "react";
import "../styles/CustomerService.css";
import MemberBottomNav from "../components/MemberBottomNav";

const CATEGORIES = [
  "Deposit Issue",
  "Withdrawal Issue",
  "Account & Verification",
  "Security",
  "Bonus & Promotions",
  "Technical Support",
  "Other",
];

const QUICK_REPLIES = [
  "Deposit not received",
  "Wrong network sent",
  "Withdrawal pending",
  "Account locked",
  "KYC help",
  "Change payment method",
];

const FAQ = [
  { q: "How long does a deposit take?", a: "Usually credited after required confirmations. Time varies by network." },
  { q: "What should I send for faster help?", a: "TXID, amount, network, and a screenshot if possible." },
  { q: "Can I change the deposit network?", a: "No. Funds must be sent on the same network shown on deposit page." },
];

const DEMO_MESSAGES = [
  { id: 1, from: "agent", text: "Hello! 👋 How can I help you today?", time: "09:12" },
  { id: 2, from: "user", text: "My deposit is not showing yet.", time: "09:13", delivery: "Seen" },
  { id: 3, from: "agent", text: "Please share TXID and network. A screenshot also helps.", time: "09:14" },
];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function makeTicketId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `CS-${n}`;
}

export default function CustomerService() {
  const [tab, setTab] = useState("chat");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [ticketId, setTicketId] = useState(makeTicketId());
  const [ticketStatus, setTicketStatus] = useState("Open");
  const [priority, setPriority] = useState("Normal");

  const [agentTyping, setAgentTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const msgBoxRef = useRef(null);

  const agent = useMemo(
    () => ({
      name: "Royal Support",
      status: "Online",
      reply: "Usually replies in 3–10 min",
      hours: "24/7 (VIP priority)",
    }),
    []
  );

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const s = search.toLowerCase();
    return messages.filter((m) => (m.text || "").toLowerCase().includes(s));
  }, [messages, search]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (!msgBoxRef.current) return;
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    });
  };

  const openFilePicker = () => fileRef.current?.click();
  const openImagePicker = () => imageRef.current?.click();

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removePending = (idx) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), from: "agent", text: "Chat cleared. How can I help you now?", time: nowTime() }]);
    setPendingFiles([]);
    setDraft("");
    setAgentTyping(false);
  };

  const newTicket = () => {
    setTicketId(makeTicketId());
    setTicketStatus("Open");
    setPriority("Normal");
    setCategory(CATEGORIES[0]);
    setMessages([{ id: Date.now(), from: "agent", text: "New ticket created ✅ Tell us your issue.", time: nowTime() }]);
    setPendingFiles([]);
    setDraft("");
    setAgentTyping(false);
  };

  const updateDelivery = (id, value) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, delivery: value } : m)));
  };

  const send = () => {
    const text = draft.trim();
    if (!text && pendingFiles.length === 0) return;

    const myId = Date.now();
    const msg = {
      id: myId,
      from: "user",
      text: text || "(Attachment sent)",
      time: nowTime(),
      delivery: "Sent",
      attachments: pendingFiles.map((f) => ({ name: f.name, size: f.size })),
    };

    setMessages((prev) => [...prev, msg]);
    setDraft("");
    setPendingFiles([]);
    scrollToBottom();

    setTimeout(() => updateDelivery(myId, "Delivered"), 500);

    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "agent",
          text:
            category === "Deposit Issue"
              ? "Thanks. Please confirm the network and TXID. We’ll verify your deposit status now."
              : "Thanks. We received your request. Please wait while we verify and respond.",
          time: nowTime(),
        },
      ]);

      updateDelivery(myId, "Seen");
      scrollToBottom();
    }, 1100);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="cs-page cs-bgSupport">
      <div className="cs-overlay" />

      <header className="cs-header">
        <button className="cs-back" onClick={() => window.history.back()} type="button">
          ←
        </button>

        <div className="cs-title">
          <h1>Customer Service</h1>
          <p>Open a ticket, chat with support, or contact Telegram service.</p>
        </div>

        <div className="cs-headerActions">
          <button className="cs-ghostBtn" type="button" onClick={newTicket}>
            + New Ticket
          </button>
          <button className="cs-ghostBtn" type="button" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </header>

      <main className="cs-wrap">
        <section className="cs-grid">
          <div className="cs-main">
            <div className="cs-card cs-tabs">
              <button className={"cs-tabBtn " + (tab === "chat" ? "is-active" : "")} onClick={() => setTab("chat")} type="button">
                Direct Messaging <span className="cs-tabHint">In-app</span>
              </button>
              <button className={"cs-tabBtn " + (tab === "telegram" ? "is-active" : "")} onClick={() => setTab("telegram")} type="button">
                Telegram Support <span className="cs-tabHint">@YourSupport</span>
              </button>
            </div>

            {tab === "chat" ? (
              <>
                <div className="cs-card cs-ticket">
                  <div className="cs-ticketLeft">
                    <div className="cs-ticketTop">
                      <div className="cs-ticketId">{ticketId}</div>
                      <span className={"cs-pill " + (ticketStatus === "Open" ? "is-open" : "")}>{ticketStatus}</span>
                      <span className="cs-pill is-priority">{priority}</span>
                    </div>

                    <div className="cs-ticketBottom">
                      <div className="cs-field">
                        <div className="cs-label">Category</div>
                        <select className="cs-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="cs-field">
                        <div className="cs-label">Search in chat</div>
                        <input className="cs-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." />
                      </div>
                    </div>
                  </div>

                  <div className="cs-ticketRight">
                    <div className="cs-agent">
                      <div className="cs-agentAvatar">RS</div>
                      <div className="cs-agentMeta">
                        <div className="cs-agentName">
                          {agent.name} <span className="cs-onlineDot" /> <span className="cs-onlineText">{agent.status}</span>
                        </div>
                        <div className="cs-mutedSmall">{agent.reply}</div>
                        <div className="cs-mutedSmall">Hours: {agent.hours}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cs-chipRow">
                  {QUICK_REPLIES.map((c) => (
                    <button key={c} className="cs-chip" type="button" onClick={() => setDraft((d) => (d ? d + "\n" + c : c))}>
                      {c}
                    </button>
                  ))}
                </div>

                <div className="cs-card cs-chat">
                  <div className="cs-messages" ref={msgBoxRef}>
                    {filteredMessages.map((m) => (
                      <div key={m.id} className={"cs-msg " + (m.from === "user" ? "is-user" : "is-agent")}>
                        <div className="cs-bubble">
                          <div className="cs-text">{m.text}</div>

                          {m.attachments?.length ? (
                            <div className="cs-attachList">
                              {m.attachments.map((a, idx) => (
                                <div key={idx} className="cs-attachItem">
                                  <span className="cs-attachIcon">📎</span>
                                  <span className="cs-attachName">{a.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="cs-metaRow">
                            <div className="cs-time">{m.time}</div>
                            {m.from === "user" && (
                              <div className={"cs-delivery " + (m.delivery === "Seen" ? "is-seen" : "")}>
                                {m.delivery === "Sent" && "✓ Sent"}
                                {m.delivery === "Delivered" && "✓✓ Delivered"}
                                {m.delivery === "Seen" && "✓✓ Seen"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {agentTyping && (
                      <div className="cs-msg is-agent">
                        <div className="cs-bubble cs-typingBubble">
                          <div className="cs-typing">
                            <span className="dot" />
                            <span className="dot" />
                            <span className="dot" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {pendingFiles.length > 0 && (
                    <div className="cs-pending">
                      {pendingFiles.map((f, idx) => (
                        <div className="cs-fileChip" key={idx}>
                          <span className="cs-fileIcon">📎</span>
                          <span className="cs-fileName">{f.name}</span>
                          <button className="cs-fileX" type="button" onClick={() => removePending(idx)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="cs-inputRow">
                    <div className="cs-tools">
                      <button className="cs-toolBtn" type="button" onClick={openImagePicker} title="Add image">📷</button>
                      <button className="cs-toolBtn" type="button" onClick={openFilePicker} title="Add file">📎</button>

                      <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFiles} />
                      <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onPickFiles} />
                    </div>

                    <textarea
                      className="cs-input"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Write your message… (Enter to send, Shift+Enter new line)"
                    />
                    <button className="cs-sendBtn" type="button" onClick={send}>Send</button>
                  </div>

                  <div className="cs-note">
                    For deposit/withdraw issues: include <b>TXID</b>, <b>amount</b>, <b>network</b>, and screenshot if available.
                  </div>
                </div>
              </>
            ) : (
              <div className="cs-card cs-telegram">
                <div className="cs-tgTop">
                  <div>
                    <div className="cs-tgTitle">Telegram Customer Support</div>
                    <div className="cs-mutedSmall">Use Telegram for urgent issues. Never share passwords or OTP codes.</div>
                  </div>
                  <div className="cs-badgeGold">Official</div>
                </div>

                <div className="cs-tgGrid">
                  <div className="cs-tgCard">
                    <div className="cs-label">Support Handle</div>
                    <div className="cs-tgHandle">@YourSupport</div>
                    <div className="cs-mutedSmall">Replace this with your official Telegram handle.</div>
                    <button className="cs-primaryBtn" type="button" onClick={() => alert("Open Telegram link (wire later)")}>
                      Open Telegram
                    </button>
                  </div>

                  <div className="cs-tgCard">
                    <div className="cs-label">Guidelines</div>
                    <ul className="cs-list">
                      <li>Never share your password or OTP.</li>
                      <li>Provide TXID for transaction issues.</li>
                      <li>Verify official handle inside the app.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="cs-side">
            <div className="cs-card cs-sideCard">
              <div className="cs-sideTitle">FAQ & Tips</div>
              {FAQ.map((f, idx) => (
                <div key={idx} className="cs-faq">
                  <div className="cs-faqQ">{f.q}</div>
                  <div className="cs-faqA">{f.a}</div>
                </div>
              ))}
              <div className="cs-divider" />
              <div className="cs-sideTitle">Security</div>
              <ul className="cs-list">
                <li>Support will never ask for your password.</li>
                <li>Do not share OTP or 2FA codes.</li>
                <li>Use official channels only.</li>
              </ul>
            </div>
          </aside>
        </section>

        {/* ✅ spacer so the bottom nav doesn't cover content */}
        <div className="csNavSpacer" />
      </main>

      {/* ✅ KEEP your existing bottom nav */}
      <MemberBottomNav active="service" />
    </div>
  );
}
