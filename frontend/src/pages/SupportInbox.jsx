import { useEffect, useMemo, useRef, useState } from "react";
import "./SupportInbox.css";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

function toTs(s) {
  if (!s) return 0;
  const safe = s.replace(" ", "T");
  const t = Date.parse(safe);
  return Number.isFinite(t) ? t : 0;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function SupportInbox() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      member: "sajib",
      displayName: "",
      phone: "+11212313",
      status: "pending",
      unread: 2,
      lastMsg: "The di...",
      lastAt: "2026-02-20 01:39",
      note: "",
      messages: [
        { id: "m1", from: "customer", text: "Hello, I need help with my account.", at: "2026-02-20 01:30" },
        { id: "m2", from: "customer", text: "Can you reply?", at: "2026-02-20 01:39" },
      ],
    },
    {
      id: 2,
      member: "User 4",
      displayName: "VIP lead",
      phone: "1235656",
      status: "pending",
      unread: 0,
      lastMsg: "Cool",
      lastAt: "2026-02-20 01:35",
      note: "Asked about pricing.",
      messages: [{ id: "m1", from: "customer", text: "Cool", at: "2026-02-20 01:35" }],
    },
    {
      id: 3,
      member: "testuser5",
      displayName: "",
      phone: "+11111111111111",
      status: "open",
      unread: 5,
      lastMsg: "Ai cha...",
      lastAt: "2026-02-19 04:50",
      note: "",
      messages: [
        { id: "m1", from: "customer", text: "Ai cha...", at: "2026-02-19 04:48" },
        { id: "m2", from: "customer", text: "Can you reply please?", at: "2026-02-19 04:50" },
      ],
    },
    {
      id: 4,
      member: "TEST1111",
      displayName: "Test account",
      phone: "+88011111111111",
      status: "open",
      unread: 0,
      lastMsg: "kdf",
      lastAt: "2026-02-17 01:29",
      note: "Ignore (testing).",
      messages: [{ id: "m1", from: "customer", text: "kdf", at: "2026-02-17 01:29" }],
    },
    {
      id: 5,
      member: "Ray360",
      displayName: "",
      phone: "+8801654328754",
      status: "open",
      unread: 0,
      lastMsg: "ggkk",
      lastAt: "2026-02-15 20:30",
      note: "",
      messages: [{ id: "m1", from: "customer", text: "ggkk", at: "2026-02-15 20:30" }],
    },
  ]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  // ✅ profile edit states
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // ✅ mobile chat open/close
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // ✅ NEW: chat auto-scroll ref
  const chatBodyRef = useRef(null);

  // ✅ NEW: helper to scroll bottom safely after render
  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      const el = chatBodyRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  // ✅ NEW: auto-scroll when opening chat or new message
  useEffect(() => {
    if (!active) return;
    if (!mobileChatOpen) return;
    scrollChatToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, mobileChatOpen, active?.messages?.length]);

  const notif = useMemo(() => {
    const unreadTotal = conversations.reduce((a, c) => a + (c.unread || 0), 0);
    const pending = conversations.filter((c) => c.status === "pending").length;
    const open = conversations.filter((c) => c.status === "open").length;
    const newest = conversations.slice().sort((a, b) => toTs(b.lastAt) - toTs(a.lastAt))[0]?.lastAt;
    return { unreadTotal, pending, open, newest: newest || "-" };
  }, [conversations]);

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

  function openConversation(c) {
    setActiveId(c.id);
    setEditName(c.displayName || "");
    setEditNote(c.note || "");
    setConversations((prev) => prev.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));

    // ✅ mobile open chat
    setMobileChatOpen(true);

    // ✅ NEW: scroll to bottom on open
    scrollChatToBottom();
  }

  function toggleStatus() {
    if (!active) return;
    setConversations((prev) =>
      prev.map((x) => (x.id === active.id ? { ...x, status: x.status === "open" ? "pending" : "open" } : x))
    );
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text || !active) return;

    const stamp = nowStamp();
    const newMsg = { id: `a-${Date.now()}`, from: "agent", text, at: stamp };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== active.id) return c;
        return {
          ...c,
          status: "open",
          messages: [...c.messages, newMsg],
          lastMsg: text.length > 28 ? text.slice(0, 28) + "…" : text,
          lastAt: stamp,
        };
      })
    );

    setDraft("");

    // ✅ NEW: scroll to bottom after send
    scrollChatToBottom();
  }

  function saveProfile() {
    if (!active) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, displayName: editName.trim(), note: editNote.trim() } : c))
    );
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
  }

  const activeLabel = active ? (active.displayName?.trim() ? active.displayName : active.member) : "";

  return (
    <div className="sxPage">
      <div className={cls("sxContainer", mobileChatOpen && "isChatOpen")}>
        <header className="sxTop">
          <div className="sxTopLeft">
            <div className="sxTitle">Support Inbox</div>
            <div className="sxSub">Customer messages • Reply and manage status</div>
          </div>

          <div className="sxTopRight">
            <button className="sxBtn" type="button" onClick={() => location.reload()}>
              Reload
            </button>
            <button className="sxBtn sxBtnPrimary" type="button">
              Logout
            </button>
          </div>
        </header>

        <section className="sxNotif">
          <div className="sxNotifItem">
            <div className="sxNotifK">Unread</div>
            <div className="sxNotifV">{notif.unreadTotal}</div>
          </div>
          <div className="sxNotifItem">
            <div className="sxNotifK">Pending</div>
            <div className="sxNotifV">{notif.pending}</div>
          </div>
          <div className="sxNotifItem">
            <div className="sxNotifK">Open</div>
            <div className="sxNotifV">{notif.open}</div>
          </div>
          <div className="sxNotifItem sxNotifWide">
            <div className="sxNotifK">Last activity</div>
            <div className="sxNotifV sxMono">{notif.newest}</div>
          </div>
        </section>

        <div className={cls("sxLayout", mobileChatOpen && "isChatOpen")}>
          <aside className="sxLeft">
            <div className="sxTools">
              <div className="sxSearch">
                <span className="sxSearchIcon" aria-hidden="true">
                  🔎
                </span>
                <input
                  className="sxInput"
                  placeholder="Search member, phone, last message…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="sxRow">
                <div className="sxSeg">
                  <button className={cls("sxSegBtn", status === "all" && "isActive")} onClick={() => setStatus("all")}>
                    All
                  </button>
                  <button className={cls("sxSegBtn", status === "open" && "isActive")} onClick={() => setStatus("open")}>
                    Open
                  </button>
                  <button
                    className={cls("sxSegBtn", status === "pending" && "isActive")}
                    onClick={() => setStatus("pending")}
                  >
                    Pending
                  </button>
                </div>

                <label className="sxCheck">
                  <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
                  <span>Unread</span>
                </label>
              </div>
            </div>

            <div className="sxListHead">
              <div className="sxListTitle">Conversations</div>
              <div className="sxListMeta">
                {filteredSorted.length}/{conversations.length}
              </div>
            </div>

            <div className="sxList">
              {filteredSorted.map((c) => {
                const isUnread = c.unread > 0;
                const label = c.displayName?.trim() ? c.displayName : c.member;

                return (
                  <button
                    key={c.id}
                    className={cls("sxItem", c.id === activeId && "isActive", isUnread && "isUnread")}
                    type="button"
                    onClick={() => openConversation(c)}
                  >
                    <div className="sxAvatar">{label.slice(0, 1).toUpperCase()}</div>

                    <div className="sxItemMid">
                      <div className="sxItemTop">
                        <div className="sxName">{label}</div>

                        <div className="sxTopBadges">
                          {isUnread && <span className="sxUnreadTag">Unread</span>}
                          <span className={cls("sxPill", c.status === "pending" ? "isPending" : "isOpen")}>
                            {c.status}
                          </span>
                        </div>
                      </div>

                      <div className="sxHint">{c.phone}</div>
                      <div className="sxLast">{c.lastMsg || "-"}</div>
                    </div>

                    <div className="sxItemRight">
                      {isUnread ? <div className="sxUnreadCount">{c.unread}</div> : <div className="sxUnreadEmpty" />}
                      <div className="sxTime sxMono">{c.lastAt}</div>
                    </div>
                  </button>
                );
              })}

              {filteredSorted.length === 0 && <div className="sxEmpty">No conversations found.</div>}
            </div>
          </aside>

          <section className="sxRight">
            {!active ? (
              <div className="sxBlank">
                <div className="sxBlankTitle">Select a conversation</div>
                <div className="sxBlankSub">Choose a customer from the left list to view messages.</div>
              </div>
            ) : (
              <>
                <div className="sxChatHead">
                  <div className="sxChatUser">
                    <div className="sxChatAvatar">{activeLabel.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="sxChatName">{activeLabel}</div>
                      <div className="sxChatPhone sxMono">{active.phone}</div>
                    </div>
                  </div>

                  <div className="sxChatActions">
                    <button className="sxBtnSmall sxBack" type="button" onClick={() => setMobileChatOpen(false)}>
                      Back
                    </button>

                    <span className={cls("sxPill", active.status === "pending" ? "isPending" : "isOpen")}>
                      {active.status}
                    </span>

                    <button className="sxBtnSmall" type="button" onClick={toggleStatus}>
                      Toggle
                    </button>
                  </div>
                </div>

                <div className="sxChatGrid">
                  {/* ✅ ONLY CHANGE: add ref for scroll */}
                  <div className="sxChatBody" ref={chatBodyRef}>
                    {active.messages.map((m) => (
                      <div key={m.id} className={cls("sxMsgRow", m.from === "agent" ? "isAgent" : "isCustomer")}>
                        <div className="sxBubble">
                          <div className="sxMsgText">{m.text}</div>
                          <div className="sxMsgAt sxMono">{m.at}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <aside className="sxProfile">
                    <div className="sxProfileTitle">Customer Profile</div>

                    <div className="sxField">
                      <div className="sxLabel">Saved name</div>
                      <input
                        className="sxFieldInput"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Set custom name (optional)"
                      />
                      <div className="sxHelp">Example: “VIP lead”, “Refund request”, “New buyer”</div>
                    </div>

                    <div className="sxField">
                      <div className="sxLabel">Phone</div>
                      <div className="sxFieldStatic sxMono">{active.phone}</div>
                    </div>

                    <div className="sxField">
                      <div className="sxLabel">Status</div>
                      <div className="sxFieldStatic">
                        <span className={cls("sxPill", active.status === "pending" ? "isPending" : "isOpen")}>
                          {active.status}
                        </span>
                      </div>
                    </div>

                    <div className="sxField">
                      <div className="sxLabel">Internal note</div>
                      <textarea
                        className="sxFieldArea"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Write note for this customer (admin only)"
                      />
                    </div>

                    <div className="sxProfileActions">
                      <button className="sxBtnSmall" type="button" onClick={saveProfile}>
                        Save
                      </button>
                      {savedToast && <span className="sxToast">Saved</span>}
                    </div>
                  </aside>
                </div>

                <div className="sxComposer">
                  <textarea
                    className="sxTextarea"
                    placeholder="Type your reply…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button className="sxSend" type="button" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
