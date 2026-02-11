// src/pages/WithdrawCrypto.jsx (or WithdrawByCrypto.jsx)
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

// map backend row -> UI beneficiary
function mapBeneficiaryRow(row) {
  return {
    id: String(row.id),
    label: row.label || `Wallet ${row.id}`,
    asset: String(row.asset || "USDT").toUpperCase(),
    network: String(row.network || "").toUpperCase(),
    address: row.wallet_address || "",
    isDefault: !!row.is_default,
  };
}

export default function WithdrawCrypto() {
  const nav = useNavigate();

  const FEE = 1;
  const MIN_WITHDRAW = 10;

  const [me, setMe] = useState(null);
  const balance = Number(me?.balance || 0);

  // ✅ beneficiaries
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedId, setSelectedId] = useState(""); // beneficiary id
  const [loadingBf, setLoadingBf] = useState(false);

  // derived selected beneficiary
  const selected = useMemo(() => {
    return beneficiaries.find((b) => String(b.id) === String(selectedId)) || null;
  }, [beneficiaries, selectedId]);

  // ✅ withdrawal fields (now filled from beneficiary)
  const [coin, setCoin] = useState(coins[0]);
  const [network, setNetwork] = useState(coins[0].networks[0]);
  const [address, setAddress] = useState("");

  const [amount, setAmount] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // load balance
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

  // load crypto beneficiaries
  const loadBeneficiaries = async () => {
    setLoadingBf(true);
    try {
      const r = await memberApi.get("/member/beneficiaries?type=crypto");
      const rows = Array.isArray(r.data) ? r.data : [];
      const mapped = rows.map(mapBeneficiaryRow);

      // default first: is_default DESC is already ordered by backend, but keep safe
      mapped.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

      setBeneficiaries(mapped);

      // auto select default or first
      if (mapped.length) {
        const def = mapped.find((x) => x.isDefault) || mapped[0];
        setSelectedId(String(def.id));
      } else {
        setSelectedId("");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load beneficiaries");
    } finally {
      setLoadingBf(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when beneficiary changes -> fill coin/network/address
  useEffect(() => {
    if (!selected) {
      setAddress("");
      setCoin(coins[0]);
      setNetwork(coins[0].networks[0]);
      return;
    }

    const asset = String(selected.asset || "USDT").toUpperCase();
    const c = coins.find((x) => x.code === asset) || coins[0];

    setCoin(c);

    // ensure network is valid for selected asset
    const net = String(selected.network || "").toUpperCase();
    const validNet = c.networks.includes(net) ? net : c.networks[0];

    setNetwork(validNet);
    setAddress(selected.address || "");
    setOk("");
    setErr("");
  }, [selected]);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const receive = useMemo(() => Math.max(0, amountNum - FEE), [amountNum]);

  const canSubmit =
    !!selected &&
    address.trim() &&
    amountNum >= MIN_WITHDRAW &&
    amountNum <= balance &&
    !submitting;

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
    } catch (e) {
      setErr(e?.response?.data?.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goAddBeneficiary = () => {
    // ✅ go to Beneficiaries page, crypto tab
    nav("/beneficiary-management?tab=crypto");
  };

  const disableFilledInputs = true; // ✅ as you requested: disable all except amount

  return (
    <div className="wcPage">
      {/* Header */}
      <header className="wcTop">
        <button className="wcBack" onClick={() => nav(-1)}>
          ←
        </button>
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

        {/* Coins (disabled by requirement) */}
        <section className="wcCoins">
          <div className="wcCoinsTitle">Select Asset</div>
          <div className="wcCoinRow">
            {coins.map((c) => (
              <button
                key={c.code}
                className={`wcCoin ${coin.code === c.code ? "active" : ""}`}
                disabled={disableFilledInputs}
                onClick={() => {}}
                style={disableFilledInputs ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                type="button"
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

        {/* Wallets -> Beneficiary dropdown */}
        <section className="wcWallet">
          <div className="wcWalletHead">
            <div className="wcWalletTitle">Bind Wallet</div>
            <button className="wcAddWallet" onClick={goAddBeneficiary} type="button">
              + Add New
            </button>
          </div>

          <div className="wcCard" style={{ marginTop: 12 }}>
            <div className="wcField">
              <label>Beneficiary</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loadingBf}
              >
                {!beneficiaries.length ? (
                  <option value="">
                    {loadingBf ? "Loading..." : "No beneficiaries found"}
                  </option>
                ) : (
                  beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} • {b.asset} • {b.network}
                      {b.isDefault ? " (Default)" : ""}
                    </option>
                  ))
                )}
              </select>

              {!beneficiaries.length && !loadingBf ? (
                <div className="wcCalc" style={{ marginTop: 8 }}>
                  No saved wallets. Tap <b>+ Add New</b> to create a beneficiary.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="wcCard">
          {err && <div className="wcError">{err}</div>}
          {ok && <div className="wcSuccess">{ok}</div>}

          <div className="wcField">
            <label>Network</label>
            <select value={network} onChange={() => {}} disabled={disableFilledInputs}>
              {coin.networks.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
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
              onChange={() => {}}
              disabled={disableFilledInputs}
              placeholder={`Enter ${coin.code} address`}
            />
          </div>

          <button className="wcSubmit" disabled={!canSubmit} onClick={submit} type="button">
            {submitting ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </section>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}
