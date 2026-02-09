import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Beneficiaries.css";
import MemberBottomNav from "../components/MemberBottomNav";

const LS_KEY = "mw_beneficiaries_v1";

/** ✅ Network whitelist */
const CRYPTO_NETWORKS = ["BTC", "ETH", "USDT-TRC20", "USDT-ERC20"];

const DEMO = {
  crypto: [
    {
      id: "CR-1001",
      type: "crypto",
      label: "My USDT Wallet",
      network: "USDT-TRC20",
      address: "TQwZ9GxkWw3e9bqGQqZk9k9k9k9k9k9k9k",
      note: "Primary wallet",
      isDefault: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
    },
    {
      id: "CR-1002",
      type: "crypto",
      label: "Backup Wallet",
      network: "USDT-ERC20",
      address: "0x2b7fA9dE4bC1c8d0d9b1A2b3C4d5E6f7A8b9C0D1",
      note: "",
      isDefault: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ],
  bank: [
    {
      id: "BK-2001",
      type: "bank",
      label: "Personal Bank",
      bankName: "ABA Bank",
      accountName: "User Name",
      accountNumber: "1234567890",
      country: "Cambodia",
      swift: "ABAAKHPP",
      branch: "Phnom Penh",
      routing: "",
      note: "Salary account",
      isDefault: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 72,
    },
  ],
};

function uid(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
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

function validateCrypto(form) {
  const label = clean(form.label);
  const network = clean(form.network);
  const address = clean(form.address);

  if (!label) return "Please enter a Beneficiary Name.";
  if (!network) return "Please select a Network.";

  // ✅ whitelist check
  if (!CRYPTO_NETWORKS.includes(network)) {
    return "Invalid network. Please choose from BTC / ETH / USDT TRC20 / USDT ERC20.";
  }

  if (!address) return "Please enter a Wallet Address.";
  if (address.length < 10) return "Wallet Address looks too short.";
  return "";
}

function validateBank(form) {
  const label = clean(form.label);
  const bankName = clean(form.bankName);
  const accountName = clean(form.accountName);
  const accountNumber = clean(form.accountNumber);
  const country = clean(form.country);

  if (!label) return "Please enter a Beneficiary Name.";
  if (!bankName) return "Please enter Bank Name.";
  if (!accountName) return "Please enter Account Holder Name.";
  if (!accountNumber) return "Please enter Account Number.";
  if (!country) return "Please enter Country.";
  if (accountNumber.length < 6) return "Account Number looks too short.";
  return "";
}

export default function Beneficiaries() {
  const nav = useNavigate();

  const [tab, setTab] = useState("crypto"); // crypto | bank
  const [q, setQ] = useState("");
  const [data, setData] = useState(DEMO);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState("");

  const emptyCrypto = {
    type: "crypto",
    label: "",
    network: "USDT-TRC20", // ✅ default to whitelist value
    address: "",
    note: "",
    isDefault: false,
  };

  const emptyBank = {
    type: "bank",
    label: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    country: "",
    swift: "",
    branch: "",
    routing: "",
    note: "",
    isDefault: false,
  };

  const [form, setForm] = useState(emptyCrypto);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.crypto && parsed?.bank) setData(parsed);
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  const list = data[tab] ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;

    return list.filter((b) => {
      const hay = [
        b.label,
        b.network,
        b.address,
        b.bankName,
        b.accountName,
        b.accountNumber,
        b.country,
        b.swift,
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
    const base = tab === "crypto" ? emptyCrypto : emptyBank;
    setForm(base);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setErr("");
    setMode("edit");
    setEditingId(item.id);

    // ✅ If old saved network is not in whitelist, auto-fix to default
    if (item.type === "crypto" && item.network && !CRYPTO_NETWORKS.includes(item.network)) {
      setForm({ ...item, network: "USDT-TRC20" });
    } else {
      setForm({ ...item });
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setErr("");
  };

  const setDefault = (id) => {
    setData((prev) => {
      const next = { ...prev };
      next[tab] = (next[tab] ?? []).map((x) => ({ ...x, isDefault: x.id === id }));
      return next;
    });
  };

  const removeItem = (id) => {
    const ok = window.confirm("Remove this beneficiary?");
    if (!ok) return;

    setData((prev) => {
      const next = { ...prev };
      const before = next[tab] ?? [];
      const removed = before.find((x) => x.id === id);
      const after = before.filter((x) => x.id !== id);

      // if default removed, set first as default
      if (removed?.isDefault && after.length) {
        after[0] = { ...after[0], isDefault: true };
      }

      next[tab] = after;
      return next;
    });
  };

  const onSave = () => {
    const message = tab === "crypto" ? validateCrypto(form) : validateBank(form);
    if (message) {
      setErr(message);
      return;
    }

    setErr("");

    if (mode === "create") {
      const id = uid(tab === "crypto" ? "CR" : "BK");
      const item = {
        ...form,
        id,
        type: tab,
        createdAt: Date.now(),
      };

      setData((prev) => {
        const next = { ...prev };
        const arr = [...(next[tab] ?? [])];

        // default handling
        if (item.isDefault || arr.length === 0) {
          item.isDefault = true;
          for (let i = 0; i < arr.length; i++) arr[i] = { ...arr[i], isDefault: false };
        }

        arr.unshift(item);
        next[tab] = arr;
        return next;
      });

      closeModal();
      return;
    }

    // edit
    setData((prev) => {
      const next = { ...prev };
      let arr = [...(next[tab] ?? [])];

      arr = arr.map((x) => (x.id === editingId ? { ...x, ...form } : x));

      const edited = arr.find((x) => x.id === editingId);

      // if edited set as default
      if (edited?.isDefault) {
        arr = arr.map((x) => ({ ...x, isDefault: x.id === editingId }));
      }

      next[tab] = arr;
      return next;
    });

    closeModal();
  };

  const resetDemo = () => {
    const ok = window.confirm("Reset beneficiaries to demo data?");
    if (!ok) return;
    setData(DEMO);
  };

  const clearAll = () => {
    const ok = window.confirm("Clear ALL beneficiaries?");
    if (!ok) return;
    setData({ crypto: [], bank: [] });
  };

  const iconSrc = tab === "crypto" ? "/icons/btc.png" : "/icons/bank.png";

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
              placeholder={tab === "crypto" ? "Search name / network / address…" : "Search name / bank / account / country…"}
            />
          </div>

          <button className="bf-primary" type="button" onClick={openCreate}>
            + Add {tab === "crypto" ? "Crypto" : "Bank"}
          </button>
        </div>

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
              <div key={b.id} className={"bf-card " + (b.isDefault ? "is-default" : "")}>
                <div className="bf-cardTop">
                  <div className="bf-cardLeft">
                    {/* ✅ ICONS from /public/icons */}
                    <div className="bf-avatar" aria-hidden="true">
                      <img className="bf-iconImg" src={b.type === "crypto" ? "/icons/btc.png" : "/icons/bank.png"} alt="" />
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
                    <div className="bf-row">
                      <span className="bf-k">Country</span>
                      <span className="bf-v">{b.country}</span>
                    </div>

                    {(b.swift || b.branch || b.routing) && (
                      <div className="bf-grid3">
                        <div className="bf-miniBox">
                          <div className="bf-k">SWIFT</div>
                          <div className="bf-v mono">{b.swift || "—"}</div>
                        </div>
                        <div className="bf-miniBox">
                          <div className="bf-k">Branch</div>
                          <div className="bf-v">{b.branch || "—"}</div>
                        </div>
                        <div className="bf-miniBox">
                          <div className="bf-k">Routing</div>
                          <div className="bf-v mono">{b.routing || "—"}</div>
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
                      <label>Network (Whitelist)</label>
                      <select
                        value={form.network || "USDT-TRC20"}
                        onChange={(e) => setForm((p) => ({ ...p, network: e.target.value }))}
                      >
                        {CRYPTO_NETWORKS.map((n) => (
                          <option key={n} value={n}>
                            {n.replace("-", " ")}
                          </option>
                        ))}
                      </select>
                      <div className="bf-hint">Only safe networks are allowed to reduce mistakes.</div>
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
                  </div>

                  <div className="bf-field">
                    <label>Wallet Address</label>
                    <textarea
                      value={form.address || ""}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Paste wallet address…"
                      rows={3}
                    />
                    <div className="bf-hint">Tip: copy/paste to avoid typing mistakes.</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bf-grid2">
                    <div className="bf-field">
                      <label>Bank Name</label>
                      <input
                        value={form.bankName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                        placeholder="e.g. ABA Bank"
                      />
                    </div>

                    <div className="bf-field">
                      <label>Country</label>
                      <input
                        value={form.country || ""}
                        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                        placeholder="e.g. Cambodia"
                      />
                    </div>
                  </div>

                  <div className="bf-grid2">
                    <div className="bf-field">
                      <label>Account Holder Name</label>
                      <input
                        value={form.accountName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, accountName: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>

                    <div className="bf-field">
                      <label>Account Number</label>
                      <input
                        value={form.accountNumber || ""}
                        onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                        placeholder="Account number"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="bf-grid3">
                    <div className="bf-field">
                      <label>SWIFT (optional)</label>
                      <input value={form.swift || ""} onChange={(e) => setForm((p) => ({ ...p, swift: e.target.value }))} placeholder="SWIFT" />
                    </div>
                    <div className="bf-field">
                      <label>Branch (optional)</label>
                      <input value={form.branch || ""} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} placeholder="Branch" />
                    </div>
                    <div className="bf-field">
                      <label>Routing (optional)</label>
                      <input value={form.routing || ""} onChange={(e) => setForm((p) => ({ ...p, routing: e.target.value }))} placeholder="Routing" />
                    </div>
                  </div>

                  <div className="bf-field">
                    <label>Set as Default</label>
                    <div className="bf-switchRow">
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
