import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AliexpressVip3.css";
import memberApi from "../services/memberApi";

const initialDemo = {
  brand: "AliExpress",
  vipLevel: "VIP 3",

  commissionRate: 8,
  availableMin: 1000,
  availableMax: 100000,
  accountBalance: 97280.12,

  metrics: [
    { label: "Today's Times", value: "40" },
    { label: "Today's Commission", value: "18,920.10 USDT" },
    { label: "Cash gap between tasks", value: "0 USDT" },
    { label: "Yesterday's buy commission", value: "0 USDT" },
    { label: "Yesterday's team commission", value: "0 USDT" },
    { label: "Money frozen in accounts", value: "0 USDT" },
  ],

  rules: [
    "VIP 3 commission is credited only after successful order completion.",
    "Orders are assigned randomly by the system based on VIP range.",
    "Complete tasks as soon as possible after receiving them.",
    "Repeated refresh or abuse may result in account restriction.",
  ],
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function AliexpressVip3() {
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

  // ✅ instant redirect (no modal, no confirm, no timeout)
  const startMatching = () => {
    nav("/member/tasks-set");
  };

  return (
    <div className="vipWhite axElite">
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
              <span className="vipBadge-modern vipBadgeAx-modern">{demo.vipLevel}</span>
            </div>
            <div className="topSub-modern">
              Commission {demo.commissionRate}% • Range {demo.availableMin}-{demo.availableMax} USDT
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
            <div className="vipLogoMark vipLogoMarkNoBg" aria-hidden>
              <img
                className="vipLogoImg vipLogoImgBig"
                src="/brands/aliexpress.png"
                alt="AliExpress"
                draggable="false"
              />
            </div>

            <div className="vipLogoText">
              <div className="vipLogoTitle">
                AliExpress{" "}
                <span className="vipLogoChip vipLogoChipAx">{demo.vipLevel}</span>
              </div>
              <div className="vipLogoSub">Elite task commission wallet</div>
            </div>
          </div>
        </section>

        {/* Wallet / Balance */}
        <section className="balanceCardAx">
          <div className="balanceLeft">
            <div className="balanceLabelAx">Account Balance</div>

            <div className={`balanceValueW ${balanceShimmer ? "isShimmer" : ""}`}>
              {money(demo.accountBalance)} <span className="unitW">USDT</span>
            </div>

            <div className="metaRowW">
              <span className="pillW pillAx">{demo.vipLevel}</span>
              <span className="pillW pillAx">{demo.commissionRate}% Commission</span>
              <span className="pillW pillAx">
                {demo.availableMin}–{demo.availableMax} USDT
              </span>
            </div>
          </div>

          <div className="balanceRightW balanceRightAx">
            <div className="miniInfo">
              <div className="miniLabelAx">Available Range</div>
              <div className="miniValue">
                {demo.availableMin}–{demo.availableMax} USDT
              </div>
            </div>

            <div className="miniInfo">
              <div className="miniLabelAx">Commission Rate</div>
              <div className="miniValue">{demo.commissionRate}%</div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="cardW">
          <div className="cardHeadW">
            <h2 className="h2W">Performance Overview</h2>
            <span className="smallMutedW">Live</span>
          </div>

          <div className="metricGrid2">
            {demo.metrics.map((m, i) => (
              <div key={i} className="metricItemW metricItemAx">
                <div className="metricValueW">{m.value}</div>
                <div className="metricLabelW">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ctaArea">
          <button className="ctaBtnAx" type="button" onClick={startMatching}>
            Execute VIP 3 Offer
          </button>
          <div className="ctaSubW">You will be redirected to your task list.</div>
        </section>

        {/* Rules */}
        <section className="rulesCard">
          <div className="rulesHead">
            <h3 className="rulesTitle">Rules</h3>
            <button
              className="supportBtn"
              type="button"
              onClick={() => nav("/member/service")}
              aria-label="Customer Support"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15.46C20.36 15.46 19.74 15.36 19.15 15.17C18.84 15.06 18.5 15.14 18.31 15.37L16.57 17.11C14.06 15.87 12.13 13.94 10.89 11.43L12.63 9.69C12.86 9.5 12.94 9.16 12.83 8.85C12.64 8.26 12.54 7.64 12.54 7C12.54 6.45 12.09 6 11.54 6H8.54C7.99 6 7.54 6.45 7.54 7C7.54 13.48 12.52 18.46 19 18.46C19.55 18.46 20 18.01 20 17.46V14.46C21 14.96 21.55 15.46 21 15.46Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Customer Support
            </button>
          </div>

          <ul className="rulesList">
            {demo.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <div className="supportHint">
            Need help? Click <b>Customer Support</b> to contact customer service.
          </div>
        </section>
      </main>

    </div>
  );
}