import { useEffect, useState } from "react";
import "../styles/memberDashboard.css";
import memberApi from "../services/memberApi";
import { getMember } from "../memberAuth";
import MemberBottomNav from "../components/MemberBottomNav"; // ✅ add this

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

export default function Home() {

  const me = getMember(); // from local storage (logged in member)
  const [profile, setProfile] = useState(null);
  const [pErr, setPErr] = useState("");
  const [balance, setBalance] = useState(0);
  const [locked, setLocked] = useState(0); // optional (if you need later)

useEffect(() => {
  (async () => {
    try {
      // ✅ pick ONE that you already have in backend:
      // If you already have: GET /member/me or /members/me
      const { data } = await memberApi.get("/member/me");
      setProfile(data || null);
      setBalance(Number(data?.balance || 0));
      setLocked(Number(data?.locked_balance || 0)); // optional      
    } catch (e) {
      // fallback to local storage values if API not ready
      setProfile(me || null);
      setBalance(Number(me?.balance || 0));          // fallback if LS has balance
      setLocked(Number(me?.locked_balance || 0));    // optional
      setPErr(e?.response?.data?.message || "");      
    }
  })();
}, []);


  const stats = [
    { label: "Account status", value: "Active", tone: "good" },
    { label: "Verification", value: "Verified", tone: "info" },
    { label: "Withdraw processing", value: "Normal", tone: "info" },
    { label: "Support response", value: "Fast", tone: "good" },
  ];

  const howItWorks = [
    {
      t: "Complete your profile",
      d: "Keep phone/email accurate for verification & withdrawals.",
      icon: "👤",
      photo: "/home/hero-4.png",
      actionLabel: "Open Profile",
      onClick: () => alert("Later: Open Profile page /profile"),
    },
    {
      t: "Read rules & instructions",
      d: "Understand what is allowed before starting tasks.",
      icon: "📘",
      photo: "/home/hero-1.png",
      actionLabel: "Read Rules",
      onClick: () => alert("Later: Open Rules page /rules"),
    },
    {
      t: "Do tasks correctly",
      d: "Follow order and submit required proof (if needed).",
      icon: "🧩",
      photo: "/home/profile.png",
      actionLabel: "View Tasks",
      onClick: () => alert("Later: Open Tasks page /tasks"),
    },
    {
      t: "Request withdrawal",
      d: "Choose Bank or Crypto and track the status timeline.",
      icon: "⬇️",
      photo: "/home/winwin.png",
      actionLabel: "Withdraw",
      onClick: () => alert("Later: Open Withdraw page /withdraw"),
    },
  ];

  const readingBlocks = [
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
  ];

  const faqs = [
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
  ];

  const user = {
    name: "User",
    vip: 3,
    inviteCode: "ABCD-1234",
    balance: 97280.12,
  };

  return (
    <div className="homeClean">
      <div className="bgLayer" aria-hidden="true" />

      <div className="wrap">
        {/* TOP: Welcome + profile (color improved) */}
        <header className="topHeader premiumHeader fadeIn">
          <div className="profileLeft">
            <div className="mine-avatar">
              <img
                src={`https://i.pravatar.cc/150?u=${profile?.short_id || me?.short_id || "guest"}`}
                alt="User Avatar"
                className="mine-avatar-img"
              />
            </div>
            {/* <div className="avatarWrap">
              <img
                className="avatar"
                src={profile?.photo_url || "/user.png"}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/100x100/png";
                }}
              />
              <span className="online" />
            </div> */}

            <div className="welcomeText">
              <div className="welcomeBalance">Welcome back</div>
              <div className="welcomeName">
                {profile?.nickname || profile?.name || "—"}
                <span className="vip">{profile?.ranking ? profile.ranking : "Trial"}</span>
              </div>
              <div className="welcomeBalance">ID: {profile?.short_id || me?.short_id || "-"}</div>
              {/* need to add balance here */}
              <div className="welcomeBalance">                
                <span className="balanceAmount">
                  Current Balance: USD {money(balance)}
                </span>
              </div>
            </div>
           </div> 

          <div className="headerMiniPhoto" />
        </header>

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
            <p className="p">
              Click an option to open the next step (later you’ll connect routes).
            </p>
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

        {/* Reading blocks with photos */}
        <section className="section">
          <div className="sectionHead">
            <h2 className="h2">Understand the Platform</h2>
            <p className="p">Read these to build confidence and avoid mistakes.</p>
          </div>

          <div className="grid3">
            {readingBlocks.map((b, idx) => (
              <article
                className={`infoPanel lift enter enter-${(idx % 4) + 1}`}
                key={b.title}
              >
                <div
                  className="infoPanelPhoto"
                  style={{ backgroundImage: `url("${b.photo}")` }}
                />
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

        {/* ✅ spacer so content doesn't hide behind bottom nav */}
        <div className="homeNavSpacer" />
      </div>

      {/* ✅ bottom nav fixed area */}
      <div className="homeBottomNav">
        <MemberBottomNav active="home" />
      </div>
    </div>
  );
}