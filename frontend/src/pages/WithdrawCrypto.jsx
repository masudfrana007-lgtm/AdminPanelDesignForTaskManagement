// frontend/src/pages/WithdrawCrypto.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WithdrawCrypto.css"; // ✅ place css in styles folder
import withdrawBg from "../assets/bg/withdraw.png"; // ✅ correct for /src/pages

import MemberBottomNav from "../components/MemberBottomNav"; // ✅ bottom bar

const user = {
  name: "User",
  vip: 3,
  inviteCode: "ABCD-1234",
  balance: 97280.12,
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

const NETWORKS = [
  { key: "TRC20", label: "TRC20 (USDT)", fee: 1.0, min: 10 },
  { key: "ERC20", label: "ERC20 (USDT)", fee: 8.0, min: 20 },
  { key: "BEP20", label: "BEP20 (USDT)", fee: 0.8, min: 10 },
];

export default function WithdrawCrypto() {
  const nav = useNavigate();

  const [boundWallet, setBoundWallet] = useState({
    label: "My E-Wallet",
    address: "TQ8v...A1c9 (Bound)",
  });

  const [network, setNetwork] = useState("TRC20");
  const [useBound, setUseBound] = useState(true);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const net = useMemo(() => NETWORKS.find((n) => n.key === network), [network]);

  const amountNum = Number(amount || 0);
  const fee = net?.fee ?? 0;
  const received = Math.max(0, amountNum - fee);

  const canSubmit = useMemo(() => {
    if (!net) return false;
    if (!amountNum || amountNum <= 0) return false;
    if (amountNum < net.min) return false;
    if (amountNum > user.balance) return false;

    if (useBound) return Boolean(boundWallet?.address);
    return address.trim().length >= 8;
  }, [net, amountNum, useBound, address, boundWallet]);

  const finalAddress = useBound ? boundWallet?.address : address;

  function onBindWallet() {
    const newAddr = prompt("Enter your E-Wallet address to bind (example):");
    if (!newAddr) return;
    setBoundWallet({ label: "Bound E-Wallet", address: newAddr.trim() });
    setUseBound(true);
  }

  function onSubmit() {
    if (!canSubmit) return;
    alert(
      `Withdrawal submitted!\n\nNetwork: ${network}\nAddress: ${finalAddress}\nAmount: ${amountNum}\nFee: ${fee}\nYou will receive: ${received}`
    );
  }

  return (
    <div className="page wc" style={{ backgroundImage: `url(${withdrawBg})` }}>
      <div className="wc-header">
        <button className="wc-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="wc-header-title">
          <div className="wc-title">Withdraw by Crypto</div>
          <div className="wc-sub">Secure USDT withdrawal to your E-Wallet</div>
        </div>

        {/* ✅ your real route */}
        <button className="wc-help" onClick={() => nav("/member/service")} type="button">
          Support
        </button>
      </div>

      <div className="wc-wrap">
        {/* Profile + Balance */}
        <div className="wc-profileCard">
          <div className="wc-profLeft">
            <div className="wc-avatar" aria-hidden="true" />
            <div className="wc-profMeta">
              <div className="wc-profRow">
                <span className="wc-profName">{user.name}</span>
                <span className="wc-vip">VIP {user.vip}</span>
              </div>

              <div className="wc-codeRow">
                <span className="wc-codeLabel">Reference code:</span>
                <span className="wc-codePill">{user.inviteCode}</span>
              </div>
            </div>
          </div>

          <div className="wc-balanceBox">
            <div className="wc-balLabel">Available Balance</div>
            <div className="wc-balValue">
              <span className="wc-balUnit">USDT</span>
              <span className="wc-balNum">{money(user.balance)}</span>
            </div>
            <div className="wc-balHint">Crypto withdrawals require correct network & address</div>
          </div>
        </div>

        <div className="wc-grid">
          {/* Bind E-Wallet */}
          <div className="wc-card glass">
            <div className="wc-cardHead">
              <div className="wc-cardTitle">Bind E-Wallet</div>
              <span className="wc-badge">Required</span>
            </div>

            <div className="wc-bindBox">
              <div className="wc-bindLeft">
                <div className="wc-bindLabel">Bound wallet</div>
                <div className="wc-bindValue">
                  {boundWallet?.address ? (
                    <>
                      <span className="wc-bindName">{boundWallet.label}</span>
                      <span className="wc-bindAddr">{boundWallet.address}</span>
                    </>
                  ) : (
                    <span className="wc-bindEmpty">No wallet bound yet</span>
                  )}
                </div>
              </div>

              <button className="wc-btn" type="button" onClick={onBindWallet}>
                {boundWallet?.address ? "Update Wallet" : "Bind Wallet"}
              </button>
            </div>

            <div className="wc-note">
              Tip: Bind your own wallet only. Third-party wallets may be rejected for security reasons.
            </div>
          </div>

          {/* Withdraw Form */}
          <div className="wc-card glass">
            <div className="wc-cardHead">
              <div className="wc-cardTitle">Withdraw Operation</div>
              <span className="wc-badge soft">USDT</span>
            </div>

            <div className="wc-toggleRow">
              <button
                type="button"
                className={`wc-pill ${useBound ? "active" : ""}`}
                onClick={() => setUseBound(true)}
                disabled={!boundWallet?.address}
                title={!boundWallet?.address ? "Bind wallet first" : ""}
              >
                Use Bound E-Wallet
              </button>

              <button
                type="button"
                className={`wc-pill ${!useBound ? "active" : ""}`}
                onClick={() => setUseBound(false)}
              >
                Enter Address Manually
              </button>
            </div>

            <div className="wc-field">
              <label className="wc-label">Network</label>
              <select
                className="wc-select"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                {NETWORKS.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.label}
                  </option>
                ))}
              </select>
              <div className="wc-hint">
                Minimum: <b>{net.min} USDT</b> • Fee: <b>{fee} USDT</b>
              </div>
            </div>

            <div className="wc-field">
              <label className="wc-label">Wallet Address</label>

              {useBound ? (
                <div className={`wc-readonly ${boundWallet?.address ? "" : "disabled"}`}>
                  {boundWallet?.address || "Bind E-Wallet first"}
                </div>
              ) : (
                <input
                  className="wc-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Paste your USDT wallet address"
                />
              )}

              <div className="wc-hint">
                Make sure address matches the selected network. Wrong network/address may cause permanent loss.
              </div>
            </div>

            <div className="wc-field">
              <label className="wc-label">Amount (USDT)</label>
              <div className="wc-amountRow">
                <input
                  className="wc-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder={`Minimum ${net.min} USDT`}
                />
                <button type="button" className="wc-miniBtn" onClick={() => setAmount(String(user.balance))}>
                  Max
                </button>
              </div>

              <div className="wc-summary">
                <div className="wc-sumRow">
                  <span>Fee</span>
                  <b>{money(fee)} USDT</b>
                </div>
                <div className="wc-sumRow">
                  <span>You will receive</span>
                  <b>{money(received)} USDT</b>
                </div>
                <div className="wc-sumRow dim">
                  <span>Available</span>
                  <span>{money(user.balance)} USDT</span>
                </div>
              </div>

              {amountNum > user.balance && <div className="wc-alert">Amount exceeds your available balance.</div>}
              {amountNum > 0 && amountNum < net.min && (
                <div className="wc-alert">Amount is below minimum for {network}.</div>
              )}
            </div>

            <button
              className={`wc-cta ${canSubmit ? "" : "disabled"}`}
              type="button"
              onClick={onSubmit}
            >
              Submit Withdrawal
            </button>

            <div className="wc-footNote">
              By submitting, you confirm the address and network are correct and accept the withdrawal rules.
            </div>
          </div>
        </div>

        <div className="wc-card glass wc-instructions">
          <div className="wc-cardHead">
            <div className="wc-cardTitle">Important Instructions</div>
            <span className="wc-badge">Security</span>
          </div>

          <ul className="wc-instList">
            <li>Withdrawals may require additional verification based on account security level.</li>
            <li>Processing time: usually 5–30 minutes (depends on network congestion).</li>
            <li>Do not withdraw to smart contract addresses unless you are sure they support USDT deposits.</li>
            <li>If your withdrawal is delayed, contact Customer Service with your TXID (if available).</li>
          </ul>
        </div>
      </div>

      {/* ✅ bottom bar */}
      <MemberBottomNav active="mine" />
    </div>
  );
}
