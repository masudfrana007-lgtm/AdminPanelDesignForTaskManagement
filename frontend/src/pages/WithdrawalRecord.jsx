import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WithdrawalRecord.css";

const records = [
  {
    id: "WD-10231",
    date: "2026-02-01 14:22",
    amount: 120.5,
    method: "USDT (TRC20)",
    status: "Completed",
    txHash: "b8f1a2e9c91f7d9a5c7a81a9f91d88b3",
    address: "TQ9L7Pp9D9dY2fQ7QpA1dYpFfR9D9A",
    completedAt: "2026-02-01 14:40",
  },
  {
    id: "WD-10218",
    date: "2026-01-31 09:10",
    amount: 300,
    method: "USDT (ERC20)",
    status: "Pending",
    txHash: "-",
    address: "0xA19f8d91F98dF91A8f9D91dF98F9",
    completedAt: "-",
  },
  {
    id: "WD-10199",
    date: "2026-01-30 17:44",
    amount: 75,
    method: "USDT (TRC20)",
    status: "Rejected",
    txHash: "-",
    address: "T7A1pQ9dP9A1dY2fQ7QpA1dYpFfR",
    completedAt: "-",
  },
];

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function WithdrawalRecord() {
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);

  const filtered = records.filter(
    (r) => filter === "All" || r.status === filter
  );

  return (
    <div className="wdPage">
      {/* Top Bar */}
      <header className="wdTop">
        <button className="wdBack" onClick={() => nav(-1)}>←</button>
        <div className="wdTitle">Withdrawal Records</div>
        <div style={{ width: 40 }} />
      </header>

      {/* Filters */}
      <section className="wdFilters">
        {["All", "Pending", "Completed", "Rejected"].map((f) => (
          <button
            key={f}
            className={`wdFilterBtn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Records */}
      <main className="wdWrap">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="wdCard clickable"
            onClick={() => setActive(r)}
          >
            <div className="wdRow">
              <span className="wdLabel">Amount</span>
              <span className="wdAmount">{money(r.amount)} USDT</span>
            </div>

            <div className="wdRow">
              <span className="wdLabel">Method</span>
              <span>{r.method}</span>
            </div>

            <div className="wdRow">
              <span className="wdLabel">Date</span>
              <span>{r.date}</span>
            </div>

            <div className="wdRow">
              <span className="wdLabel">Status</span>
              <span className={`wdStatus ${r.status.toLowerCase()}`}>
                {r.status}
              </span>
            </div>

            <div className="wdFooter">
              <span className="wdId">{r.id}</span>
              <span className="wdView">View Details →</span>
            </div>
          </div>
        ))}
      </main>

      {/* DETAIL MODAL */}
      {active && (
        <div className="wdModalOverlay" onClick={() => setActive(null)}>
          <div className="wdModal" onClick={(e) => e.stopPropagation()}>
            <div className="wdModalTop">
              <div className="wdModalTitle">Withdrawal Details</div>
              <button className="wdClose" onClick={() => setActive(null)}>✕</button>
            </div>

            <div className="wdModalBody">
              {/* ✅ Animated Timeline */}
              <StatusTimeline status={active.status} />

              <DetailRow label="Amount" value={`${money(active.amount)} USDT`} />
              <DetailRow label="Network" value={active.method} />
              <DetailRow label="Wallet Address" mono value={active.address} />
              <DetailRow label="TX Hash" mono value={active.txHash} />
              <DetailRow label="Requested At" value={active.date} />
              <DetailRow label="Completed At" value={active.completedAt} />
            </div>

            <div className="wdModalFooter">
              <button className="wdBtnSoft" onClick={() => setActive(null)}>
                Close
              </button>
              {active.txHash !== "-" && (
                <button
                  className="wdBtnPrimary"
                  onClick={() => navigator.clipboard.writeText(active.txHash)}
                >
                  Copy TX Hash
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================
   Animated Timeline
   ===================== */

function StatusTimeline({ status }) {
  const steps = ["Requested", "Processing", "Completed"];

  let currentStep = 1;
  if (status === "Pending") currentStep = 2;
  if (status === "Completed") currentStep = 3;
  if (status === "Rejected") currentStep = 2;

  const rejected = status === "Rejected";

  return (
    <div className={`wdTimeline is-animated ${status.toLowerCase()}`}>
      {steps.map((label, i) => {
        const stepIndex = i + 1;
        const reached = stepIndex <= currentStep;
        const dotRejected = rejected && stepIndex === 2;

        return (
          <div className="wdStep" key={label}>
            <div
              className={`wdDot ${reached && !rejected ? "done" : ""} ${
                dotRejected ? "rejected" : ""
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            />

            <div className="wdStepLabel">{label}</div>

            {i < steps.length - 1 && (
              <div className="wdLine">
                <div
                  className={`wdLineFill ${
                    reached && !dotRejected ? "fillOn" : ""
                  } ${dotRejected ? "fillRejected" : ""}`}
                  style={{ animationDelay: `${i * 200 + 200}ms` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="wdDetailRow">
      <div className="wdDetailLabel">{label}</div>
      <div className={`wdDetailValue ${mono ? "mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
