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

// ✅ VIP requirements (based on your card ranges)
const VIP_RULES = {
  "VIP 1": { min: 20, max: 499 },
  "VIP 2": { min: 499, max: 899 },
  "VIP 3": { min: 999, max: Infinity },
};

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function rankToVipTier(ranking) {
  const x = String(ranking || "").trim().toUpperCase();
  if (x === "V1") return "VIP 1";
  if (x === "V2") return "VIP 2";
  if (x === "V3") return "VIP 3";
  return null;
}

function isAllowedByTier(eligibleTier, cardTier) {
  // ✅ can access amazon OR their package:
  // VIP 1 -> only VIP1
  // VIP 2 -> VIP1 + VIP2
  // VIP 3 -> VIP1 + VIP2 + VIP3
  const order = { "VIP 1": 1, "VIP 2": 2, "VIP 3": 3 };
  const e = order[eligibleTier] || 0;
  const c = order[cardTier] || 0;
  return c <= e;
}

function meetsBalanceForTier(balance, tier) {
  const rule = VIP_RULES[tier];
  if (!rule) return false;
  const b = safeNum(balance);
  return b >= rule.min && b <= rule.max;
}

function requiredText(tier) {
  const r = VIP_RULES[tier];
  if (!r) return "";
  if (r.max === Infinity) return `Minimum ${r.min} USDT`;
  return `${r.min}–${r.max} USDT`;
}

// keep the 3-slot UI the same
const EMPTY_SLOTS = [{ dateLabel: "Today", dateISO: "—", task: null }];

export default function MemberMenu() {
  const nav = useNavigate();
  const meLS = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // ✅ modal for "insufficient balance -> go deposit"
  const [needDeposit, setNeedDeposit] = useState(null); // { tier, required, balance }

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
      const [activeSetRes, meRes] = await Promise.all([
        memberApi.get("/member/active-set"),
        memberApi.get("/member/me"),
      ]);

      setData({
        ...(activeSetRes.data || {}),
        me: meRes.data || null,
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

  const rankingRaw = data?.me?.ranking || null;
  const eligibleTier = rankToVipTier(rankingRaw); // "VIP 1/2/3" or null
  const balance = safeNum(data?.me?.balance);

  const goToVip = (card) => {
    // ✅ ranking not eligible
    if (!eligibleTier) {
      setErr("You are not eligible for VIP packages. Please contact your sponsor.");
      setTimeout(() => setErr(""), 1800);
      return;
    }

    // ✅ allow amazon OR their tier (tier <= eligibleTier)
    if (!isAllowedByTier(eligibleTier, card.tier)) {
      setErr("You are not eligible.");
      setTimeout(() => setErr(""), 1800);
      return;
    }

    // ✅ balance gate for the selected package
    if (!meetsBalanceForTier(balance, card.tier)) {
      setNeedDeposit({
        tier: card.tier,
        required: requiredText(card.tier),
        balance,
      });
      return;
    }

    // ✅ route by logoType
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

  // ✅ display ranking text as VIP tier (V1->VIP1)
  const rankDisplay = eligibleTier ? eligibleTier : (rankingRaw || "-");

  return (
    <div className="vipPage">
      {/* Top Area */}
      <div className="vipTop">
        <div className="vipHeaderRow">
          <div className="vipBrand">
            <div>
              <div className="vipBrandTitle">TK Branding</div>
              <div className="vipBrandSub">
                Welcome, <b>{meLS?.nickname || "Member"}</b>
              </div>

              {/* ✅ show ranking mapped */}
              <div className="vipBrandSub">
                Rank: <b>{rankDisplay}</b>
              </div>
            </div>
          </div>

          <button className="vipLogout" onClick={logout} type="button">
            Logout
          </button>
        </div>

        {data?.assignment?.status && (
          <div className="vipHint">
            Balance: <b>{balance.toFixed(2)}</b> · Status{" "}
            <span
              className={`vipPill ${
                String(data?.assignment?.status).toLowerCase() === "active"
                  ? "isActive"
                  : "isInactive"
              }`}
            >
              {data?.assignment?.status}
            </span>
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
        {visibleCards.map((c) => {
          const eligible = eligibleTier ? isAllowedByTier(eligibleTier, c.tier) : false;

          return (
            <div
              key={c.tier}
              className={`vipCard ${c.theme} ${
                eligible ? "eligibleCard" : "notEligibleCard"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => goToVip(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToVip(c);
              }}
            >
              <div className="vipTierText">{c.tier}</div>

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
          );
        })}
      </div>

      {/* ✅ Deposit popup (no CSS changes required, basic inline overlay) */}
      {needDeposit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setNeedDeposit(null)}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 18px 40px rgba(0,0,0,.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              Insufficient balance
            </div>

            <div style={{ color: "rgba(255,255,255,.75)", fontSize: 13, lineHeight: 1.5 }}>
              To enter <b style={{ color: "#fff" }}>{needDeposit.tier}</b>, your balance must match:{" "}
              <b style={{ color: "#fff" }}>{needDeposit.required}</b>.
              <br />
              Your current balance: <b style={{ color: "#fff" }}>{needDeposit.balance.toFixed(2)} USDT</b>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                type="button"
                className="vipLogout"
                style={{ flex: 1 }}
                onClick={() => {
                  setNeedDeposit(null);
                  nav("/member/deposit");
                }}
              >
                Go to Deposit
              </button>

              <button
                type="button"
                className="vipLogout"
                style={{ flex: 1, opacity: 0.85 }}
                onClick={() => setNeedDeposit(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ REUSABLE BOTTOM NAV */}
      <div className="vipBottomNav">
        <MemberBottomNav active="menu" />
      </div>
    </div>
  );
}
