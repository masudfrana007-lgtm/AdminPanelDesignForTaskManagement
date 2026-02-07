import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import "./WithdrawByCrypto.css";
import MemberBottomNav from "../components/MemberBottomNav";

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

  const FEE = 1;
  const MIN_WITHDRAW = 10;

  const [me, setMe] = useState(null);
  const balance = Number(me?.balance || 0);

  const [coin, setCoin] = useState(coins[0]);
  const [network, setNetwork] = useState(coins[0].networks[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newWallet, setNewWallet] = useState({
    label: "",
    network: coins[0].networks[0],
    address: "",
  });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await memberApi.get("/member/me");
        setMe(r.data);
      } catch {
        setErr("Failed to load balance");
      }
    })();
  }, []);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const receive = useMemo(
    () => Math.max(0, amountNum - FEE),
    [amountNum]
  );

  const canSubmit =
    address.trim() &&
    amountNum >= MIN_WITHDRAW &&
    amountNum <= balance &&
    !submitting;

  const saveWallet = () => {
    setWallets((prev) => [...prev, { ...newWallet, id: Date.now() }]);
    setShowAdd(false);
    setNewWallet({ label: "", network: coin.networks[0], address: "" });
  };

  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setErr("");
    setOk("");

    try {
      const { data } = await memberApi.post("/member/withdrawals", {
        method: "crypto",
        amount: amountNum,
        asset: coin.code,
        network,
        wallet_address: address.trim(),
      });

      setOk(`Withdrawal submitted • Ref ${data?.tx_ref || "-"}`);

      // refresh balance
      const meRes = await memberApi.get("/member/me");
      setMe(meRes.data);

      setAmount("");
      setAddress("");
      setActiveWallet(null);
    } catch (e) {
      setErr(e?.response?.data?.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wcPage">
      {/* Header */}
      <header className="wcTop">
        <button className="wcBack" onClick={() => nav(-1)}>←</button>
        <div className="wcTitle">Withdraw Crypto</div>
        <div style={{ width: 48 }} />
      </header>

      <div className="wcContainer">
        {/* Balance */}
        <section className="wcBalance">
          <div className="wcBalanceLabel">Wallet Balance</div>
          <div className="wcBalanceValue">{money(balance)} USDT</div>
          <div className="wcBalanceMeta">
            Min {MIN_WITHDRAW} • Fee {FEE}
          </div>
        </section>

        {/* Coins */}
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
                  setAddress("");
                  setActiveWallet(null);
                }}
              >
                <img className="wcCoinIcon" src={c.icon} alt={c.code} />
                <div>
                  <div className="wcCoinCode">{c.code}</div>
                  <div className="wcCoinName">{c.name}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Wallets */}
        <section className="wcWallet">
          <div className="wcWalletHead">
            <div className="wcWalletTitle">Bind Wallet</div>
            <button className="wcAddWallet" onClick={() => setShowAdd(true)}>
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
              >
                <div>
                  <div className="wcWalletLabel">{w.label}</div>
                  <div className="wcWalletAddr">
                    {w.address.slice(0, 8)}…{w.address.slice(-6)}
                  </div>
                </div>
                <div className="wcWalletNet">{w.network}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="wcCard">
          {err && <div className="wcError">{err}</div>}
          {ok && <div className="wcSuccess">{ok}</div>}

          <div className="wcField">
            <label>Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)}>
              {coin.networks.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="wcField">
            <label>Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${MIN_WITHDRAW}`}
              inputMode="decimal"
            />
            <div className="wcCalc">
              Fee {FEE} • Receive {money(receive)} {coin.code}
            </div>
          </div>

          <div className="wcField">
            <label>Wallet Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${coin.code} address`}
            />
          </div>

          <button className="wcSubmit" disabled={!canSubmit} onClick={submit}>
            {submitting ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </section>
      </div>

      {/* Add Wallet Modal */}
      {showAdd && (
        <div className="wcModalOverlay" onClick={() => setShowAdd(false)}>
          <div className="wcModal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Wallet</h3>

            <input
              placeholder="Label"
              value={newWallet.label}
              onChange={(e) =>
                setNewWallet((p) => ({ ...p, label: e.target.value }))
              }
            />

            <select
              value={newWallet.network}
              onChange={(e) =>
                setNewWallet((p) => ({ ...p, network: e.target.value }))
              }
            >
              {coin.networks.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <input
              placeholder="Wallet address"
              value={newWallet.address}
              onChange={(e) =>
                setNewWallet((p) => ({ ...p, address: e.target.value }))
              }
            />

            <button
              disabled={!newWallet.label || !newWallet.address}
              onClick={saveWallet}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <MemberBottomNav active="mine" />
    </div>
  );
}
