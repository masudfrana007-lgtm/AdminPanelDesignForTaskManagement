import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/MemberSetHistory.css";

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

function fmtGMT(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  const yyyy = d.getUTCFullYear();
  const hh = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  const ss = pad2(d.getUTCSeconds());
  return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss} (GMT)`;
}

function dateLabel(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  // group by UTC date to match fmtGMT
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

function durationLabel(startIso, endIso) {
  if (!startIso || !endIso) return "-";
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return "-";
  const sec = Math.floor((b - a) / 1000);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const SORTS = [
  { id: "finished_desc", label: "Newest Finished" },
  { id: "finished_asc", label: "Oldest Finished" },
  { id: "amount_desc", label: "Highest Amount" },
  { id: "amount_asc", label: "Lowest Amount" },
];

export default function MemberSetHistory() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("finished_desc");
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await memberApi.get("/member/history");
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || e?.message || "Failed to load set history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Filter + sort
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    let list = rows.slice();

    if (needle) {
      list = list.filter((x) => String(x.set_name || "").toLowerCase().includes(needle));
    }

    const getAmount = (x) => Number(x.set_amount || 0);
    const getFinished = (x) => new Date(x.updated_at || 0).getTime() || 0;

    list.sort((a, b) => {
      if (sort === "finished_desc") return getFinished(b) - getFinished(a);
      if (sort === "finished_asc") return getFinished(a) - getFinished(b);
      if (sort === "amount_desc") return getAmount(b) - getAmount(a);
      if (sort === "amount_asc") return getAmount(a) - getAmount(b);
      return 0;
    });

    return list;
  }, [rows, q, sort]);

  // ✅ Summary stats
  const summary = useMemo(() => {
    const totalSets = filtered.length;
    const totalVolume = filtered.reduce((s, x) => s + Number(x.set_amount || 0), 0);
    const totalTasks = filtered.reduce((s, x) => s + Number(x.total_tasks || 0), 0);

    // best day (group by finished day)
    const map = new Map();
    for (const x of filtered) {
      const key = dateLabel(x.updated_at);
      map.set(key, (map.get(key) || 0) + Number(x.set_amount || 0));
    }
    let bestDay = "-";
    let bestDayVol = 0;
    for (const [k, v] of map.entries()) {
      if (v > bestDayVol) {
        bestDayVol = v;
        bestDay = k;
      }
    }

    return { totalSets, totalVolume, totalTasks, bestDay, bestDayVol };
  }, [filtered]);

  // ✅ Group by finished date (based on updated_at)
  const grouped = useMemo(() => {
    const groups = new Map();
    for (const x of filtered) {
      const key = dateLabel(x.updated_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(x);
    }

    // keep order of groups based on current sort
    // if sort is finished_desc -> group keys desc, else asc
    const keys = Array.from(groups.keys()).sort((a, b) => {
      if (sort === "finished_asc") return a.localeCompare(b);
      // default: newest first
      return b.localeCompare(a);
    });

    return keys.map((k) => ({ date: k, items: groups.get(k) }));
  }, [filtered, sort]);

  return (
    <div className="msh-page">
      {/* TOP BAR */}
      <header className="msh-top">
        <button className="msh-back" type="button" onClick={() => nav(-1)}>
          ←
        </button>

        <div className="msh-head">
          <div className="msh-title">Set History</div>
          <div className="msh-sub">
            Completed sets • Finished time uses <b>updated_at</b>
          </div>
        </div>

        <button className="msh-refresh" type="button" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <section className="msh-summary">
        <div className="msh-card">
          <div className="msh-cardLabel">Completed Sets</div>
          <div className="msh-cardValue">{loading ? "—" : summary.totalSets}</div>
          <div className="msh-cardHint">Filtered by your search</div>
        </div>

        <div className="msh-card">
          <div className="msh-cardLabel">Total Task Count</div>
          <div className="msh-cardValue">{loading ? "—" : summary.totalTasks}</div>
          <div className="msh-cardHint">Across completed sets</div>
        </div>

        <div className="msh-card msh-cardAccent">
          <div className="msh-cardLabel">Total Volume</div>
          <div className="msh-cardValue">{loading ? "—" : `$${money(summary.totalVolume)}`}</div>
          <div className="msh-cardHint">
            Best day: <b>{summary.bestDay === "-" ? "—" : summary.bestDay}</b>
            {summary.bestDayVol ? ` • $${money(summary.bestDayVol)}` : ""}
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="msh-controls">
        <div className="msh-searchWrap">
          <span className="msh-searchIcon">⌕</span>
          <input
            className="msh-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by set name…"
          />
          {q ? (
            <button className="msh-clear" type="button" onClick={() => setQ("")}>
              ✕
            </button>
          ) : null}
        </div>

        <div className="msh-sortWrap">
          <span className="msh-sortLabel">Sort</span>
          <select className="msh-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* LIST */}
      <main className="msh-main">
        {loading ? (
          <div className="msh-skeletonList">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="msh-skeleton" key={i} />
            ))}
          </div>
        ) : err ? (
          <div className="msh-empty">
            <div className="msh-emptyTitle">Couldn’t load history</div>
            <div className="msh-emptyText">{err}</div>
            <button className="msh-emptyBtn" onClick={load} type="button">
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="msh-empty">
            <div className="msh-emptyTitle">No completed sets found</div>
            <div className="msh-emptyText">
              {q ? "Try a different search keyword." : "Complete a set and it will show up here."}
            </div>
          </div>
        ) : (
          <div className="msh-groups">
            {grouped.map((g) => (
              <section className="msh-group" key={g.date}>
                <div className="msh-groupHead">
                  <div className="msh-groupDate">{g.date}</div>
                  <div className="msh-groupMeta">
                    {g.items.length} set{g.items.length > 1 ? "s" : ""} • $
                    {money(g.items.reduce((s, x) => s + Number(x.set_amount || 0), 0))}
                  </div>
                </div>

                <div className="msh-list">
                  {g.items.map((x) => {
                    const id = x.id;
                    const isOpen = openId === id;

                    const startedAt = x.created_at;
                    const finishedAt = x.updated_at; // ✅ your rule
                    const dur = durationLabel(startedAt, finishedAt);

                    const totalTasks = Number(x.total_tasks || 0);
                    const setAmount = Number(x.set_amount || 0);

                    return (
                      <div className={"msh-item " + (isOpen ? "is-open" : "")} key={id}>
                        <button
                          className="msh-itemTop"
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : id)}
                        >
                          <div className="msh-itemLeft">
                            <div className="msh-itemName">{x.set_name || "Set"}</div>
                            <div className="msh-itemSub">
                              <span className="msh-pill ok">Completed</span>
                              <span className="msh-dot">•</span>
                              <span>{totalTasks} tasks</span>
                              <span className="msh-dot">•</span>
                              <span>Duration {dur}</span>
                            </div>
                          </div>

                          <div className="msh-itemRight">
                            <div className="msh-amount">${money(setAmount)}</div>
                            <div className="msh-finished">Finished {fmtGMT(finishedAt)}</div>
                            <div className="msh-chevron">{isOpen ? "▴" : "▾"}</div>
                          </div>
                        </button>

                        {isOpen ? (
                          <div className="msh-itemBody">
                            <div className="msh-kvGrid">
                              <div className="msh-kv">
                                <div className="msh-k">Set ID</div>
                                <div className="msh-v">#{x.id}</div>
                              </div>

                              <div className="msh-kv">
                                <div className="msh-k">Tasks</div>
                                <div className="msh-v">{totalTasks}</div>
                              </div>

                              <div className="msh-kv">
                                <div className="msh-k">Started</div>
                                <div className="msh-v">{fmtGMT(startedAt)}</div>
                              </div>

                              <div className="msh-kv">
                                <div className="msh-k">Finished</div>
                                <div className="msh-v">{fmtGMT(finishedAt)}</div>
                              </div>

                              <div className="msh-kv msh-kvWide">
                                <div className="msh-k">Set Amount</div>
                                <div className="msh-v msh-vBig">${money(setAmount)}</div>
                              </div>
                            </div>

                            <div className="msh-note">
                              Tip: “Finished” time comes from <b>member_sets.updated_at</b> when status is completed.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <MemberBottomNav active="mine" />
    </div>
  );
}
