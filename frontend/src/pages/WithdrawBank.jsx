import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const INITIAL_HISTORY = [
  {
    id: "WD-10021",
    date: "2026-01-27 14:30",
    amount: 500,
    status: "Processing",
    timeline: ["Submitted", "Reviewing", "Processing"],
  },
  {
    id: "WD-10018",
    date: "2026-01-25 09:10",
    amount: 1200,
    status: "Completed",
    timeline: ["Submitted", "Reviewing", "Processing", "Completed"],
  },
  {
    id: "WD-10012",
    date: "2026-01-22 11:45",
    amount: 300,
    status: "Failed",
    timeline: ["Submitted", "Reviewing", "Failed"],
  },
];

/**
 * Put these logo images in: public/partners/
 * - visa.png, mastercard.png, unionpay.png, paypal.png, stripe.png
 * - swift.png, hsbc.png, citi.png, standardchartered.png, barclays.png
 */
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

export default function WithdrawBankV3() {
  const nav = useNavigate();

  const balance = 97280.12;
  const feeRate = 0.01;
  const MIN_WITHDRAW = 10;

  const countries = useMemo(() => getAllCountries(), []);
  const [country, setCountry] = useState("KH");

  const banks = useMemo(() => BANKS_BY_COUNTRY[country] || [], [country]);
  const [bank, setBank] = useState("");

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [branchNumber, setBranchNumber] = useState("");

  const [amount, setAmount] = useState("");

  const [history, setHistory] = useState(INITIAL_HISTORY);

  // Inline validation + submit lock
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fee = useMemo(() => Number(amount || 0) * feeRate, [amount]);
  const receive = useMemo(() => Math.max(0, Number(amount || 0) - fee), [amount, fee]);

  const validateWithdrawal = () => {
    const next = {};

    if (!country) next.country = "Please select a country.";
    if (!bank) next.bank = "Please select a bank.";
    if (!accountName.trim()) next.accountName = "Please enter account holder name.";
    if (!accountNumber.trim()) next.accountNumber = "Please enter account number.";

    const amt = Number(amount || 0);
    if (!amount || isNaN(amt) || amt <= 0) next.amount = "Enter a valid amount.";
    else if (amt < MIN_WITHDRAW) next.amount = `Minimum withdrawal is ${MIN_WITHDRAW} USD.`;
    else if (amt > balance) next.amount = "Amount exceeds available balance.";

    return next;
  };

  const isReadyToSubmit = () => Object.keys(validateWithdrawal()).length === 0;

  const submit = async () => {
    if (isSubmitting) return;

    const next = validateWithdrawal();
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API

    const newId = "WD-" + Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const date = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

    const newItem = {
      id: newId,
      date,
      amount: Number(amount),
      status: "Submitted",
      timeline: ["Submitted"],
    };

    setHistory((prev) => [newItem, ...prev]);
    setAmount("");
    setIsSubmitting(false);

    setErrors((prev) => ({ ...prev, form: "Withdrawal submitted ✅" }));
    setTimeout(() => setErrors((p) => ({ ...p, form: "" })), 2500);
  };

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

    setErrors((prev) => ({ ...prev, form: "Withdrawal cancelled ✅" }));
    setTimeout(() => setErrors((p) => ({ ...p, form: "" })), 2500);
  };

  const statusKey = (s) => String(s || "").toLowerCase();

  return (
    <div className="vipWhite wb3">
      {/* Top bar */}
      <header className="topbarW">
        <button className="backIcon" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>

        <div className="topTitle">
          <div className="topBrandRow">
            <span className="topBrand">Withdraw by Bank</span>
            <span className="vipBadge vipBadgeAx">Secure</span>
          </div>
          <div className="topSub">Withdraw securely to your personal bank account</div>
        </div>

        <button className="homeBtn" onClick={() => nav("/")} aria-label="Home">
          Home
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

          <div className="wb3-netNote">
            Processing is handled via trusted networks. Provider list is display-only (demo).
          </div>
        </div>
      </section>

      <main className="wrapW">
        {/* Balance block (same as AliexpressVip3) */}
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

        {/* Withdrawal Request (highlighted) */}
        <section className="cardW wb3-requestCard" id="withdraw-request">
          <div className="wb3-cardHead">
            <h2 className="h2W">Withdrawal Request</h2>
            <span className="smallMutedW">Verify details carefully</span>
          </div>

          {errors.form ? <div className="wb3-banner">{errors.form}</div> : null}

          <div className="wb3-grid">
            <div className="wb3-field">
              <label>Country</label>
              <select
                value={country}
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
              {errors.country ? (
                <div className="wb3-error">{errors.country}</div>
              ) : (
                <div className="wb3-help">Select your bank country/region.</div>
              )}
            </div>

            <div className="wb3-field">
              <label>Bank</label>
              <select
                value={bank}
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
              {errors.bank ? (
                <div className="wb3-error">{errors.bank}</div>
              ) : (
                <div className="wb3-help">Banks load by selected country (demo list).</div>
              )}
            </div>

            <div className="wb3-field">
              <label>Account Holder Name</label>
              <input
                value={accountName}
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
              <input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} inputMode="numeric" />
            </div>

            <div className="wb3-field">
              <label>Branch Number (optional)</label>
              <input value={branchNumber} onChange={(e) => setBranchNumber(e.target.value)} inputMode="numeric" />
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
              {errors.amount ? (
                <div className="wb3-error">{errors.amount}</div>
              ) : (
                <div className="wb3-help">Minimum: {MIN_WITHDRAW} USD • Fee: 1%</div>
              )}
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

          {/* Desktop button */}
          <button
            className="wb3-primaryBtn wb3-desktopOnly"
            onClick={submit}
            type="button"
            disabled={isSubmitting || !isReadyToSubmit()}
          >
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

                {h.status === "Failed" && (
                  <div className="wb3-failHint">Reason: Bank details mismatch or compliance review.</div>
                )}

                {h.status === "Cancelled" && (
                  <div className="wb3-cancelHint">Cancelled by user. Funds returned to wallet (demo).</div>
                )}
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

      {/* ✅ bottom bar */}
      <MemberBottomNav active="mine" />      
    </div>
  );
}