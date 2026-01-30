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

  // drawer state
  const [openMember, setOpenMember] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [deps, setDeps] = useState([]);
  const [wds, setWds] = useState([]);
  const [wErr, setWErr] = useState("");
  const [busy, setBusy] = useState(false);

  const canReview = me?.role === "owner"; // only owner approves

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

  const actDeposit = async (id, action) => {
    setWErr("");
    setBusy(true);
    try {
      await api.patch(`/deposits/${id}/${action}`, { admin_note: null });
      await openWallet(openMember);
      await load(); // update balances in table
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
      await openWallet(openMember);
      await load();
    } catch (e) {
      setWErr(e?.response?.data?.message || `Withdrawal ${action} failed`);
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

          <table className="table">
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
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
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
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td colSpan="10" className="small">
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

                <button className="btn" type="button" onClick={closeWallet}>
                  Close
                </button>
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
                  This layout avoids clutter: approvals live inside the Wallet drawer, not inside the table.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
