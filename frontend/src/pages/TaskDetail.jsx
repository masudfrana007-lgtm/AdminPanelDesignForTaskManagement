import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/TaskDetail.css";

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function dtString(d = new Date()) {
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export default function TaskDetail() {
  const nav = useNavigate();
  const loc = useLocation();

  const demoTasks = useMemo(
    () =>
      Array.from({ length: 25 }).map((_, i) => ({
        id: "TK-" + (20000 + i),
        status: "Pending",
        title: ["Order Verification", "Payment Check", "Proof Review", "Account Review"][i % 4],
        qty: 1,
        unitPrice: 12900,
        commissionRate: 0.7,
      })),
    []
  );

  const tasks = loc.state?.tasks?.length ? loc.state.tasks : demoTasks;
  const balance = loc.state?.balance ?? 111.38;

  const [index, setIndex] = useState(loc.state?.index ?? 0);
  const [completedCount, setCompletedCount] = useState(loc.state?.completedCount ?? 0);

  // ✅ new: tab state + completed history
  const [tab, setTab] = useState("active"); // "active" | "completed"
  const [completed, setCompleted] = useState([]); // store completed task summaries

  // Loading / success
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const task = tasks[index];
  const totalAmount = task.qty * task.unitPrice;
  const taskProfit = (totalAmount * task.commissionRate) / 100;

  // totals
  const totalProfit = completed.reduce((sum, t) => sum + (t.profit || 0), 0);

  const canPrev = index > 0;
  const canNext = index < tasks.length - 1;

  const goPrev = () => !isLoading && canPrev && setIndex((i) => i - 1);

  const goNext = () => {
  const updatedTasks = tasks.map((t, i) =>
    i === index ? { ...t, status: "Completed" } : t
  );

  if (index < tasks.length - 1) {
    nav("/task-detail", {
      state: {
        tasks: updatedTasks,
        index: index + 1,
        balance,
        completedCount: completedCount + 1,
      },
      replace: true,
    });
  } else {
    // last task → go back to list
    nav("/tasks", {
      state: {
        tasks: updatedTasks,
        balance,
      },
      replace: true,
    });
  }
};


  const submit = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setIsSuccess(true);

          // ✅ mark completed (avoid duplicates)
          setCompleted((prev) => {
            const exists = prev.some((x) => x.id === task.id);
            if (exists) return prev;

            return [
              {
                id: task.id,
                title: task.title,
                profit: taskProfit,
                amount: totalAmount,
                time: dtString(),
              },
              ...prev,
            ];
          });

          setCompletedCount((c) => Math.min(tasks.length, c + 1));
          return 100;
        }
        return p + 4; // 5 seconds total
      });
    }, 200);
  };

  return (
    <div className="td-page">
      {/* HEADER */}
      <header className="td-top">
        <button
          className="td-back"
          onClick={() => nav(-1)}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.4 : 1 }}
          type="button"
        >
          ←
        </button>

        <div className="td-tabs">
          <button
            className={"td-tab " + (tab === "active" ? "is-active" : "")}
            type="button"
            onClick={() => setTab("active")}
            disabled={isLoading}
          >
            Active Tasks
          </button>

          <button
            className={"td-tab " + (tab === "completed" ? "is-active" : "")}
            type="button"
            onClick={() => setTab("completed")}
            disabled={isLoading}
          >
            Completed Tasks ({completed.length})
          </button>
        </div>

        {/* Top finance summary (responsive) */}
        <div className="td-balance">
          <div className="td-balanceBlock">
            <span className="td-balanceLabel">Main Balance</span>
            <span className="td-balanceValue">${money(balance)}</span>
          </div>

          <div className="td-balanceBlock">
            <span className="td-balanceLabel">Last Task Profit</span>
            <span className="td-balanceValue profit">+${money(taskProfit)}</span>
          </div>

          <div className="td-balanceBlock">
            <span className="td-balanceLabel">Total Profit (This Session)</span>
            <span className="td-balanceValue profit">${money(totalProfit)}</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="td-wrap">
        {/* ✅ Completed tab content */}
        {tab === "completed" ? (
          <section className="td-card">
            <div className="td-cardTop">
              <div className="td-date">Completed Task History</div>
              <span className="td-status is-ok">Completed</span>
            </div>

            {completed.length === 0 ? (
              <div className="td-empty">
                No completed tasks yet. Finish a task and it will appear here.
              </div>
            ) : (
              <div className="td-completedList">
                {completed.map((c) => (
                  <div key={c.id} className="td-completedItem">
                    <div className="td-ciMain">
                      <div className="td-ciTitle">{c.title}</div>
                      <div className="td-ciMeta">
                        <span><b>{c.id}</b></span>
                        <span className="td-ciDot">•</span>
                        <span>{c.time}</span>
                      </div>
                    </div>

                    <div className="td-ciRight">
                      <div className="td-ciAmount">${money(c.amount)}</div>
                      <div className="td-ciProfit">+${money(c.profit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ✅ Active tab content (your original block) */
          <section className="td-card">
            <div className="td-cardTop">
              <div className="td-date">{dtString()}</div>
              <span className="td-status">Pending Processing</span>
            </div>

            <div className="td-title">{task.title}</div>

            <div className="td-productRow">
              <div className="td-imageWrap">
                <div className="td-imagePlaceholder">Your product image will appear here</div>
              </div>

              <div className="td-metrics">
                <div className="td-grid">
                  <div className="td-box">
                    <div className="td-label">Quantity</div>
                    <div className="td-value">{task.qty}</div>
                  </div>
                  <div className="td-box">
                    <div className="td-label">Unit Price</div>
                    <div className="td-value">${money(task.unitPrice)}</div>
                  </div>
                  <div className="td-box">
                    <div className="td-label">Commission Rate</div>
                    <div className="td-value">{task.commissionRate}%</div>
                  </div>
                  <div className="td-box">
                    <div className="td-label">Order Amount</div>
                    <div className="td-value">${money(totalAmount)}</div>
                  </div>
                </div>

                <div className="td-summary">
                  <div className="td-row">
                    <span>Total Order Amount</span>
                    <span className="td-strong">${money(totalAmount)}</span>
                  </div>
                  <div className="td-row">
                    <span>Estimated Task Commission</span>
                    <span className="td-commission">+${money(taskProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="td-actions">
              <button className="td-submit" onClick={submit} disabled={isLoading} type="button">
                Submit Task
              </button>
              <div className="td-hint">Please wait while the system verifies and processes this task.</div>
            </div>
          </section>
        )}
      </main>

      {/* BOTTOM BAR */}
      <footer className="td-bottomBar">
        <div>
          <div className="td-progressTitle">Tasks Completed</div>
          <div className="td-progressValue">
            {completedCount} / {tasks.length}
          </div>
        </div>

        <div className="td-navBtns">
          <button className="td-navBtn" onClick={goPrev} disabled={!canPrev || isLoading} type="button">
            ← Previous
          </button>
          <button className="td-navBtn is-primary" onClick={goNext} disabled={!canNext || isLoading} type="button">
            Next →
          </button>
        </div>
      </footer>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="td-overlay">
          <div className="td-loader"></div>
          <div className="td-loadingText">Processing task, please wait…</div>

          <div className="td-progressBar">
            <div className="td-progressFill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY */}
      {isSuccess && (
        <div className="td-overlay success">
          <div className="td-confetti">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className="td-successCard">
            <h2>Task Successfully Completed</h2>
            <p>Your task has been processed successfully. The commission has been recorded.</p>

            <div className="td-successMeta">
              <div>
                <div className="td-smLabel">Task Profit</div>
                <div className="td-smValue">+${money(taskProfit)}</div>
              </div>
              <div>
                <div className="td-smLabel">Order Amount</div>
                <div className="td-smValue">${money(totalAmount)}</div>
              </div>
            </div>

            <div className="td-successBtns">
              <button className="td-finishBtn" onClick={() => { setIsSuccess(false); setTab("completed"); }} type="button">
                View Completed
              </button>
              <button className="td-finishBtn is-next" onClick={goNext} type="button">
                Proceed to Next Task →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}