import { useMemo, useState } from "react";
import "../styles/memberDepositCrypto.css";
import MemberBottomNav from "../components/MemberBottomNav"; // ✅ if you use it

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
    networks: [{ key: "BTC", label: "Bitcoin", badge: "Mainnet", feeHint: "Network fee varies", eta: "10–60 min", conf: 2, min: 0.0002 }],
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

export default function DepositCrypto() {
  const [asset, setAsset] = useState("USDT");
  const assetObj = useMemo(() => ASSETS.find((a) => a.symbol === asset), [asset]);

  const [network, setNetwork] = useState(assetObj.networks[0].key);
  const networkObj = useMemo(
    () => assetObj.networks.find((n) => n.key === network) || assetObj.networks[0],
    [assetObj, network]
  );

  const [address, setAddress] = useState(() => getDemoAddress(asset, network));
  const [memoTag, setMemoTag] = useState("");
  const memoRequired = false;

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 2200);
  };

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

  const markPaid = () => {
    showToast("Submitted. We are checking your deposit...");
  };

  return (
    <div
      className="dc-page"
      style={{
        backgroundImage: `url(/bg/deposit.png)`,
      }}
    >
      <div className="dc-overlay" />

      <header className="dc-header">
        <button className="dc-back" onClick={() => window.history.back()}>
          ←
        </button>
        <div className="dc-title">
          <h1>Deposit Crypto</h1>
          <p>Choose asset & network carefully to avoid loss.</p>
        </div>
        <div className="dc-headerActions">
          <button className="dc-ghostBtn" onClick={() => showToast("Opening help...")}>
            Help
          </button>
        </div>
      </header>

      <main className="dc-wrap">
        <section className="dc-gridTop">
          <div className="dc-card dc-balance dc-balance--highlight">
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
              <button className="dc-miniBtn" onClick={() => showToast("Opening deposit history...")}>
                View History
              </button>
              <button className="dc-miniBtn" onClick={() => showToast("Refreshing balance...")}>
                Refresh
              </button>
            </div>
          </div>

          <div className="dc-card dc-status">
            <div className="dc-statusTitle">Deposit Status</div>
            <div className="dc-statusRow">
              <div className="dc-chip">Pending: 0</div>
              <div className="dc-chip">Completed: 12</div>
            </div>
            <div className="dc-mutedSmall">Deposits are credited after required confirmations.</div>
          </div>
        </section>

        <section className="dc-gridMain">
          <div className="dc-left">
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
                    className={"dc-netBtn " + (network === n.key ? "is-selected" : "")}
                    onClick={() => onChangeNetwork(n.key)}
                  >
                    <div className="dc-netTop">
                      <span className="dc-netName">{n.label}</span>
                      <span className={"dc-badge " + badgeTone(n.badge)}>{n.badge}</span>
                    </div>
                    <div className="dc-mutedSmall">{n.feeHint}</div>
                  </button>
                ))}
              </div>

              <div className="dc-warning">
                <span className="dc-warningIcon">⚠</span>
                Sending to the wrong network may result in permanent loss.
              </div>
            </div>

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
                  <button className="dc-miniBtn" onClick={refreshAddress}>
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
                      <button className="dc-miniBtn" onClick={() => copy(address)}>
                        Copy
                      </button>
                      <button className="dc-ghostBtn" onClick={() => showToast("Sharing...")}>
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
                      {memoRequired ? (
                        <span className="dc-required">Required</span>
                      ) : (
                        <span className="dc-mutedSmall">(if needed)</span>
                      )}
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
                <button className="dc-primaryBtn" onClick={markPaid}>
                  I have completed the transfer
                </button>
                <button className="dc-secondaryBtn" onClick={() => showToast("Opening support...")}>
                  Contact Support
                </button>
              </div>

              <div className="dc-helpRow">
                <button className="dc-linkBtn" onClick={() => showToast("How to deposit...")}>
                  How to deposit?
                </button>
                <button className="dc-linkBtn" onClick={() => showToast("Deposit not received...")}>
                  Deposit not received?
                </button>
                <button className="dc-linkBtn" onClick={() => showToast("Network fee info...")}>
                  Network & fees
                </button>
              </div>
            </div>
          </div>

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

              <button className="dc-secondaryBtn w100" onClick={() => copy(address)}>
                Copy Address
              </button>
              <button className="dc-ghostBtn w100" onClick={() => showToast("Opening history...")}>
                Deposit History
              </button>
            </div>
          </aside>
        </section>
      </main>

      {toast ? <div className="dc-toast">{toast}</div> : null}

      {/* ✅ OLD bottom bar EXACT look: isolate it from dc styles */}
      <div className="dc-bottomNavSafe">
        <MemberBottomNav active="mine" />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="dc-infoItem">
      <div className="dc-mutedSmall">{label}</div>
      <div className="dc-infoValue">{value}</div>
    </div>
  );
}

function badgeTone(badge) {
  const b = (badge || "").toLowerCase();
  if (b.includes("recommend")) return "is-green";
  if (b.includes("fast")) return "is-blue";
  if (b.includes("high")) return "is-red";
  return "is-gray";
}
