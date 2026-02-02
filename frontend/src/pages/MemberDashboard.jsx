import { useEffect, useMemo, useState } from "react";
import "../styles/memberDashboard.css";
import memberApi from "../services/memberApi";
import { getMember, memberLogout } from "../memberAuth";
import { useNavigate } from "react-router-dom";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberDashboard() {
  const nav = useNavigate();
  const me = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await memberApi.get("/member/active-set");
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logout = () => {
    memberLogout();
    nav("/member/login");
  };

  // ✅ map backend/member data into the new UI model
  const user = useMemo(() => {
    const name = me?.nickname || me?.name || "Member";
    const vip = Number(me?.vip || me?.vip_level || 1);
    const photoUrl =
      me?.photoUrl ||
      me?.photo_url ||
      me?.avatar ||
      "/home/user.jpg";

    const lastLogin =
      me?.lastLogin ||
      me?.last_login ||
      data?.lastLogin ||
      data?.last_login ||
      "Today • --:--";

    return { name, vip, photoUrl, lastLogin };
  }, [me, data]);

  // ✅ status tiles driven by backend where possible
  const stats = useMemo(() => {
    const accountStatus =
      me?.status ||
      (me ? "Active" : "—");

    const verification =
      me?.kyc_status ||
      me?.verification ||
      (me?.verified ? "Verified" : "Unverified") ||
      "—";

    const withdrawProcessing =
      data?.withdraw?.processing ||
      data?.withdraw_processing ||
      "Normal";

    const supportResponse =
      data?.support?.response ||
      "Fast";

    return [
      { label: "Account status", value: String(accountStatus), tone: "good" },
      { label: "Verification", value: String(verification), tone: "info" },
      { label: "Withdraw processing", value: String(withdrawProcessing), tone: "info" },
      { label: "Support response", value: String(supportResponse), tone: "good" },
    ];
  }, [me, data]);

  // Clickable blocks (now using routes instead of alert)
  const howItWorks = useMemo(
    () => [
      {
        t: "Complete your profile",
        d: "Keep phone/email accurate for verification & withdrawals.",
        icon: "👤",
        photo: "/home/hero-4.png",
        actionLabel: "Open Profile",
        onClick: () => nav("/member/profile"),
      },
      {
        t: "Read rules & instructions",
        d: "Understand what is allowed before starting tasks.",
        icon: "📘",
        photo: "/home/hero-1.png",
        actionLabel: "Read Rules",
        onClick: () => nav("/member/rules"),
      },
      {
        t: "Do tasks correctly",
        d: "Follow order and submit required proof (if needed).",
        icon: "🧩",
        photo: "/home/profile.png",
        actionLabel: "View Tasks",
        onClick: () => nav("/member/tasks"),
      },
      {
        t: "Request withdrawal",
        d: "Choose Bank or Crypto and track the status timeline.",
        icon: "⬇️",
        photo: "/home/winwin.png",
        actionLabel: "Withdraw",
        onClick: () => nav("/member/withdraw"),
      },
    ],
    [nav]
  );

  const readingBlocks = useMemo(
    () => [
      {
        title: "Platform Profile",
        icon: "🏢",
        desc:
          "A structured workflow platform designed to be clear, trackable, and secure — so users understand what to do and trust the results.",
        bullets: [
          "Transparent task → review → status → withdrawal flow",
          "Clear rules to protect the system",
          "Security checks to keep accounts safe",
        ],
        photo: "/home/hero-1.png",
        tag: "Trusted Process",
      },
      {
        title: "Platform Rules",
        icon: "📜",
        desc: "Rules exist to protect users and keep the platform fair.",
        bullets: [
          "One account per user (duplicate accounts may be restricted).",
          "Never share login/withdraw password.",
          "Incorrect submissions may affect ranking or review.",
          "Verification may happen if device/IP changes are detected.",
        ],
        photo: "/home/hero-3.png",
        tag: "Important",
      },
      {
        title: "Security & Account Safety",
        icon: "🛡️",
        desc: "Simple habits that protect your account and speed up processing.",
        bullets: [
          "Use strong passwords and keep them private",
          "Avoid unknown devices/networks",
          "Keep profile data consistent to reduce verification delays",
        ],
        photo: "/home/hero-4.png",
        tag: "Secure",
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        q: "Why does verification happen sometimes?",
        a: "Verification may happen when the system detects risk signals like new device login, IP changes, or unusual activity.",
      },
      {
        q: "How can I reduce withdrawal delays?",
        a: "Keep your profile accurate, maintain consistent login behavior, and follow rules and task instructions.",
      },
      {
        q: "Where can I get help?",
        a: "Use Support/Ticket options to contact the team. Include screenshots or details to get faster solutions.",
      },
    ],
    []
  );

  return (
    <div className="homeClean">
      <div className="bgLayer" aria-hidden="true" />

      <div className="wrap">
        {/* TOP: Welcome + profile */}
        <header className="topHeader premiumHeader fadeIn">
          <div className="profileLeft">
            <div className="avatarWrap">
              <img
                className="avatar"
                src={user.photoUrl}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/100x100/png";
                }}
              />
              <span className="online" />
            </div>

            <div className="welcomeText">
              <div className="welcomeSmall">Welcome back</div>
              <div className="welcomeName">
                {user.name} <span className="vip">VIP {user.vip}</span>
              </div>
              <div className="welcomeMeta">Last login: {user.lastLogin}</div>

              {/* optional: show active set info from backend */}
              {data?.active && (
                <div className="welcomeMeta">
                  Active Package: <b>{data?.set?.name}</b> · Status{" "}
                  <b>{data?.assignment?.status}</b>
                </div>
              )}
            </div>
          </div>

          <div className="headerRight">
            <button className="logoutBtn" type="button" onClick={logout}>
              Logout
            </button>
            <div className="headerMiniPhoto" />
          </div>
        </header>

        {err && <div className="dashError">{err}</div>}

        {/* Status summary */}
        <section className="section">
          <div className="grid4">
            {stats.map((s, idx) => (
              <div className={`card lift enter enter-${idx + 1}`} key={s.label}>
                <div className="cardTop">
                  <div className="cardLabel">{s.label}</div>
                  <span className={`dot ${s.tone}`} />
                </div>
                <div className="cardValue">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="sectionHead">
            <h2 className="h2">How It Works</h2>
            <p className="p">Click an option to open the next step.</p>
          </div>

          <div className="howGrid">
            {howItWorks.map((x, idx) => (
              <button
                type="button"
                className={`howCard lift enter enter-${(idx % 4) + 1}`}
                key={x.t}
                onClick={x.onClick}
              >
                <div className="howTop">
                  <div className="howIcon">{x.icon}</div>
                  <div className="howText">
                    <div className="howTitle">{x.t}</div>
                    <div className="howDesc">{x.d}</div>
                  </div>
                </div>

                <div
                  className="howPhoto"
                  style={{ backgroundImage: `url("${x.photo}")` }}
                  aria-hidden="true"
                />

                <div className="howBottom">
                  <span className="howAction">{x.actionLabel}</span>
                  <span className="howArrow">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Reading blocks */}
        <section className="section">
          <div className="sectionHead">
            <h2 className="h2">Understand the Platform</h2>
            <p className="p">Read these to build confidence and avoid mistakes.</p>
          </div>

          <div className="grid3">
            {readingBlocks.map((b, idx) => (
              <article className={`infoPanel lift enter enter-${(idx % 4) + 1}`} key={b.title}>
                <div className="infoPanelPhoto" style={{ backgroundImage: `url("${b.photo}")` }} />
                <div className="infoPanelBody">
                  <div className="infoPanelHead">
                    <div className="panelIconSm">{b.icon}</div>
                    <span className="chip">{b.tag}</span>
                  </div>

                  <div className="panelTitle">{b.title}</div>
                  <div className="panelDesc">{b.desc}</div>

                  <ul className="bullets">
                    {b.bullets.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="sectionHead">
            <h2 className="h2">Frequently Asked Questions</h2>
            <p className="p">Quick answers to reduce confusion.</p>
          </div>

          <div className="grid3">
            {faqs.map((f, idx) => (
              <div className={`faq lift enter enter-${(idx % 4) + 1}`} key={f.q}>
                <div className="faqQ">{f.q}</div>
                <div className="faqA">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div className="footerBox">
            <div className="footerTitle">Tip</div>
            <div className="footerText">
              For faster processing, keep consistent login behavior and avoid switching devices frequently.
            </div>
          </div>
        </footer>

        {/* spacer so page never hides behind bottom nav */}
        <div className="bottomNavSpacer" />
      </div>

      {/* ✅ KEEP BOTTOM BAR EXACTLY AS-IS */}
      <MemberBottomNav active="home" />
    </div>
  );
}
