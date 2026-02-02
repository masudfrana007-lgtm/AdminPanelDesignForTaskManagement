import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AlibabaVip2.css";
import memberApi from "../services/memberApi";

const initialDemo = {
  brand: "Alibaba",
  vipLevel: "VIP 2",

  // Higher commission + bigger range
  commissionRate: 6,
  availableMin: 500,
  availableMax: 50000,
  accountBalance: 97280.12,

  metrics: [
    { label: "Today's Times", value: "32" },
    { label: "Today's Commission", value: "12,480.50 USDT" },
    { label: "Cash gap between tasks", value: "0 USDT" },
    { label: "Yesterday's buy commission", value: "0 USDT" },
    { label: "Yesterday's team commission", value: "0 USDT" },
    { label: "Money frozen in accounts", value: "0 USDT" },
  ],

  rules: [
    "Elite commission is credited only after successful order completion.",
    "Orders are assigned randomly by the system based on VIP range.",
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

export default function AlibabaVip2() {
  const nav = useNavigate();

  // Balance in state so shimmer can react to changes
  const [balance, setBalance] = useState(0);
  const [balanceShimmer, setBalanceShimmer] = useState(false);

  // Modal flow: "idle" | "matching" | "confirm"
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
    setFlow("matching");

    const newOrder = makeOrder(demo);

    setTimeout(() => {
      setOrder(newOrder);
      setFlow("confirm");
    }, 1600);
  };

  const cancelOrder = () => {
    closeAll();
  };

  const confirmOrder = () => {
    if (!order) return;

    setBalance((b) => {
      const newB = Math.max(0, b - order.amount);
      return Math.round(newB * 100) / 100;
    });

    closeAll();

    alert(`Success! Order confirmed: #${order.id}`);
    nav("/member/tasks-set");
  };

  const progressPct = Math.max(0, Math.min(100, (secondsLeft / COUNTDOWN_SEC) * 100));

  return (
    <div className="vipWhite aliElite">
      {/* Top Bar */}
      <header className="topbarW">
        <button className="backIcon" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>

        <div className="topTitle">
          <div className="topBrandRow">
            <span className="topBrand">{demo.brand}</span>
            <span className="vipBadge vipBadgeElite">{demo.vipLevel}</span>
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
            <div className="vipLogoMark vipLogoMarkElite vipLogoMarkNoBg" aria-hidden>
  <img
    className="vipLogoImg vipLogoImgBig"
    src="/brands/alibaba.png"
    alt="Alibaba"
    draggable="false"
  />
</div>


            <div className="vipLogoText">
              <div className="vipLogoTitle">
                Alibaba <span className="vipLogoChip vipLogoChipElite">{demo.vipLevel}</span>
              </div>
              <div className="vipLogoSub">Elite task commission wallet</div>
            </div>
          </div>
        </section>

        {/* ELITE WALLET BALANCE (same structure, upgraded professional design) */}
        <section className="balanceCardElite">
          <div className="balanceLeft">
            <div className="balanceLabelW">Account Balance</div>

            <div className={`balanceValueW ${balanceShimmer ? "isShimmer" : ""}`}>
              {money(demo.accountBalance)} <span className="unitW">USDT</span>
            </div>

            <div className="metaRowW">
              <span className="pillW pillElite">{demo.vipLevel}</span>
              <span className="pillW pillElite">{demo.commissionRate}% Commission</span>
              <span className="pillW pillElite">
                {demo.availableMin}–{demo.availableMax} USDT
              </span>
            </div>
          </div>

          <div className="balanceRightW balanceRightElite">
            <div className="miniInfo">
              <div className="miniLabel miniLabelElite">Available Range</div>
              <div className="miniValue">
                {demo.availableMin}–{demo.availableMax} USDT
              </div>
            </div>

            <div className="miniInfo">
              <div className="miniLabel miniLabelElite">Commission Rate</div>
              <div className="miniValue">{demo.commissionRate}%</div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE OVERVIEW */}
        <section className="cardW">
          <div className="cardHeadW">
            <h2 className="h2W">Performance Overview</h2>
            <span className="smallMutedW">Live</span>
          </div>

          <div className="metricGrid2">
            {demo.metrics.map((m, i) => (
              <div key={i} className="metricItemW metricItemElite">
                <div className="metricValueW">{m.value}</div>
                <div className="metricLabelW">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ctaArea">
          <button className="ctaBtnElite" type="button" onClick={startMatching}>
            Execute Elite Offer
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
          PREMIUM MODALS (same flow)
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
              <div className="spinner spinnerElite" aria-hidden />
              <div className="modalText">
                Please wait while we match an order based on your VIP range.
              </div>
              <div className="modalSub">Do not refresh the page.</div>
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
                <div className="countValue countValueElite">{secondsLeft}s</div>
              </div>

              <div className="progressBar" aria-hidden>
                <div className="progressFill progressFillElite" style={{ width: `${progressPct}%` }} />
              </div>

              <div className="orderCard orderCardElite">
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
                  <span className="orderVal goldStrong goldStrongElite">{money(order.commission)} USDT</span>
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
                className="btnGold btnElite"
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
