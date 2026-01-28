// src/pages/WithdrawBank.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/WithdrawBank.css";

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

const INITIAL_BENEFICIARIES = [
  {
    id: "B-1",
    label: "My Main Account",
    country: "KH",
    bank: "ABA Bank",
    accountName: "John Doe",
    accountNumber: "012-345-678",
    routingNumber: "",
    branchNumber: "001",
  },
  {
    id: "B-2",
    label: "Savings",
    country: "TH",
    bank: "SCB",
    accountName: "John Doe",
    accountNumber: "998-221-445",
    routingNumber: "1100",
    branchNumber: "",
  },
];

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

export default function WithdrawBank() {
  const nav = useNavigate();

  const balance = 97280.12;
  const feeRate = 0.01;

  const countries = useMemo(() => getAllCountries(), []);
  const [country, setCountry] = useState("KH");

  const banks = useMemo(() => BANKS_BY_COUNTRY[country] || [], [country]);
  const [bank, setBank] = useState("");

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [branchNumber, setBranchNumber] = useState("");

  const [amount, setAmount] = useState("");

  const [beneficiaries, setBeneficiaries] = useState(INITIAL_BENEFICIARIES);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("");
  const [benefLabel, setBenefLabel] = useState("");

  const [history, setHistory] = useState(INITIAL_HISTORY);

  const fee = useMemo(() => Number(amount || 0) * feeRate, [amount]);
  const receive = useMemo(() => Math.max(0, Number(amount || 0) - fee), [amount, fee]);

  const applyBeneficiary = (id) => {
    const b = beneficiaries.find((x) => x.id === id);
    if (!b) return;

    setSelectedBeneficiaryId(id);
    setCountry(b.country);
    setBank(b.bank);
    setAccountName(b.accountName);
    setAccountNumber(b.accountNumber);
    setRoutingNumber(b.routingNumber || "");
    setBranchNumber(b.branchNumber || "");
  };

  const deleteBeneficiary = (id) => {
    const b = beneficiaries.find((x) => x.id === id);
    if (!b) return;

    const ok = window.confirm(`Delete beneficiary "${b.label}"?`);
    if (!ok) return;

    setBeneficiaries((prev) => prev.filter((x) => x.id !== id));
    if (selectedBeneficiaryId === id) setSelectedBeneficiaryId("");
  };

  const saveBeneficiary = () => {
    if (!benefLabel.trim()) return alert("Please enter a beneficiary label.");
    if (!country) return alert("Select country.");
    if (!bank) return alert("Select bank.");
    if (!accountName.trim()) return alert("Enter account holder name.");
    if (!accountNumber.trim()) return alert("Enter account number.");

    const newB = {
      id: "B-" + Math.floor(1000 + Math.random() * 9000),
      label: benefLabel.trim(),
      country,
      bank,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      routingNumber: routingNumber.trim(),
      branchNumber: branchNumber.trim(),
    };

    setBeneficiaries((prev) => [newB, ...prev]);
    setSelectedBeneficiaryId(newB.id);
    setBenefLabel("");
    alert("Beneficiary saved ✅");
  };

  const submit = () => {
    if (!country) return alert("Please select a country.");
    if (!bank) return alert("Please select a bank.");
    if (!accountName.trim()) return alert("Please enter account holder name.");
    if (!accountNumber.trim()) return alert("Please enter account number.");
    if (!amount || Number(amount) <= 0) return alert("Please enter a valid amount.");

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
    alert("Withdrawal submitted ✅");
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

    alert("Withdrawal cancelled ✅");
  };

  return (
    <div className="wb-page">
      <header className="wb-header">
        <button className="wb-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="wb-headerText">
          <h1>Withdraw by Bank</h1>
          <p>Withdraw securely to your personal bank account</p>
        </div>

        <button className="wb-secondaryBtn" type="button" onClick={() => nav("/member/service")}>
          Support
        </button>
      </header>

      <main className="wb-wrap">
        {/* Balance */}
        <section className="wb-card wb-balance">
          <div className="wb-balanceHead">
            <span>Available Balance</span>
            <span className="wb-pill">USD</span>
          </div>
          <div className="wb-balanceAmount">${money(balance)}</div>
          <div className="wb-infoText">
            Processing time: up to <b>24 hours</b>. Compliance checks may apply.
          </div>
        </section>

        {/* Saved Beneficiaries */}
        <section className="wb-card">
          <div className="wb-rowHead">
            <h3>Saved Beneficiaries</h3>
            <span className="wb-muted">Tap one to autofill your bank details.</span>
          </div>

          <div className="wb-benefList">
            {beneficiaries.map((b) => (
              <div
                key={b.id}
                className={"wb-benefCard " + (selectedBeneficiaryId === b.id ? "is-active" : "")}
              >
                <button
                  type="button"
                  className="wb-benefMain"
                  onClick={() => applyBeneficiary(b.id)}
                  title="Use this beneficiary"
                >
                  <div className="wb-benefTitle">{b.label}</div>
                  <div className="wb-benefSub">
                    {b.bank} • {b.country} • {b.accountNumber}
                  </div>
                </button>

                <button
                  type="button"
                  className="wb-dangerBtn"
                  onClick={() => deleteBeneficiary(b.id)}
                  title="Delete beneficiary"
                >
                  Delete
                </button>
              </div>
            ))}

            {!beneficiaries.length && <div className="wb-empty">No saved beneficiaries yet.</div>}
          </div>
        </section>

        {/* Add Beneficiary */}
        <section className="wb-card wb-addBeneficiary">
          <h3>Add Beneficiary</h3>
          <p className="wb-muted">Save an account for faster withdrawals next time.</p>

          <div className="wb-grid">
            <div className="wb-field">
              <label>Beneficiary Label</label>
              <input
                value={benefLabel}
                onChange={(e) => setBenefLabel(e.target.value)}
                placeholder='Example: "My Main Account"'
              />
              <div className="wb-help">This name is only for your reference.</div>
            </div>

            <div className="wb-field">
              <label>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="wb-field">
              <label>Bank</label>
              <select value={bank} onChange={(e) => setBank(e.target.value)}>
                <option value="">Select bank</option>
                {banks.length ? (
                  banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No banks configured (backend needed)
                  </option>
                )}
              </select>
            </div>

            <div className="wb-field">
              <label>Account Holder Name</label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account holder name"
              />
            </div>

            <div className="wb-field">
              <label>Account Number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
              />
            </div>

            <div className="wb-field">
              <label>Routing Number (optional)</label>
              <input
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="Routing number"
              />
            </div>

            <div className="wb-field">
              <label>Branch Number (optional)</label>
              <input
                value={branchNumber}
                onChange={(e) => setBranchNumber(e.target.value)}
                placeholder="Branch number"
              />
            </div>
          </div>

          <button className="wb-secondaryBtn" type="button" onClick={saveBeneficiary}>
            Save Beneficiary
          </button>
        </section>

        {/* Withdrawal Request */}
        <section className="wb-card">
          <h3>Withdrawal Request</h3>

          <div className="wb-grid">
            <div className="wb-field">
              <label>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="wb-help">Select your bank country/region.</div>
            </div>

            <div className="wb-field">
              <label>Bank</label>
              <select value={bank} onChange={(e) => setBank(e.target.value)}>
                <option value="">Select bank</option>
                {banks.length ? (
                  banks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No banks configured (backend needed)
                  </option>
                )}
              </select>
              <div className="wb-help">Banks load by selected country (demo list).</div>
            </div>

            <div className="wb-field">
              <label>Account Holder Name</label>
              <input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>

            <div className="wb-field">
              <label>Account Number</label>
              <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>

            <div className="wb-field">
              <label>Routing Number (optional)</label>
              <input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} />
            </div>

            <div className="wb-field">
              <label>Branch Number (optional)</label>
              <input value={branchNumber} onChange={(e) => setBranchNumber(e.target.value)} />
            </div>

            <div className="wb-field">
              <label>Withdrawal Amount (USD)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                inputMode="decimal"
              />
              <div className="wb-help">Minimum: 10 USD • Fee: 1%</div>
            </div>
          </div>

          <div className="wb-summary">
            <div>
              <span>Processing Fee (1%)</span>
              <span>${money(fee)}</span>
            </div>
            <div className="strong">
              <span>You Will Receive</span>
              <span>${money(receive)}</span>
            </div>
          </div>

          <button className="wb-primaryBtn" onClick={submit} type="button">
            Confirm Withdrawal
          </button>

          <p className="wb-note">
            Ensure bank details are correct. Incorrect details may cause delays or rejection.
          </p>
        </section>

        {/* History + Timeline + Cancel */}
        <section className="wb-card">
          <h3>Withdrawal History & Status</h3>

          <div className="wb-history">
            {history.map((h) => (
              <div key={h.id} className="wb-historyCard">
                <div className="wb-historyTop">
                  <div>
                    <div className="wb-id">{h.id}</div>
                    <div className="wb-date">{h.date}</div>
                  </div>

                  <div className="wb-historyActions">
                    <div className={`wb-status ${String(h.status).toLowerCase()}`}>{h.status}</div>

                    {canCancel(h.status) && (
                      <button className="wb-cancelBtn" type="button" onClick={() => cancelWithdrawal(h.id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="wb-historyAmount">${money(h.amount)}</div>

                <div className="wb-timeline">
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
                      <div key={step} className={"wb-step " + (done ? "doneText" : "")}>
                        <span className={"dot " + dotClass} />
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {h.status === "Failed" && (
                  <div className="wb-failHint">Reason: Bank details mismatch or compliance review.</div>
                )}

                {h.status === "Cancelled" && (
                  <div className="wb-cancelHint">Cancelled by user. Funds returned to wallet (demo).</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* bottom bar like mine page */}
      <MemberBottomNav active="mine" />
    </div>
  );
}
