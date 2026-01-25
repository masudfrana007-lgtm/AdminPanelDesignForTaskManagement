import { useEffect, useState } from "react";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberHistory.css";

export default function MemberHistory() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await memberApi.get("/member/history");
      setRows(res.data || []);
    } catch {
      setErr("Failed to load history");
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
    <div className="historyPage">
      <div className="historyContent">
        <div className="historyHeader">
          <h2 className="historyTitle">Completed Packages</h2>
          <div className="historySub">Your finished sets & earnings</div>
        </div>

        {err && <div className="historyAlert error">{err}</div>}

        {!rows.length ? (
          <div className="historyCard">
            <div className="historyEmpty">No completed packages yet.</div>
          </div>
        ) : (
          rows.map((r, i) => (
            <div key={r.id} className="historyCard">
              <div className="historyTop">
                <div className="historyIndex">#{i + 1}</div>
                <div className="historyBadge">COMPLETED</div>
              </div>

              <div className="historyName">{r.set_name}</div>

              <div className="historyGrid">
                <div>
                  <div className="historyLabel">Total Tasks</div>
                  <div className="historyValue">{r.total_tasks}</div>
                </div>

                <div>
                  <div className="historyLabel">Set Amount</div>
                  <div className="historyValue strong">{r.set_amount}</div>
                </div>

                <div>
                  <div className="historyLabel">Completed At</div>
                  <div className="historyValue">{fmt(r.updated_at)}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <MemberBottomNav active="record" />
    </div>
  );
}
