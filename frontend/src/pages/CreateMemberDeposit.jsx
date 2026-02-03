// src/pages/CreateMemberDeposit.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { getUser } from "../auth";
import "../styles/app.css";

export default function CreateMemberDeposit() {
  const me = getUser();
  const canReview = me?.role === "owner";
  const nav = useNavigate();
  const { memberId } = useParams();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Manual");
  const [txRef, setTxRef] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!canReview) return setErr("Only owner can create deposits");
    setErr("");

    const n = Number(amount || 0);
    if (!n || n <= 0) return setErr("Deposit amount must be > 0");

    setBusy(true);
    try {
      await api.post("/deposits", {
        member_id: Number(memberId),
        amount: n,
        method: String(method || "").trim(),
        tx_ref: String(txRef || "").trim() || null,
        proof_url: String(proofUrl || "").trim() || null,
      });

      nav(`/members/${memberId}/wallet?tab=deposits`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Create deposit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Create Deposit</h2>
            <div className="small">Member ID: <span className="badge">{memberId}</span></div>
          </div>
          <button className="btn" onClick={() => nav(-1)} disabled={busy}>← Back</button>
        </div>

        <div className="card">
          {err && <div className="error">{err}</div>}

          <div className="small">Amount</div>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100" disabled={busy} />

          <div className="small" style={{ marginTop: 10 }}>Method</div>
          <input className="input" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Manual / USDT / Bank" disabled={busy} />

          <div className="small" style={{ marginTop: 10 }}>TX Ref (optional)</div>
          <input className="input" value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder="Transaction reference" disabled={busy} />

          <div className="small" style={{ marginTop: 10 }}>Proof URL (optional)</div>
          <input className="input" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." disabled={busy} />

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn" type="button" onClick={submit} disabled={busy}>
              {busy ? "Creating..." : "Create Deposit"}
            </button>
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            Wallet balance changes only after <b>Approve</b>.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
