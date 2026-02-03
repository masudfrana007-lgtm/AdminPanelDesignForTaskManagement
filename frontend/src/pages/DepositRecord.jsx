// src/pages/DepositRecord.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi"; // ✅ member-side API client
import "./DepositRecord.css";
import MemberBottomNav from "../components/MemberBottomNav";

/** ✅ Map DB status -> UI labels used by DepositRecord.css
 * deposits.status: pending | approved | rejected
 */
function uiStatus(dbStatus) {
  const s = String(dbStatus || "").toLowerCase();
  if (s === "approved") return "Completed";
  if (s === "rejected") return "Failed";
  return "Confirming";
}

/** ✅ Confirmation rule:
 * - Completed => 12/12
 * - Others => random 3..10 / 12
 */
function getConfirmationsByStatus(status, max = 12) {
  if (status === "Completed") return { current: max, max };
  const current = Math.floor(Math.random() * (10 - 3 + 1)) + 3; // 3..10
  return { current, max };
}

function fmtDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(n || 0));
}

/** ✅ Normalize DB row -> UI record */
function normalizeDeposit(d) {
  const status = uiStatus(d.status);

  return {
    // keep numeric id, but show DP-xxx in UI
    id: Number(d.id),
    displayId: `DP-${d.id}`,

    date: fmtDate(d.created_at),
    completedAt: d.reviewed_at ? fmtDate(d.reviewed_at) : "-",

    amount: Number(d.amount || 0),
    asset: d.asset || "USDT",
    network: d.network || "-",
    method: d.method || "-",

    status,
    rawStatus: d.status || "pending",

    // in your DB it is tx_ref (nullable)
    txHash: d.tx_ref || "-",

    adminNote: d.admin_note || "",
  };
}

export default function DepositRecord() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]); // normalized records
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const [toast, setToast] = useState("");

  const load = async () => {
    setErr("");
    setBusy(true);
    try {
      // ✅ MEMBER endpoint
      // returns: id, amount, method, asset, network, tx_ref, proof_url, source, status, admin_note, created_at, reviewed_at
      const { data } = await memberApi.get("/member/deposits");
      const list = Array.isArray(data) ? data : [];
      setRows(list.map(normalizeDeposit));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load deposit records");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "All" && r.status !== filter) return false;

      if (search) {
        const q = search.toLowerCase();
        const a = String(r.displayId || "").toLowerCase();
        const b = String(r.txHash || "").toLowerCase();
        if (!a.includes(q) && !b.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  return (
    <div className="dpPage">
      {/* Top bar */}
      <header className="dpTop">
        <button className="dpBack" onClick={() => nav(-1)}>←</button>
        <div className="dpTitle">Deposit Records</div>

        {/* small refresh button */}
        <button
          className="dpFilterBtn"
          style={{ marginLeft: "auto" }}
          onClick={load}
          disabled={busy}
          type="button"
        >
          {busy ? "..." : "↻"}
        </button>
      </header>

      {err ? <div className="dpEmpty" style={{ color: "#dc2626" }}>{err}</div> : null}

      {/* Status filter */}
      <section className="dpFilters">
        {["All", "Confirming", "Completed", "Failed"].map((f) => (
          <button
            key={f}
            className={`dpFilterBtn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
            type="button"
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
        {busy && <div className="dpEmpty">Loading…</div>}

        {!busy && filtered.length === 0 && (
          <div className="dpEmpty">No deposit records found.</div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="dpCard clickable"
            onClick={() =>
              setActive({
                ...r,
                confirmations: getConfirmationsByStatus(r.status, 12),
              })
            }
          >
            <div className="dpRow">
              <span className="dpLabel">Amount</span>
              <span className="dpAmount">{money(r.amount)} {r.asset}</span>
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
              <span className="dpId">{r.displayId}</span>
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
              <button className="dpClose" onClick={() => setActive(null)} type="button">✕</button>
            </div>

            <div className="dpModalBody">
              <DepositTimeline status={active.status} />

              {/* Confirmations counter */}
              {active.confirmations && (
                <DetailRow
                  label="Confirmations"
                  value={`${active.confirmations.current} / ${active.confirmations.max}`}
                />
              )}

              <DetailRow label="Deposit ID" value={active.displayId} />
              <DetailRow label="Amount" value={`${money(active.amount)} ${active.asset}`} />
              <DetailRow label="Method" value={active.method} />
              <DetailRow label="Network" value={active.network} />
              <DetailRow label="TX Hash" mono value={active.txHash} />
              <DetailRow label="Submitted At" value={active.date} />
              <DetailRow label="Completed At" value={active.completedAt} />

              {!!active.adminNote && (
                <DetailRow label="Admin note" value={active.adminNote} />
              )}
            </div>

            {/* Footer actions (Close + Copy) */}
            <div className="dpModalFooter">
              <button className="dpBtnSoft" onClick={() => setActive(null)} type="button">
                Close
              </button>

              {active.txHash !== "-" && (
                <button
                  className="dpBtnPrimary"
                  onClick={() => {
                    navigator.clipboard.writeText(active.txHash);
                    setToast("TX Hash copied to clipboard");
                    setTimeout(() => setToast(""), 2000);
                  }}
                  type="button"
                >
                  Copy TX Hash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="dpToast">
          {toast}
        </div>
      )}

      <MemberBottomNav active="mine" />            
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
