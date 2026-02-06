import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Profile.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import { memberLogout } from "../memberAuth";

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

function mapStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return "Active";
  if (s === "pending") return "Pending";
  if (s === "rejected") return "Rejected";
  return "-";
}

/* ✅ NORMALIZE RANKING */
function normalizeRanking(ranking) {
  const r = String(ranking || "").trim().toLowerCase();
  if (r === "v1" || r === "vip1" || r === "vip 1")
    return { text: "VIP 1", level: 1 };
  if (r === "v2" || r === "vip2" || r === "vip 2")
    return { text: "VIP 2", level: 2 };
  if (r === "v3" || r === "vip3" || r === "vip 3")
    return { text: "VIP 3", level: 3 };
  return { text: "Trial", level: 0 };
}

/* ---------------- component ---------------- */

export default function Profile() {
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);

  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const pickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setAvatar(URL.createObjectURL(f));
  };

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

  /* ✅ SAFE UI MAPPING */
  const ui = useMemo(() => {
    const u = user || {};
    const rank = normalizeRanking(u.ranking);

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

      /* ✅ ACCESS FLAGS */
      canVip1: rank.level >= 1,
      canVip2: rank.level >= 2,
      canVip3: rank.level >= 3,
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
            <section className="pf-card pf-top">
              <div className="pf-avatarWrap" onClick={pickAvatar}>
                <div className="pf-avatar">
                  {avatar ? <img src={avatar} alt="" /> : ui.initials}
                </div>
                <div className="pf-avatarHint">Change photo</div>
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={onAvatarChange}
                />
              </div>

              <div className="pf-basic">
                <div className="pf-name">{ui.name}</div>
                <div className="pf-uid">
                  UID: {ui.uid}
                  <button onClick={() => navigator.clipboard.writeText(ui.uid)}>
                    Copy
                  </button>
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
                <div className="pf-row"><span>Email</span><span title={ui.emailRaw}>{ui.emailMasked}</span></div>
                <div className="pf-row"><span>Phone</span><span>{ui.phone}</span></div>
                <div className="pf-row"><span>Country</span><span>{ui.country}</span></div>
                <div className="pf-row"><span>Registered</span><span>{ui.registered}</span></div>
                <div className="pf-row"><span>Last Login</span><span>{ui.lastLogin}</span></div>
                <div className="pf-row"><span>Sponsor</span><span>{ui.sponsor}</span></div>
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
                <div className="pf-row"><span>Balance</span><span>{ui.balance}</span></div>
                <div className="pf-row"><span>Locked</span><span>{ui.locked}</span></div>

                <div className="pf-actions">
                  <button className="pf-btn ghost" onClick={loadMe}>Refresh</button>
                  <button
                    className="pf-btn warn"
                    onClick={() => {
                      memberLogout?.();
                      window.location.href = "/member-login";
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

      <div className="pfNavSpacer" />
      <MemberBottomNav active="mine" />
    </div>
  );
}
