import { useEffect, useMemo, useState } from "react";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberMenu.css"; // keep this path (we’ll replace CSS content)

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
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

// demo data (replace with backend later)
const DEMO_SLOTS = [
  {
    dateLabel: "Today",
    dateISO: "2026-01-28",
    task: {
      id: "TK-20481",
      title: "Order Verification",
      type: "Assigned Task",
      reward: 12.5,
      difficulty: "Medium",
      assignedAt: Date.now() - 2 * 60 * 60 * 1000 - 8 * 60 * 1000,
      steps: ["Open order detail", "Verify payment proof", "Mark as completed"],
      ref: "ORD-88912",
    },
  },
  { dateLabel: "Tomorrow", dateISO: "2026-01-29", task: null },
  { dateLabel: "Next Day", dateISO: "2026-01-30", task: null },
];

export default function MemberMenu() {
  const [balance, setBalance] = useState(97280.12);
  const [slots, setSlots] = useState(DEMO_SLOTS);

  // countdown tick
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const openTask = (task) => {
    alert(`Open task: ${task.id} (wire to your task detail page)`);
  };

  const applyForDate = (slot) => {
    const now = Date.now();
    const newTask = {
      id: "TK-" + Math.floor(10000 + Math.random() * 90000),
      title: "Order Completion",
      type: "Applied Task",
      reward: 10.0,
      difficulty: "Easy",
      assignedAt: now,
      steps: ["Open assigned order", "Complete required action", "Submit proof"],
      ref: "AUTO-" + Math.floor(1000 + Math.random() * 9000),
    };

    setSlots((prev) =>
      prev.map((s) => (s.dateISO === slot.dateISO ? { ...s, task: newTask } : s))
    );
  };

  const completeTask = (slot) => {
    alert(`Complete task for ${slot.dateLabel} (wire to submit flow)`);
  };

  const stats = useMemo(() => {
    const assigned = slots.filter((s) => !!s.task).length;
    const pending = slots.filter((s) => {
      if (!s.task) return false;
      const remaining = 24 * 3600 * 1000 - (tick - s.task.assignedAt);
      return remaining > 0;
    }).length;

    return { assigned, pending };
  }, [slots, tick]);

  return (
    <div className="mn-page">
      {/* Header */}
      <header className="mn-header">
        <div className="mn-title">
          <h1>Menu</h1>
          <p>Assigned tasks & daily operations</p>
        </div>

        <button className="mn-ghostBtn" onClick={() => alert("Refresh (wire backend later)")}>
          Refresh
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
                <div className="mn-mValue ok">Active</div>
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
                  <div key={slot.dateISO} className="mn-slot mn-slotEmpty">
                    <div className="mn-slotLeft">
                      <div className="mn-slotDate">{slot.dateLabel}</div>
                      <div className="mn-mutedSmall">{slot.dateISO}</div>
                      <div className="mn-emptyText">No task assigned for this date.</div>
                    </div>

                    <div className="mn-slotRight">
                      <button className="mn-primaryBtn" onClick={() => applyForDate(slot)}>
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

              return (
                <div key={slot.dateISO} className={"mn-slot " + (urgent ? "is-urgent" : "")}>
                  <div className="mn-slotLeft">
                    <div className="mn-slotDateRow">
                      <div className="mn-slotDate">{slot.dateLabel}</div>
                      <span className="mn-chip">{task.type}</span>
                      <span className={"mn-chip " + (expired ? "bad" : urgent ? "warn" : "ok")}>
                        {expired ? "Expired" : urgent ? "Urgent" : "Active"}
                      </span>
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

                    <div className="mn-rightBtns">
                      <button className="mn-secondaryBtn" onClick={() => openTask(task)}>
                        Open Task
                      </button>
                      <button
                        className="mn-primaryBtn"
                        onClick={() => completeTask(slot)}
                        disabled={expired}
                        title={expired ? "Task expired" : "Submit completion"}
                      >
                        Complete
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

      {/* ✅ Keep bottom bar exactly as you already use it */}
      <MemberBottomNav active="menu" />
    </div>
  );
}
