import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AmazonVip1.css";
import memberApi from "../services/memberApi";

const initialDemo = {
  brand: "Amazon",
  vipLevel: "VIP 1",
  commissionRate: 4,
  availableMin: 20,
  availableMax: 499,
  accountBalance: 97280.12,

  metrics: [
    { label: "Today's Times", value: "25" },
    { label: "Today's Commission", value: "5,720.77 USDT" },
    { label: "Cash gap between tasks", value: "0 USDT" },
    { label: "Yesterday's buy commission", value: "0 USDT" },
    { label: "Yesterday's team commission", value: "0 USDT" },
    { label: "Money frozen in accounts", value: "0 USDT" },
  ],

  rules: [
    "Commission is credited only after successful order completion.",
    "Orders are assigned randomly by the system.",
    "Complete tasks as soon as possible after receiving them.",
    "Repeated refresh or abuse may result in account restriction.",
  ],
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function AmazonVip1() {
  const nav = useNavigate();

  const [balance, setBalance] = useState(0);
  const [balanceShimmer, setBalanceShimmer] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await memberApi.get("/member/me");
        setBalance(Number(data?.balance || 0));
      } catch {
        setBalance(initialDemo.accountBalance);
      }
    };

    loadMe();
  }, []);

  useEffect(() => {
    setBalanceShimmer(true);
    const t = setTimeout(() => setBalanceShimmer(false), 1100);
    return () => clearTimeout(t);
  }, [balance]);

  const demo = useMemo(() => ({ ...initialDemo, accountBalance: balance }), [balance]);

  // ✅ instant navigation (no modal, no delay)
  const startMatching = () => {
    nav("/member/tasks");
  };

  

  return (
    <div className="vipWhite">
      {/* Top Bar */}
      <header className="topbarW-modern">
        <div className="headerContainer">
          <button className="backIcon-modern" onClick={() => nav(-1)} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="topTitle-modern">
            <div className="topBrandRow-modern">
              <span className="topBrand-modern">{demo.brand}</span>
              <span className="vipBadge-modern">{demo.vipLevel}</span>
            </div>
            <div className="topSub-modern">
              Commission Rate {demo.commissionRate}% • Range {demo.availableMin}-{demo.availableMax} USDT
            </div>
          </div>

          <button className="homeBtn-modern" onClick={() => nav("/member/dashboard")} aria-label="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20A1 1 0 006 21H9M19 10L21 12M19 10V20A1 1 0 0018 21H15M9 21V16A1 1 0 0110 15H14A1 1 0 0115 16V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Home</span>
          </button>
        </div>
      </header>

      <main className="wrapW">
        {/* VIP Logo */}
        <section className="vipLogoRow">
          <div className="vipLogoCard">
            <div className="vipLogoMark" aria-hidden>
              amz
            </div>
            <div className="vipLogoText">
              <div className="vipLogoTitle">
                Amazon <span className="vipLogoChip">{demo.vipLevel}</span>
              </div>
              <div className="vipLogoSub">Task commission wallet</div>
            </div>
          </div>
        </section>

        {/* Balance Card */}
        <section className="balanceCardGold">
          <div className="balanceLeft">
            <div className="balanceLabelW">Account Balance</div>

            <div className={`balanceValueW ${balanceShimmer ? "isShimmer" : ""}`}>
              {money(demo.accountBalance)} <span className="unitW">USDT</span>
            </div>

            <div className="metaRowW">
              <span className="pillW">{demo.vipLevel}</span>
              {/* <span className="pillW">{demo.commissionRate}% Commission</span> */}
              <span className="pillW">
                {demo.availableMin}–{demo.availableMax} USDT
              </span>
            </div>
          </div>

          <div className="balanceRightW">
            <div className="miniInfo">
              <div className="miniLabel">Available Range</div>
              <div className="miniValue">
                {demo.availableMin}–{demo.availableMax} USDT
              </div>
            </div>

            <div className="miniInfo">
              <div className="miniLabel">Commission Rate</div>
              <div className="miniValue">{demo.commissionRate}%</div>
            </div>
          </div>
        </section>

        {/* Professional Content Section with Background */}
        <div className="professional-content-wrapper">

        {/* Performance */}
        <section className="cardW professional-card">
          <div className="cardHeadW">
            <h2 className="h2W">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}}>
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Performance Overview
            </h2>
            <span className="" style={{ display: "flex", alignItems: "center", gap: 6, color: "#22c55e", fontWeight: 900, fontSize: '13px' }}>
              <span className="live-dot"></span>
              Live
            </span>
          </div>

          <div className="metricGrid2">
            {demo.metrics.map((m, i) => (
              <div key={i} className="metricItemW professional-metric">
                <div className="metric-icon">
                  {i === 0 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2V22M17 5H9.5C7.5 5 6 6.5 6 8.5S7.5 12 9.5 12H14.5C16.5 12 18 13.5 18 15.5S16.5 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {i === 3 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {i === 4 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {i === 5 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="metricValueW">{m.value}</div>
                <div className="metricLabelW">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ctaArea">
          <button className="ctaBtnGold professional-cta" type="button" onClick={startMatching}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: '10px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Grab This Offer Immediately
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginLeft: '10px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </section>

        {/* Rules */}
        <section className="rulesCard professional-card">
          <div className="rulesHead">
            <h3 className="rulesTitle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}}>
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Rules & Guidelines
            </h3>
            <button
              className="supportBtn professional-support-btn"
              type="button"
              onClick={() => nav("/member/service")}
              aria-label="Customer Support"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Support</span>
            </button>
          </div>

          <ul className="rulesList professional-rules">
            {demo.rules.map((r, i) => (
              <li key={i}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="rule-check-icon">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{r}</span>
              </li>
            ))}
          </ul>

          <div className="supportHint professional-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '6px', display: 'inline-block', verticalAlign: 'middle'}}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Need help? Click <b>Support</b> button to contact our customer service team 24/7.
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}