import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";
import { Link } from "react-router-dom";

const fmtMoney = (v) => {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
};

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
};

export default function Members() {
  const me = getUser();
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // wallet drawer state
  const [openMember, setOpenMember] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [deps, setDeps] = useState([]);
  const [wds, setWds] = useState([]);
  const [wErr, setWErr] = useState("");
  const [busy, setBusy] = useState(false);

  const canReview = me?.role === "owner"; // only owner approves/creates/edits

  // create forms (wallet drawer)
  const [depAmount, setDepAmount] = useState("");
  const [depMethod, setDepMethod] = useState("Manual");
  const [depTxRef, setDepTxRef] = useState("");
  const [depProof, setDepProof] = useState("");

  const [wdAmount, setWdAmount] = useState("");
  const [wdMethod, setWdMethod] = useState("Manual");
  const [wdAccount, setWdAccount] = useState("");

  // ✅ EDIT MODAL state
  const [editOpen, setEditOpen] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editForm, setEditForm] = useState({
    id: null,
    short_id: "",
    nickname: "",
    phone: "",
    country: "",
    ranking: "Trial",
    withdraw_privilege: true,
    approval_status: "pending",
    gender: "male",
  });

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get("/members");
      setList(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load members");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveMember = async (id) => {
    setErr("");
    setOk("");
    try {
      await api.patch(`/members/${id}/approve`);
      setOk("Member approved");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e) {
      setErr(e?.response?.data?.message || "Approve failed");
    }
  };

  const rejectMember = async (id) => {
    setErr("");
    setOk("");
    try {
      await api.patch(`/members/${id}/reject`);
      setOk("Member rejected");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e) {
      setErr(e?.response?.data?.message || "Reject failed");
    }
  };

  const openWallet = async (member) => {
    setOpenMember(member);
    setWallet(null);
    setDeps([]);
    setWds([]);
    setWErr("");
    setBusy(true);

    // reset forms
    setDepAmount("");
    setDepMethod("Manual");
    setDepTxRef("");
    setDepProof("");
    setWdAmount("");
    setWdMethod("Manual");
    setWdAccount("");

    try {
      const { data } = await api.get(`/members/${member.id}/wallet`);
      setWallet(data?.wallet || null);
      setDeps(data?.deposits || []);
      setWds(data?.withdrawals || []);
    } catch (e) {
      setWErr(e?.response?.data?.message || "Failed to load wallet");
    } finally {
      setBusy(false);
    }
  };

  const closeWallet = () => {
    setOpenMember(null);
    setWallet(null);
    setDeps([]);
    setWds([]);
    setWErr("");
    setBusy(false);
  };

  const refreshAll = async () => {
    if (openMember) {
      await openWallet(openMember);
    }
    await load();
  };

  const actDeposit = async (id, action) => {
    setWErr("");
    setBusy(true);
    try {
      await api.patch(`/deposits/${id}/${action}`, { admin_note: null });
      await refreshAll();
    } catch (e) {
      setWErr(e?.response?.data?.message || `Deposit ${action} failed`);
    } finally {
      setBusy(false);
    }
  };

  const actWithdrawal = async (id, action) => {
    setWErr("");
    setBusy(true);
    try {
      await api.patch(`/withdrawals/${id}/${action}`, { admin_note: null });
      await refreshAll();
    } catch (e) {
      setWErr(e?.response?.data?.message || `Withdrawal ${action} failed`);
    } finally {
      setBusy(false);
    }
  };

  const createDeposit = async () => {
    if (!openMember) return;
    setWErr("");

    const amount = Number(depAmount || 0);
    const method = String(depMethod || "").trim();
    const tx_ref = String(depTxRef || "").trim();
    const proof_url = String(depProof || "").trim();

    if (!amount || amount <= 0) return setWErr("Deposit amount must be > 0");
    if (!method) return setWErr("Deposit method required");

    setBusy(true);
    try {
      await api.post("/deposits", {
        member_id: openMember.id,
        amount,
        method,
        tx_ref: tx_ref || null,
        proof_url: proof_url || null,
      });

      setDepAmount("");
      setDepTxRef("");
      setDepProof("");

      await refreshAll();
    } catch (e) {
      setWErr(e?.response?.data?.message || "Create deposit failed");
    } finally {
      setBusy(false);
    }
  };

  const createWithdrawal = async () => {
    if (!openMember) return;
    setWErr("");

    const amount = Number(wdAmount || 0);
    const method = String(wdMethod || "").trim();
    const account_details = String(wdAccount || "").trim();

    if (!amount || amount <= 0) return setWErr("Withdraw amount must be > 0");
    if (!method) return setWErr("Withdraw method required");
    if (!account_details) return setWErr("Account details required");

    setBusy(true);
    try {
      await api.post("/withdrawals", {
        member_id: openMember.id,
        amount,
        method,
        account_details,
      });

      setWdAmount("");
      setWdAccount("");

      await refreshAll();
    } catch (e) {
      setWErr(e?.response?.data?.message || "Create withdrawal failed");
    } finally {
      setBusy(false);
    }
  };

  // ✅ EDIT MODAL handlers
  const openEdit = (m) => {
    setEditErr("");
    setEditForm({
      id: m.id,
      short_id: m.short_id || "",
      nickname: m.nickname || "",
      phone: m.phone || "",
      country: m.country || "",
      ranking: m.ranking || "Trial",
      withdraw_privilege: !!m.withdraw_privilege,
      approval_status: m.approval_status || "pending",
      gender: m.gender || "male",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditErr("");
  };

  const saveEdit = async () => {
    setEditErr("");
    if (!editForm.id) return;

    const payload = {
      nickname: editForm.nickname.trim(),
      phone: editForm.phone.trim(),
      country: editForm.country.trim(),
      ranking: editForm.ranking,
      withdraw_privilege: editForm.withdraw_privilege,
      approval_status: editForm.approval_status,
      gender: editForm.gender,
    };

    if (!payload.nickname) return setEditErr("Nickname is required");
    if (!payload.phone) return setEditErr("Phone is required");
    if (!payload.country) return setEditErr("Country is required");

    setBusy(true);
    try {
      await api.patch(`/members/${editForm.id}`, payload);

      setOk("Member updated");
      setTimeout(() => setOk(""), 1500);

      closeEdit();
      await load();

      // if wallet drawer is open for same member, refresh it too
      if (openMember?.id === editForm.id) {
        await openWallet({ ...openMember, ...payload });
      }
    } catch (e) {
      setEditErr(e?.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Members</h2>
            <div className="small">
              You are <span className="badge">{me?.role}</span>
            </div>
          </div>

          <Link to="/members/create" className="btn">
            + Create Member
          </Link>
        </div>

        <div className="card">
          <h3>Members List</h3>
          <div className="small">
            Agent sees only their members. Owner sees own + members created by their agents.
          </div>
          <div className="hr" />

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <div className="tableWrap">
            <table className="table tableNoCut">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Nickname</th>
                  <th>Phone</th>
                  <th>Ranking</th>
                  <th>Withdraw</th>
                  <th>Balance</th>
                  <th>Locked</th>
                  <th>Sponsor</th>
                  <th>Status</th>
                  <th>Wallet</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {list.map((m) => (
                  <tr key={m.short_id || m.id}>
                    <td>{m.short_id}</td>
                    <td>{m.nickname}</td>
                    <td>{m.phone}</td>

                    <td>
                      <span className="badge">{m.ranking}</span>
                    </td>

                    <td>
                      <span className="badge">
                        {m.withdraw_privilege ? "Enabled" : "Disabled"}
                      </span>
                    </td>

                    <td>
                      <span className="badge">{fmtMoney(m.balance)}</span>
                    </td>

                    <td>
                      <span className="badge">{fmtMoney(m.locked_balance)}</span>
                    </td>

                    <td>{m.sponsor_short_id || "-"}</td>

                    <td>
                      <span className="badge">{m.approval_status}</span>

                      {me?.role === "owner" && m.approval_status === "pending" && (
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn"
                            type="button"
                            onClick={() => approveMember(m.id)}
                            style={{ padding: "6px 10px" }}
                          >
                            Approve
                          </button>

                          <button
                            className="btn"
                            type="button"
                            onClick={() => rejectMember(m.id)}
                            style={{
                              padding: "6px 10px",
                              background: "#dc2626",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => openWallet(m)}
                        style={{ padding: "6px 10px" }}
                      >
                        Wallet
                      </button>
                    </td>

                    <td>
                      {canReview ? (
                        <button
                          className="btn"
                          type="button"
                          onClick={() => openEdit(m)}
                          style={{ padding: "6px 10px" }}
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="small">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!list.length && (
                  <tr>
                    <td colSpan="11" className="small">
                      No members yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ EDIT MODAL */}
        {editOpen && (
          <div
            onClick={closeEdit}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 14,
              zIndex: 2600,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(680px, 98vw)",
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                boxShadow: "var(--shadow)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--soft)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>
                    Edit Member — {editForm.nickname || "-"} ({editForm.short_id || "-"})
                  </div>
                  <div className="small">Update basic profile and permissions.</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" type="button" onClick={closeEdit} disabled={busy}>
                    Close
                  </button>
                </div>
              </div>

              <div style={{ padding: 14, display: "grid", gap: 10 }}>
                {editErr && <div className="error">{editErr}</div>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="small">Nickname</div>
                    <input
                      className="input"
                      value={editForm.nickname}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, nickname: e.target.value }))
                      }
                      disabled={busy}
                    />
                  </div>

                  <div>
                    <div className="small">Phone</div>
                    <input
                      className="input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                      disabled={busy}
                    />
                  </div>
                </div>

                <div>
                  <div className="small">Country</div>
                  <input
                    className="input"
                    value={editForm.country}
                    onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))}
                    disabled={busy}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="small">Ranking</div>
                    <select
                      className="input"
                      value={editForm.ranking}
                      onChange={(e) => setEditForm((p) => ({ ...p, ranking: e.target.value }))}
                      disabled={busy}
                    >
                      <option value="Trial">Trial</option>
                      <option value="V1">VIP 1</option>
                      <option value="V2">VIP 2</option>
                      <option value="V3">VIP 3</option>
                      <option value="V4">VIP 4</option>
                      <option value="V5">VIP 5</option>
                      <option value="V6">VIP 6</option>
                    </select>
                  </div>

                  <div>
                    <div className="small">Approval status</div>
                    <select
                      className="input"
                      value={editForm.approval_status}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, approval_status: e.target.value }))
                      }
                      disabled={busy}
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="small">Gender</div>
                    <select
                      className="input"
                      value={editForm.gender}
                      onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                      disabled={busy}
                    >
                      <option value="male">male</option>
                      <option value="female">female</option>
                      <option value="other">other</option>
                    </select>
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      background: "var(--bg)",
                      marginTop: 18,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editForm.withdraw_privilege}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, withdraw_privilege: e.target.checked }))
                      }
                      disabled={busy}
                    />
                    <span className="small" style={{ margin: 0 }}>
                      Withdraw enabled
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="btn" type="button" onClick={closeEdit} disabled={busy}>
                    Cancel
                  </button>
                  <button className="btn" type="button" onClick={saveEdit} disabled={busy}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Drawer */}
        {openMember && (
          <div
            onClick={closeWallet}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 14,
              zIndex: 2000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(980px, 98vw)",
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                boxShadow: "var(--shadow)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--soft)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>
                    Wallet — {openMember.nickname} ({openMember.short_id})
                  </div>
                  <div className="small">
                    Phone: {openMember.phone} • Sponsor: {openMember.sponsor_short_id || "-"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" type="button" disabled={busy} onClick={refreshAll}>
                    Refresh
                  </button>
                  <button className="btn" type="button" onClick={closeWallet}>
                    Close
                  </button>
                </div>
              </div>

              <div style={{ padding: 14 }}>
                {wErr && <div className="error">{wErr}</div>}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div className="card" style={{ margin: 0 }}>
                    <div className="small">Balance</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                      {wallet ? fmtMoney(wallet.balance) : busy ? "…" : "0.00"}
                    </div>
                  </div>

                  <div className="card" style={{ margin: 0 }}>
                    <div className="small">Locked</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                      {wallet ? fmtMoney(wallet.locked_balance) : busy ? "…" : "0.00"}
                    </div>
                  </div>

                  <div className="card" style={{ margin: 0 }}>
                    <div className="small">Status</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>
                      {openMember.approval_status}
                    </div>
                  </div>
                </div>

                {/* CREATE (owner only) */}
                {canReview && (
                  <div
                    className="card"
                    style={{
                      margin: 0,
                      marginBottom: 14,
                      background: "var(--soft)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0 }}>Create Requests</h3>
                      <div className="small">Owner only</div>
                    </div>
                    <div className="hr" />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 12,
                      }}
                    >
                      {/* Create Deposit */}
                      <div
                        style={{
                          padding: 12,
                          border: "1px solid var(--line)",
                          borderRadius: 12,
                          background: "var(--card)",
                        }}
                      >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Deposit (Pending)</div>

                        <div className="small" style={{ marginBottom: 6 }}>
                          Amount
                        </div>
                        <input
                          className="input"
                          value={depAmount}
                          onChange={(e) => setDepAmount(e.target.value)}
                          placeholder="e.g. 100"
                          disabled={busy}
                        />

                        <div className="small" style={{ marginTop: 10, marginBottom: 6 }}>
                          Method
                        </div>
                        <input
                          className="input"
                          value={depMethod}
                          onChange={(e) => setDepMethod(e.target.value)}
                          placeholder="Manual / USDT / Bank"
                          disabled={busy}
                        />

                        <div className="small" style={{ marginTop: 10, marginBottom: 6 }}>
                          TX Ref (optional)
                        </div>
                        <input
                          className="input"
                          value={depTxRef}
                          onChange={(e) => setDepTxRef(e.target.value)}
                          placeholder="Transaction reference"
                          disabled={busy}
                        />

                        <div className="small" style={{ marginTop: 10, marginBottom: 6 }}>
                          Proof URL (optional)
                        </div>
                        <input
                          className="input"
                          value={depProof}
                          onChange={(e) => setDepProof(e.target.value)}
                          placeholder="https://..."
                          disabled={busy}
                        />

                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <button
                            className="btn"
                            type="button"
                            disabled={busy}
                            onClick={createDeposit}
                          >
                            Create Deposit
                          </button>
                        </div>

                        <div className="small" style={{ marginTop: 8 }}>
                          Wallet balance changes only after <b>Approve</b>.
                        </div>
                      </div>

                      {/* Create Withdrawal */}
                      <div
                        style={{
                          padding: 12,
                          border: "1px solid var(--line)",
                          borderRadius: 12,
                          background: "var(--card)",
                        }}
                      >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Withdrawal (Pending)</div>

                        <div className="small" style={{ marginBottom: 6 }}>
                          Amount
                        </div>
                        <input
                          className="input"
                          value={wdAmount}
                          onChange={(e) => setWdAmount(e.target.value)}
                          placeholder="e.g. 50"
                          disabled={busy}
                        />

                        <div className="small" style={{ marginTop: 10, marginBottom: 6 }}>
                          Method
                        </div>
                        <input
                          className="input"
                          value={wdMethod}
                          onChange={(e) => setWdMethod(e.target.value)}
                          placeholder="Manual / Bank / USDT"
                          disabled={busy}
                        />

                        <div className="small" style={{ marginTop: 10, marginBottom: 6 }}>
                          Account details
                        </div>
                        <input
                          className="input"
                          value={wdAccount}
                          onChange={(e) => setWdAccount(e.target.value)}
                          placeholder="Bkash/Bank/USDT address"
                          disabled={busy}
                        />

                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <button
                            className="btn"
                            type="button"
                            disabled={busy}
                            onClick={createWithdrawal}
                          >
                            Create Withdrawal
                          </button>
                        </div>

                        <div className="small" style={{ marginTop: 8 }}>
                          On create: <b>balance ↓</b> and <b>locked ↑</b> immediately.
                          Reject returns it. Approve releases locked.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  {/* Deposits */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0 }}>Recent Deposits</h3>
                      <div className="small">Last 3</div>
                    </div>
                    <div className="hr" />

                    {!deps.length && <div className="small">No deposits.</div>}

                    {deps.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          padding: 10,
                          border: "1px solid var(--line)",
                          borderRadius: 12,
                          marginBottom: 10,
                          background: "var(--bg)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 800 }}>{fmtMoney(d.amount)}</div>
                          <span className="badge">{d.status}</span>
                        </div>
                        <div className="small">Method: {d.method} • TX: {d.tx_ref || "-"}</div>
                        <div className="small">
                          Created: {fmtDate(d.created_at)} • Reviewed:{" "}
                          {d.reviewed_at ? fmtDate(d.reviewed_at) : "-"}
                        </div>

                        {!!d.admin_note && (
                          <div className="small" style={{ marginTop: 6 }}>
                            Note: {d.admin_note}
                          </div>
                        )}

                        {canReview && d.status === "pending" && (
                          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <button
                              className="btn"
                              type="button"
                              disabled={busy}
                              onClick={() => actDeposit(d.id, "approve")}
                              style={{ padding: "6px 10px" }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn"
                              type="button"
                              disabled={busy}
                              onClick={() => actDeposit(d.id, "reject")}
                              style={{ padding: "6px 10px", background: "#dc2626" }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Withdrawals */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ margin: 0 }}>Recent Withdrawals</h3>
                      <div className="small">Last 3</div>
                    </div>
                    <div className="hr" />

                    {!wds.length && <div className="small">No withdrawals.</div>}

                    {wds.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          padding: 10,
                          border: "1px solid var(--line)",
                          borderRadius: 12,
                          marginBottom: 10,
                          background: "var(--bg)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 800 }}>{fmtMoney(w.amount)}</div>
                          <span className="badge">{w.status}</span>
                        </div>
                        <div className="small">Method: {w.method}</div>
                        <div className="small">Account: {w.account_details}</div>
                        <div className="small">
                          Created: {fmtDate(w.created_at)} • Reviewed:{" "}
                          {w.reviewed_at ? fmtDate(w.reviewed_at) : "-"}
                        </div>

                        {!!w.admin_note && (
                          <div className="small" style={{ marginTop: 6 }}>
                            Note: {w.admin_note}
                          </div>
                        )}

                        {canReview && w.status === "pending" && (
                          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <button
                              className="btn"
                              type="button"
                              disabled={busy}
                              onClick={() => actWithdrawal(w.id, "approve")}
                              style={{ padding: "6px 10px" }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn"
                              type="button"
                              disabled={busy}
                              onClick={() => actWithdrawal(w.id, "reject")}
                              style={{ padding: "6px 10px", background: "#dc2626" }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="small" style={{ marginTop: 10 }}>
                  Approvals + creation live inside the Wallet drawer to avoid clutter in the main
                  table.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
