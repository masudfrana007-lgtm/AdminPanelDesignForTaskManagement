import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WithdrawCrypto.css";

const coins = [
  {
    code: "USDT",
    name: "Tether",
    icon: "/coins/usdt.png",
    networks: ["TRC20", "ERC20", "BEP20"],
  },
  { code: "BTC", name: "Bitcoin", icon: "/coins/btc.png", networks: ["BTC"] },
  { code: "ETH", name: "Ethereum", icon: "/coins/eth.png", networks: ["ERC20"] },
  { code: "BNB", name: "BNB", icon: "/coins/bnb.png", networks: ["BEP20"] },
  { code: "TRX", name: "TRON", icon: "/coins/trx.png", networks: ["TRC20"] },
];

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(n);
}

export default function WithdrawCrypto() {
  const nav = useNavigate();

  // demo values (replace with API later)
  const balance = 97280.12; // shown as USDT here for demo
  const fee = 1.0;
  const minWithdraw = 10;

  const [coin, setCoin] = useState(coins[0]);
  const [network, setNetwork] = useState(coins[0].networks[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [wallets, setWallets] = useState([
    {
      id: 1,
      label: "Main Wallet",
      address: "TQ9L7Pp9D9dY2fQ7QpA1dYpFfR9D9A",
      network: "TRC20",
    },
  ]);
  const [activeWallet, setActiveWallet] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newWallet, setNewWallet] = useState({
    label: "",
    network: "TRC20",
    address: "",
  });

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const receive = useMemo(() => Math.max(0, amountNum - fee), [amountNum, fee]);

  const canSubmit =
    address.trim() && amountNum >= minWithdraw && amountNum <= balance;

  function saveWallet() {
    setWallets((prev) => [...prev, { ...newWallet, id: Date.now() }]);
    setShowAdd(false);
    setNewWallet({ label: "", network: coin.networks[0], address: "" });
  }

  return (
    <div className="wcPage">
      {/* Header */}
      <header className="wcTop">
        <button className="wcBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>
        <div className="wcTitle">Withdraw Crypto</div>
        <button
          className="wcHistoryBtn"
          onClick={() => nav("/withdraw/records")}
        >
          History
        </button>
      </header>

      <div className="wcContainer">
        {/* Balance (AliExpressVip3 style) */}
        <section className="wcBalance">
          <div className="wcBalanceLabel">Wallet Balance</div>
          <div className="wcBalanceValue">{money(balance)} USDT</div>
          <div className="wcBalanceMeta">
            Min {minWithdraw} • Fee {fee} • Secure withdrawal
          </div>
        </section>

        {/* Select Asset (with logos) */}
        <section className="wcCoins">
          <div className="wcCoinsTitle">Select Asset</div>
          <div className="wcCoinRow">
            {coins.map((c) => (
              <button
                key={c.code}
                className={`wcCoin ${coin.code === c.code ? "active" : ""}`}
                onClick={() => {
                  setCoin(c);
                  setNetwork(c.networks[0]);
                  setActiveWallet(null);
                  setAddress("");
                  // keep amount as is (or clear if you want)
                }}
                type="button"
              >
                <div className="wcCoinTop">
                  <img className="wcCoinIcon" src={c.icon} alt={c.code} />
                  <div className="wcCoinTexts">
                    <div className="wcCoinCode">{c.code}</div>
                    <div className="wcCoinName">{c.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="wcHelper">
            Tip: choose coin first, then select the correct network.
          </div>
        </section>

        {/* Bind Wallet */}
        <section className="wcWallet">
          <div className="wcWalletHead">
            <div className="wcWalletTitle">Bind Wallet</div>
            <button className="wcAddWallet" onClick={() => {
              setNewWallet({ label: "", network: coin.networks[0], address: "" });
              setShowAdd(true);
            }}>
              + Add New
            </button>
          </div>

          <div className="wcWalletList">
            {wallets.map((w) => (
              <button
                key={w.id}
                className={`wcSavedWallet ${
                  activeWallet?.id === w.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveWallet(w);
                  setAddress(w.address);
                  setNetwork(w.network);
                }}
                type="button"
              >
                <div className="wcWalletLeft">
                  <div className="wcWalletLabel">{w.label}</div>
                  <div className="wcWalletAddr">
                    {w.address.slice(0, 10)}…{w.address.slice(-6)}
                  </div>
                </div>
                <div className="wcWalletNet">{w.network}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="wcCard">
          <div className="wcGrid">
            <div className="wcField">
              <label>Network</label>
              <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                {coin.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <div className="wcHint">Make sure it matches your wallet network.</div>
            </div>

            <div className="wcField">
              <label>Amount</label>
              <div className="wcAmountRow">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder={`Min ${minWithdraw}`}
                />
                <button type="button" onClick={() => setAmount(String(balance))}>
                  Max
                </button>
              </div>

              <div className="wcCalc">
                Fee {fee} {coin.code} • Receive{" "}
                <span>
                  {money(receive)} {coin.code}
                </span>
              </div>

              {amountNum > 0 && amountNum < minWithdraw && (
                <div className="wcError">Minimum withdrawal is {minWithdraw}.</div>
              )}
              {amountNum > balance && (
                <div className="wcError">Amount exceeds available balance.</div>
              )}
            </div>
          </div>

          <div className="wcField">
            <label>Wallet Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${coin.code} address`}
              autoComplete="off"
            />
          </div>

          <button
            className="wcSubmit"
            disabled={!canSubmit}
            onClick={() => alert("Withdrawal submitted")}
          >
            Submit Withdrawal
          </button>

          <div className="wcRules">
            <ul>
              <li>Crypto withdrawals are irreversible.</li>
              <li>Wrong network/address may cause permanent loss.</li>
              <li>Processing time depends on blockchain congestion.</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Add Wallet Modal */}
      {showAdd && (
        <div className="wcModalOverlay" onClick={() => setShowAdd(false)}>
          <div className="wcModal" onClick={(e) => e.stopPropagation()}>
            <div className="wcModalHead">
              <div className="wcModalTitle">Add New Wallet</div>
              <button className="wcModalClose" onClick={() => setShowAdd(false)}>
                ✕
              </button>
            </div>

            <div className="wcModalBody">
              <label className="wcModalLabel">Wallet Label</label>
              <input
                className="wcModalInput"
                placeholder="e.g. My TRC20 wallet"
                value={newWallet.label}
                onChange={(e) =>
                  setNewWallet((p) => ({ ...p, label: e.target.value }))
                }
              />

              <label className="wcModalLabel">Network</label>
              <select
                className="wcModalInput"
                value={newWallet.network}
                onChange={(e) =>
                  setNewWallet((p) => ({ ...p, network: e.target.value }))
                }
              >
                {coin.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <label className="wcModalLabel">Wallet Address</label>
              <input
                className="wcModalInput"
                placeholder="Paste wallet address"
                value={newWallet.address}
                onChange={(e) =>
                  setNewWallet((p) => ({ ...p, address: e.target.value }))
                }
              />

              <button
                className="wcModalSave"
                disabled={!newWallet.label || !newWallet.address}
                onClick={saveWallet}
              >
                Save Wallet
              </button>

              <div className="wcModalTip">
                Make sure the address matches the selected network.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
