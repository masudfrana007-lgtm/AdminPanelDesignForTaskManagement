// src/pages/WithdrawCrypto.jsx (or WithdrawByCrypto.jsx)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import "./WithdrawByCrypto.css";
import "../styles/memberDepositBank.css";
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
      <header className="dcTop">
        <button className="dcBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>
        <div className="dcTitle">Withdraw Crypto</div>
        <button className="dcHistoryBtn" onClick={() => nav("/member/withdraw/records")}>
          History
        </button>
      </header>

      <div className="wcContainer">
        <main className="wrapW">
        {/* Balance */}
        <section className="balanceCardAx">
          <div className="balanceLeft">
            <div className="balanceLabelAx">Wallet Balance</div>

            <div className="balanceValueW">
              {money(balance)} <span className="unitW">USDT</span>
            </div>

            <div className="metaRowW">
              <span className="pillW pillAx">Min {MIN_WITHDRAW} USDT</span>
              <span className="pillW pillAx">Fee {FEE} USDT</span>
              <span className="pillW pillAx">Instant Processing</span>
            </div>
          </div>

          <div className="balanceRightW balanceRightAx">
            <div className="miniInfo">
              <div className="miniLabelAx">Fee</div>
              <div className="miniValue">{FEE} USDT</div>
            </div>

            <div className="miniInfo">
              <div className="miniLabelAx">Minimum</div>
              <div className="miniValue">{MIN_WITHDRAW} USDT</div>
            </div>
          </div>
        </section>

        {/* Withdrawal Request */}
        <section className="cardW wc3-requestCard" id="withdraw-request">
          <div className="wc3-cardHead">
            <h2 className="h2W">Withdrawal Request</h2>
            <span className="smallMutedW">Verify crypto details carefully</span>
          </div>

          {err && <div className="wc3-error wc3-banner">{err}</div>}
          {ok && <div className="wc3-success wc3-banner">{ok}</div>}

          <div className="wc3-grid">
            {/* Asset Selection */}
            <div className="wc3-field" style={{ gridColumn: "1 / -1" }}>
              <label>Select Asset</label>
              <div className="wc3-coinGrid">
                {coins.map((c) => (
                  <button
                    key={c.code}
                    className={`wc3-coinCard ${coin.code === c.code ? "active" : ""}`}
                    disabled={disableFilledInputs}
                    onClick={() => {}}
                    type="button"
                  >
                    <img className="wc3-coinIcon" src={c.icon} alt={c.code} />
                    <div className="wc3-coinInfo">
                      <div className="wc3-coinCode">{c.code}</div>
                      <div className="wc3-coinName">{c.name}</div>
                    </div>
                    {coin.code === c.code && <span className="wc3-checkmark">✓</span>}
                  </button>
                ))}
              </div>
              {disableFilledInputs && (
                <div className="wc3-help">Asset is auto-filled from beneficiary.</div>
              )}
            </div>

            {/* Beneficiary Selection */}
            <div className="wc3-field" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <label style={{ margin: 0 }}>Saved Wallet</label>
                <button
                  type="button"
                  className="wc3-addBtn"
                  onClick={goAddBeneficiary}
                >
                  Add New
                </button>
              </div>

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
                <div className="wc3-help">
                  No saved wallets found. Click <b>+ Add New</b> to create a beneficiary.
                </div>
              ) : (
                <div className="wc3-help">
                  Select a saved wallet. Network and address are auto-filled for security.
                </div>
              )}
            </div>

            {/* Network (disabled) */}
            <div className="wc3-field">
              <label>Network</label>
              <select value={network} onChange={() => {}} disabled={disableFilledInputs}>
                {coin.networks.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <div className="wc3-help">Network is locked for security.</div>
            </div>

            {/* Amount */}
            <div className="wc3-field">
              <label>Withdrawal Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${MIN_WITHDRAW}`}
                inputMode="decimal"
              />
              <div className="wc3-calc">
                Fee {FEE} {coin.code} • You'll receive <b>{money(receive)} {coin.code}</b>
              </div>
            </div>

            {/* Wallet Address (disabled) */}
            <div className="wc3-field" style={{ gridColumn: "1 / -1" }}>
              <label>Wallet Address</label>
              <input
                value={address}
                onChange={() => {}}
                disabled={disableFilledInputs}
                placeholder={`${coin.code} address`}
              />
              <div className="wc3-help">Address is locked from beneficiary for security.</div>
            </div>
          </div>

          {/* Summary */}
          <div className="wc3-summary">
            <div>
              <span>Amount</span>
              <span>{money(amountNum)} {coin.code}</span>
            </div>
            <div>
              <span>Fee</span>
              <span>{FEE} {coin.code}</span>
            </div>
            <div className="strong">
              <span>You'll Receive</span>
              <span>{money(receive)} {coin.code}</span>
            </div>
          </div>

          {/* Desktop button */}
          <button
            className="wc3-primaryBtn wc3-desktopOnly"
            onClick={submit}
            type="button"
            disabled={!canSubmit}
          >
            {submitting ? "Processing..." : "Confirm Withdrawal"}
          </button>

          <p className="wc3-note">
            Withdrawals are processed within 24 hours. Ensure wallet address is correct before confirming.
          </p>
        </section>
        </main>
      </div>

      {/* Sticky mobile confirm bar */}
      <div className="wc3-stickyBar" role="region" aria-label="Withdrawal action bar">
        <div className="wc3-stickyMeta">
          <div className="wc3-stickyLabel">Receive</div>
          <div className="wc3-stickyValue">{money(receive)} {coin.code}</div>
        </div>

        <button
          className="wc3-stickyBtn"
          type="button"
          onClick={submit}
          disabled={!canSubmit}
        >
          {submitting ? "Processing..." : "Confirm"}
        </button>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}
