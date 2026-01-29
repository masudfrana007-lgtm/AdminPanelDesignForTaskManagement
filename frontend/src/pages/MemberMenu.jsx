import { useEffect, useMemo, useState } from "react";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberMenu.css"; // keep this path
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi"; // ✅ use your existing axios instance

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

function formatRemaining(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function isExpired(ms) {
  return ms <= 0;
}

function toMs(d) {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : Date.now();
}

// keep the 3-slot UI the same
const EMPTY_SLOTS = [
  { dateLabel: "Today", dateISO: "—", task: null },
  { dateLabel: "Tomorrow", dateISO: "—", task: null },
  { dateLabel: "Next Day", dateISO: "—", task: null },
];

export default function MemberMenu() {
  const nav = useNavigate();
  const [balance, setBalance] = useState(97280.12); // keep as-is (wire later if you want)
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [activeSet, setActiveSet] = useState(null); // backend response
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);

  // countdown tick (keep same behavior)
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

useEffect(() => {
  (async () => {
    try {
      const r = await memberApi.get("/member/me");
      console.log("ME RESPONSE:", r.data); // ✅ check sponsor_short_id exists here
      setMe(r.data || null);
    } catch (e) {
      console.log("ME ERROR:", e?.response?.status, e?.response?.data || e.message);
      setMe(null);
    }
  })();
}, []);

  const loadActiveSet = async () => {
    setLoading(true);
    try {
      const r = await memberApi.get("/member/active-set");
      setActiveSet(r.data || null);

      // ✅ Keep same UI slots, but slot[0] represents the assigned SET (not individual tasks)
      if (r.data?.active) {
        const assignedAtMs = toMs(r.data.assignment?.created_at || Date.now());

        const totalTasks = Number(r.data.total_tasks || 0);
        const done = Number(r.data.assignment?.current_task_index || 0);
        const pendingTasks = Math.max(0, totalTasks - done);

        // show the set as a "task card" without changing layout
        const setTaskCard = {
          id: r.data.current_task?.id ?? `SET-${r.data.set?.id ?? ""}`,
          title: r.data.set?.name || "Assigned Set",
          type: "Assigned Set",
          reward: r.data.set_amount ?? 0, // keep same reward line, but show set amount
          difficulty: pendingTasks === 0 ? "Completed" : "Active",
          assignedAt: assignedAtMs,
          steps: [
            `Total tasks in set: ${totalTasks}`,
            `Pending tasks: ${pendingTasks}`,
            pendingTasks === 0 ? "Set is complete ✅" : "Open Task to continue the set",
          ],
          ref: me?.sponsor_short_id ?? "—",
        };

        setSlots((prev) => [
          {
            dateLabel: "Today",
            dateISO: new Date(assignedAtMs).toISOString().slice(0, 10),
            task: setTaskCard,
          },
          prev[1],
          prev[2],
        ]);
      } else {
        setSlots(EMPTY_SLOTS);
      }
    } catch (e) {
      // if error, keep UI but show as inactive
      setActiveSet({ active: false });
      setSlots(EMPTY_SLOTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTask = () => {
    // ✅ navigate to your task flow page (member/tasks)
    // You can use backend activeSet there to show current_task etc.
    nav("/member/tasks", {
      state: {
        balance,
      },
    });
  };

  // keep Apply button UI, but backend doesn't support it yet
  const applyForDate = () => {
    alert("No apply endpoint yet. Set is assigned by owner/agent.");
  };

  const stats = useMemo(() => {
    const totalTasks = Number(activeSet?.total_tasks || 0);
    const done = Number(activeSet?.assignment?.current_task_index || 0);
    const pendingTasks = activeSet?.active ? Math.max(0, totalTasks - done) : 0;

    return {
      assigned: activeSet?.active ? totalTasks : 0,
      pending: activeSet?.active ? pendingTasks : 0,
      statusText: activeSet?.active ? "Active" : "Inactive",
      statusClass: activeSet?.active ? "ok" : "bad",
    };
  }, [activeSet]);

  return (
    <div className="mn-page">
      {/* Header */}
      <header className="mn-header">
        <div className="mn-title">
          <h1>Menu</h1>
          <p>Assigned tasks & daily operations</p>
        </div>

        <button className="mn-ghostBtn" onClick={loadActiveSet} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <main className="mn-wrap">
        {/* Top row */}
        <section className="mn-topRow">
          {/* Balance */}
          <div className="mn-card mn-balance">
            <div className="mn-balanceHead">
              <div className="mn-kicker">Wallet Balance</div>
              <span className="mn-pill">Available</span>
            </div>

            <div className="mn-balanceAmount">
              <span className="mn-usd">${money(balance)}</span>
              <span className="mn-unit">USD</span>
            </div>

            <div className="mn-balanceSub">Keep enough balance for task operations.</div>

            <div className="mn-balanceActions">
              <button className="mn-miniBtn" onClick={() => alert("Open Deposit page")}>
                Deposit
              </button>
              <button className="mn-miniBtn" onClick={() => alert("Open Withdraw page")}>
                Withdraw
              </button>
              <button className="mn-miniBtn" onClick={() => setBalance((b) => b + 50)}>
                + Test
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mn-card mn-summary">
            <div className="mn-summaryTitle">Quick Summary</div>

            <div className="mn-summaryGrid">
              <div className="mn-metric">
                <div className="mn-mLabel">Assigned Slots</div>
                <div className="mn-mValue">{stats.assigned}</div>
              </div>
              <div className="mn-metric">
                <div className="mn-mLabel">Pending (24h)</div>
                <div className="mn-mValue">{stats.pending}</div>
              </div>
              <div className="mn-metric">
                <div className="mn-mLabel">Deadline Rule</div>
                <div className="mn-mValue">24 Hours</div>
              </div>
              <div className="mn-metric">
                <div className="mn-mLabel">Status</div>
                <div className={"mn-mValue " + stats.statusClass}>{stats.statusText}</div>
              </div>
            </div>

            <div className="mn-tip">
              Tip: Complete tasks early to avoid time pressure near the deadline.
            </div>
          </div>
        </section>

        {/* Task slots */}
        <section className="mn-card mn-slots">
          <div className="mn-sectionHead">
            <div>
              <div className="mn-sectionTitle">Your Tasks (by Date)</div>
              <div className="mn-muted">
                Tasks must be completed within <b>24 hours</b> after assignment.
              </div>
            </div>

            <button className="mn-ghostBtn" onClick={() => alert("Open Task History")}>
              History
            </button>
          </div>

          <div className="mn-slotList">
            {slots.map((slot) => {
              const task = slot.task;

              if (!task) {
                return (
                  <div key={slot.dateLabel} className="mn-slot mn-slotEmpty">
                    <div className="mn-slotLeft">
                      <div className="mn-slotDate">{slot.dateLabel}</div>
                      <div className="mn-mutedSmall">{slot.dateISO}</div>
                      <div className="mn-emptyText">No set assigned for this date.</div>
                    </div>

                    <div className="mn-slotRight">
                      <button className="mn-primaryBtn" onClick={applyForDate}>
                        Apply for Task
                      </button>
                      <div className="mn-mutedSmall">Apply to receive a task from the system.</div>
                    </div>
                  </div>
                );
              }

              const total = 24 * 3600 * 1000;
              const elapsed = tick - task.assignedAt;
              const remaining = total - elapsed;

              const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
              const urgent = remaining <= 2 * 3600 * 1000;
              const expired = isExpired(remaining);

              // ✅ set-based active/inactive indicator (requested)
              const isSetActive = !!activeSet?.active;
              const statusChipClass = isSetActive ? "ok" : "bad";
              const statusChipText = isSetActive ? "Active" : "Inactive";

              return (
                <div key={slot.dateLabel} className={"mn-slot " + (urgent ? "is-urgent" : "")}>
                  <div className="mn-slotLeft">
                    <div className="mn-slotDateRow">
                      <div className="mn-slotDate">{slot.dateLabel}</div>
                      <span className="mn-chip">{task.type}</span>
                      <span className={"mn-chip " + statusChipClass}>{statusChipText}</span>
                    </div>

                    <div className="mn-taskTitle">{task.title}</div>

                    <div className="mn-taskMeta">
                      <span>
                        Task ID: <b>{task.id}</b>
                      </span>
                      <span>
                        Ref: <b>{task.ref}</b>
                      </span>
                      <span>
                        Reward: <b>${money(task.reward)}</b>
                      </span>
                      <span>
                        Level: <b>{task.difficulty}</b>
                      </span>
                    </div>

                    <div className="mn-steps">
                      {task.steps.map((s, idx) => (
                        <div key={idx} className="mn-step">
                          <span className="mn-stepDot" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mn-slotRight">
                    <div className="mn-countTitle">Time Remaining</div>
                    <div className={"mn-count " + (expired ? "bad" : urgent ? "warn" : "")}>
                      {formatRemaining(remaining)}
                    </div>

                    <div className="mn-progress">
                      <div className="mn-progressBar" style={{ width: `${pct}%` }} />
                    </div>

                    {/* ✅ ONLY Open Task, full width */}
                    <div className="mn-rightBtns">
                      <button className="mn-secondaryBtn mn-openFull" onClick={openTask}>
                        Open Task
                      </button>
                    </div>

                    <div className="mn-mutedSmall">Deadline: 24h from assignment time.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info */}
        <section className="mn-card mn-info">
          <div className="mn-infoTitle">Important Information</div>
          <div className="mn-infoGrid">
            <div className="mn-infoItem">
              <div className="mn-infoH">24-hour deadline</div>
              <div className="mn-mutedSmall">Each assigned task must be completed within 24 hours.</div>
            </div>
            <div className="mn-infoItem">
              <div className="mn-infoH">Be accurate</div>
              <div className="mn-mutedSmall">Always verify order details before submitting completion.</div>
            </div>
            <div className="mn-infoItem">
              <div className="mn-infoH">Proof & notes</div>
              <div className="mn-mutedSmall">Some tasks may require screenshots or reference numbers.</div>
            </div>
            <div className="mn-infoItem">
              <div className="mn-infoH">Need help?</div>
              <div className="mn-mutedSmall">Use Customer Service if you face any issue completing a task.</div>
            </div>
          </div>
        </section>
      </main>

      {/* keep bottom bar exactly */}
      <MemberBottomNav active="menu" />
    </div>
  );
}
