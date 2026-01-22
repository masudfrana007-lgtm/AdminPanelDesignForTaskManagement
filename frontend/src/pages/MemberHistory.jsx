import { useEffect, useState } from "react";
import memberApi from "../services/memberApi";
import MemberLayout from "../components/MemberLayout";
import "../styles/app.css";

export default function MemberHistory() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await memberApi.get("/member/history");
      setRows(res.data || []);
    } catch (e) {
      setErr("Failed to load history");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  return (
    <MemberLayout>
      <div className="container" style={{ marginTop: 20 }}>
        <h2>Completed Sets</h2>
        <div className="small">Your finished packages</div>

        {err && <div className="error">{err}</div>}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Set Name</th>
                <th>Total Tasks</th>
                <th>Set Amount</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.set_name}</td>
                  <td>{r.total_tasks}</td>
                  <td>{r.set_amount}</td>
                  <td>{fmt(r.updated_at)}</td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan="5" className="small">No completed sets yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MemberLayout>
  );
}
