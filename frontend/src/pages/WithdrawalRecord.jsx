import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import "./WithdrawalRecord.css";

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toISOString().slice(0, 16).replace("T", " ");
}

/** DB → UI status */
function uiStatus(db) {
  const s = String(db || "").toLowerCase();
  if (s === "approved") return "Completed";
  if (s === "rejected") return "Rejected";
  return "Pending"; // pending / reviewing / processing
}

export default function WithdrawalRecord() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const [err, setErr] = useState("");

  /** load profile + withdrawals */
  useEffect(() => {
    (async () => {
      try {
        const [meRes, wRes] = await Promise.all([
          memberApi.get("/member/me"),
          memberApi.get("/member/withdrawals"),
        ]);

        setMe(meRes.data || null);

        const rows = Array.isArray(wRes.data) ? wRes.data : [];

        const mapped = rows.map((x) => {
          const status = uiStatus(x.status);

          const method =
            x.method === "crypto"
              ? `${x.asset || "USDT"} (${x.network || "-"})`
              : `${x.bank_name || "Bank"} (${x.bank_country || "-"})`;

          return {
            id: x.tx_ref || `WD-${x.id}`,
            date: fmtDate(x.created_at),
            amount: Number(x.amount || 0),
            method,
            status,
            txHash: x.tx_ref || "-",
            address: x.wallet_address || x.account_details || "-",
            completedAt: fmtDate(x.reviewed_at),
          };
        });

        setRecords(mapped);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load withdrawals");
      }
    })();
  }, []);

  const filtered = useMemo(
    () => records.filter((r) => filter === "All" || r.status === filter),
    [records, filter]
  );

  return (
    <div className="wdPage">
      {/* Top Bar */}
      <header className="wdTop">
        <button className="wdBack" onClick={() => nav(-1)}>←</button>

        <div className="wdTitle">Withdrawal Records</div>

      </header>

      {err && <div className="wdError">{err}</div>}

      {/* Filters + Locked (same row) */}
      <section className="wdFiltersRow">
        <div className="wdFilters">
          {["All", "Pending", "Completed", "Rejected"].map((f) => (
            <button
              key={f}
              className={`wdFilterBtn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ✅ Locked Balance top-right aligned with filters */}
        <div className="wdLockedInline">
          <div className="wdLockedLabel">Locked</div>
          <div className="wdLockedValue">{money(me?.locked_balance || 0)} USDT</div>
        </div>
      </section>

      {/* Records */}
      <main className="wdWrap">
        {filtered.length === 0 && (
          <div className="wdEmpty">No withdrawal records</div>
        )}

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
              <StatusTimeline status={active.status} />

              <DetailRow label="Amount" value={`${money(active.amount)} USDT`} />
              <DetailRow label="Method" value={active.method} />
              <DetailRow label="Destination" mono value={active.address} />
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
