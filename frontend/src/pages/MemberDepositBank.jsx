import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberDepositBank.css";
import MemberBottomNav from "../components/MemberBottomNav";

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

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
      { code: "US", name: "United States" },
      { code: "BD", name: "Bangladesh" },
      { code: "TR", name: "Turkey" },
    ];
  }
}

const BANKS_BY_COUNTRY = {
  US: [
    { id: "chase", name: "Chase", type: "Bank Transfer" },
    { id: "boa", name: "Bank of America", type: "Bank Transfer" },
    { id: "wells", name: "Wells Fargo", type: "Bank Transfer" },
    { id: "citi", name: "Citibank", type: "Bank Transfer" },
    { id: "cap1", name: "Capital One", type: "Bank Transfer" },
    { id: "hsbc", name: "HSBC", type: "Bank Transfer" },
  ],
  BD: [
    { id: "brac", name: "BRAC Bank", type: "Bank Transfer" },
    { id: "dbbl", name: "DBBL", type: "Mobile Banking" },
    { id: "bkash", name: "bKash", type: "Mobile Wallet" },
  ],
};

const DEMO_PAYEE_DETAILS = {
  payeeName: "Royal Payments Co.,Ltd",
  bankName: "Royal Partner Bank",
  accountName: "Royal Payments",
  accountNumber: "012-345-678-901",
  swift: "ROYALKHPP",
  note: "Use the Reference Code exactly. Deposits without reference may be delayed.",
};

const DEMO_HISTORY = [
  { id: "H-1", date: "2026-01-27 18:24", method: "Bank Transfer", amount: 500, status: "Pending", ref: "DP-812334" },
  { id: "H-2", date: "2026-01-26 10:12", method: "Bank Transfer", amount: 1200, status: "Completed", ref: "DP-771223" },
  { id: "H-3", date: "2026-01-25 09:40", method: "Bank Transfer", amount: 300, status: "Failed", ref: "DP-661298" },
];

export default function MemberDepositBank() {
  const nav = useNavigate();

  const [balance] = useState(1280.45);

  const countries = useMemo(() => getAllCountries(), []);
  const [country, setCountry] = useState("US");

  const banks = useMemo(() => BANKS_BY_COUNTRY[country] || [], [country]);
  const [selectedBankId, setSelectedBankId] = useState("");

  useEffect(() => {
    setSelectedBankId(banks[0]?.id || "");
  }, [country, banks]);

  const selectedBank = useMemo(
    () => banks.find((b) => b.id === selectedBankId) || null,
    [banks, selectedBankId]
  );

  const [amount, setAmount] = useState("");
  const [reference] = useState(() => `DP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [senderName, setSenderName] = useState("");
  const [receipt, setReceipt] = useState(null);

  const [historyTab, setHistoryTab] = useState("All");

  const filteredHistory = useMemo(() => {
    if (historyTab === "All") return DEMO_HISTORY;
    return DEMO_HISTORY.filter((h) => h.status === historyTab);
  }, [historyTab]);

  const fileRef = useRef(null);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ✅");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const onPickReceipt = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setReceipt({ name: f.name, size: f.size });
    e.target.value = "";
  };

  const submit = () => {
    if (!country) return alert("Please select a country.");
    if (!selectedBank) return alert("Please select a bank.");
    if (!amount || Number(amount) <= 0) return alert("Please enter a valid amount.");
    if (!senderName.trim()) return alert("Please enter Sender Name.");
    alert("Deposit request submitted ✅ (wire to backend)");
  };

  return (
    <div className="db-page">
      <div className="db-overlay" />

      <header className="db-header">
        <button className="db-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="db-title">
          <h1>Deposit by Bank</h1>
          <p>Select country & bank. Complete payment and submit reference.</p>
        </div>

        <button className="db-ghostBtn" type="button" onClick={() => nav("/member/service")}>
          Help
        </button>
      </header>

      <main className="db-wrap">
        {/* Top balance + rules */}
        <section className="db-topRow">
          <div className="db-card db-balance">
            <div className="db-balanceHead">
              <div className="db-kicker">Wallet Balance</div>
              <span className="db-pill">Available</span>
            </div>

            <div className="db-balanceAmount">
              <span className="db-usd">${money(balance)}</span>
              <span className="db-unit">USD</span>
            </div>

            <div className="db-mutedSmall">Bank deposits may take time to confirm after payment.</div>
          </div>

          <div className="db-card db-status">
            <div className="db-statusTitle">Deposit Rules</div>
            <ul className="db-list">
              <li>Use the exact <b>Reference Code</b> provided.</li>
              <li>Send from an account you own (name must match).</li>
              <li>Upload payment receipt for faster processing.</li>
            </ul>
          </div>
        </section>

        {/* Select country + bank */}
        <section className="db-card db-selectors">
          <div className="db-sectionHead">
            <div>
              <div className="db-sectionTitle">1) Select Country</div>
              <div className="db-mutedSmall">Banks & mobile options are shown based on country.</div>
            </div>
          </div>

          <div className="db-row">
            <div className="db-field">
              <div className="db-label">Country</div>
              <select className="db-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => (
                  <option key={c.code} value={c.code} style={{
                    backgroundColor: "#051436"
                  }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="db-field">
              <div className="db-label">Available Banks</div>
              <div className="db-bankRow">
                {banks.length ? (
                  banks.map((b) => (
                    <button
                      key={b.id}
                      className={"db-bankCard " + (b.id === selectedBankId ? "is-active" : "")}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      title={b.name}
                    >
                      <div className="db-bankLogo" aria-hidden="true">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="db-bankInfo">
                        <div className="db-bankName">{b.name}</div>
                        <div className="db-bankType">{b.type}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="db-empty">No banks configured for this country.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Details + Submit */}
        <section className="db-grid">
          <div className="db-card db-details">
            <div className="db-sectionTitle">2) Bank Details</div>
            <div className="db-mutedSmall">Send payment to the following beneficiary account.</div>

            <div className="db-kv">
              <div className="db-k">Beneficiary</div>
              <div className="db-v">
                {DEMO_PAYEE_DETAILS.payeeName}
                <button className="db-secondaryBtn" onClick={() => copy(DEMO_PAYEE_DETAILS.payeeName)} type="button">
                  Copy
                </button>
              </div>
            </div>

            <div className="db-kv">
              <div className="db-k">Bank</div>
              <div className="db-v">
                {DEMO_PAYEE_DETAILS.bankName}
                <button className="db-secondaryBtn" onClick={() => copy(DEMO_PAYEE_DETAILS.bankName)} type="button">
                  Copy
                </button>
              </div>
            </div>

            <div className="db-kv">
              <div className="db-k">Account Name</div>
              <div className="db-v">
                {DEMO_PAYEE_DETAILS.accountName}
                <button className="db-secondaryBtn" onClick={() => copy(DEMO_PAYEE_DETAILS.accountName)} type="button">
                  Copy
                </button>
              </div>
            </div>

            <div className="db-kv">
              <div className="db-k">Account Number</div>
              <div className="db-v">
                {DEMO_PAYEE_DETAILS.accountNumber}
                <button className="db-secondaryBtn" onClick={() => copy(DEMO_PAYEE_DETAILS.accountNumber)} type="button">
                  Copy
                </button>
              </div>
            </div>

            <div className="db-kv">
              <div className="db-k">SWIFT</div>
              <div className="db-v">
                {DEMO_PAYEE_DETAILS.swift}
                <button className="db-secondaryBtn" onClick={() => copy(DEMO_PAYEE_DETAILS.swift)} type="button">
                  Copy
                </button>
              </div>
            </div>

            <div className="db-note">⚠️ {DEMO_PAYEE_DETAILS.note}</div>
          </div>

          <div className="db-card db-submit">
            <div className="db-sectionTitle">3) Submit Deposit Request</div>
            <div className="db-mutedSmall">After payment, submit the details below for confirmation.</div>

            <div className="db-form">
              <div className="db-field">
                <div className="db-label">Reference Code</div>
                <div className="db-refRow">
                  <div className="db-ref">{reference}</div>
                  <button className="db-primarySmall" type="button" onClick={() => copy(reference)}>
                    Copy
                  </button>
                </div>
              </div>

              <div className="db-field">
                <div className="db-label">Deposit Amount</div>
                <input
                  className="db-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (USD)"
                  inputMode="decimal"
                />
                <div className="db-mutedSmall">Minimum: 10 USD • Processing: 5–30 minutes</div>
              </div>

              <div className="db-field">
                <div className="db-label">Sender Name</div>
                <input
                  className="db-input"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Name used in your bank transfer"
                />
              </div>

              <div className="db-field">
                <div className="db-label">Upload Receipt (optional)</div>
                <div className="db-uploadRow">
                  <button className="db-secondaryBtn" type="button" onClick={() => fileRef.current?.click()}>
                    📎 Add File
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" hidden onChange={onPickReceipt} />
                  <div className="db-uploadName">{receipt ? receipt.name : "No file selected"}</div>
                </div>
              </div>

              <button className="db-primaryBtn" type="button" onClick={submit} disabled={!banks.length}>
                Confirm Deposit
              </button>

              <div className="db-mutedSmall">By submitting, you confirm the payment details are correct.</div>
            </div>
          </div>
        </section>

        {/* Deposit History */}
        <section className="db-card db-history">
          <div className="db-historyHead">
            <div>
              <div className="db-sectionTitle">Deposit History</div>
              <div className="db-mutedSmall">Track pending and completed deposits.</div>
            </div>

            <div className="db-historyTabs">
              {["All", "Pending", "Completed", "Failed"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={"db-tab " + (historyTab === t ? "is-active" : "")}
                  onClick={() => setHistoryTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="db-historyTable">
            <div className="db-historyRow head">
              <span>Date</span>
              <span>Method</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Reference</span>
              <span>Action</span>
            </div>

            {filteredHistory.map((d) => (
              <div key={d.id} className="db-historyRow">
                <span>{d.date}</span>
                <span>{d.method}</span>
                <span>${money(d.amount)}</span>
                <span className={"db-status " + d.status.toLowerCase()}>{d.status}</span>
                <span className="db-refMini">{d.ref}</span>
                <button className="db-secondaryBtn" type="button" onClick={() => copy(d.ref)}>
                  Copy
                </button>
              </div>
            ))}

            {!filteredHistory.length && <div className="db-historyEmpty">No records found for this status.</div>}
          </div>
        </section>
      </main>

      {/* ✅ KEEP OLD BOTTOM BAR EXACTLY */}
      <div className="memberBottomNavFixed">
        <MemberBottomNav active="mine" />
      </div>
    </div>
  );
}
