// src/pages/CreateMemberDeposit.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { getUser } from "../auth";
import "../styles/app.css";

// Keep same asset list style you used in member deposit page
const ASSETS = [
  {
    symbol: "USDT",
    name: "Tether",
    networks: ["TRC20", "BEP20", "ERC20"],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    networks: ["BTC"],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    networks: ["ERC20"],
  },
  {
    symbol: "BNB",
    name: "BNB",
    networks: ["BEP20"],
  },
];

export default function CreateMemberDeposit() {
  const me = getUser();
  const canReview = me?.role === "owner";
  const nav = useNavigate();
  const { memberId } = useParams();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank"); // "crypto" | "bank"
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");

  const [txRef, setTxRef] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const assetObj = useMemo(() => ASSETS.find((a) => a.symbol === asset) || ASSETS[0], [asset]);
  const networks = assetObj.networks;

  const onChangeMethod = (v) => {
    setMethod(v);
    setErr("");

    // if switching to crypto, ensure network matches asset
    if (v === "crypto") {
      const a = ASSETS.find((x) => x.symbol === asset) || ASSETS[0];
      const defNet = a.networks[0] || "";
      setNetwork(defNet);
    }
  };

  const onChangeAsset = (sym) => {
    setAsset(sym);
    const a = ASSETS.find((x) => x.symbol === sym) || ASSETS[0];
    const defNet = a.networks[0] || "";
    setNetwork(defNet);
  };

  const submit = async () => {
    if (!canReview) return setErr("Only owner can create deposits");
    setErr("");

    const n = Number(amount || 0);
    if (!n || n <= 0) return setErr("Deposit amount must be > 0");

    const txRefClean = String(txRef || "").trim();
    const proofUrlClean = String(proofUrl || "").trim();

    // ✅ Validate crypto requirements
    if (method === "crypto") {
      if (!asset) return setErr("Asset is required for crypto deposit");
      if (!network) return setErr("Network is required for crypto deposit");
    }

    // ✅ Match backend validation: if method includes "crypto", network required.
    // Use method values that make this predictable.
    const methodStr = method === "crypto" ? "crypto" : "bank";

    // ✅ Build payload:
    // - include tx_ref only if user entered it (otherwise DB default can generate)
    // - include asset/network only for crypto
    const payload = {
      member_id: Number(memberId),
      amount: n,
      method: methodStr,
      ...(method === "crypto" ? { asset, network } : {}),
      ...(txRefClean ? { tx_ref: txRefClean } : {}),
      ...(proofUrlClean ? { proof_url: proofUrlClean } : {}),
    };

    setBusy(true);
    try {
      await api.post("/deposits", payload);
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
            <div className="small">
              Member ID: <span className="badge">{memberId}</span>
            </div>
          </div>
          <button className="btn" onClick={() => nav(-1)} disabled={busy} type="button">
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
            placeholder="e.g. 100"
            disabled={busy}
            type="number"
            min="0"
            step="any"
          />

          <div className="small" style={{ marginTop: 10 }}>
            Method
          </div>
          <select
            className="input"
            value={method}
            onChange={(e) => onChangeMethod(e.target.value)}
            disabled={busy}
          >
            <option value="crypto">Crypto</option>
            <option value="bank">Bank</option>
          </select>

          {/* ✅ Only show asset/network for crypto */}
          {method === "crypto" && (
            <>
              <div className="small" style={{ marginTop: 10 }}>
                Asset
              </div>
              <select className="input" value={asset} onChange={(e) => onChangeAsset(e.target.value)} disabled={busy}>
                {ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name}
                  </option>
                ))}
              </select>

              <div className="small" style={{ marginTop: 10 }}>
                Network
              </div>
              <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)} disabled={busy}>
                {networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <div className="small" style={{ marginTop: 8 }}>
                Leave TX Ref empty to auto-generate.
              </div>
            </>
          )}

          <div className="small" style={{ marginTop: 10 }}>
            TX Ref (optional)
          </div>
          <input
            className="input"
            value={txRef}
            onChange={(e) => setTxRef(e.target.value)}
            placeholder={method === "crypto" ? "Leave empty to auto-generate" : "Bank reference (optional)"}
            disabled={busy}
          />

          <div className="small" style={{ marginTop: 10 }}>
            Proof URL (optional)
          </div>
          <input
            className="input"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://..."
            disabled={busy}
          />

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
