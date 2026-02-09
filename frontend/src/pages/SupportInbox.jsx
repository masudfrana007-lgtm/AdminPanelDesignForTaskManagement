import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // admin/owner/agent axios
import CsLayout from "../components/CsLayout";
import "../styles/app.css";

function fmt(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mi}`;
}

export default function SupportInbox() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get("/support/inbox");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load inbox");
      setRows([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CsLayout title="Support Inbox">
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button className="btn" type="button" onClick={load}>Reload</button>
          {err ? <div style={{ color: "#b91c1c" }}>{err}</div> : null}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Unread</th>
                <th>Last message</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.member_name || `Member #${r.member_id}`}</td>
                  <td>{r.member_phone || "-"}</td>
                  <td>{r.status}</td>
                  <td>
                    {Number(r.unread_count || 0) > 0 ? (
                      <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fee2e2" }}>
                        {r.unread_count}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.last_message || "-"}
                  </td>
                  <td>{fmt(r.last_message_at)}</td>
                  <td>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => nav(`/support/${r.id}`)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={7} style={{ padding: 14, opacity: 0.7 }}>
                    No conversations yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </CsLayout>
  );
}
