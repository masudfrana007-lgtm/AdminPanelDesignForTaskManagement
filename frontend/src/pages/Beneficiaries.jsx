// src/pages/Beneficiaries.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import "./Beneficiaries.css";
import MemberBottomNav from "../components/MemberBottomNav";

/**
 * ✅ Must match WithdrawCrypto networks:
 * USDT: TRC20 / ERC20 / BEP20
 * BTC : BTC
 * ETH : ERC20
 * BNB : BEP20
 * TRX : TRC20
 */
const COINS = [
  { code: "USDT", networks: ["TRC20", "ERC20", "BEP20"] },
  { code: "BTC", networks: ["BTC"] },
  { code: "ETH", networks: ["ERC20"] },
  { code: "BNB", networks: ["BEP20"] },
  { code: "TRX", networks: ["TRC20"] },
];

const DEFAULT_ASSET = "USDT";

function networksForAsset(asset) {
  const a = String(asset || "").toUpperCase();
  const c = COINS.find((x) => x.code === a);
  return c ? c.networks : [];
}

function uid(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()
    .toString()
    .slice(-4)}`;
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function clean(s) {
  return (s ?? "").toString().trim();
}

/** Load ALL countries automatically (same behavior as WithdrawBankV3) */
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

/** Demo banks by country (same list as WithdrawBankV3) */
const BANKS_BY_COUNTRY = {
  KH: ["ABA Bank", "ACLEDA Bank", "Wing"],
  TH: ["Kasikornbank", "SCB", "Krungthai Bank"],
  VN: ["Vietcombank", "Techcombank"],
  MY: ["Maybank", "CIMB"],
};

/** ---------------- VALIDATION ---------------- */
function validateCrypto(form) {
  const label = clean(form.label);
  const asset = clean(form.asset).toUpperCase();
  const network = clean(form.network).toUpperCase();
  const address = clean(form.address);

  if (!label) return "Please enter a Beneficiary Name.";
  if (!asset) return "Please select an Asset.";

  const allowed = networksForAsset(asset);
  if (!allowed.length) return "Invalid asset selected.";

  if (!network) return "Please select a Network.";
  if (!allowed.includes(network)) return `Invalid network for ${asset}.`;

  if (!address) return "Please enter a Wallet Address.";
  if (address.length < 10) return "Wallet Address looks too short.";
  return "";
}

function validateBank(form) {
  const label = clean(form.label);
  const country = clean(form.country); // expects country code like KH
  const bankName = clean(form.bankName);
  const accountName = clean(form.accountName);
  const accountNumber = clean(form.accountNumber);

  if (!label) return "Please enter a Beneficiary Name.";
  if (!country) return "Please select a country.";
  if (!bankName) return "Please select a bank.";
  if (!accountName) return "Please enter account holder name.";
  if (!accountNumber) return "Please enter account number.";
  if (accountNumber.length < 6) return "Account Number looks too short.";
  return "";
}

/** ---------------- MAPPERS: DB <-> UI ---------------- */
function dbToUi(row) {
  const type = String(row?.type || "").toLowerCase();

  if (type === "crypto") {
    const asset = (row.asset || DEFAULT_ASSET).toUpperCase();
    const allowed = networksForAsset(asset);
    const net = (row.network || "").toUpperCase();

    return {
      id: String(row.id),
      type: "crypto",
      label: row.label || "",
      asset,
      network:
        allowed.includes(net)
          ? net
          : allowed[0] || networksForAsset(DEFAULT_ASSET)[0] || "TRC20",
      address: row.wallet_address || "",
      note: row.note || "",
      isDefault: !!row.is_default,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    };
  }

  // ✅ bank_country should be code (KH/TH/...)
  return {
    id: String(row.id),
    type: "bank",
    label: row.label || "",
    country: row.bank_country || "KH",
    bankName: row.bank_name || "",
    accountName: row.account_holder_name || "",
    accountNumber: row.account_number || "",
    routing: row.routing_number || "",
    branch: row.branch_name || "",
    note: row.note || "",
    isDefault: !!row.is_default,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function uiToApiPayload(tab, form) {
  if (tab === "crypto") {
    return {
      type: "crypto",
      label: clean(form.label),
      is_default: !!form.isDefault,

      // ✅ matches WithdrawCrypto
      asset: clean(form.asset).toUpperCase(),
      network: clean(form.network).toUpperCase(),
      wallet_address: clean(form.address),

      note: clean(form.note) || null,
    };
  }

  // ✅ matches WithdrawBankV3
  return {
    type: "bank",
    label: clean(form.label),
    is_default: !!form.isDefault,

    bank_country: clean(form.country), // code like KH
    bank_name: clean(form.bankName),
    account_holder_name: clean(form.accountName),
    account_number: clean(form.accountNumber),

    routing_number: clean(form.routing) || null,
    branch_name: clean(form.branch) || null,

    // keep optional columns compatible with backend schema
    swift: null,
    note: clean(form.note) || null,
  };
}

export default function Beneficiaries() {
  const nav = useNavigate();
  const location = useLocation();

  const countries = useMemo(() => getAllCountries(), []);

  // ✅ initial tab from URL: /beneficiaries?tab=crypto|bank
  const initialTab = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const t = String(sp.get("tab") || "").toLowerCase();
    return t === "bank" ? "bank" : "crypto";
  }, [location.search]);

  const [tab, setTab] = useState(initialTab); // crypto | bank
  const [q, setQ] = useState("");

  const [data, setData] = useState({ crypto: [], bank: [] });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const emptyCrypto = useMemo(
    () => ({
      type: "crypto",
      label: "",
      asset: DEFAULT_ASSET,
      network: networksForAsset(DEFAULT_ASSET)[0] || "TRC20",
      address: "",
      note: "",
      isDefault: false,
    }),
    []
  );

  const emptyBank = useMemo(
    () => ({
      type: "bank",
      label: "",
      country: "KH",
      bankName: "",
      accountName: "",
      accountNumber: "",
      routing: "",
      branch: "",
      note: "",
      isDefault: false,
    }),
    []
  );

  const [form, setForm] = useState(initialTab === "bank" ? emptyBank : emptyCrypto);

  // keep tab in sync if URL changes
  useEffect(() => {
    setTab(initialTab);
    setForm(initialTab === "bank" ? emptyBank : emptyCrypto);
    setQ("");
    setErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  const banksForFormCountry = useMemo(() => {
    const code = String(form.country || "KH");
    return BANKS_BY_COUNTRY[code] || [];
  }, [form.country]);

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [cRes, bRes] = await Promise.all([
        memberApi.get("/member/beneficiaries?type=crypto"),
        memberApi.get("/member/beneficiaries?type=bank"),
      ]);

      const cryptoRows = Array.isArray(cRes.data) ? cRes.data : [];
      const bankRows = Array.isArray(bRes.data) ? bRes.data : [];

      setData({
        crypto: cryptoRows.map(dbToUi),
        bank: bankRows.map(dbToUi),
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = data[tab] ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;

    return list.filter((b) => {
      const hay = [
        b.label,
        b.asset,
        b.network,
        b.address,
        b.bankName,
        b.accountName,
        b.accountNumber,
        b.country,
        b.routing,
        b.branch,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [q, list]);

  const openCreate = () => {
    setErr("");
    setMode("create");
    setEditingId(null);
    setForm(tab === "crypto" ? emptyCrypto : emptyBank);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setErr("");
    setMode("edit");
    setEditingId(item.id);

    if (item.type === "crypto") {
      const asset = (item.asset || DEFAULT_ASSET).toUpperCase();
      const allowed = networksForAsset(asset);
      const net = (item.network || "").toUpperCase();
      setForm({
        ...item,
        asset,
        network:
          allowed.includes(net)
            ? net
            : allowed[0] || networksForAsset(DEFAULT_ASSET)[0] || "TRC20",
      });
    } else {
      // bank
      setForm({
        ...item,
        country: item.country || "KH",
        bankName: item.bankName || "",
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setErr("");
  };

  const setDefault = async (id) => {
    try {
      setErr("");
      const item = (data[tab] || []).find((x) => String(x.id) === String(id));
      if (!item) return;

      if (tab === "crypto") {
        await memberApi.patch(`/member/beneficiaries/${id}`, {
          label: item.label,
          is_default: true,
          asset: (item.asset || DEFAULT_ASSET).toUpperCase(),
          network: (item.network || "").toUpperCase(),
          wallet_address: item.address,
          note: item.note || null,
        });
      } else {
        await memberApi.patch(`/member/beneficiaries/${id}`, {
          label: item.label,
          is_default: true,
          bank_country: item.country,
          bank_name: item.bankName,
          account_holder_name: item.accountName,
          account_number: item.accountNumber,
          routing_number: item.routing || null,
          branch_name: item.branch || null,
          swift: null,
          note: item.note || null,
        });
      }

      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to set default");
    }
  };

  const removeItem = async (id) => {
    const ok = window.confirm("Remove this beneficiary?");
    if (!ok) return;

    try {
      setErr("");
      await memberApi.delete(`/member/beneficiaries/${id}`);
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete beneficiary");
    }
  };

  const onSave = async () => {
    const message = tab === "crypto" ? validateCrypto(form) : validateBank(form);
    if (message) {
      setErr(message);
      return;
    }

    setErr("");

    try {
      const payload = uiToApiPayload(tab, form);

      if (mode === "create") {
        await memberApi.post("/member/beneficiaries", payload);
      } else {
        await memberApi.patch(`/member/beneficiaries/${editingId}`, payload);
      }

      await loadAll();
      closeModal();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save beneficiary");
    }
  };

  const resetDemo = async () => {
    const ok = window.confirm("Reset beneficiaries to demo data?");
    if (!ok) return;

    try {
      setErr("");

      const all = [...(data.crypto || []), ...(data.bank || [])];
      for (const x of all) {
        // eslint-disable-next-line no-await-in-loop
        await memberApi.delete(`/member/beneficiaries/${x.id}`);
      }

      await memberApi.post("/member/beneficiaries", {
        type: "crypto",
        label: "My USDT Wallet",
        is_default: true,
        asset: "USDT",
        network: "TRC20",
        wallet_address: "TQwZ9GxkWw3e9bqGQqZk9k9k9k9k9k9k9k",
        note: "Primary wallet",
      });

      await memberApi.post("/member/beneficiaries", {
        type: "bank",
        label: "Personal Bank",
        is_default: true,
        bank_country: "KH",
        bank_name: "ABA Bank",
        account_holder_name: "User Name",
        account_number: "1234567890",
        routing_number: null,
        branch_name: null,
        swift: null,
        note: "Salary account",
      });

      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reset demo");
    }
  };

  const clearAll = async () => {
    const ok = window.confirm("Clear ALL beneficiaries?");
    if (!ok) return;

    try {
      setErr("");
      const all = [...(data.crypto || []), ...(data.bank || [])];
      for (const x of all) {
        // eslint-disable-next-line no-await-in-loop
        await memberApi.delete(`/member/beneficiaries/${x.id}`);
      }
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to clear beneficiaries");
    }
  };

  return (
    <div className="bf-page">
      <header className="bf-top">
        <button className="bf-back" type="button" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>

        <div className="bf-title">
          <div className="bf-h1">Beneficiaries</div>
          <div className="bf-sub">Manage Crypto & Bank withdrawal accounts</div>
        </div>

        <div className="bf-actionsTop">
          <button className="bf-btnGhost" type="button" onClick={resetDemo}>
            Demo
          </button>
          <button className="bf-btnGhost danger" type="button" onClick={clearAll}>
            Clear
          </button>
        </div>
      </header>

      <section className="bf-shell">
        <div className="bf-tabsRow">
          <button
            className={"bf-tab " + (tab === "crypto" ? "is-active" : "")}
            type="button"
            onClick={() => {
              setTab("crypto");
              setQ("");
              setErr("");
              setForm(emptyCrypto);
            }}
          >
            Crypto Beneficiary
          </button>

          <button
            className={"bf-tab " + (tab === "bank" ? "is-active" : "")}
            type="button"
            onClick={() => {
              setTab("bank");
              setQ("");
              setErr("");
              setForm(emptyBank);
            }}
          >
            Bank Beneficiary
          </button>
        </div>

        <div className="bf-toolbar">
          <div className="bf-searchWrap">
            <input
              className="bf-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                tab === "crypto"
                  ? "Search name / asset / network / address…"
                  : "Search name / country / bank / account…"
              }
            />
          </div>

          <button className="bf-primary" type="button" onClick={openCreate}>
            + Add {tab === "crypto" ? "Crypto" : "Bank"}
          </button>
        </div>

        {err ? <div className="bf-error" style={{ marginBottom: 12 }}>{err}</div> : null}
        {loading ? <div className="bf-emptySub" style={{ marginBottom: 12 }}>Loading…</div> : null}

        <div className="bf-list">
          {filtered.length === 0 ? (
            <div className="bf-empty">
              <div className="bf-emptyTitle">No beneficiaries found</div>
              <div className="bf-emptySub">Create one to withdraw faster and safer.</div>
              <button className="bf-primary" type="button" onClick={openCreate}>
                Add now
              </button>
            </div>
          ) : (
            filtered.map((b) => (
              <div key={b.id || uid("row")} className={"bf-card " + (b.isDefault ? "is-default" : "")}>
                <div className="bf-cardTop">
                  <div className="bf-cardLeft">
                    <div className="bf-avatar" aria-hidden="true">
                      <img
                        className="bf-iconImg"
                        src={b.type === "crypto" ? "/icons/btc.png" : "/icons/bank.png"}
                        alt=""
                      />
                    </div>

                    <div>
                      <div className="bf-nameRow">
                        <div className="bf-name">{b.label}</div>
                        {b.isDefault && <span className="bf-badge">Default</span>}
                      </div>
                      <div className="bf-meta">
                        ID: <b>{b.id}</b> • Created: {formatDate(b.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="bf-cardBtns">
                    {!b.isDefault && (
                      <button className="bf-mini" type="button" onClick={() => setDefault(b.id)}>
                        Set Default
                      </button>
                    )}
                    <button className="bf-mini" type="button" onClick={() => openEdit(b)}>
                      Edit
                    </button>
                    <button className="bf-mini danger" type="button" onClick={() => removeItem(b.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {tab === "crypto" ? (
                  <div className="bf-details">
                    <div className="bf-row">
                      <span className="bf-k">Asset</span>
                      <span className="bf-v">{b.asset || DEFAULT_ASSET}</span>
                    </div>
                    <div className="bf-row">
                      <span className="bf-k">Network</span>
                      <span className="bf-v">{b.network}</span>
                    </div>
                    <div className="bf-row">
                      <span className="bf-k">Wallet Address</span>
                      <span className="bf-v mono">{b.address}</span>
                    </div>
                    {b.note ? (
                      <div className="bf-note">
                        <span className="bf-k">Note</span>
                        <span className="bf-v">{b.note}</span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="bf-details">
                    <div className="bf-row">
                      <span className="bf-k">Country</span>
                      <span className="bf-v">{b.country}</span>
                    </div>
                    <div className="bf-row">
                      <span className="bf-k">Bank</span>
                      <span className="bf-v">{b.bankName}</span>
                    </div>
                    <div className="bf-row">
                      <span className="bf-k">Account Name</span>
                      <span className="bf-v">{b.accountName}</span>
                    </div>
                    <div className="bf-row">
                      <span className="bf-k">Account Number</span>
                      <span className="bf-v mono">{b.accountNumber}</span>
                    </div>

                    {(b.routing || b.branch) && (
                      <div className="bf-grid3">
                        <div className="bf-miniBox">
                          <div className="bf-k">Routing</div>
                          <div className="bf-v mono">{b.routing || "—"}</div>
                        </div>
                        <div className="bf-miniBox">
                          <div className="bf-k">Branch</div>
                          <div className="bf-v">{b.branch || "—"}</div>
                        </div>
                        <div className="bf-miniBox">
                          <div className="bf-k">—</div>
                          <div className="bf-v">—</div>
                        </div>
                      </div>
                    )}

                    {b.note ? (
                      <div className="bf-note">
                        <span className="bf-k">Note</span>
                        <span className="bf-v">{b.note}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bf-footerTips">
          <div className="bf-tipTitle">Security tips</div>
          <ul className="bf-tipList">
            <li>Always double-check addresses before saving.</li>
            <li>Use “Default” for your most-used account to reduce mistakes.</li>
            <li>Never share passwords or OTP codes with anyone.</li>
          </ul>
        </div>
      </section>

      {/* MODAL */}
      {modalOpen && (
        <div className="bf-modalOverlay" role="dialog" aria-modal="true">
          <div className="bf-modal">
            <div className="bf-modalHead">
              <div>
                <div className="bf-modalTitle">
                  {mode === "create" ? "Add" : "Edit"} {tab === "crypto" ? "Crypto" : "Bank"} Beneficiary
                </div>
                <div className="bf-modalSub">Fill carefully — withdrawals use this information.</div>
              </div>

              <button className="bf-x" type="button" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>

            {err ? <div className="bf-error">{err}</div> : null}

            <div className="bf-form">
              <div className="bf-field">
                <label>Beneficiary Name</label>
                <input
                  value={form.label || ""}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder={tab === "crypto" ? "e.g. My USDT Wallet" : "e.g. Personal Bank"}
                />
              </div>

              {tab === "crypto" ? (
                <>
                  <div className="bf-grid2">
                    <div className="bf-field">
                      <label>Asset</label>
                      <select
                        value={(form.asset || DEFAULT_ASSET).toUpperCase()}
                        onChange={(e) => {
                          const nextAsset = e.target.value.toUpperCase();
                          const nets = networksForAsset(nextAsset);
                          setForm((p) => ({
                            ...p,
                            asset: nextAsset,
                            network: nets[0] || "",
                          }));
                        }}
                      >
                        {COINS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bf-field">
                      <label>Network</label>
                      <select
                        value={(form.network || "").toUpperCase()}
                        onChange={(e) => setForm((p) => ({ ...p, network: e.target.value.toUpperCase() }))}
                      >
                        {networksForAsset(form.asset || DEFAULT_ASSET).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <div className="bf-hint">Network list matches Withdraw Crypto.</div>
                    </div>
                  </div>

                  <div className="bf-field">
                    <label>Set as Default</label>
                    <div className="bf-switchRow">
                      <input
                        id="bfDefault"
                        type="checkbox"
                        checked={!!form.isDefault}
                        onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                      />
                      <label htmlFor="bfDefault" className="bf-switchLabel">
                        Make default
                      </label>
                    </div>
                  </div>

                  <div className="bf-field">
                    <label>Wallet Address</label>
                    <textarea
                      value={form.address || ""}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder={`Enter ${form.asset || DEFAULT_ASSET} address`}
                      rows={3}
                    />
                    <div className="bf-hint">Tip: copy/paste to avoid typing mistakes.</div>
                  </div>
                </>
              ) : (
                <>
                  {/* ✅ Bank form matches WithdrawBankV3 */}
                  <div className="bf-grid2">
                    <div className="bf-field">
                      <label>Country</label>
                      <select
                        value={form.country || "KH"}
                        onChange={(e) => {
                          const nextCountry = e.target.value;
                          const nextBanks = BANKS_BY_COUNTRY[nextCountry] || [];
                          setForm((p) => ({
                            ...p,
                            country: nextCountry,
                            bankName: nextBanks.includes(p.bankName) ? p.bankName : "",
                          }));
                        }}
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bf-field">
                      <label>Bank</label>
                      <select
                        value={form.bankName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                      >
                        <option value="">Select bank</option>
                        {(BANKS_BY_COUNTRY[form.country || "KH"] || []).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      <div className="bf-hint">Bank list loads by selected country (demo list).</div>
                    </div>
                  </div>

                  <div className="bf-grid2">
                    <div className="bf-field">
                      <label>Account Holder Name</label>
                      <input
                        value={form.accountName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                        placeholder="Full name"
                        autoComplete="name"
                      />
                    </div>

                    <div className="bf-field">
                      <label>Account Number</label>
                      <input
                        value={form.accountNumber || ""}
                        onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                        placeholder="Account number"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="bf-grid3">
                    <div className="bf-field">
                      <label>Routing Number (optional)</label>
                      <input
                        value={form.routing || ""}
                        onChange={(e) => setForm((p) => ({ ...p, routing: e.target.value }))}
                        inputMode="numeric"
                      />
                    </div>

                    <div className="bf-field">
                      <label>Branch Number (optional)</label>
                      <input
                        value={form.branch || ""}
                        onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                        inputMode="numeric"
                      />
                    </div>

                    <div className="bf-field">
                      <label>Set as Default</label>
                      <div className="bf-switchRow" style={{ marginTop: 6 }}>
                        <input
                          id="bfDefault2"
                          type="checkbox"
                          checked={!!form.isDefault}
                          onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                        />
                        <label htmlFor="bfDefault2" className="bf-switchLabel">
                          Make default
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bf-field">
                <label>Note (optional)</label>
                <input
                  value={form.note || ""}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Any note for your reference"
                />
              </div>
            </div>

            <div className="bf-modalBtns">
              <button className="bf-btnGhost" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="bf-primary" type="button" onClick={onSave}>
                {mode === "create" ? "Save Beneficiary" : "Update Beneficiary"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MemberBottomNav active="mine" />
    </div>
  );
}
