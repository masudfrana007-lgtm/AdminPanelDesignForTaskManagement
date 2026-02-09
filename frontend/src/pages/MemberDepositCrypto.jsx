// src/pages/MemberDepositCrypto.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberDepositCrypto.css";

// ✅ backend + bottom bar
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";

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

  // optional: show counts on page (like your other new UI)
  const [pendingCount, setPendingCount] = useState(0);
  const [creditedCount, setCreditedCount] = useState(0);

  // ✅ deposits from backend (crypto only)
  const [deposits, setDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);

  // UI inputs
  const minDeposit = 5; // keep your UI constant
  const confirmationsRequired = 12; // keep your UI constant

  const [coin, setCoin] = useState(coins[0]);
  const [network, setNetwork] = useState(coins[0].networks[0]);

  // deposit address book (LOCAL UI book)
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Main Deposit Address",
      network: "TRC20",
      address: "TQwZ9GxkWw3e9bqGQqZk9k9k9k9k9k9k9k",
      isDefault: true,
    },
  ]);
  const [activeAddr, setActiveAddr] = useState(addresses[0]);

  // optional amount
  const [amount, setAmount] = useState("");
  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  // UI states
  const [copied, setCopied] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "",
    network: coins[0].networks[0],
    address: "",
    isDefault: false,
  });

  const [showQR, setShowQR] = useState(false);

  const canSaveAddr = newAddr.label.trim() && newAddr.address.trim();

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

  const refreshTop = async () => {
    await Promise.all([loadMe(), loadDeposits()]);
  };

  useEffect(() => {
    refreshTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSelectCoin(c) {
    setCoin(c);
    setNetwork(c.networks[0]);
    // reset active address to first matching network if possible
    const match = addresses.find((a) => a.network === c.networks[0]) || addresses[0];
    setActiveAddr(match || null);
    setCopied(false);
  }

  function onNetworkChange(n) {
    setNetwork(n);
    const match = addresses.find((a) => a.network === n) || null;
    setActiveAddr(match);
    setCopied(false);
  }

  async function copyAddress() {
    if (!activeAddr?.address) return;
    try {
      await navigator.clipboard.writeText(activeAddr.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = activeAddr.address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  function saveAddress() {
    const item = { ...newAddr, id: Date.now() };
    setAddresses((prev) => {
      let next = [...prev, item];
      if (item.isDefault) {
        next = next.map((x) => ({ ...x, isDefault: x.id === item.id }));
      }
      return next;
    });

    // set as active if network matches current network
    if (item.network === network) setActiveAddr(item);

    setShowAdd(false);
    setNewAddr({ label: "", network: coin.networks[0], address: "", isDefault: false });
  }

  const depositHint = useMemo(() => {
    if (coin.code === "USDT") return "Send only USDT to this address.";
    return `Send only ${coin.code} to this address.`;
  }, [coin.code]);

  const amountOk = amountNum === 0 || amountNum >= minDeposit;

  // ✅ REAL: create deposit request in DB (same backend you use elsewhere)
  const submitDeposit = async () => {
    // amount optional in UI, but backend needs a number
    const n = Number(amount || 0);
    if (!n || Number.isNaN(n) || n <= 0) return alert("Please enter amount.");
    if (n < minDeposit) return alert(`Minimum suggested deposit is ${minDeposit}.`);
    if (!coin?.code) return alert("Select coin.");
    if (!network) return alert("Select network.");

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
      // keep your old history route
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
        <button className="dcHistoryBtn" onClick={() => nav("/deposit/records")}>
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

          {/* ✅ extra backend data (counts) - safe to keep, remove if you don't want */}
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

        {/* Deposit Address book */}
        <section className="dcWallet">
          <div className="dcWalletHead">
            <div className="dcWalletTitle">Deposit Address</div>
            <button
              className="dcAddWallet"
              onClick={() => {
                setNewAddr({ label: "", network: coin.networks[0], address: "", isDefault: false });
                setShowAdd(true);
              }}
              type="button"
            >
              + Add New
            </button>
          </div>

          <div className="dcWalletList">
            {addresses.map((a) => (
              <button
                key={a.id}
                className={`dcSavedWallet ${activeAddr?.id === a.id ? "active" : ""}`}
                onClick={() => {
                  setActiveAddr(a);
                  setNetwork(a.network);
                  setCopied(false);
                }}
                type="button"
              >
                <div className="dcWalletLeft">
                  <div className="dcWalletLabel">
                    {a.label} {a.isDefault ? <span className="dcTag">Default</span> : null}
                  </div>
                  <div className="dcWalletAddr">{maskAddr(a.address)}</div>
                </div>
                <div className="dcWalletNet">{a.network}</div>
              </button>
            ))}
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
                {activeAddr?.address ? activeAddr.address : "No address found for this network."}
              </div>

              <div className="dcAddressActions">
                <button className="dcMiniBtn" type="button" onClick={() => setShowQR(true)} disabled={!activeAddr?.address}>
                  QR
                </button>
                <button className="dcMiniBtn" type="button" onClick={copyAddress} disabled={!activeAddr?.address}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="dcHint">
              {depositHint} Transactions are credited after {confirmationsRequired} confirmations.
            </div>
          </div>

          <button className="dcSubmit" onClick={submitDeposit} disabled={!activeAddr?.address}>
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

        {/* ✅ Optional: show backend crypto deposit list on this page */}
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

      {/* Add Address Modal */}
      {showAdd && (
        <div className="dcModalOverlay" onClick={() => setShowAdd(false)}>
          <div className="dcModal" onClick={(e) => e.stopPropagation()}>
            <div className="dcModalHead">
              <div className="dcModalTitle">Add New Deposit Address</div>
              <button className="dcModalClose" onClick={() => setShowAdd(false)} type="button">
                ✕
              </button>
            </div>

            <div className="dcModalBody">
              <label className="dcModalLabel">Label</label>
              <input
                className="dcModalInput"
                placeholder="e.g. My TRC20 deposit address"
                value={newAddr.label}
                onChange={(e) => setNewAddr((p) => ({ ...p, label: e.target.value }))}
              />

              <label className="dcModalLabel">Network</label>
              <select
                className="dcModalInput"
                value={newAddr.network}
                onChange={(e) => setNewAddr((p) => ({ ...p, network: e.target.value }))}
              >
                {coin.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label className="dcModalLabel">Address</label>
              <input
                className="dcModalInput"
                placeholder="Paste deposit address"
                value={newAddr.address}
                onChange={(e) => setNewAddr((p) => ({ ...p, address: e.target.value }))}
              />

              <label className="dcCheckRow">
                <input
                  type="checkbox"
                  checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr((p) => ({ ...p, isDefault: e.target.checked }))}
                />
                <span>Set as default</span>
              </label>

              <button className="dcModalSave" disabled={!canSaveAddr} onClick={saveAddress} type="button">
                Save Address
              </button>

              <div className="dcModalTip">Make sure the address matches the selected network.</div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal (simple) */}
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
                <div className="dcQrPlaceholder">QR</div>
                <div className="dcQrText">{maskAddr(activeAddr?.address || "")}</div>
              </div>

              <button className="dcModalSave" onClick={copyAddress} disabled={!activeAddr?.address} type="button">
                {copied ? "Copied" : "Copy Address"}
              </button>

              <div className="dcModalTip">For best security, verify the first & last characters before sending.</div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Bottom nav (same pattern you use everywhere) */}
      <div className="memberBottomNavFixed">
        <MemberBottomNav active="mine" />
      </div>
    </div>
  );
}
