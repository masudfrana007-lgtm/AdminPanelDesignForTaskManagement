import React, { useEffect, useMemo, useRef, useState } from "react";
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

function makeOrder({ brand, vipLevel, commissionRate, availableMin, availableMax }) {
  const amount = Math.round((availableMin + Math.random() * (availableMax - availableMin)) * 100) / 100;
  const commission = Math.round((amount * (commissionRate / 100)) * 100) / 100;
  const id = `${brand.slice(0, 1).toUpperCase()}${Math.floor(10000 + Math.random() * 90000)}`;
  const productNo = Math.floor(100000 + Math.random() * 900000);

  return {
    id,
    brand,
    vipLevel,
    amount,
    commission,
    product: `${brand} Product #${productNo}`,
    createdAt: new Date().toISOString(),
  };
}

export default function AmazonVip1() {
  const nav = useNavigate();

  // Balance in state so shimmer can react to changes
  const [balance, setBalance] = useState(0);
  const [balanceShimmer, setBalanceShimmer] = useState(false);

  // Modal flow
  // "idle" | "matching" | "confirm"
  const [flow, setFlow] = useState("idle");
  const [order, setOrder] = useState(null);

  // Countdown
  const COUNTDOWN_SEC = 60;
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SEC);

  // Accessibility focus
  const confirmPrimaryBtnRef = useRef(null);

useEffect(() => {
  const loadMe = async () => {
    try {
      const { data } = await memberApi.get("/member/me");
      setBalance(Number(data?.balance || 0));
    } catch (e) {
      // keep the demo / existing balance if API fails
      setBalance(initialDemo.accountBalance);
    }
  };

  loadMe();
}, []);

  // Trigger shimmer whenever balance changes
  useEffect(() => {
    setBalanceShimmer(true);
    const t = setTimeout(() => setBalanceShimmer(false), 1100);
    return () => clearTimeout(t);
  }, [balance]);

  // When confirm modal opens, reset countdown
  useEffect(() => {
    if (flow === "confirm") {
      setSecondsLeft(COUNTDOWN_SEC);
      // focus confirm button
      setTimeout(() => confirmPrimaryBtnRef.current?.focus(), 50);
    }
  }, [flow]);

  // Countdown timer ticking
  useEffect(() => {
    if (flow !== "confirm") return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [flow]);

  // Auto-cancel on timeout
  useEffect(() => {
    if (flow !== "confirm") return;
    if (secondsLeft > 0) return;

    // time is up
    setFlow("idle");
    setOrder(null);
    setSecondsLeft(COUNTDOWN_SEC);
    alert("Order expired. Please grab again.");
  }, [secondsLeft, flow]);

  const demo = useMemo(() => ({ ...initialDemo, accountBalance: balance }), [balance]);

  const closeAll = () => {
    setFlow("idle");
    setOrder(null);
  };

  const startMatching = () => {
    // Start premium matching modal
    setFlow("matching");

    // simulate backend matching delay
    const newOrder = makeOrder(demo);

    setTimeout(() => {
      setOrder(newOrder);
      setFlow("confirm");
    }, 1600);
  };

  const cancelOrder = () => {
    closeAll();
  };

// ✅ replace ONLY this function
const confirmOrder = () => {
  if (!order) return;

  // update balance locally (same as you already do)
  setBalance((b) => {
    const newB = Math.max(0, b - order.amount);
    return Math.round(newB * 100) / 100;
  });

  closeAll();

  // ✅ show success then go to MemberTasks
  alert(`Success! Order confirmed: #${order.id}`);
  nav("/member/tasks-set");
};


  const progressPct = Math.max(0, Math.min(100, (secondsLeft / COUNTDOWN_SEC) * 100));

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

        {/* LUXURY WALLET BALANCE (animated gold light + shimmer on balance update) */}
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

        {/* PERFORMANCE OVERVIEW (2 columns on desktop, compact on mobile) */}
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
          <div className="ctaSubW">We’ll match an order for you. Confirm within the time limit.</div>
        </section>

        {/* RULES + SUPPORT */}
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

      {/* =========================
          PREMIUM MODALS
         ========================= */}

      {/* Matching modal */}
      {flow === "matching" && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Matching order">
          <div className="modalCard">
            <div className="modalTop">
              <div className="modalTitle">Matching order…</div>
              <button className="iconClose" type="button" onClick={closeAll} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modalBody">
              <div className="spinner" aria-hidden />
              <div className="modalText">
                Please wait while we match an order based on your VIP range.
              </div>
              <div className="modalSub">
                Do not refresh the page.
              </div>
            </div>

            <div className="modalFooter">
              <button className="btnSoft" type="button" onClick={closeAll}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal with countdown */}
      {flow === "confirm" && order && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Confirm order">
          <div className="modalCard">
            <div className="modalTop">
              <div className="modalTitle">Confirm Order</div>
              <button className="iconClose" type="button" onClick={cancelOrder} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modalBody">
              <div className="countRow">
                <div className="countLabel">Time remaining</div>
                <div className="countValue">{secondsLeft}s</div>
              </div>

              <div className="progressBar" aria-hidden>
                <div className="progressFill" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="orderCard">
                <div className="orderLine">
                  <span className="orderKey">Order ID</span>
                  <span className="orderVal mono">#{order.id}</span>
                </div>
                <div className="orderLine">
                  <span className="orderKey">Product</span>
                  <span className="orderVal">{order.product}</span>
                </div>
                <div className="orderLine">
                  <span className="orderKey">Amount</span>
                  <span className="orderVal strong">{money(order.amount)} USDT</span>
                </div>
                <div className="orderLine">
                  <span className="orderKey">Commission</span>
                  <span className="orderVal goldStrong">{money(order.commission)} USDT</span>
                </div>
              </div>

              <div className="modalHint">
                Confirm to proceed. If you don’t confirm before time ends, the order will expire.
              </div>
            </div>

            <div className="modalFooter">
              <button className="btnSoft" type="button" onClick={cancelOrder}>
                Cancel
              </button>
              <button
                className="btnGold"
                type="button"
                onClick={confirmOrder}
                ref={confirmPrimaryBtnRef}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
