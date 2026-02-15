import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import "../styles/app.css";

export default function AssignSets() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [setId, setSetId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [allRows, setAllRows] = useState([]);

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get("/member-sets");
      const arr = Array.isArray(data) ? data : [];
      setAllRows(arr);
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || "Failed to load assignments");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const money = (v) => {
    if (v === null || v === undefined) return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toFixed(2);
  };

  const filteredRows = useMemo(() => {
    const sid = String(setId || "").trim();
    const mid = String(memberId || "").trim();

    return allRows.filter((r) => {
      const rSetId = String(r.id ?? "");
      const rMemberId = String(r.member_id ?? r.memberId ?? "");

      const okSet = !sid || rSetId === sid;
      const okMember = !mid || rMemberId === mid;

      return okSet && okMember;
    });
  }, [allRows, setId, memberId]);

  return (
    <AppLayout>
      <div className="assignsets-page">
        <style>{`
          .assignsets-page{
            min-width: 0;
            max-width: 100%;
            overflow-x: clip;
          }
          @supports not (overflow-x: clip) {
            .assignsets-page{ overflow-x: hidden; }
          }

          /* allow children to shrink */
          .assignsets-page .container,
          .assignsets-page .row,
          .assignsets-page .col,
          .assignsets-page .card{
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
          }

          /* ✅ filter bar: wrap nicely on mobile */
          .assignsets-page .filters{
            display: flex;
            gap: 12px;
            flex-wrap: wrap;        /* ✅ key */
            align-items: center;
            margin-bottom: 12px;
            min-width: 0;
          }
          .assignsets-page .filters .input{
            flex: 1 1 220px;        /* grow but wrap */
            min-width: 0;
          }
          .assignsets-page .filters .btn{
            flex: 0 0 auto;
          }

          /* on very small screens: buttons full width */
          @media (max-width: 520px){
            .assignsets-page .filters .btn{
              width: 100%;
            }
          }

          /* ✅ table scroll wrapper */
          .assignsets-page .table-scroll{
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }

          /* ensure table can overflow and wrapper scrolls */
          .assignsets-page .table-scroll table{
            width: 100% !important;
            min-width: 1100px;     /* this table has many columns -> wider min */
            max-width: none !important;
            table-layout: auto;
            border-collapse: collapse;
          }

          .assignsets-page .table-scroll th,
          .assignsets-page .table-scroll td{
            white-space: nowrap;
          }

          /* allow the "Username" / "Package" cells to be readable without forcing page width */
          .assignsets-page .wrapcell{
            white-space: normal !important;
            min-width: 240px;
          }
        `}</style>

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
            <div className="filters">
              <input
                type="text"
                className="input"
                placeholder="Filter by Set ID"
                value={setId}
                onChange={(e) => setSetId(e.target.value)}
              />

              <input
                type="text"
                className="input"
                placeholder="Filter by Member ID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              />

              <button className="btn" onClick={load}>
                Filter
              </button>

              <button
                className="btn secondary"
                onClick={() => {
                  setSetId("");
                  setMemberId("");
                }}
              >
                Reset
              </button>
            </div>

            <div className="hr" />
            {err && <div className="error">{err}</div>}

            {/* ✅ TABLE MUST be inside scroll wrapper */}
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>No.</th>
                    <th style={{ width: 190 }}>Created Date</th>
                    <th style={{ width: 150 }}>Username</th>
                    <th style={{ width: 190 }}>Package</th>
                    <th style={{ width: 130 }}>Status</th>
                    <th style={{ width: 190 }}>Updated Date</th>
                    <th style={{ width: 140 }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r, idx) => {
                    const isCompleted = r.status === "completed";
                    const lastCompleted = Number(r.current_task_index || 0);
                    const totalTasks = Number(r.total_tasks || 0);
                    const setAmount = money(r.set_amount);
                    const currentTaskAmount =
                      totalTasks > 0 ? money(r.current_task_amount) : "-";

                    return (
                      <tr key={r.id || idx}>
                        <td>{r.id}</td>
                        <td>{fmt(r.created_at)}</td>

                        {/* ✅ allow these cells to wrap nicely without blowing layout */}
                        <td className="wrapcell">
                          <div className="small">
                            <b>Member ID:</b> {r.member_id || "-"}
                          </div>
                          <div className="small">
                            <b>Phone:</b> {r.member_phone || "-"}
                          </div>
                          <div className="small">
                            <b>Nickname:</b> {r.member_nickname || "-"}
                          </div>
                        </td>

                        <td className="wrapcell">
                          <div className="small">
                            <b>Set Name:</b> {r.set_name || "-"}
                          </div>
                          <div className="small">
                            <b>Total Tasks:</b> {totalTasks || 0}
                          </div>
                          <div className="small">
                            <b>Set Amount:</b> {setAmount}
                          </div>
                          <div className="small">
                            <b>Last Completed Task #:</b> {lastCompleted}
                          </div>
                          <div className="small">
                            <b>Current Task Amount:</b>{" "}
                            {isCompleted ? "-" : currentTaskAmount}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              isCompleted ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {isCompleted ? "Completed" : "Active"}
                          </span>
                        </td>

                        <td>{fmt(r.updated_at)}</td>

                        <td>
                          <button className="btn small" disabled={isCompleted}>
                            Action
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!filteredRows.length && (
                    <tr>
                      <td colSpan="7" className="small">
                        No assigned sets yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="small" style={{ opacity: 0.7, marginTop: 8 }}>
              Tip: swipe left/right to see all columns.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
