// src/pages/Members.jsx (list + filters + wallet redirect)
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";
import { Link, useNavigate } from "react-router-dom";

const RANKS = ["Trial", "V1", "V2", "V3"];
const STATUSES = ["pending", "approved", "rejected"];

const fmtMoney = (v) => {
  const n = Number(v || 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
};

function norm(s) {
  return String(s ?? "").trim();
}

function toTs(x) {
  // supports created_at / createdAt values (ISO or timestamp)
  if (!x) return 0;
  if (typeof x === "number") return x;
  const t = Date.parse(String(x));
  return Number.isFinite(t) ? t : 0;
}

export default function Members() {
  const me = getUser();
  const nav = useNavigate();

  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canReview = me?.role === "owner";

  // -------------------------
  // Filters: draft -> apply
  // -------------------------
  const [draft, setDraft] = useState({
    q: "",
    ranking: "ALL",
    status: "ALL",
    sponsor: "ALL",
    sort: "created_desc", // created_desc | created_asc
  });

  const [filters, setFilters] = useState(draft);

  const sponsorOptions = useMemo(() => {
    const set = new Set();
    for (const m of list) {
      const s = norm(m?.sponsor_short_id);
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  const load = async () => {
    setErr("");
    try {
      const { data } = await api.get("/members");
      setList(Array.isArray(data) ? data : []);
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

  const applyFilters = () => setFilters(draft);

  const resetFilters = () => {
    const clean = {
      q: "",
      ranking: "ALL",
      status: "ALL",
      sponsor: "ALL",
      sort: "created_desc",
    };
    setDraft(clean);
    setFilters(clean);
  };

  const filtered = useMemo(() => {
    const q = norm(filters.q).toLowerCase();

    let rows = [...list];

    // ranking
    if (filters.ranking !== "ALL") {
      rows = rows.filter((m) => norm(m?.ranking) === filters.ranking);
    }

    // status
    if (filters.status !== "ALL") {
      rows = rows.filter((m) => norm(m?.approval_status) === filters.status);
    }

    // sponsor
    if (filters.sponsor !== "ALL") {
      rows = rows.filter((m) => norm(m?.sponsor_short_id) === filters.sponsor);
    }

    // search text
    if (q) {
      rows = rows.filter((m) => {
        const hay = [
          m?.id,
          m?.short_id,
          m?.nickname,
          m?.phone,
          m?.sponsor_short_id,
        ]
          .map((x) => norm(x).toLowerCase())
          .join(" ");
        return hay.includes(q);
      });
    }

    // sort
    rows.sort((a, b) => {
      const ta = toTs(a?.created_at ?? a?.createdAt);
      const tb = toTs(b?.created_at ?? b?.createdAt);

      if (filters.sort === "created_asc") {
        // oldest first; if missing, fallback to id
        if (ta !== tb) return ta - tb;
        return Number(a?.id || 0) - Number(b?.id || 0);
      }

      // newest first (default)
      if (ta !== tb) return tb - ta;
      return Number(b?.id || 0) - Number(a?.id || 0);
    });

    return rows;
  }, [list, filters]);

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

        {/* ✅ FILTER BAR */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 260px", minWidth: 220 }}>
              <div className="label"> </div>
              <input
                className="input"
                placeholder="Search members..."
                value={draft.q}
                onChange={(e) => setDraft((s) => ({ ...s, q: e.target.value }))}
              />
            </div>

            <button className="btn" type="button" onClick={applyFilters}>
              Search
            </button>

            <button className="btn" type="button" onClick={resetFilters} style={{ opacity: 0.9 }}>
              Reset
            </button>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px", minWidth: 160 }}>
              <div className="label">Ranking</div>
              <select
                className="input"
                value={draft.ranking}
                onChange={(e) => setDraft((s) => ({ ...s, ranking: e.target.value }))}
              >
                <option value="ALL">All</option>
                {RANKS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 160px", minWidth: 160 }}>
              <div className="label">Status</div>
              <select
                className="input"
                value={draft.status}
                onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="ALL">All</option>
                {STATUSES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 200px", minWidth: 200 }}>
              <div className="label">Sponsor</div>
              <select
                className="input"
                value={draft.sponsor}
                onChange={(e) => setDraft((s) => ({ ...s, sponsor: e.target.value }))}
              >
                <option value="ALL">All</option>
                {sponsorOptions.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 220px", minWidth: 220 }}>
              <div className="label">Sort</div>
              <select
                className="input"
                value={draft.sort}
                onChange={(e) => setDraft((s) => ({ ...s, sort: e.target.value }))}
              >
                <option value="created_desc">Sort By Date Created (Newest)</option>
                <option value="created_asc">Sort By Date Created (Oldest)</option>
              </select>
            </div>
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            Showing <span className="badge">{filtered.length}</span> of{" "}
            <span className="badge">{list.length}</span>
          </div>
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
                {filtered.map((m) => (
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

                {!filtered.length && (
                  <tr>
                    <td colSpan="11" className="small">
                      No members match these filters.
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
