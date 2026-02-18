// src/pages/MemberDepositCrypto.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberDepositCrypto.css";

// ✅ backend + bottom bar
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";

const API_HOST = "http://159.198.40.145:5010";

function toAbsUrl(p) {
  const s = String(p || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return API_HOST + s;
  return API_HOST + "/" + s;
}

const coins = [
  { code: "USDT", name: "Tether", icon: "/coins/usdt.png", networks: ["TRC20", "ERC20", "BEP20"] },
  { code: "BTC", name: "Bitcoin", icon: "/coins/btc.png", networks: ["BTC"] },
  { code: "ETH", name: "Ethereum", icon: "/coins/eth.png", networks: ["ERC20"] },
  { code: "BNB", name: "BNB", icon: "/coins/bnb.png", networks: ["BEP20"] },
  { code: "TRX", name: "TRON", icon: "/coins/trx.png", networks: ["TRC20"] },
];

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(Number(n || 0));
}

function maskAddr(a = "") {
  if (!a) return "";
  if (a.length <= 16) return a;
  return `${a.slice(0, 10)}…${a.slice(-6)}`;
}

function fmtDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

// db -> ui
function uiStatus(dbStatus) {
  const s = String(dbStatus || "").toLowerCase();
  if (s === "approved") return "Credited";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

export default function MemberDepositCrypto() {
  const nav = useNavigate();

  // ✅ REAL balance (from /member/me)
  const [balance, setBalance] = useState(0);

  // optional: show counts on page
  const [pendingCount, setPendingCount] = useState(0);
  const [creditedCount, setCreditedCount] = useState(0);

  // ✅ deposits from backend (crypto only)
  const [deposits, setDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  // UI inputs
  const minDeposit = 5;
  const confirmationsRequired = 12;

  const [coin, setCoin] = useState(coins[0]);
  const [network, setNetwork] = useState(coins[0].networks[0]);

  // ✅ VIP deposit slot from backend (rank-based)
  // { vip_rank, asset, network, wallet_address, photo_url }
  const [vipSlot, setVipSlot] = useState(null);
  const vipAddress = vipSlot?.wallet_address || "";
  const vipPhotoUrl = toAbsUrl(vipSlot?.photo_url);

  // optional amount
  const [amount, setAmount] = useState("");
  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  // UI states
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // ✅ load balance
  const loadMe = async () => {
    try {
      const { data } = await memberApi.get("/member/me");
      setBalance(Number(data?.balance || 0));
    } catch {
      setBalance(0);
    }
  };

  // ✅ load deposits (crypto only)
  const loadDeposits = async () => {
    setLoadingDeposits(true);
    try {
      const { data } = await memberApi.get("/member/deposits");
      const rows = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];

      const cryptoOnly = rows.filter((x) => String(x?.method || "").toLowerCase() === "crypto");
      setDeposits(cryptoOnly);

      const p = cryptoOnly.filter((x) => String(x?.status || "").toLowerCase() === "pending").length;
      const a = cryptoOnly.filter((x) => String(x?.status || "").toLowerCase() === "approved").length;
      setPendingCount(p);
      setCreditedCount(a);
    } catch {
      setDeposits([]);
      setPendingCount(0);
      setCreditedCount(0);
    } finally {
      setLoadingDeposits(false);
    }
  };

  // ✅ load VIP address + photo for current coin/network
  const loadVipAddress = async (assetCode, net) => {
    try {
      const { data } = await memberApi.get("/vip-deposit-addresses/me", {
        params: { asset: assetCode, network: net },
      });
      setVipSlot(data || null);
    } catch {
      setVipSlot(null);
    }
  };

  const refreshTop = async () => {
    await Promise.all([loadMe(), loadDeposits()]);
  };

  useEffect(() => {
    refreshTop();
    loadVipAddress(coins[0].code, coins[0].networks[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSelectCoin(c) {
    setCoin(c);
    const net = c.networks[0];
    setNetwork(net);
    setCopied(false);
    loadVipAddress(c.code, net);
  }

  function onNetworkChange(n) {
    setNetwork(n);
    setCopied(false);
    loadVipAddress(coin.code, n);
  }

  async function copyAddress() {
    if (!vipAddress) return;
    try {
      await navigator.clipboard.writeText(vipAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = vipAddress;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  const depositHint = useMemo(() => {
    if (coin.code === "USDT") return "Send only USDT to this address.";
    return `Send only ${coin.code} to this address.`;
  }, [coin.code]);

  const amountOk = amountNum === 0 || amountNum >= minDeposit;

  // ✅ REAL: create deposit request in DB
  const submitDeposit = async () => {
    const n = Number(amount || 0);
    if (!n || Number.isNaN(n) || n <= 0) return alert("Please enter amount.");
    if (n < minDeposit) return alert(`Minimum suggested deposit is ${minDeposit}.`);
    if (!coin?.code) return alert("Select coin.");
    if (!network) return alert("Select network.");
    if (!vipAddress) return alert("No VIP deposit address found for your package.");

    try {
      await memberApi.post("/member/deposits", {
        amount: n,
        method: "crypto",
        asset: coin.code,
        network,
        tx_ref: null,
        proof_url: null,
      });

      alert("Deposit submitted. Awaiting approval ✅");
      setAmount("");
      await refreshTop();
      nav("/member/deposit/records");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to submit deposit");
    }
  };

  return (
    <div className="dcPage">
      {/* Header */}
      <header className="dcTop">
        <button className="dcBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>
        <div className="dcTitle">Deposit Crypto</div>
        <button className="dcHistoryBtn" onClick={() => nav("/member/deposit/records")}>
          History
        </button>
      </header>

      <div className="dcContainer">
        {/* Balance */}
        <section className="dcBalance">
          <div className="dcBalanceLabel">Wallet Balance</div>
          <div className="dcBalanceValue">{money(balance)} USDT</div>

          <div className="dcBalanceMeta">
            Min {minDeposit} • {confirmationsRequired} confirmations • Secure deposit
          </div>

          <div className="dcBalanceMeta" style={{ marginTop: 8 }}>
            Pending: {pendingCount} • Credited: {creditedCount}{" "}
            <button type="button" onClick={refreshTop} style={{ marginLeft: 10 }}>
              Refresh
            </button>
          </div>
        </section>

        {/* Select Asset */}
        <section className="dcCoins">
          <div className="dcCoinsTitle">Select Asset</div>
          <div className="dcCoinRow">
            {coins.map((c) => (
              <button
                key={c.code}
                className={`dcCoin ${coin.code === c.code ? "active" : ""}`}
                onClick={() => onSelectCoin(c)}
                type="button"
              >
                <div className="dcCoinTop">
                  <img className="dcCoinIcon" src={c.icon} alt={c.code} />
                  <div className="dcCoinTexts">
                    <div className="dcCoinCode">{c.code}</div>
                    <div className="dcCoinName">{c.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="dcHelper">Tip: choose coin first, then select the correct network to avoid loss.</div>
        </section>

        {/* ✅ VIP Deposit Address (rank based) */}
        <section className="dcWallet">
          <div className="dcWalletHead">
            <div className="dcWalletTitle">
              Deposit Address{" "}
              <span className="dcTag" style={{ marginLeft: 8 }}>
                {vipSlot?.vip_rank ? `VIP ${vipSlot.vip_rank.slice(1)}` : "VIP"}
              </span>
            </div>

            <button
              className="dcAddWallet"
              type="button"
              onClick={() => loadVipAddress(coin.code, network)}
              style={{ opacity: 0.9 }}
            >
              Refresh
            </button>
          </div>

          <div className="dcHint" style={{ marginTop: 6 }}>
            This address is assigned automatically based on your VIP package (VIP 1/2/3).
          </div>
        </section>

        {/* Deposit instructions + form */}
        <section className="dcCard">
          <div className="dcGrid">
            <div className="dcField">
              <label>Network</label>
              <select value={network} onChange={(e) => onNetworkChange(e.target.value)}>
                {coin.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <div className="dcHint">Only send via the selected network.</div>
            </div>

            <div className="dcField">
              <label>Deposit Amount</label>
              <div className="dcAmountRow">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder={`Min ${minDeposit}`}
                />
                <button type="button" onClick={() => setAmount("")}>
                  Clear
                </button>
              </div>

              <div className="dcCalc">
                You will receive after confirmations:{" "}
                <span>{amountNum > 0 ? `${money(amountNum)} ${coin.code}` : `— ${coin.code}`}</span>
              </div>

              {!amountOk && <div className="dcError">Minimum suggested deposit is {minDeposit}.</div>}
            </div>
          </div>

          <div className="dcField">
            <label>Deposit Address</label>

            <div className="dcAddressBox">
              <div className="dcAddressText">
                {vipAddress ? vipAddress : "No address found for your VIP rank / asset / network."}
              </div>

              <div className="dcAddressActions">
                <button className="dcMiniBtn" type="button" onClick={() => setShowQR(true)} disabled={!vipAddress}>
                  QR
                </button>
                <button className="dcMiniBtn" type="button" onClick={copyAddress} disabled={!vipAddress}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="dcHint">
              {depositHint} Transactions are credited after {confirmationsRequired} confirmations.
            </div>
          </div>

          <button className="dcSubmit" onClick={submitDeposit} disabled={!vipAddress}>
            I have sent the payment
          </button>

          <div className="dcRules">
            <ul>
              <li>
                Send only <b>{coin.code}</b> on <b>{network}</b> network to this address.
              </li>
              <li>Wrong coin/network may cause permanent loss and cannot be recovered.</li>
              <li>Deposits are credited automatically after confirmations + approval.</li>
              <li>If you need help, contact support with TxID / hash.</li>
            </ul>
          </div>
        </section>

        {/* Optional: show backend crypto deposit list on this page */}
        <section className="dcCard" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>Recent Crypto Deposits</div>
            <button type="button" onClick={loadDeposits} disabled={loadingDeposits}>
              {loadingDeposits ? "Loading..." : "Reload"}
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            {loadingDeposits ? (
              <div className="dcHint">Loading…</div>
            ) : deposits.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {deposits.slice(0, 8).map((d) => (
                  <div
                    key={String(d?.id || d?.tx_ref || Math.random())}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,.35)",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>
                        {String(d?.asset || "").toUpperCase()} • {String(d?.network || "").toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700 }}>{uiStatus(d?.status)}</div>
                    </div>
                    <div className="dcHint">
                      Amount: {money(d?.amount)} • Date: {fmtDate(d?.created_at)}
                    </div>
                    <div className="dcHint">Ref: {d?.tx_ref || `DP-${d?.id}`}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dcHint">No crypto deposit records found.</div>
            )}
          </div>
        </section>
      </div>

      {/* ✅ QR Modal (shows ADMIN-UPLOADED photo_url) */}
      {showQR && (
        <div className="dcModalOverlay" onClick={() => setShowQR(false)}>
          <div className="dcModal" onClick={(e) => e.stopPropagation()}>
            <div className="dcModalHead">
              <div className="dcModalTitle">Scan QR</div>
              <button className="dcModalClose" onClick={() => setShowQR(false)} type="button">
                ✕
              </button>
            </div>

            <div className="dcModalBody">
              <div className="dcQrBox">
                {vipPhotoUrl ? (
                  <img
                    src={vipPhotoUrl}
                    alt="VIP QR"
                    style={{ width: "100%", maxWidth: 260, borderRadius: 16, display: "block", margin: "0 auto" }}
                  />
                ) : (
                  <div className="dcQrPlaceholder">No QR photo uploaded</div>
                )}

                <div className="dcQrText">{maskAddr(vipAddress || "")}</div>
              </div>

              <button className="dcModalSave" onClick={copyAddress} disabled={!vipAddress} type="button">
                {copied ? "Copied" : "Copy Address"}
              </button>

              <div className="dcModalTip">For best security, verify the first & last characters before sending.</div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Bottom nav */}
      <div className="memberBottomNavFixed">
        <MemberBottomNav active="mine" />
      </div>
    </div>
  );
}
