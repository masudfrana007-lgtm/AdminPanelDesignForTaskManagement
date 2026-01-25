import { useEffect, useMemo, useState } from "react";
import "../styles/memberDashboard.css";
import memberApi from "../services/memberApi";
import { getMember, memberLogout } from "../memberAuth";
import { useNavigate } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";

const TABS = ["All", "VIP 1", "VIP 2", "VIP 3"];

export default function MemberDashboard() {
  const nav = useNavigate();
  const me = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // You can replace these with API-driven values later if you add an endpoint.
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

  // Bottom nav routes (adjust if your routes differ)
  const goHome = () => nav("/member/dashboard");
  const goService = () => nav("/member/service");
  const goMenu = () => nav("/member/menu");
  const goRecord = () => nav("/member/record"); // ✅ history here
  const goMine = () => nav("/member/mine");

  // If you want to show “active package” small info somewhere:
  const active = data?.active;

  return (
    <MemberLayout>
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
              </div>
            </div>

            <button className="vipLogout" onClick={logout}>
              Logout
            </button>
          </div>

          {/* Optional: active set small line (won't break UI) */}
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
                className={`vipTab ${activeTab === t ? "active" : ""}`}
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
            <div key={c.tier} className={`vipCard ${c.theme}`}>
              <div className="vipBadge">{c.tier}</div>

              <div className="vipCardTop">
                <div className={`vipIcon ${c.logoType}`} aria-hidden="true" />
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

        {/* Bottom Nav */}
        <div className="vipBottomNav">
          <button className="navItem active" onClick={goHome} type="button">
            <span className="navIcon">⌂</span>
            <span className="navText">Home</span>
          </button>

          <button className="navItem" onClick={goService} type="button">
            <span className="navIcon">⟲</span>
            <span className="navText">Service</span>
          </button>

          <button className="navItem" onClick={goMenu} type="button">
            <span className="navIcon">▦</span>
            <span className="navText">Menu</span>
          </button>

          <button className="navItem" onClick={goRecord} type="button">
            <span className="navIcon">▤</span>
            <span className="navText">Record</span>
          </button>

          <button className="navItem mine" onClick={goMine} type="button">
            <span className="navIcon">●</span>
            <span className="navText">Mine</span>
          </button>
        </div>

        {/* Spacer so content doesn't hide behind bottom nav */}
        <div className="vipNavSpacer" />
      </div>
    </MemberLayout>
  );
}
