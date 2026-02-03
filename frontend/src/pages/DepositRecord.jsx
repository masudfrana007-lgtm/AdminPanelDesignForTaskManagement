import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepositRecord.css";

/** ✅ Confirmation rule:
 * - Completed => 12/12
 * - Others (Confirming/Failed/etc) => random 3..10 / 12
 */
function getConfirmationsByStatus(status, max = 12) {
  if (status === "Completed") {
    return { current: max, max };
  }
  const current = Math.floor(Math.random() * (10 - 3 + 1)) + 3; // 3..10
  return { current, max };
}

const records = [
  {
    id: "DP-40231",
    date: "2026-02-02 11:20",
    amount: 500,
    method: "USDT",
    network: "TRC20",
    status: "Completed",
    txHash: "9f1a2b3c4d5e6f7a8b9c",
    completedAt: "2026-02-02 11:35",
  },
  {
    id: "DP-40188",
    date: "2026-02-01 19:02",
    amount: 120,
    method: "USDT",
    network: "ERC20",
    status: "Confirming",
    txHash: "a7b8c9d0e1f2",
    completedAt: "-",
  },
  {
    id: "DP-40110",
    date: "2026-01-31 08:40",
    amount: 80,
    method: "USDT",
    network: "TRC20",
    status: "Failed",
    txHash: "-",
    completedAt: "-",
  },
];

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function DepositRecord() {
  const nav = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const filtered = records.filter((r) => {
    if (filter !== "All" && r.status !== filter) return false;

    if (search) {
      const q = search.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.txHash.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="dpPage">
      {/* Top bar */}
      <header className="dpTop">
        <button className="dpBack" onClick={() => nav(-1)}>←</button>
        <div className="dpTitle">Deposit Records</div>
        <div style={{ width: 40 }} />
      </header>

      {/* Status filter */}
      <section className="dpFilters">
        {["All", "Confirming", "Completed", "Failed"].map((f) => (
          <button
            key={f}
            className={`dpFilterBtn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Search */}
      <section className="dpSearch">
        <input
          placeholder="Search by Deposit ID or TX hash"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* Records */}
      <main className="dpWrap">
        {filtered.length === 0 && (
          <div className="dpEmpty">No deposit records found.</div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="dpCard clickable"
            onClick={() =>
              setActive({
                ...r,
                confirmations: getConfirmationsByStatus(r.status, 12), // ✅ updated rule
              })
            }
          >
            <div className="dpRow">
              <span className="dpLabel">Amount</span>
              <span className="dpAmount">{money(r.amount)} USDT</span>
            </div>

            <div className="dpRow">
              <span className="dpLabel">Network</span>
              <span>{r.network}</span>
            </div>

            <div className="dpRow">
              <span className="dpLabel">Date</span>
              <span>{r.date}</span>
            </div>

            <div className="dpRow">
              <span className="dpLabel">Status</span>
              <span className={`dpStatus ${r.status.toLowerCase()}`}>
                {r.status}
              </span>
            </div>

            <div className="dpFooter">
              <span className="dpId">{r.id}</span>
              <span className="dpView">View Details →</span>
            </div>
          </div>
        ))}
      </main>

      {/* Detail modal */}
      {active && (
        <div className="dpModalOverlay" onClick={() => setActive(null)}>
          <div className="dpModal" onClick={(e) => e.stopPropagation()}>
            <div className="dpModalTop">
              <div className="dpModalTitle">Deposit Details</div>
              <button className="dpClose" onClick={() => setActive(null)}>✕</button>
            </div>

            <div className="dpModalBody">
              <DepositTimeline status={active.status} />

              {/* ✅ Confirmations counter */}
              {active.confirmations && (
                <DetailRow
                  label="Confirmations"
                  value={`${active.confirmations.current} / ${active.confirmations.max}`}
                />
              )}

              <DetailRow label="Amount" value={`${money(active.amount)} USDT`} />
              <DetailRow label="Network" value={active.network} />
              <DetailRow label="TX Hash" mono value={active.txHash} />
              <DetailRow label="Submitted At" value={active.date} />
              <DetailRow label="Completed At" value={active.completedAt} />
            </div>

            {/* Footer actions (Close + Copy) */}
            <div className="dpModalFooter">
              <button className="dpBtnSoft" onClick={() => setActive(null)}>
                Close
              </button>

              {active.txHash !== "-" && (
                <button
                  className="dpBtnPrimary"
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

/* Components */

function DepositTimeline({ status }) {
  const steps = ["Submitted", "Confirming", "Completed"];

  let current = 1;
  if (status === "Confirming") current = 2;
  if (status === "Completed") current = 3;
  if (status === "Failed") current = 2;

  return (
    <div className={`dpTimeline ${status.toLowerCase()}`}>
      {steps.map((s, i) => {
        const done = i + 1 <= current && status !== "Failed";
        const failed = status === "Failed" && i === 1;

        return (
          <div key={s} className="dpStep">
            <div className={`dpDot ${done ? "done" : ""} ${failed ? "failed" : ""}`} />
            <div className="dpStepLabel">{s}</div>
            {i < steps.length - 1 && <div className="dpLine" />}
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="dpDetailRow">
      <div className="dpDetailLabel">{label}</div>
      <div className={`dpDetailValue ${mono ? "mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}
