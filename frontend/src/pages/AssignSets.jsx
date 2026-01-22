import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import "../styles/app.css";

export default function AssignSets() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      // Backend should return assignments list
      // If backend not ready, it will show empty
      const { data } = await api.get("/member-sets");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || "Failed to load assignments");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Manage Assign Sets</h2>
            <div className="small">
              Assign sets to members and track completion.
            </div>
          </div>

          <Link to="/assign-sets/create" className="btn">
            + Assign Set
          </Link>
        </div>

        <div className="card">
          <div className="small" style={{ marginBottom: 8 }}>
            Table layout like “Manage Set Orders”.
          </div>
          <div className="hr" />

          {err && <div className="error">{err}</div>}

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>No.</th>
                <th style={{ width: 190 }}>Created Date</th>
                <th>Username</th>
                <th>Package</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 190 }}>Updated Date</th>
                <th style={{ width: 140 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id || idx}>
                  <td>{idx + 1}</td>

                  <td>{fmt(r.created_at)}</td>

                  <td>
                    <div className="small">
                      <b>Member ID:</b> {r.member_short_id || r.member_id || "-"}
                    </div>
                    <div className="small">
                      <b>Phone:</b> {r.member_phone || "-"}
                    </div>
                    <div className="small">
                      <b>Nickname:</b> {r.member_nickname || "-"}
                    </div>
                  </td>

                  <td>
                    <div className="small">
                      <b>Set Name:</b> {r.set_name || "-"}
                    </div>
                    <div className="small">
                      <b>Total Tasks:</b> {r.total_tasks ?? "-"}
                    </div>
                    <div className="small">
                      <b>Set Amount:</b> {r.set_amount ?? "-"}
                    </div>
                    <div className="small">
                      <b>Last Completed Task #:</b>{" "}
                      {r.current_task_index ?? 0}
                    </div>
                    <div className="small">
                      <b>Current Task Amount:</b> {r.current_task_amount ?? "-"}
                    </div>
                  </td>

                  <td>
                    <span className="badge">
                      {r.status === "completed" ? "Completed" : "Active"}
                    </span>
                  </td>

                  <td>{fmt(r.updated_at)}</td>

                  <td>
                    <button className="btn small" disabled>
                      Action
                    </button>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan="7" className="small">
                    No assigned sets yet.
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
