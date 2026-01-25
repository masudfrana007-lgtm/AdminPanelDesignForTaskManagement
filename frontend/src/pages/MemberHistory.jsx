import { useEffect, useState } from "react";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberHistory.css";

export default function MemberHistory() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const [hist, sum] = await Promise.all([
        memberApi.get("/member/history"),
        memberApi.get("/member/history-summary"),
      ]);

      setRows(hist.data || []);
      setSummary(sum.data);
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
          <h2 className="historyTitle">History & Earnings</h2>
          <div className="historySub">
            Daily · Weekly · Lifetime performance
          </div>
        </div>

        {err && <div className="historyAlert error">{err}</div>}

        {/* ================= SUMMARY GLASS CARDS ================= */}
        {summary && (
          <div className="historySummary">
            {[
              {
                title: "Today",
                sets: summary.today_sets,
                tasks: summary.today_tasks,
                amount: summary.today_commission,
              },
              {
                title: "This Week",
                sets: summary.week_sets,
                tasks: summary.week_tasks,
                amount: summary.week_commission,
              },
              {
                title: "Lifetime",
                sets: summary.lifetime_sets,
                tasks: summary.lifetime_tasks,
                amount: summary.lifetime_commission,
              },
            ].map((s) => (
              <div key={s.title} className="summaryCard">
                <div className="summaryTitle">{s.title}</div>

                <div className="summaryGrid">
                  <div>
                    <div className="summaryLabel">Sets</div>
                    <div className="summaryValue">{s.sets}</div>
                  </div>

                  <div>
                    <div className="summaryLabel">Tasks</div>
                    <div className="summaryValue">{s.tasks}</div>
                  </div>

                  <div>
                    <div className="summaryLabel">Commission</div>
                    <div className="summaryValue strong">
                      {Number(s.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= COMPLETED SETS ================= */}
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

      <MemberBottomNav active="record" />
    </div>
  );
}
