import { useEffect, useMemo, useState } from "react";
import "../styles/memberMenu.css";
import memberApi from "../services/memberApi";
import { getMember, memberLogout } from "../memberAuth";
import { useNavigate } from "react-router-dom";
import MemberBottomNav from "../components/MemberBottomNav";

const TABS = ["All", "VIP 1", "VIP 2", "VIP 3"];

const LOGOS = import.meta.glob("../assets/img/*.png", {
  eager: true,
  import: "default",
});

const getLogoSrc = (logoType) => LOGOS[`../assets/img/${logoType}.png`];

function formatRemaining(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function isExpired(ms) {
  return ms <= 0;
}

function toMs(d) {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : Date.now();
}

// keep the 3-slot UI the same
const EMPTY_SLOTS = [
  { dateLabel: "Today", dateISO: "—", task: null },
  // { dateLabel: "Tomorrow", dateISO: "—", task: null },
  // { dateLabel: "Next Day", dateISO: "—", task: null },
];

export default function MemberMenu() {
  const nav = useNavigate();
  const me = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const VIP_CARDS = useMemo(
    () => [
      {
        tier: "VIP 1",
        brand: "Amazon",
        balanceTop: "Available Balance",
        balanceRange: "20USDT-499USDT",
        commission: "4%",
        theme: "vip1",
        logoType: "amazon",
      },
      {
        tier: "VIP 2",
        brand: "Alibaba",
        balanceTop: "Available Balance",
        balanceRange: "499USDT-899USDT",
        commission: "8%",
        theme: "vip2",
        logoType: "alibaba",
      },
      {
        tier: "VIP 3",
        brand: "Aliexpress",
        balanceTop: "Available Balance",
        balanceRange: "≥999USDT",
        commission: "12%",
        theme: "vip3",
        logoType: "aliexpress",
      },
    ],
    []
  );

  const visibleCards = useMemo(() => {
    if (activeTab === "All") return VIP_CARDS;
    return VIP_CARDS.filter((c) => c.tier === activeTab);
  }, [VIP_CARDS, activeTab]);

  const load = async () => {
    setErr("");
    try {
      // ✅ get both active set + member profile (ranking)
      const [activeSetRes, meRes] = await Promise.all([
        memberApi.get("/member/active-set"),
        memberApi.get("/member/me"),
      ]);

      setData({
        ...(activeSetRes.data || {}),
        me: meRes.data || null, // ✅ contains ranking
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    memberLogout();
    nav("/member/login");
  };

  const active = data?.active;

  // ✅ ranking -> eligible VIP tier
  const ranking = data?.me?.ranking || null;

  const rankToVipTier = (r) => {
    const x = String(r || "").trim().toUpperCase();
    if (x === "V1") return "VIP 1";
    if (x === "V2") return "VIP 2";
    if (x === "V3") return "VIP 3";
    return null; // Trial / V4 / V5 / V6 etc (not used here)
  };

  const eligibleTier = rankToVipTier(ranking);

  const goToVip = (card) => {
    // ✅ block non-eligible VIP
    if (eligibleTier && card.tier !== eligibleTier) {
      setErr("You are not eligible");
      setTimeout(() => setErr(""), 1800);
      return;
    }

    switch (card.logoType) {
      case "amazon":
        nav("/member/vip/amazon");
        break;

      case "alibaba":
        nav("/member/vip/alibaba");
        break;

      case "aliexpress":
        nav("/member/vip/aliexpress");
        break;

      default:
        break;
    }
  };

  return (
    <div className="vipPage">
      {/* Top Area */}
      <div className="vipTop">
        <div className="vipHeaderRow">
          <div className="vipBrand">
            <div className="vipBrandLogo">TK</div>
            <div>
              <div className="vipBrandTitle">TK Branding</div>
              <div className="vipBrandSub">
                Welcome, <b>{me?.nickname || "Member"}</b>
              </div>

              {/* ✅ show ranking */}
              <div className="vipBrandSub">
                Rank: <b>{ranking || "-"}</b>
              </div>
            </div>
          </div>

          <button className="vipLogout" onClick={logout} type="button">
            Logout
          </button>
        </div>

        {active && (
          <div className="vipHint">
            Active Package: <b>{data?.set?.name}</b> · Status{" "}
            <span className="vipPill">{data?.assignment?.status}</span>
          </div>
        )}

        {err && <div className="vipError">{err}</div>}

        {/* Tabs */}
        <div className="vipTabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`vipTab ${activeTab === t ? "active" : ""} ${
                eligibleTier && t === eligibleTier ? "eligible" : ""
              }`}
              onClick={() => setActiveTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="vipCardsWrap">
        {visibleCards.map((c) => (
          <div
            key={c.tier}
            className={`vipCard ${c.theme} ${
              eligibleTier && c.tier === eligibleTier ? "eligibleCard" : ""
            } ${eligibleTier && c.tier !== eligibleTier ? "notEligibleCard" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => goToVip(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToVip(c);
            }}
          >
            <div className="vipBadge">{c.tier}</div>

            <div className="vipCardTop">
              <img
                src={getLogoSrc(c.logoType)}
                alt={c.brand}
                className={`vipIcon ${c.logoType}`}
              />
              <div className="vipTitleBlock">
                <div className="vipStore">{c.brand}</div>
                <div className="vipMini">{c.balanceTop}</div>
                <div className="vipMini">{c.balanceRange}</div>
              </div>
            </div>

            <div className="vipDivider" />

            <div className="vipLine">
              <div className="vipLabel">Available Balance</div>
              <div className="vipValue">{c.balanceRange}</div>
            </div>

            <div className="vipLine">
              <div className="vipLabel">Commissions:</div>
              <div className="vipValue strong">{c.commission}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ REUSABLE BOTTOM NAV */}
      <div className="vipBottomNav">
        <MemberBottomNav active="menu" />
      </div>
    </div>
  );
}