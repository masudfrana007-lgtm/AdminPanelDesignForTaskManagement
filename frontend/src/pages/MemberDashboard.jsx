import { useEffect, useMemo, useState } from "react";
import "../styles/memberDashboard.css";
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

export default function MemberDashboard() {
  const nav = useNavigate();
  const me = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  
  // Static user tier for testing (change this to test different scenarios)
  // "A" = VIP 1, "B" = VIP 2, "C" = VIP 3
  const [staticUserTier] = useState("A"); // Change this to "B" or "C" for testing

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
        setName: "A",
      },
      
      {
        tier: "VIP 2",
        brand: "Alibaba",
        balanceTop: "Available Balance",
        balanceRange: "499USDT-899USDT",
        commission: "8%",
        theme: "vip2",
        logoType: "alibaba",
        setName: "B",
      },
      {
        tier: "VIP 3",
        brand: "Aliexpress",
        balanceTop: "Available Balance",
        balanceRange: "≥999USDT",
        commission: "12%",
        theme: "vip3",
        logoType: "aliexpress",
        setName: "C",
      },
    ],
    []
  );

  const visibleCards = useMemo(() => {
    if (activeTab === "All") return VIP_CARDS;
    return VIP_CARDS.filter((c) => c.tier === activeTab);
  }, [VIP_CARDS, activeTab]);

  // Get user's current tier based on set name (using static data for now)
  const userCurrentTier = useMemo(() => {
    // For testing with static data
    const userCard = VIP_CARDS.find(card => card.setName === staticUserTier);
    return userCard?.tier || null;
    
    // Uncomment below when you have dynamic data
    // if (!data?.set?.name) return null;
    // const userCard = VIP_CARDS.find(card => card.setName === data.set.name);
    // return userCard?.tier || null;
  }, [staticUserTier, VIP_CARDS]);

  // Check if user can access a card
  const canAccessCard = (cardTier) => {
    if (!userCurrentTier) return false;
    const userTierNum = parseInt(userCurrentTier.split(" ")[1]);
    const cardTierNum = parseInt(cardTier.split(" ")[1]);
    return userTierNum >= cardTierNum;
  };

  // Handle card click
  const handleCardClick = (card) => {
    if (canAccessCard(card.tier)) {
      nav("/member/menu");
    } else {
      setPopupMessage("You are not eligible for this task");
      setShowPopup(true);
    }
  };

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

  // Set active tab based on user's set name
  useEffect(() => {
    // For testing with static data
    const userCard = VIP_CARDS.find(card => card.setName === staticUserTier);
    if (userCard) {
      setActiveTab(userCard.tier);
    }
    
    // Uncomment below when you have dynamic data
    // if (data?.set?.name) {
    //   const userCard = VIP_CARDS.find(card => card.setName === data.set.name);
    //   if (userCard) {
    //     setActiveTab(userCard.tier);
    //   }
    // }
  }, [staticUserTier, VIP_CARDS]);

  const logout = () => {
    memberLogout();
    nav("/member/login");
  };

  const active = data?.active;

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
            </div>
          </div>

          <button className="vipLogout" onClick={logout}>
            Logout
          </button>
        </div>

        {/* Static data for testing */}
        <div className="vipHint">
          Active Package: <b>{staticUserTier}</b> · Status{" "}
          <span className="vipPill">Active</span>
        </div>
        
        {/* Uncomment below when you have dynamic data */}
        {/* {active && (
          <div className="vipHint">
            Active Package: <b>{data?.set?.name}</b> · Status{" "}
            <span className="vipPill">{data?.assignment?.status}</span>
          </div>
        )} */}

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
          <div 
            key={c.tier} 
            className={`vipCard ${c.theme} ${!canAccessCard(c.tier) ? 'disabled' : ''}`} 
            onClick={() => handleCardClick(c)} 
            style={{ 
              cursor: 'pointer',
              opacity: canAccessCard(c.tier) ? 1 : 0.6
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

      {/* Stylish Popup Modal */}
      {showPopup && (
        <div 
          className="popup-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="popup-content"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center',
              maxWidth: '320px',
              margin: '20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              transform: 'scale(1)',
              transition: 'all 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255,68,68,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid #ff4444'
              }}
            >
              <span style={{ fontSize: '24px', color: '#ff4444' }}>⚠️</span>
            </div>
            <h3 
              style={{ 
                color: 'white', 
                marginBottom: '15px', 
                fontSize: '20px',
                fontWeight: '600'
              }}
            >
              Access Denied
            </h3>
            <p 
              style={{ 
                marginBottom: '25px', 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            >
              {popupMessage}
            </p>
            <button 
              onClick={() => setShowPopup(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 30px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ✅ REUSABLE BOTTOM NAV */}
      <MemberBottomNav active="home" />
    </div>
  );
}
