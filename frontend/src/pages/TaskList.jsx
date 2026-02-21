import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/TaskList.css";
import memberApi from "../services/memberApi";

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

// ✅ Convert backend image path to a real browser URL
function toImageUrl(img) {
  if (!img) return "";

  const s = String(img).trim();
  if (!s) return "";

  // already absolute: http / https / data url
  if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s)) return s;

  // relative URL from backend: just prepend /
  return s.startsWith("/") ? s : `/${s}`;
}

// Keep your UI shape the same
function normalizeTaskRow(row) {
  return {
    id: String(row?.id ?? ""),
    title: row?.title || "Task",
    ref: row?.ref || "—",
    image: row?.image || "",
    difficulty: row?.difficulty || "—",
    reward: Number(row?.reward || 0),
    status: row?.status || "Active",
    createdAt: row?.createdAt || "-",
    steps: Array.isArray(row?.steps) ? row.steps : [],
  };
}

export default function TaskList() {
  const nav = useNavigate();
  const loc = useLocation();

  const [balance, setBalance] = useState(0);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadMe = async () => {
    try {
      const { data } = await memberApi.get("/member/me");
      setBalance(Number(data?.balance || 0));
    } catch {
      // ignore
    }
  };

const load = async () => {
  setLoading(true);
  setErr("");
  try {
    const r = await memberApi.get("/member/active-set");
    const d = r.data || null;

    if (!d?.active) {
      setTasks([]);
      return;
    }

    const currentIndex = Number(d.assignment?.current_task_index || 0);
    const totalTasks = Number(d.total_tasks || 0);
    const setName = d.set?.name || d.set?.id || "-";

    const rows = (Array.isArray(d.tasks) ? d.tasks : []).map((t, i) => {
      const qty = Number(t?.quantity ?? 1);
      const rate = Number(t?.rate ?? 0);
      const commissionRate = Number(t?.commission_rate ?? 0);

      const orderAmount = qty * rate;
      const commission = (orderAmount * commissionRate) / 100;

      // ✅ status by position
      const status =
        i < currentIndex ? "Completed" : i === currentIndex ? "Active" : "Pending";

      return normalizeTaskRow({
        id: t?.id ?? `SET-${d.set?.id ?? ""}-#${i + 1}`,
        title: t?.title || `Order ${i + 1}`,
        ref: d.sponsor_short_id || "—",
        image: toImageUrl(t?.image_url),
        difficulty: status, // or keep "Active"/"Pending"/"Completed"
        reward: commission,
        status,
        createdAt: d.assignment?.created_at
          ? new Date(d.assignment.created_at).toLocaleString()
          : "-",
        // optional: show serial info
        steps: [
          `SET-${setName} • Step ${i + 1}/${totalTasks}`,
          status === "Completed"
            ? "Already completed ✅"
            : status === "Active"
            ? "Current order (submit enabled)"
            : "Upcoming (locked until current is done)",
        ],
      });
    });

    setTasks(rows);
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || "Failed to load tasks";
    setErr(msg);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
      loadMe();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchText =
        !s ||
        String(t.id).toLowerCase().includes(s) ||
        String(t.title).toLowerCase().includes(s) ||
        String(t.ref).toLowerCase().includes(s);

      const matchFilter = filter === "All" ? true : t.status === filter;
      return matchText && matchFilter;
    });
  }, [tasks, q, filter]);

  return (
    <div className="tl-page">
      <header className="tl-topbar">
        <button className="tl-back" onClick={() => nav(-1)} type="button">
          ← Back
        </button>

        <div className="tl-title">
          <h1>Tasks</h1>
          <p>Review and manage assigned tasks</p>
        </div>

        <div className="tl-right">

          <button
            className="tl-ghost"
            type="button"
            onClick={async () => {
              await loadMe();
              await load();
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>
      </header>

      <main className="tl-wrap">
        <section className="tl-topGrid">
          <div className="tl-card tl-balance tl-balanceGold">
            <div className="tl-cardHead">
              <div>
                <div className="tl-kicker">Wallet Balance</div>
                <div className="tl-balanceRow">
                  <div className="tl-balanceValue">${money(balance)}</div>
                  <div className="tl-unit">USD</div>
                </div>
                <div className="tl-muted">Keep enough balance for task operations.</div>
              </div>

              <div className="tl-pill">Available</div>
            </div>

            <div className="tl-actions">
				<button className="mn-miniBtn" onClick={() => nav("/member/deposit")}>
				  Deposit
				</button>
				<button className="mn-miniBtn" onClick={() => nav("/member/withdraw")}>
				  Withdraw
				</button>              
              <button className="tl-mini" type="button" onClick={() => nav("/member/customerService")}>                
                Support
              </button>
            </div>
          </div>

          <div className="tl-card tl-rules">
            <div className="tl-cardTitle">Rules & Guidelines</div>
            <ul className="tl-list">
              <li>Each assigned task must be completed within <b>72 hours</b>.</li>
              <li>Always verify the <b>Order ID</b>, <b>Ref</b>, and required steps before submitting.</li>
              <li>Do not submit fake proof. Accounts may be restricted for violations.</li>
              <li>For issues, use <b>Customer Service</b> and provide screenshots if needed.</li>
            </ul>
            <div className="tl-note">Tip: complete tasks early to avoid urgent deadlines.</div>
          </div>
        </section>

        <section className="tl-controls">
          <div className="tl-searchWrap">
            <input
              className="tl-search"
              placeholder="Search by Task ID, Title, or Ref..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {err ? (
              <div className="tl-mutedSmall" style={{ marginTop: 8 }}>
                {err}
              </div>
            ) : null}
          </div>

<div className="tl-filters">
  <button
    className={"tl-filter " + (filter === "All" ? "is-active" : "")}
    onClick={() => setFilter("All")}
    type="button"
  >
    All
  </button>

  <button
    className={"tl-filter " + (filter === "Active" ? "is-active" : "")}
    onClick={() => setFilter("Active")}
    type="button"
  >
    Active
  </button>

  <button
    className={"tl-filter " + (filter === "Pending" ? "is-active" : "")}
    onClick={() => setFilter("Pending")}
    type="button"
  >
    Pending
  </button>

  <button
    className={"tl-filter " + (filter === "Completed" ? "is-active" : "")}
    onClick={() => setFilter("Completed")}
    type="button"
  >
    Completed
  </button>
</div>

          <div className="tl-count">
            Showing <b>{filtered.length}</b> / {tasks.length}
          </div>
        </section>

        <section className="tl-card tl-tableCard">
          <div className="tl-tableHead">
            <div className="tl-tableTitle">Task List</div>
            <div className="tl-mutedSmall">All tasks with status and details.</div>
          </div>

          <div className="tl-table">
            <div className="tl-row tl-rowHead">
              <div>Task</div>
              <div>Photo</div>
              <div>Status</div>
              <div>Reward</div>
              <div>Level</div>
              <div>Created</div>
              <div></div>
            </div>

            {filtered.map((t) => (
              <div key={t.id} className="tl-row">
                <div className="tl-taskCell">
                  <div className="tl-taskTitle">{t.title}</div>
                  <div className="tl-mutedSmall">
                    <span><b>{t.id}</b></span>
                    <span className="tl-dot">•</span>
                    <span>Ref: <b>{t.ref}</b></span>
                    <span className="tl-dot">•</span>
                    <span>{(t.steps || []).join(" • ")}</span>
                  </div>
                </div>

                <div className="tl-photoCell">
                  {t.image ? (
                    <img
                      src={t.image}
                      alt="task"
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }}
                      onError={(e) => {
                        console.log("IMAGE FAILED:", t.image);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="tl-photoPlaceholder">Your Product photo is here</div>
                  )}
                </div>

                <div
                  className={
                    "tl-status " +
                    (t.status === "Active"
                      ? "is-active"
                      : t.status === "Completed"
                      ? "is-completed"
                      : "is-pending")
                  }
                >
                  {t.status}
                </div>

                <div className="tl-reward">${money(t.reward)}</div>
                <div className="tl-level">{t.difficulty}</div>
                <div className="tl-created">{t.createdAt}</div>

                <div className="tl-open">

                <button
                  className={"tl-openBtn " + (t.status !== "Active" ? "is-disabled" : "")}
                  type="button"
                  disabled={t.status !== "Active"}
                  onClick={() =>
                    nav("/member/task-detail", {
                      state: {
                        tasks,                 // IMPORTANT: pass full list (serial), not filtered
                        index: tasks.findIndex((x) => x.id === t.id),
                        balance,
                        completedCount: 0,
                      },
                    })
                  }
                >
                  Open
                </button>

                </div>
              </div>
            ))}

            {!loading && tasks.length === 0 ? (
              <div className="tl-mutedSmall" style={{ padding: 16 }}>
                No active task found.
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <MemberBottomNav active="menu" />
    </div>
  );
}
