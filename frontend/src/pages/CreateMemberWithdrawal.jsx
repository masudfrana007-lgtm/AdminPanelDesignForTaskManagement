// src/pages/CreateMemberWithdrawal.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { getUser } from "../auth";
import "../styles/app.css";

const CRYPTO_ASSETS = ["USDT", "BTC", "ETH", "BNB"];
const NETWORKS_BY_ASSET = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  BTC: ["BTC"],
  ETH: ["ERC20"],
  BNB: ["BEP20"],
};

// optional: you can replace this with your real list
const BANK_COUNTRIES = [
  { code: "KH", name: "Cambodia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
];

export default function CreateMemberWithdrawal() {
  const me = getUser();
  const canReview = me?.role === "owner";

  const nav = useNavigate();
  const { memberId } = useParams();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("crypto"); // "crypto" | "bank"

  // crypto fields
  const [asset, setAsset] = useState("USDT");
  const networks = useMemo(() => NETWORKS_BY_ASSET[asset] || ["TRC20"], [asset]);
  const [network, setNetwork] = useState(networks[0] || "TRC20");
  const [walletAddress, setWalletAddress] = useState("");

  // bank fields
  const [bankCountry, setBankCountry] = useState("KH");
  const [bankName, setBankName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [branchName, setBranchName] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  // keep network valid when asset changes
  const onChangeAsset = (a) => {
    setAsset(a);
    const ns = NETWORKS_BY_ASSET[a] || [];
    setNetwork(ns[0] || "");
    setWalletAddress("");
  };

  const validate = () => {
    const n = Number(amount || 0);
    if (!canReview) return "Only owner can create withdrawals";
    if (!n || n <= 0) return "Withdraw amount must be > 0";

    if (method === "crypto") {
      if (!asset) return "Asset required";
      if (!network) return "Network required";
      if (!walletAddress.trim()) return "Wallet address required";
      if (walletAddress.trim().length < 10) return "Wallet address looks too short";
    }

    if (method === "bank") {
      if (!bankCountry) return "Bank country required";
      if (!bankName.trim()) return "Bank name required";
      if (!accountHolderName.trim()) return "Account holder name required";
      if (!accountNumber.trim()) return "Account number required";
    }

    return "";
  };

  const buildAccountDetails = () => {
    if (method === "crypto") {
      const addr = walletAddress.trim();
      const short = addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : "-";
      return `Crypto • ${asset} (${network}) • ${short}`;
    }

    // bank
    const acc = accountNumber.trim();
    const masked = acc ? `****${acc.slice(-4)}` : "-";
    return `Bank • ${bankName.trim()} • ${accountHolderName.trim()} • ${masked}`;
  };

  const submit = async () => {
    setErr("");
    setOk("");

    const msg = validate();
    if (msg) return setErr(msg);

    setBusy(true);
    try {
      const n = Number(amount || 0);

      const payload =
        method === "crypto"
          ? {
              member_id: Number(memberId),
              amount: n,
              method: "crypto",
              account_details: buildAccountDetails(),

              // crypto-only
              asset,
              network,
              wallet_address: walletAddress.trim(),
            }
          : {
              member_id: Number(memberId),
              amount: n,
              method: "bank",
              account_details: buildAccountDetails(),

              // bank-only
              bank_country: bankCountry,
              bank_name: bankName.trim(),
              account_holder_name: accountHolderName.trim(),
              account_number: accountNumber.trim(),
              routing_number: routingNumber.trim() || null,
              branch_name: branchName.trim() || null,
            };

      await api.post("/withdrawals", payload);
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
          {ok && <div className="ok">{ok}</div>}

          <div className="small">Amount</div>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            disabled={busy}
            inputMode="decimal"
          />

          {/* Method switch */}
          <div className="small" style={{ marginTop: 10 }}>
            Withdrawal Method
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => {
                setMethod("crypto");
                setErr("");
              }}
              style={{ opacity: method === "crypto" ? 1 : 0.7 }}
            >
              Crypto
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => {
                setMethod("bank");
                setErr("");
              }}
              style={{ opacity: method === "bank" ? 1 : 0.7 }}
            >
              Bank
            </button>
          </div>

          {/* Crypto fields */}
          {method === "crypto" && (
            <div style={{ marginTop: 12 }}>
              <div className="small">Asset</div>
              <select
                className="input"
                value={asset}
                onChange={(e) => onChangeAsset(e.target.value)}
                disabled={busy}
              >
                {CRYPTO_ASSETS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <div className="small" style={{ marginTop: 10 }}>
                Network
              </div>
              <select
                className="input"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                disabled={busy}
              >
                {networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <div className="small" style={{ marginTop: 10 }}>
                Wallet Address
              </div>
              <input
                className="input"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter ${asset} address (${network})`}
                disabled={busy}
                autoComplete="off"
              />

              <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                TX Ref is generated automatically after creation.
              </div>
            </div>
          )}

          {/* Bank fields */}
          {method === "bank" && (
            <div style={{ marginTop: 12 }}>
              <div className="small">Bank Country</div>
              <select
                className="input"
                value={bankCountry}
                onChange={(e) => setBankCountry(e.target.value)}
                disabled={busy}
              >
                {BANK_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>

              <div className="small" style={{ marginTop: 10 }}>
                Bank Name
              </div>
              <input
                className="input"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. ABA Bank"
                disabled={busy}
              />

              <div className="small" style={{ marginTop: 10 }}>
                Account Holder Name
              </div>
              <input
                className="input"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={busy}
              />

              <div className="small" style={{ marginTop: 10 }}>
                Account Number
              </div>
              <input
                className="input"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 0123456789"
                disabled={busy}
                inputMode="numeric"
                autoComplete="off"
              />

              <div className="small" style={{ marginTop: 10 }}>
                Routing Number (optional)
              </div>
              <input
                className="input"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="optional"
                disabled={busy}
                inputMode="numeric"
              />

              <div className="small" style={{ marginTop: 10 }}>
                Branch Name (optional)
              </div>
              <input
                className="input"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="optional"
                disabled={busy}
              />

              <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                TX Ref is generated automatically after creation.
              </div>
            </div>
          )}

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
