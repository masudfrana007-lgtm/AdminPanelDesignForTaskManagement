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

// ✅ NO overlap, NO gap
const VIP_RULES = {
  "VIP 1": { min: 20, max: 499 },
  "VIP 2": { min: 500, max: 998 },
  "VIP 3": { min: 999, max: Infinity },
};

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isBelowMinForTier(balance, tier) {
  const rule = VIP_RULES[tier];
  if (!rule) return true;
  return safeNum(balance) < rule.min;
}

function isAboveMaxForTier(balance, tier) {
  const rule = VIP_RULES[tier];
  if (!rule) return false;
  const b = safeNum(balance);
  return false;
}

function meetsBalanceForTier(balance, tier) {
  const rule = VIP_RULES[tier];
  if (!rule) return false;
  const b = safeNum(balance);
  return b >= rule.min;
}

// ✅ choose correct tier based on balance (100k -> VIP 3)
function tierByBalance(balance) {
  const b = safeNum(balance);
  if (b >= VIP_RULES["VIP 3"].min) return "VIP 3";
  if (b >= VIP_RULES["VIP 2"].min && b <= VIP_RULES["VIP 2"].max) return "VIP 2";
  if (b >= VIP_RULES["VIP 1"].min && b <= VIP_RULES["VIP 1"].max) return "VIP 1";
  return null; // below VIP1 min
}

function rankToVipTier(ranking) {
  const x = String(ranking || "").trim().toUpperCase();
  if (x === "V1") return "VIP 1";
  if (x === "V2") return "VIP 2";
  if (x === "V3") return "VIP 3";
  return null; // trial / not assigned
}

function isAllowedByTier(eligibleTier, cardTier) {
  const order = { "VIP 1": 1, "VIP 2": 2, "VIP 3": 3 };
  const e = order[eligibleTier] || 0;
  const c = order[cardTier] || 0;
  return c <= e;
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
        balanceRange: "500USDT-998USDT",
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
    setErr("");

    // ✅ if trial/not assigned, but has balance in some VIP => suggest upgrade tier
    if (!eligibleTier) {
      const suggested = tierByBalance(balance);
      if (suggested) {
        setErr(`Your balance requires ${suggested}. Please contact your agent to upgrade your package.`);
      } else {
        setErr("You are not eligible for VIP packages. Please contact your sponsor.");
      }
      setTimeout(() => setErr(""), 2400);
      return;
    }

    // ✅ rank gate
    if (!isAllowedByTier(eligibleTier, card.tier)) {
      // optional: if they click higher tier, show upgrade suggestion
      const suggested = tierByBalance(balance);
      setErr(
        suggested && suggested !== eligibleTier
          ? `Your balance requires ${suggested}. Please contact your agent to upgrade.`
          : "You are not eligible."
      );
      setTimeout(() => setErr(""), 2400);
      return;
    }

    // ✅ balance gate (FIXED):
    // below min => deposit modal
    if (isBelowMinForTier(balance, card.tier)) {
      setNeedDeposit({
        tier: card.tier,
        required: requiredText(card.tier),
        balance,
      });
      return;
    }

    // above max => upgrade/go correct package (NOT deposit)
    if (isAboveMaxForTier(balance, card.tier)) {
      const suggested = tierByBalance(balance);

      if (suggested === "VIP 3" && eligibleTier === "VIP 3") {
        setErr(`Your balance is above ${card.tier}. Please enter VIP 3 package.`);
      } else if (suggested && suggested !== eligibleTier) {
        setErr(`Your balance requires ${suggested}. Please contact your agent to upgrade your package.`);
      } else if (suggested) {
        setErr(`Your balance matches ${suggested}. Please enter ${suggested} package.`);
      } else {
        setErr("Please contact your agent.");
      }

      setTimeout(() => setErr(""), 2600);
      return;
    }

    // in range => allow
    if (!meetsBalanceForTier(balance, card.tier)) {
      setErr("Balance does not match the package range.");
      setTimeout(() => setErr(""), 1800);
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

  const rankDisplay = eligibleTier ? eligibleTier : rankingRaw || "-";

  return (
    <div className="vipPage">
      {/* Top Area */}
      <div className="vipTop">
        <div className="vipHeaderRow">
          <div className="vipBrand">
            <div>
              {/* <div className="vipBrandTitle">Eorder.io</div> */}
              <div className="eoLogoRow">
                <div className="eoMark" aria-hidden="true">
                  <span className="eoMarkInner">e</span>
                </div>
                <div className="eoBrand">eorder<span>.io</span>
                </div>
              </div>
              <div className="vipUserBottom">
                <div className="vipBrandSub">
                  Welcome, <b>{meLS?.nickname || "Member"}</b>
                </div>
                <div className="mine-vip">
                  <span className="mine-vip-pill">{rankDisplay}</span>
                </div>
              </div>
              {/* <div className="userIDText">
                User ID: <b>{meLS?.short_id || "-"}</b>
              </div> */}
              
              {/* <div className="vipBrandSub">
                <b>{rankDisplay}</b>
              </div> */}
            </div>
          </div>

          <button className="vipLogout" onClick={logout} type="button">
            Logout
          </button>
        </div>

        {/* Available Balance Card */}
        <section className="balanceCardGold">
          <div className="balanceLeft">
            <div className="balanceLabelW">Available Balance</div>

            <div className="balanceValueW">
              {balance.toFixed(2)} <span className="unitW">USDT</span>
            </div>

            {/* <div className="metaRowW">
              <span className="pillW">{rankDisplay}</span>
              <span className="pillW">
                {eligibleTier ? VIP_RULES[eligibleTier]?.min : "0"}–
                {eligibleTier && VIP_RULES[eligibleTier]?.max !== Infinity 
                  ? VIP_RULES[eligibleTier]?.max 
                  : "∞"} USDT
              </span>
            </div> */}
          </div>

          <div className="balanceRightW">
            <div className="miniInfo">
              <div className="miniLabel">Status</div>
              <div className="miniValue">
                {data?.assignment?.status || "Inactive"}
              </div>
            </div>

            <div className="miniInfo">
              <div className="miniLabel">User ID</div>
              <div className="miniValue">{meLS?.short_id || "-"}</div>
            </div>
          </div>
        </section>
        

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
              className={`vipCard ${c.theme} ${eligible ? "eligibleCard" : "notEligibleCard"}`}
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

      {/* ✅ Deposit popup */}
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
              Your current balance:{" "}
              <b style={{ color: "#fff" }}>{needDeposit.balance.toFixed(2)} USDT</b>
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

      {/* ✅ Bottom nav */}
      <div className="vipBottomNav">
        <MemberBottomNav active="menu" />
      </div>
    </div>
  );
}
