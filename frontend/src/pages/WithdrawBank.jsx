// src/pages/WithdrawBankV3.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi"; // ✅ member auth axios
import "../styles/WithdrawBank.css";
import MemberBottomNav from "../components/MemberBottomNav"; // ✅ bottom bar

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

/** Load ALL countries automatically */
function getAllCountries() {
  try {
    const regions = Intl.supportedValuesOf("region");
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return regions
      .map((code) => ({ code, name: dn.of(code) || code }))
      .filter((x) => x.name && x.name.toLowerCase() !== "unknown region")
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [
      { code: "KH", name: "Cambodia" },
      { code: "TH", name: "Thailand" },
      { code: "VN", name: "Vietnam" },
      { code: "MY", name: "Malaysia" },
      { code: "US", name: "United States" },
      { code: "GB", name: "United Kingdom" },
    ];
  }
}

/** Demo banks by country (replace with backend later) */
const BANKS_BY_COUNTRY = {
  KH: ["ABA Bank", "ACLEDA Bank", "Wing"],
  TH: ["Kasikornbank", "SCB", "Krungthai Bank"],
  VN: ["Vietcombank", "Techcombank"],
  MY: ["Maybank", "CIMB"],
};

function canCancel(status) {
  return status === "Submitted" || status === "Reviewing" || status === "Processing";
}

// Partner logos (UI only)
const PARTNER_LOGOS = [
  { name: "Visa", src: "/partners/visa.png" },
  { name: "Mastercard", src: "/partners/mastercard.png" },
  { name: "UnionPay", src: "/partners/unionpay.png" },
  { name: "PayPal", src: "/partners/paypal.png" },
  { name: "Stripe", src: "/partners/stripe.png" },
  { name: "SWIFT", src: "/partners/swift.png" },
  { name: "HSBC", src: "/partners/hsbc.png" },
  { name: "Citi", src: "/partners/citi.png" },
  { name: "Standard Chartered", src: "/partners/standardchartered.png" },
  { name: "Barclays", src: "/partners/barclays.png" },
];

function statusToUi(dbStatus) {
  const s = String(dbStatus || "").toLowerCase();
  if (s === "approved") return "Completed";
  if (s === "rejected") return "Failed";
  return "Submitted";
}

function uiTimeline(uiStatus) {
  if (uiStatus === "Completed") return ["Submitted", "Reviewing", "Processing", "Completed"];
  if (uiStatus === "Failed") return ["Submitted", "Reviewing", "Failed"];
  return ["Submitted"];
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toISOString().slice(0, 16).replace("T", " ");
}

// --- helpers ---
function pickStr(v, fallback = "") {
  return (v ?? "").toString().trim() || fallback;
}

export default function WithdrawBankV3() {
  const nav = useNavigate();

  const feeRate = 0.01;
  const MIN_WITHDRAW = 10;

  const countries = useMemo(() => getAllCountries(), []);

  // ✅ beneficiary list from backend
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedBenId, setSelectedBenId] = useState("");

  // form state (filled by beneficiary)
  const [country, setCountry] = useState("KH");
  const banks = useMemo(() => BANKS_BY_COUNTRY[country] || [], [country]);
  const [bank, setBank] = useState("");

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [branchNumber, setBranchNumber] = useState("");

  const [amount, setAmount] = useState("");

  // ✅ from backend
  const [me, setMe] = useState(null);
  const balance = Number(me?.balance || 0);

  const [history, setHistory] = useState([]);

  // Inline validation + submit lock
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fee = useMemo(() => Number(amount || 0) * feeRate, [amount]);
  const receive = useMemo(() => Math.max(0, Number(amount || 0) - fee), [amount, fee]);

  const selectedBen = useMemo(() => {
    return beneficiaries.find((b) => String(b.id) === String(selectedBenId)) || null;
  }, [beneficiaries, selectedBenId]);

  const fillFromBeneficiary = (b) => {
    if (!b) return;

    const nextCountry = pickStr(b.bank_country, "KH");
    setCountry(nextCountry);

    setBank(pickStr(b.bank_name, ""));
    setAccountName(pickStr(b.account_holder_name, ""));
    setAccountNumber(pickStr(b.account_number, ""));
    setRoutingNumber(pickStr(b.routing_number, ""));
    setBranchNumber(pickStr(b.branch_name, ""));

    // clear field errors when switching
    setErrors((p) => ({
      ...p,
      country: "",
      bank: "",
      accountName: "",
      accountNumber: "",
      form: "",
    }));
  };

  const validateWithdrawal = () => {
    const next = {};

    if (!selectedBenId) next.beneficiary = "Please select a bank beneficiary.";

    // still validate filled data (safety)
    if (!country) next.country = "Please select a country.";
    if (!bank) next.bank = "Please select a bank.";
    if (!accountName.trim()) next.accountName = "Please enter account holder name.";
    if (!accountNumber.trim()) next.accountNumber = "Please enter account number.";

    const amt = Number(amount || 0);
    if (!amount || Number.isNaN(amt) || amt <= 0) next.amount = "Enter a valid amount.";
    else if (amt < MIN_WITHDRAW) next.amount = `Minimum withdrawal is ${MIN_WITHDRAW} USD.`;
    else if (amt > balance) next.amount = "Amount exceeds available balance.";

    return next;
  };

  const isReadyToSubmit = () => Object.keys(validateWithdrawal()).length === 0;

  const loadMeAndWithdrawalsAndBeneficiaries = async () => {
    // profile/balance
    const meRes = await memberApi.get("/member/me");
    setMe(meRes.data || null);

    // withdrawals list
    const wRes = await memberApi.get("/member/withdrawals");
    const rows = Array.isArray(wRes.data) ? wRes.data : [];

    const onlyBank = rows.filter((x) => String(x?.method || "").toLowerCase() === "bank");

    const mapped = onlyBank.map((x) => {
      const uiStatus = statusToUi(x.status);
      return {
        id: x.tx_ref || `WD-${x.id}`,
        date: fmtDate(x.created_at),
        amount: Number(x.amount || 0),
        status: uiStatus,
        timeline: uiTimeline(uiStatus),
      };
    });

    setHistory(mapped);

    // ✅ beneficiaries
    const bRes = await memberApi.get("/member/beneficiaries?type=bank");
    const bRows = Array.isArray(bRes.data) ? bRes.data : [];
    setBeneficiaries(bRows);

    // auto-pick default, else first
    const def = bRows.find((x) => !!x.is_default) || bRows[0] || null;
    if (def) {
      setSelectedBenId(String(def.id));
      fillFromBeneficiary(def);
    } else {
      setSelectedBenId("");
      // clear filled details
      setCountry("KH");
      setBank("");
      setAccountName("");
      setAccountNumber("");
      setRoutingNumber("");
      setBranchNumber("");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await loadMeAndWithdrawalsAndBeneficiaries();
      } catch (e) {
        setErrors((p) => ({
          ...p,
          form: e?.response?.data?.message || "Failed to load wallet/withdrawals/beneficiaries",
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (isSubmitting) return;

    const next = validateWithdrawal();
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSubmitting(true);
    try {
      const amt = Number(amount || 0);

      const { data } = await memberApi.post("/member/withdrawals", {
        amount: amt,
        method: "bank",

        // ✅ use selected beneficiary-filled values
        bank_country: country,
        bank_name: bank,
        account_holder_name: accountName.trim(),
        account_number: accountNumber.trim(),
        routing_number: routingNumber.trim() || null,
        branch_name: branchNumber.trim() || null,

        // optional: keep trace in DB if your backend accepts extra fields (safe to remove if strict)
        beneficiary_id: selectedBenId,
      });

      const newItem = {
        id: data?.tx_ref || `WD-${data?.id || Math.floor(10000 + Math.random() * 90000)}`,
        date: fmtDate(data?.created_at || new Date()),
        amount: Number(data?.amount || amt),
        status: "Submitted",
        timeline: ["Submitted"],
      };

      setHistory((prev) => [newItem, ...prev]);

      // refresh balance after lock
      const meRes = await memberApi.get("/member/me");
      setMe(meRes.data || null);

      setAmount("");
      setErrors((prev) => ({ ...prev, form: "Withdrawal submitted ✅" }));
      setTimeout(() => setErrors((p) => ({ ...p, form: "" })), 2500);
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        form: e?.response?.data?.message || "Withdrawal failed",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⚠️ UI-only cancel (no backend endpoint yet)
  const cancelWithdrawal = (id) => {
    const ok = window.confirm("Cancel this withdrawal request?");
    if (!ok) return;

    setHistory((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        if (!canCancel(h.status)) return h;

        return {
          ...h,
          status: "Cancelled",
          timeline: [...new Set([...(h.timeline || []), "Cancelled"])],
        };
      })
    );

    setErrors((prev) => ({ ...prev, form: "Withdrawal cancelled ✅ (UI only)" }));
    setTimeout(() => setErrors((p) => ({ ...p, form: "" })), 2500);
  };

  const statusKey = (s) => String(s || "").toLowerCase();

  // ✅ only amount is editable
  const detailsDisabled = true;

  return (
    <div className="vipWhite wb3">
      {/* Top bar */}
      <header className="dcTop">
        <button className="dcBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>

        <div className="topTitle">
          <div className="topBrandRow">
            <span className="topBrand">Withdraw by Bank</span>
            <span className="vipBadge vipBadgeAx">Secure</span>
          </div>
          <div className="topSub">Withdraw securely to your personal bank account</div>
        </div>

        <button className="dcHistoryBtn" onClick={() => nav("/member/withdraw/records")}>
          History
        </button>
      </header>

      {/* ✅ Frozen supported networks block */}
      <section className="wb3-netSticky" aria-label="Supported networks">
        <div className="wb3-netInner">
          <div className="wb3-netTitle">
            Supported Networks <span className="wb3-netChip">Verified</span>
          </div>

          <div className="wb3-marquee" aria-label="Partner logos">
            <div className="wb3-track">
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((l, idx) => (
                <div key={l.name + idx} className="wb3-logoPill" title={l.name}>
                  <img className="wb3-logoImg" src={l.src} alt={l.name} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <main className="wrapW">
        {/* Balance block */}
        <section className="balanceCardAx">
          <div className="balanceLeft">
            <div className="balanceLabelAx">Available Balance</div>

            <div className="balanceValueW">
              {money(balance)} <span className="unitW">USD</span>
            </div>

            <div className="metaRowW">
              <span className="pillW pillAx">Fee 1%</span>
              <span className="pillW pillAx">Processing up to 24h</span>
              <span className="pillW pillAx">Compliance checks</span>
            </div>
          </div>

          <div className="balanceRightW balanceRightAx">
            <div className="miniInfo">
              <div className="miniLabelAx">Fee Rate</div>
              <div className="miniValue">1%</div>
            </div>

            <div className="miniInfo">
              <div className="miniLabelAx">Minimum</div>
              <div className="miniValue">{MIN_WITHDRAW} USD</div>
            </div>
          </div>
        </section>

        {/* Withdrawal Request */}
        <section className="cardW wb3-requestCard" id="withdraw-request">
          <div className="wb3-cardHead">
            <h2 className="h2W">Withdrawal Request</h2>
            <span className="smallMutedW">Verify details carefully</span>
          </div>

          {errors.form ? <div className="wb3-banner">{errors.form}</div> : null}

{/* ✅ Beneficiary selector */}
<div className="wb3-grid">
  <div className="wb3-field" style={{ gridColumn: "1 / -1" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <label style={{ margin: 0 }}>Bank Beneficiary</label>

      {/* ✅ always visible add button */}
      <button
        type="button"
        className="wb3-primaryBtn"
        style={{ padding: "8px 12px", fontSize: 13 }}
        onClick={() => nav("/beneficiary-management?tab=bank")}
      >
        + Add Beneficiary
      </button>
    </div>

    {beneficiaries.length ? (
      <>
        <select
          value={selectedBenId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedBenId(id);

            const b = beneficiaries.find((x) => String(x.id) === String(id)) || null;
            fillFromBeneficiary(b);
            setErrors((p) => ({ ...p, beneficiary: "" }));
          }}
        >
          <option value="">Select beneficiary</option>
          {beneficiaries.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.label || `Beneficiary ${b.id}`} {b.is_default ? "• Default" : ""}
            </option>
          ))}
        </select>

        {errors.beneficiary ? (
          <div className="wb3-error">{errors.beneficiary}</div>
        ) : (
          <div className="wb3-help">Select a saved bank beneficiary. Details are locked for safety.</div>
        )}

        {/* small preview */}
        {selectedBen ? (
          <div className="wb3-help" style={{ marginTop: 6 }}>
            <b>Selected:</b> {selectedBen.label} • {pickStr(selectedBen.bank_country)} • {pickStr(selectedBen.bank_name)}
          </div>
        ) : null}
      </>
    ) : (
      <>
        <div className="wb3-help">No bank beneficiaries found. Please add one first.</div>
      </>
    )}
  </div>
</div>


          <div className="wb3-grid">
            <div className="wb3-field">
              <label>Country</label>
              <select
                value={country}
                disabled={detailsDisabled}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setErrors((p) => ({ ...p, country: "" }));
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country ? <div className="wb3-error">{errors.country}</div> : <div className="wb3-help">Filled from beneficiary.</div>}
            </div>

            <div className="wb3-field">
              <label>Bank</label>
              <select
                value={bank}
                disabled={detailsDisabled}
                onChange={(e) => {
                  setBank(e.target.value);
                  setErrors((p) => ({ ...p, bank: "" }));
                }}
              >
                <option value="">Select bank</option>
                {banks.length ? (
                  banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Bank list will appear after selecting a supported country.
                  </option>
                )}
              </select>
              {errors.bank ? <div className="wb3-error">{errors.bank}</div> : <div className="wb3-help">Filled from beneficiary.</div>}
            </div>

            <div className="wb3-field">
              <label>Account Holder Name</label>
              <input
                value={accountName}
                disabled={detailsDisabled}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setErrors((p) => ({ ...p, accountName: "" }));
                }}
                autoComplete="name"
              />
              {errors.accountName ? <div className="wb3-error">{errors.accountName}</div> : null}
            </div>

            <div className="wb3-field">
              <label>Account Number</label>
              <input
                value={accountNumber}
                disabled={detailsDisabled}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setErrors((p) => ({ ...p, accountNumber: "" }));
                }}
                inputMode="numeric"
                autoComplete="off"
              />
              {errors.accountNumber ? <div className="wb3-error">{errors.accountNumber}</div> : null}
            </div>

            <div className="wb3-field">
              <label>Routing Number (optional)</label>
              <input value={routingNumber} disabled={detailsDisabled} onChange={(e) => setRoutingNumber(e.target.value)} inputMode="numeric" />
            </div>

            <div className="wb3-field">
              <label>Branch Number (optional)</label>
              <input value={branchNumber} disabled={detailsDisabled} onChange={(e) => setBranchNumber(e.target.value)} inputMode="numeric" />
            </div>

            <div className="wb3-field">
              <label>Withdrawal Amount (USD)</label>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((p) => ({ ...p, amount: "" }));
                }}
                placeholder="Enter amount"
                inputMode="decimal"
              />
              {errors.amount ? <div className="wb3-error">{errors.amount}</div> : <div className="wb3-help">Minimum: {MIN_WITHDRAW} USD • Fee: 1%</div>}
            </div>
          </div>

          <div className="wb3-summary">
            <div>
              <span>Processing Fee (1%)</span>
              <span>${money(fee)}</span>
            </div>
            <div className="strong">
              <span>You Will Receive</span>
              <span>${money(receive)}</span>
            </div>
          </div>

          <button className="wb3-primaryBtn" onClick={submit} type="button" disabled={isSubmitting || !isReadyToSubmit()}>
            {isSubmitting ? "Submitting..." : "Confirm Withdrawal"}
          </button>

          <p className="wb3-note">
            Ensure bank details are correct and match your bank records. Incorrect details may cause delays or rejection.
          </p>
        </section>

        {/* History */}
        <section className="cardW">
          <div className="wb3-cardHead">
            <h2 className="h2W">Withdrawal History & Status</h2>
            <span className="smallMutedW">Timeline tracking</span>
          </div>

          <div className="wb3-history">
            {history.map((h) => (
              <div key={h.id} className="wb3-historyCard">
                <div className="wb3-historyTop">
                  <div>
                    <div className="wb3-id">{h.id}</div>
                    <div className="wb3-date">{h.date}</div>
                  </div>

                  <div className="wb3-historyActions">
                    <div className={"wb3-status " + statusKey(h.status)}>{h.status}</div>

                    {canCancel(h.status) && (
                      <button className="wb3-cancelBtn" type="button" onClick={() => cancelWithdrawal(h.id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="wb3-historyAmount">${money(h.amount)}</div>

                <div className="wb3-timeline">
                  {["Submitted", "Reviewing", "Processing", "Completed"].map((step) => {
                    const done = h.timeline?.includes(step);
                    const cancelled = h.status === "Cancelled";
                    const failed = h.status === "Failed";

                    const dotClass = cancelled
                      ? "cancelled"
                      : failed && step === "Processing"
                      ? "failed"
                      : done
                      ? "done"
                      : "";

                    return (
                      <div key={step} className={"wb3-step " + (done ? "doneText" : "")}>
                        <span className={"dot " + dotClass} />
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {h.status === "Failed" && <div className="wb3-failHint">Reason: Bank details mismatch or compliance review.</div>}
                {h.status === "Cancelled" && <div className="wb3-cancelHint">Cancelled by user. Funds returned to wallet (demo).</div>}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky mobile confirm bar */}
      <div className="wb3-stickyBar" role="region" aria-label="Withdrawal action bar">
        <div className="wb3-stickyMeta">
          <div className="wb3-stickyLabel">Receive</div>
          <div className="wb3-stickyValue">${money(receive)}</div>
        </div>

        <button
          className="wb3-stickyBtn"
          type="button"
          onClick={() => {
            submit();
            const next = validateWithdrawal();
            if (Object.keys(next).length) {
              document.getElementById("withdraw-request")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          disabled={isSubmitting || !isReadyToSubmit()}
        >
          {isSubmitting ? "Submitting..." : "Confirm"}
        </button>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}
