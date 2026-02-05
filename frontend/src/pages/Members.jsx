// Members.jsx (ONLY show list + wallet redirect)
import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";
import { Link, useNavigate } from "react-router-dom";

const fmtMoney = (v) => {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
};

export default function Members() {
  const me = getUser();
  const nav = useNavigate();

  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canReview = me?.role === "owner";

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
                    <td>{m.id}</td>
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

                      {canReview && m.approval_status === "pending" && (
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
                        onClick={() => nav(`/members/${m.id}/wallet`)}
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
                          onClick={() => nav(`/members/${m.id}/edit`)}
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
      </div>
    </AppLayout>
  );
}
