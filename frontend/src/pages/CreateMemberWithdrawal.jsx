// src/pages/CreateMemberWithdrawal.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { getUser } from "../auth";
import "../styles/app.css";

export default function CreateMemberWithdrawal() {
  const me = getUser();
  const canReview = me?.role === "owner";
  const nav = useNavigate();
  const { memberId } = useParams();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Crypto"); // ✅ default
  const [account, setAccount] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!canReview) return setErr("Only owner can create withdrawals");
    setErr("");

    const n = Number(amount || 0);
    if (!n || n <= 0) return setErr("Withdraw amount must be > 0");
    if (!method) return setErr("Withdraw method required");
    if (!String(account || "").trim()) return setErr("Account details required");

    setBusy(true);
    try {
      await api.post("/withdrawals", {
        member_id: Number(memberId),
        amount: n,
        method, // ✅ now controlled dropdown value
        account_details: String(account || "").trim(),
      });

      nav(`/members/${memberId}/wallet?tab=withdrawals`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Create withdrawal failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Create Withdrawal</h2>
            <div className="small">
              Member ID: <span className="badge">{memberId}</span>
            </div>
          </div>
          <button className="btn" onClick={() => nav(-1)} disabled={busy}>
            ← Back
          </button>
        </div>

        <div className="card">
          {err && <div className="error">{err}</div>}

          <div className="small">Amount</div>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            disabled={busy}
          />

          {/* ✅ METHOD DROPDOWN */}
          <div className="small" style={{ marginTop: 10 }}>Method</div>
          <select
            className="input"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={busy}
          >
            <option value="Crypto">Crypto</option>
            <option value="Bank">Bank</option>
          </select>

          <div className="small" style={{ marginTop: 10 }}>Account details</div>
          <input
            className="input"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={
              method === "Crypto"
                ? "USDT / BTC address"
                : "Bank name, account no, holder name"
            }
            disabled={busy}
          />

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn" type="button" onClick={submit} disabled={busy}>
              {busy ? "Creating..." : "Create Withdrawal"}
            </button>
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            On create: <b>balance ↓</b> and <b>locked ↑</b> immediately. Reject returns it. Approve releases locked.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
