import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";
import { Link } from "react-router-dom";

export default function Members() {
  const me = getUser();
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    const { data } = await api.get("/members");
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
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

  const reject = async (id) => {
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
              You are <span className="badge">{me.role}</span>
            </div>
          </div>

          <Link to="/members/create" className="btn">
            + Create Member
          </Link>
        </div>

        <div className="card">
          <h3>Members List</h3>
          <div className="small">
            Agent sees only their members. Owner sees own + members created by
            their agents.
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
                <th>Sponsor</th>
                <th>Status</th>
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

                  <td>{m.sponsor_short_id || "-"}</td>

                  <td>
                    <span className="badge">{m.approval_status}</span>

                    {me.role === "owner" && m.approval_status === "pending" && (
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => approve(m.id)}
                          style={{ padding: "6px 10px" }}
                        >
                          Approve
                        </button>

                        <button
                          className="btn"
                          type="button"
                          onClick={() => reject(m.id)}
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
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td colSpan="7" className="small">
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
