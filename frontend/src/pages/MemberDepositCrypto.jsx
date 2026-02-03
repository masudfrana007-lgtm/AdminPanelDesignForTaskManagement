import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import "../styles/memberDepositCrypto.css";
import MemberBottomNav from "../components/MemberBottomNav";

const ASSETS = [
  {
    symbol: "USDT",
    name: "Tether",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
    networks: [
      { key: "TRC20", label: "TRC20", badge: "Recommended", feeHint: "Low fee", eta: "1–5 min", conf: 12, min: 10 },
      { key: "BEP20", label: "BEP20", badge: "Fast", feeHint: "Low fee", eta: "1–3 min", conf: 15, min: 10 },
      { key: "ERC20", label: "ERC20", badge: "High fee", feeHint: "High fee", eta: "5–30 min", conf: 24, min: 20 },
    ],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    networks: [
      {
        key: "BTC",
        label: "Bitcoin",
        badge: "Mainnet",
        feeHint: "Network fee varies",
        eta: "10–60 min",
        conf: 2,
        min: 0.0002,
      },
    ],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    networks: [{ key: "ERC20", label: "Ethereum", badge: "Mainnet", feeHint: "Fee varies", eta: "2–15 min", conf: 12, min: 0.01 }],
  },
  {
    symbol: "BNB",
    name: "BNB",
    icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    networks: [{ key: "BEP20", label: "BSC (BEP20)", badge: "Fast", feeHint: "Low fee", eta: "1–3 min", conf: 15, min: 0.02 }],
  },
];

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}
function shortAddr(addr) {
  if (!addr) return "";
  if (addr.length <= 16) return addr;
  return addr.slice(0, 10) + "..." + addr.slice(-6);
}
function getDemoAddress(symbol, networkKey) {
  const base = `${symbol}-${networkKey}-ADDR-`;
  const rnd = Math.random().toString(16).slice(2).padEnd(34, "a").slice(0, 34);
  return base + rnd;
}
function badgeTone(badge) {
  const b = (badge || "").toLowerCase();
  if (b.includes("recommend")) return "is-green";
  if (b.includes("fast")) return "is-blue";
  if (b.includes("high")) return "is-red";
  return "is-gray";
}

function InfoItem({ label, value }) {
  return (
    <div className="dc-infoItem">
      <div className="dc-mutedSmall">{label}</div>
      <div className="dc-infoValue">{value}</div>
    </div>
  );
}

export default function MemberDepositCrypto() {
  const nav = useNavigate();

  const [asset, setAsset] = useState("USDT");
  const assetObj = useMemo(() => ASSETS.find((a) => a.symbol === asset), [asset]);

  // IMPORTANT: keep network valid when asset changes (init from current assetObj)
  const [network, setNetwork] = useState(() => ASSETS.find((a) => a.symbol === "USDT")?.networks?.[0]?.key || "TRC20");

  const networkObj = useMemo(() => {
    const found = assetObj.networks.find((n) => n.key === network);
    return found || assetObj.networks[0];
  }, [assetObj, network]);

  const [address, setAddress] = useState(() => getDemoAddress(asset, network));
  const [memoTag, setMemoTag] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const memoRequired = false;

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 2200);
  };

  const [submitting, setSubmitting] = useState(false);

  // demo numbers (replace with real API later)
  const walletUsd = 1280.45;
  const walletUsdt = 1245.32;

  const onChangeAsset = (sym) => {
    setAsset(sym);
    const a = ASSETS.find((x) => x.symbol === sym);
    const defaultNet = a.networks[0].key;
    setNetwork(defaultNet);
    setAddress(getDemoAddress(sym, defaultNet));
    setMemoTag("");
  };

  const onChangeNetwork = (netKey) => {
    setNetwork(netKey);
    setAddress(getDemoAddress(asset, netKey));
    setMemoTag("");
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied!");
    } catch {
      showToast("Copy failed. Please copy manually.");
    }
  };

  const refreshAddress = () => {
    setAddress(getDemoAddress(asset, network));
    showToast("New address generated");
  };

  const handleCompleteTransfer = () => {
    // front validation before showing confirmation popup
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) {
      showToast("Enter a valid amount");
      return;
    }
    if (n < Number(networkObj.min)) {
      showToast(`Minimum deposit is ${networkObj.min} ${asset}`);
      return;
    }
    setShowConfirmation(true);
  };

  // ✅ REAL: create deposit request in DB
  const markPaid = async () => {
    if (submitting) return;

    try {
      const n = Number(amount);

      if (!amount || Number.isNaN(n) || n <= 0) {
        showToast("Enter a valid amount");
        return;
      }
      if (n < Number(networkObj.min)) {
        showToast(`Minimum deposit is ${networkObj.min} ${asset}`);
        return;
      }
      if (!asset) {
        showToast("Asset is required");
        return;
      }
      if (!network) {
        showToast("Network is required");
        return;
      }

      setSubmitting(true);

      // backend: POST /member/deposits (memberApp.js)
      await memberApi.post("/member/deposits", {
        amount: n,
        method: "crypto",
        asset,
        network,
        tx_ref: null, // optional
        proof_url: null, // optional
      });

      setShowConfirmation(false);
      showToast("Deposit submitted. Awaiting approval.");

      // Optional: go to record page
      // change this route to your real route
      nav("/member/deposit/records");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to submit deposit";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dc-page">
      <div className="dc-overlay" />

      {/* Header */}
      <header className="dc-header">
        <button className="dc-back" onClick={() => nav(-1)}>
          ←
        </button>

        <div className="dc-title">
          <h1>Deposit Crypto</h1>
          <p>Choose asset & network carefully to avoid loss.</p>
        </div>

        <div className="dc-headerActions">
          <button className="dc-ghostBtn" onClick={() => nav("/member/service")}>
            Help
          </button>
        </div>
      </header>

      <main className="dc-wrap">
        {/* Top summary */}
        <section className="dc-gridTop">
          <div className="dc-card dc-balance dc-balance--highlight dc-wallet-card">
            <div className="dc-balanceTop">
              <div className="dc-balanceTitleRow">
                <div className="dc-dot dc-dot--cyan" />
                <div className="dc-balanceTitle">Wallet Balance</div>
              </div>

              <div className="dc-balanceAmounts">
                <div className="dc-balanceMain">
                  <span className="dc-balanceUsd">${money(walletUsd)}</span>
                  <span className="dc-balanceUnit">USD</span>
                </div>
                <div className="dc-balanceSub">≈ {money(walletUsdt)} USDT</div>
              </div>
            </div>

            <div className="dc-balanceActions">
              <button className="dc-miniBtn" onClick={() => nav("/member/deposit/records")} type="button">
                View History
              </button>
              <button className="dc-miniBtn" onClick={() => showToast("Refreshing balance...")} type="button">
                Refresh
              </button>
            </div>
          </div>

          <div className="dc-card dc-status">
            <div className="dc-statusTitle">Deposit Status</div>
            <div className="dc-statusRow">
              <div className="dc-chip">Pending: —</div>
              <div className="dc-chip">Completed: —</div>
            </div>
            <div className="dc-mutedSmall">Deposits are credited after required confirmations and owner approval.</div>
          </div>
        </section>

        {/* Steps */}
        <section className="dc-gridMain">
          {/* Left */}
          <div className="dc-left">
            {/* Step 1 */}
            <div className="dc-card">
              <div className="dc-stepHead">
                <div className="dc-stepNum">1</div>
                <div>
                  <div className="dc-stepTitle">Select Asset</div>
                  <div className="dc-mutedSmall">Choose the coin you want to deposit.</div>
                </div>
              </div>

              <div className="dc-assetRow">
                {ASSETS.map((a) => (
                  <button
                    key={a.symbol}
                    className={"dc-assetBtn " + (asset === a.symbol ? "is-selected" : "")}
                    onClick={() => onChangeAsset(a.symbol)}
                    type="button"
                  >
                    <img src={a.icon} alt={a.symbol} className="dc-coinLogo" />
                    <div className="dc-assetMeta">
                      <div className="dc-assetSym">{a.symbol}</div>
                      <div className="dc-mutedSmall">{a.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="dc-card">
              <div className="dc-stepHead">
                <div className="dc-stepNum">2</div>
                <div>
                  <div className="dc-stepTitle">Select Network</div>
                  <div className="dc-mutedSmall">Network must match sender wallet.</div>
                </div>
              </div>

              <div className="dc-netRow">
                {assetObj.networks.map((n) => (
                  <button
                    key={n.key}
                    className={"dc-netBtn " + (networkObj.key === n.key ? "is-selected" : "")}
                    onClick={() => onChangeNetwork(n.key)}
                    type="button"
                  >
                    <div className="dc-netTop">
                      <span className="dc-netName">{n.label}</span>
                      <span className={"dc-badge " + badgeTone(n.badge)}>{n.badge}</span>
                    </div>
                    <div className="dc-mutedSmall">{n.feeHint}</div>
                  </button>
                ))}
              </div>

              <div className="dc-field" style={{ margin: "16px" }}>
                <div className="dc-label" style={{ fontSize: "18px" }}>
                  Amount
                </div>
                <div className="dc-inputGroup">
                  <input
                    className="dc-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount (min: ${networkObj.min})`}
                    min={networkObj.min}
                    step="any"
                  />
                  <div className="dc-inputSuffix" style={{ margin: "16px" }}>
                    {asset}
                  </div>
                </div>
                <div className="dc-mutedSmall">
                  Minimum deposit: {networkObj.min} {asset}
                </div>
              </div>

              <div className="dc-warning" style={{ margin: "16px" }}>
                <span className="dc-warningIcon">⚠</span>
                Sending to the wrong network may result in permanent loss.
              </div>
            </div>

            {/* Step 3 */}
            <div className="dc-card">
              <div className="dc-stepHead">
                <div className="dc-stepNum">3</div>
                <div>
                  <div className="dc-stepTitle">Deposit Address</div>
                  <div className="dc-mutedSmall">Scan QR or copy address.</div>
                </div>
              </div>

              <div className="dc-addressGrid">
                <div className="dc-qr">
                  <div className="dc-qrBox">
                    <div className="dc-qrFake">
                      <div className="dc-qrSquares" />
                      <div className="dc-qrText">QR</div>
                    </div>
                  </div>
                  <button className="dc-miniBtn" onClick={refreshAddress} type="button">
                    Refresh Address
                  </button>
                </div>

                <div className="dc-addressRight">
                  <div className="dc-field">
                    <div className="dc-label">Address</div>
                    <div className="dc-inputLike">
                      <span className="dc-mono">{address}</span>
                    </div>
                    <div className="dc-fieldActions">
                      <button className="dc-miniBtn" onClick={() => copy(address)} type="button">
                        Copy
                      </button>
                      <button className="dc-ghostBtn" onClick={() => showToast("Sharing...")} type="button">
                        Share
                      </button>
                    </div>
                    <div className="dc-mutedSmall">
                      Short: <span className="dc-mono">{shortAddr(address)}</span>
                    </div>
                  </div>

                  <div className="dc-field">
                    <div className="dc-label">
                      Memo / Tag{" "}
                      {memoRequired ? <span className="dc-required">Required</span> : <span className="dc-mutedSmall">(if needed)</span>}
                    </div>
                    <input
                      className="dc-input"
                      value={memoTag}
                      onChange={(e) => setMemoTag(e.target.value)}
                      placeholder="Enter memo/tag if your wallet requires it"
                    />
                    <div className="dc-mutedSmall">Some exchanges require memo/tag for certain assets.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="dc-card">
              <div className="dc-stepHead">
                <div className="dc-stepNum">4</div>
                <div>
                  <div className="dc-stepTitle">Deposit Details</div>
                  <div className="dc-mutedSmall">Review before sending.</div>
                </div>
              </div>

              <div className="dc-infoGrid">
                <InfoItem label="Minimum Deposit" value={`${networkObj.min} ${asset}`} />
                <InfoItem label="Confirmations Required" value={`${networkObj.conf}`} />
                <InfoItem label="Estimated Arrival" value={networkObj.eta} />
                <InfoItem label="Network Fee" value="Paid by sender" />
              </div>

              <div className="dc-actions">
                <button className="dc-primaryBtn" onClick={handleCompleteTransfer} type="button" disabled={submitting}>
                  I have completed the transfer
                </button>
                <button className="dc-secondaryBtn" onClick={() => nav("/member/service")} type="button" disabled={submitting}>
                  Contact Support
                </button>
              </div>

              <div className="dc-helpRow">
                <button className="dc-linkBtn" onClick={() => showToast("How to deposit...")} type="button">
                  How to deposit?
                </button>
                <button className="dc-linkBtn" onClick={() => showToast("Deposit not received...")} type="button">
                  Deposit not received?
                </button>
                <button className="dc-linkBtn" onClick={() => showToast("Network fee info...")} type="button">
                  Network & fees
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <aside className="dc-right">
            <div className="dc-card dc-side">
              <div className="dc-sideTitle">Quick Summary</div>
              <div className="dc-sideLine">
                <span className="dc-muted">Asset</span>
                <span className="dc-strong">{assetObj.symbol}</span>
              </div>
              <div className="dc-sideLine">
                <span className="dc-muted">Network</span>
                <span className="dc-strong">{networkObj.label}</span>
              </div>
              <div className="dc-sideLine">
                <span className="dc-muted">Min</span>
                <span className="dc-strong">
                  {networkObj.min} {asset}
                </span>
              </div>
              <div className="dc-sideLine">
                <span className="dc-muted">Confirmations</span>
                <span className="dc-strong">{networkObj.conf}</span>
              </div>

              <div className="dc-divider" />

              <div className="dc-sideTitle">Safety Tips</div>
              <ul className="dc-list">
                <li>Always double-check the network.</li>
                <li>Send a small test amount first (optional).</li>
                <li>Do not send below minimum deposit.</li>
              </ul>

              <div className="dc-divider" />

              <button className="dc-secondaryBtn w100" onClick={() => copy(address)} type="button">
                Copy Address
              </button>
              <button className="dc-ghostBtn w100" onClick={() => nav("/member/deposit/records")} type="button">
                Deposit History
              </button>
            </div>
          </aside>
        </section>
      </main>

      {toast ? <div className="dc-toast">{toast}</div> : null}

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div
          className="dc-popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            className="dc-popup"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "440px",
              width: "90%",
              boxShadow: "0 25px 50px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              transform: "scale(1)",
              animation: "popupScale 0.3s ease",
            }}
          >
            <div className="dc-popup-header" style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "white",
                  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                }}
              >
                ✓
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "22px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                }}
              >
                Confirm Transfer Completion
              </h3>
            </div>

            <div className="dc-popup-content" style={{ marginBottom: "32px" }}>
              <p style={{ margin: "0 0 20px 0", color: "#475569", fontSize: "16px", textAlign: "center", lineHeight: "1.6" }}>
                Are you sure you have completed the transfer?
              </p>

              <div style={{ background: "#f1f5f9", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "14px", fontWeight: "600" }}>Please confirm you have:</p>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#64748b", fontSize: "14px", lineHeight: "1.8" }}>
                  <li style={{ marginBottom: "8px" }}>✅ Sent the correct amount to the provided address</li>
                  <li style={{ marginBottom: "8px" }}>✅ Used the correct network ({networkObj.label})</li>
                  <li>✅ Included memo/tag if required</li>
                </ul>
              </div>
            </div>

            <div className="dc-popup-actions" style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowConfirmation(false)}
                type="button"
                disabled={submitting}
                style={{
                  padding: "12px 24px",
                  border: "2px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  minWidth: "100px",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                Cancel
              </button>

              <button
                onClick={markPaid}
                type="button"
                disabled={submitting}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s ease",
                  minWidth: "140px",
                  opacity: submitting ? 0.75 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Yes, I've completed it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ KEEP OLD BOTTOM BAR EXACTLY */}
      <div className="memberBottomNavFixed">
        <MemberBottomNav active="mine" />
      </div>
    </div>
  );
}
