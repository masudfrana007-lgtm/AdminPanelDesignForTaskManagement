// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import "../styles/Profile.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import { memberLogout } from "../memberAuth";
import { useNavigate } from "react-router-dom";

/* ---------------- CONFIG ---------------- */
const API_HOST = "http://159.198.40.145:5010";

function toAbsUrl(p) {
  const s = String(p || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return API_HOST + s;
  return API_HOST + "/" + s;
}

/* ---------------- helpers ---------------- */
function pad2(x) {
  return String(x).padStart(2, "0");
}

function fmtLocal(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return (
    d.getFullYear() +
    "-" +
    pad2(d.getMonth() + 1) +
    "-" +
    pad2(d.getDate()) +
    " " +
    pad2(d.getHours()) +
    ":" +
    pad2(d.getMinutes())
  );
}

function maskEmail(email) {
  const s = String(email || "").trim();
  if (!s.includes("@")) return "-";
  const [name, domain] = s.split("@");
  return `${name.slice(0, 2)}****${name.slice(-1)}@${domain}`;
}

function initials(name) {
  const s = String(name || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

/* ✅ NORMALIZE RANKING */
function normalizeRanking(ranking) {
  const r = String(ranking || "").trim().toLowerCase();
  if (r === "v1" || r === "vip1" || r === "vip 1") return { text: "VIP 1", level: 1 };
  if (r === "v2" || r === "vip2" || r === "vip 2") return { text: "VIP 2", level: 2 };
  if (r === "v3" || r === "vip3" || r === "vip 3") return { text: "VIP 3", level: 3 };
  return { text: "Trial", level: 0 };
}

/* ---------------- component ---------------- */
export default function Profile() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // modal for full image view
  const [imgOpen, setImgOpen] = useState(false);
  const nav = useNavigate();


  const loadMe = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await memberApi.get("/member/me");
      setUser(data || null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  // esc to close modal + lock scroll while open
  useEffect(() => {
    if (!imgOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setImgOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [imgOpen]);

  /* ✅ SAFE UI MAPPING */
  const ui = useMemo(() => {
    const u = user || {};
    const rank = normalizeRanking(u.ranking);

    const rawAvatar =
      u.avatar_url ||
      u.photo_url ||
      u.profile_photo_url ||
      u.profile_picture_url ||
      u.profile_photo ||
      "";

    const avatarUrl = toAbsUrl(rawAvatar);

    return {
      name: u.nickname ?? "-",
      uid: u.short_id ?? "-",
      emailMasked: maskEmail(u.email),
      emailRaw: u.email ?? "-",
      phone: u.phone ?? "-",
      country: u.country ?? "-",
      registered: fmtLocal(u.created_at),
      lastLogin: fmtLocal(u.last_login),
      ranking: rank.text,
      rankingLevel: rank.level,
      status: u.approval_status,
      withdrawPrivilege: Boolean(u.withdraw_privilege),
      sponsor: u.sponsor_short_id ?? "-",
      balance: u.balance ?? "0.00",
      locked: u.locked_balance ?? "0.00",
      initials: initials(u.nickname),

      avatarUrl,
      hasAvatar: !!avatarUrl,
    };
  }, [user]);

  return (
    <div className="pf-page">
      <div className="pf-overlay" />

      {/* HEADER */}
      <header className="pf-header">
        <button className="pf-back" onClick={() => window.history.back()}>
          ←
        </button>
        <div>
          <h1>Profile</h1>
          <p>Manage your personal information and security</p>
        </div>
      </header>

      <main className="pf-wrap">
        {/* ERROR */}
        {err && (
          <div className="pf-card">
            <strong>Error</strong>
            <p>{err}</p>
            <button className="pf-btn ghost" onClick={loadMe}>
              Retry
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="pf-card pf-top">
            <div className="pf-name">Loading…</div>
          </div>
        ) : (
          <>
            {/* TOP CARD */}
            <section className="pf-card pf-top" style={{ position: "relative" }}>
              {/* ✅ Edit button on top-right of this card */}
              <button
                className="pf-btn ghost"
                type="button"
                onClick={() => (window.location.href = "/member-profile-edit")}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  padding: "8px 12px",
                }}
              >
                Edit Profile
              </button>

              <div
                className="pf-avatarWrap"
                role="button"
                tabIndex={0}
                onClick={() => ui.hasAvatar && setImgOpen(true)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && ui.hasAvatar) setImgOpen(true);
                }}
                title={ui.hasAvatar ? "Tap to view" : ""}
                style={{ cursor: ui.hasAvatar ? "pointer" : "default" }}
              >
                <div className="pf-avatar">
                  {ui.hasAvatar ? <img src={ui.avatarUrl} alt="" /> : ui.initials}
                </div>
                {ui.hasAvatar && <div className="pf-avatarHint">Tap to view</div>}
              </div>

              <div className="pf-basic">
                <div className="pf-name">{ui.name}</div>
                <div className="pf-uid">
                  UID: {ui.uid}
                  <button onClick={() => navigator.clipboard.writeText(ui.uid)}>Copy</button>
                </div>

                <div className="pf-tags">
                  <span className="pf-tag gold">{ui.ranking}</span>
                  <span className="pf-tag green">{ui.status}</span>
                </div>
              </div>
            </section>

            {/* GRID */}
            <section className="pf-grid">
              {/* ACCOUNT */}
              <div className="pf-card">
                <h3>Account Information</h3>
                <div className="pf-row">
                  <span>Email</span>
                  <span title={ui.emailRaw}>{ui.emailMasked}</span>
                </div>
                <div className="pf-row">
                  <span>Phone</span>
                  <span>{ui.phone}</span>
                </div>
                <div className="pf-row">
                  <span>Country</span>
                  <span>{ui.country}</span>
                </div>
                <div className="pf-row">
                  <span>Registered</span>
                  <span>{ui.registered}</span>
                </div>
                <div className="pf-row">
                  <span>Last Login</span>
                  <span>{ui.lastLogin}</span>
                </div>
                <div className="pf-row">
                  <span>Sponsor</span>
                  <span>{ui.sponsor}</span>
                </div>
              </div>

              {/* WALLET */}
              <div className="pf-card">
                <h3>Security & Wallet</h3>
                <div className="pf-row">
                  <span>Withdraw Privilege</span>
                  <span className={ui.withdrawPrivilege ? "ok" : "warn"}>
                    {ui.withdrawPrivilege ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="pf-row">
                  <span>Balance</span>
                  <span>{ui.balance}</span>
                </div>
                <div className="pf-row">
                  <span>Locked</span>
                  <span>{ui.locked}</span>
                </div>

                <div className="pf-actions">
                  <button className="pf-btn ghost" onClick={loadMe}>
                    Refresh
                  </button>
                    <button
                      className="pf-btn warn"
                      type="button"
                      onClick={() => {
                        memberLogout();
                        nav("/member/login", { replace: true });
                      }}
                    >
                      Log Out
                    </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* FULL IMAGE MODAL */}
      {imgOpen && ui.hasAvatar && (
        <div
          onClick={() => setImgOpen(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: 18,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 520,
              width: "100%",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0b1220",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow: "0 18px 50px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom: "1px solid rgba(255,255,255,.10)",
                color: "#fff",
              }}
            >
              <div style={{ fontWeight: 700 }}>Profile Photo</div>
              <button
                className="pf-btn ghost"
                onClick={() => setImgOpen(false)}
                style={{ padding: "6px 10px" }}
              >
                Close
              </button>
            </div>

            <img
              src={ui.avatarUrl}
              alt=""
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxHeight: "75vh",
                objectFit: "contain",
                background: "#000",
              }}
            />
          </div>
        </div>
      )}

      <div className="pfNavSpacer" />
      <MemberBottomNav active="mine" />
    </div>
  );
}
