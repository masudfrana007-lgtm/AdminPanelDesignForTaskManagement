// src/pages/SupportInbox.jsx
// ✅ Fully dynamic: inbox + messages + reply + mark-read
// ✅ Keeps your existing layout (SupportInbox.css) + mobile open/close + autoscroll
// ✅ Supports photo messages + lightbox
// ✅ Saved name + note persisted in localStorage per conversation (no DB changes)

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "../services/api";
import "./SupportInbox.css";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

function fmtStamp(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // if backend returns "YYYY-MM-DD HH:mm" style
    const safe = String(iso).replace(" ", "T");
    const d2 = new Date(safe);
    if (Number.isNaN(d2.getTime())) return String(iso);
    return `${d2.getFullYear()}-${pad2(d2.getMonth() + 1)}-${pad2(d2.getDate())} ${pad2(
      d2.getHours()
    )}:${pad2(d2.getMinutes())}`;
  }
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}`;
}

function toTs(s) {
  if (!s) return 0;
  const d = new Date(String(s).replace(" ", "T"));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

// ✅ token helper (same style as SupportChat.jsx)
function getToken() {
  const raw = localStorage.getItem("token");
  if (!raw) return "";
  return String(raw).replace(/^bearer\s+/i, "").replace(/^"|"$/g, "").trim();
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ✅ files are served by backend host
// ✅ same as Tasks (nginx proxy safe)
const toAbsUrl = (p) => {
  if (!p) return "";
  const s = String(p).trim().replaceAll("\\", "/"); // ✅ fix windows backslashes
  if (/^(https?:)?\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
};

// ✅ local profile storage (no DB changes)
function profileKey(convoId) {
  return `support_profile_${convoId}`;
}
function loadProfile(convoId) {
  try {
    const raw = localStorage.getItem(profileKey(convoId));
    if (!raw) return { displayName: "", note: "" };
    const x = JSON.parse(raw);
    return { displayName: String(x?.displayName || ""), note: String(x?.note || "") };
  } catch {
    return { displayName: "", note: "" };
  }
}
function saveProfileLocal(convoId, displayName, note) {
  try {
    localStorage.setItem(profileKey(convoId), JSON.stringify({ displayName, note }));
  } catch {}
}

export default function SupportInbox() {
  const [rows, setRows] = useState([]); // raw inbox rows from backend
  const [messagesById, setMessagesById] = useState({}); // convoId -> messages[]
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | open | pending
  const [onlyUnread, setOnlyUnread] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  // profile edit states
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // mobile chat open/close
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // chat auto-scroll
  const chatBodyRef = useRef(null);
  const stickToBottomRef = useRef(true);

  // lightbox
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

  function scrollChatToBottom(force = false) {
    requestAnimationFrame(() => {
      const el = chatBodyRef.current;
      if (!el) return;
      if (!force && !stickToBottomRef.current) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  // track user scroll so we don't yank them
  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const px = 140;
      stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < px;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeId, mobileChatOpen]);

  const loadInbox = useCallback(async () => {
    setErr("");
    setLoadingInbox(true);
    try {
      const { data } = await api.get("/support/inbox", { headers: authHeaders() });
      setRows(Array.isArray(data) ? data : []);
      // if nothing selected, auto select first
      if (!activeId && Array.isArray(data) && data.length) {
        setActiveId(Number(data[0].id));
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load inbox");
      setRows([]);
    } finally {
      setLoadingInbox(false);
    }
  }, [activeId]);

  const loadMessages = useCallback(async (convoId, { silent = false } = {}) => {
    if (!Number.isFinite(convoId)) return;
    if (!silent) setLoadingChat(true);
    try {
      const { data } = await api.get(`/support/conversations/${convoId}/messages`, {
        headers: authHeaders(),
      });
      const arr = Array.isArray(data) ? data : [];
      setMessagesById((prev) => ({ ...prev, [convoId]: arr }));

      // mark read best-effort (so unread badge clears on backend too)
      api
        .post(`/support/conversations/${convoId}/mark-read`, {}, { headers: authHeaders() })
        .catch(() => {});
    } catch (e) {
      if (!silent) setErr(e?.response?.data?.message || "Failed to load messages");
      setMessagesById((prev) => ({ ...prev, [convoId]: prev[convoId] || [] }));
    } finally {
      if (!silent) setLoadingChat(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when active changes, load messages + load saved profile
  useEffect(() => {
    if (!Number.isFinite(activeId)) return;
    loadMessages(activeId, { silent: false });

    const p = loadProfile(activeId);
    setEditName(p.displayName || "");
    setEditNote(p.note || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // auto-scroll when opening chat / new messages
  const activeMsgs = messagesById[activeId] || [];
  useEffect(() => {
    if (!mobileChatOpen) return;
    scrollChatToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, mobileChatOpen, activeMsgs.length]);

  // lightweight polling: refresh inbox + active messages
  useEffect(() => {
    let t = null;
    const tick = async () => {
      await loadInbox();
      if (Number.isFinite(activeId)) await loadMessages(activeId, { silent: true });
      t = setTimeout(tick, 4000);
    };
    t = setTimeout(tick, 4000);
    return () => t && clearTimeout(t);
  }, [activeId, loadInbox, loadMessages]);

  // map backend rows into UI objects
  const conversations = useMemo(() => {
    return rows.map((r) => {
      const convoId = Number(r.id);
      const p = loadProfile(convoId);
      return {
        id: convoId,
        member: r.member_name || `Member #${r.member_id}`,
        phone: r.member_phone || "-",
        status: r.status || "open",
        unread: Number(r.unread_count || 0),
        lastMsg: r.last_message || "-",
        lastAt: fmtStamp(r.last_message_at),
        displayName: p.displayName || "",
        note: p.note || "",
      };
    });
  }, [rows]);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId]);

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
        String(c.member || "").toLowerCase().includes(q) ||
        String(c.phone || "").toLowerCase().includes(q) ||
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

    // clear unread locally immediately (backend clears after mark-read)
    setRows((prev) =>
      prev.map((x) => (Number(x.id) === Number(c.id) ? { ...x, unread_count: 0 } : x))
    );

    setMobileChatOpen(true);
    scrollChatToBottom(true);
  }

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !active || sending) return;

    setErr("");
    setSending(true);
    try {
      await api.post(
        `/support/conversations/${active.id}/reply`,
        { text },
        { headers: authHeaders() }
      );
      setDraft("");

      // refresh both inbox + messages fast
      await loadMessages(active.id, { silent: true });
      await loadInbox();

      scrollChatToBottom(true);
    } catch (e) {
      const status = e?.response?.status;
      const msg2 = e?.response?.data?.message || e?.message || "Failed to send";
      setErr(`(${status || "?"}) ${msg2}`);
    } finally {
      setSending(false);
    }
  }

  function saveProfile() {
    if (!active) return;
    const name = editName.trim();
    const note = editNote.trim();
    saveProfileLocal(active.id, name, note);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);

    // force re-render labels
    setRows((prev) => prev.slice());
  }

  const activeLabel = active ? (active.displayName?.trim() ? active.displayName : active.member) : "";
  const activeMessages = active ? messagesById[active.id] || [] : [];

  return (
    <div className="sxPage">
      <div className={cls("sxContainer", mobileChatOpen && "isChatOpen")}>
        <header className="sxTop">
          <div className="sxTopLeft">
            <div className="sxTitle">Support Inbox</div>
            <div className="sxSub">Customer messages • Reply and manage status</div>
          </div>

          <div className="sxTopRight">
            <button className="sxBtn" type="button" onClick={loadInbox} disabled={loadingInbox}>
              {loadingInbox ? "Loading..." : "Reload"}
            </button>

            <button
              className="sxBtn sxBtnPrimary"
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                location.href = "/cs/login";
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {err ? (
          <div style={{ padding: "0 16px 10px", color: "#b91c1c" }}>
            {err}
          </div>
        ) : null}

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

                    <button
                      className="sxBtnSmall"
                      type="button"
                      onClick={() => loadMessages(active.id, { silent: false })}
                      disabled={loadingChat}
                    >
                      {loadingChat ? "Loading..." : "Refresh"}
                    </button>
                  </div>
                </div>

                <div className="sxChatGrid">
                  <div className="sxChatBody" ref={chatBodyRef}>
                    {activeMessages.map((m) => {
                      const isAgent = m.sender_type === "agent";
                      const isPhoto = m.kind === "photo" && m.file_url;

                      return (
                        <div
                          key={m.id}
                          className={cls("sxMsgRow", isAgent ? "isAgent" : "isCustomer")}
                        >
                          <div className="sxBubble">
                            {/* TEXT */}
                            {m.kind === "text" ? (
                              <div className="sxMsgText">{m.text || ""}</div>
                            ) : null}

                            {/* PHOTO */}
                            {isPhoto ? (
                              <div style={{ marginTop: 2 }}>
                                <button
                                  type="button"
                                  onClick={() => openImage(toAbsUrl(m.file_url), m.file_name || "photo")}
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
                                    src={toAbsUrl(m.file_url)}
                                    alt={m.file_name || "photo"}
                                    style={{
                                      width: 220,
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
                              <div className="sxMsgText">[Unsupported kind: {m.kind}]</div>
                            ) : null}

                            <div className="sxMsgAt sxMono">{fmtStamp(m.created_at)}</div>
                          </div>
                        </div>
                      );
                    })}

                    {!activeMessages.length ? (
                      <div style={{ opacity: 0.7, padding: 10 }}>No messages.</div>
                    ) : null}
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
                    onKeyDown={(e) => {
                      // Ctrl+Enter send
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") sendMessage();
                    }}
                    disabled={sending}
                  />
                  <button className="sxSend" type="button" onClick={sendMessage} disabled={sending || !draft.trim()}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </section>
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
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "96vw", maxHeight: "90vh" }}>
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
    </div>
  );
}