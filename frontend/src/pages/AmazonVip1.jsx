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
    nav("/member/tasks-set");
  };

  

  return (
    <div className="vipWhite">
      {/* Top Bar */}
      <header className="topbarW">
        <button className="backIcon" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>

        <div className="topTitle">
          <div className="topBrandRow">
            <span className="topBrand">{demo.brand}</span>
            <span className="vipBadge">{demo.vipLevel}</span>
          </div>
          <div className="topSub">
            Commission {demo.commissionRate}% • Range {demo.availableMin}-{demo.availableMax} USDT
          </div>
        </div>

        <button className="homeBtn" onClick={() => nav("/")} aria-label="Home">
          Home
        </button>
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
              <span className="pillW">{demo.commissionRate}% Commission</span>
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

        {/* Performance */}
        <section className="cardW">
          <div className="cardHeadW">
            <h2 className="h2W">Performance Overview</h2>
            <span className="smallMutedW">Live</span>
          </div>

          <div className="metricGrid2">
            {demo.metrics.map((m, i) => (
              <div key={i} className="metricItemW">
                <div className="metricValueW">{m.value}</div>
                <div className="metricLabelW">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ctaArea">
          <button className="ctaBtnGold" type="button" onClick={startMatching}>
            Grab This Offer Immediately
          </button>
        </section>

        {/* Rules */}
        <section className="rulesCard">
          <div className="rulesHead">
            <h3 className="rulesTitle">Rules</h3>
            <a
              className="supportLink"
              href="/support"
              onClick={(e) => e.preventDefault()}
              aria-label="Support"
            >
              Support
            </a>
          </div>

          <ul className="rulesList">
            {demo.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <div className="supportHint">
            Need help? Click <b>Support</b> to contact customer service.
          </div>
        </section>
      </main>
    </div>
  );
}
