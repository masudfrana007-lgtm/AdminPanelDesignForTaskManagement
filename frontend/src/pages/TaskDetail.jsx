import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TaskDetail.css";
import memberApi from "../services/memberApi";

function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
}

function pad2(x) {
  return String(x).padStart(2, "0");
}

// ✅ mm/dd/yyyy hh:mm:ss (GMT)
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

function toImageUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base = import.meta.env.VITE_API_URL || "http://localhost:5010";
  return base.replace(/\/$/, "") + (src.startsWith("/") ? src : `/${src}`);
}

export default function TaskDetail() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // live payload
  const [activeSet, setActiveSet] = useState(null);

  // UI tabs
  const [tab, setTab] = useState("active");
  const [completed, setCompleted] = useState([]);

  // overlay
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ UI navigation index (Prev/Next changes this only)
  const [viewIndex, setViewIndex] = useState(0);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await memberApi.get("/member/active-set");
      setActiveSet(r.data || null);
    } catch (e) {
      setActiveSet(null);
      setErr(e?.response?.data?.message || e?.message || "Failed to load active order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ must come from backend now
  const tasks = Array.isArray(activeSet?.tasks) ? activeSet.tasks : [];

  const currentIndex = Number(activeSet?.assignment?.current_task_index || 0);
  const totalTasks = Number(activeSet?.total_tasks || tasks.length || 0);

  // ✅ keep the viewed task synced to current task when backend changes
  useEffect(() => {
    if (!Number.isFinite(currentIndex)) return;
    setViewIndex(currentIndex);
  }, [currentIndex]);

  // bounds
  const canPrev = viewIndex > 0;
  const canNext = viewIndex < tasks.length - 1;

  // ✅ only current task can be submitted
  const isCurrentTask = viewIndex === currentIndex;

  // ✅ show the task at viewIndex (not only current_task)
  const t = tasks[viewIndex] || null;

  // ✅ map backend -> UI (for the currently viewed task)
  const task = useMemo(() => {
    if (!activeSet?.active || !t) return null;

    return {
      id: String(t.id),
      title: t.title || "Order",
      description: t.description || "",
      image: toImageUrl(t.image_url),

      qty: Number(t.quantity || 1),
      unitPrice: Number(t.rate || 0), // rate is unit price
      commissionRate: Number(t.commission_rate || 0),

      assignedAt: activeSet.assignment?.created_at || null,
      sponsorRef: activeSet.sponsor_short_id || "—",
      setId: activeSet.set?.name ?? null,

      // ✅ this is the viewed step number (UI)
      stepNo: viewIndex + 1,
      totalTasks,
    };
  }, [activeSet, t, viewIndex, totalTasks]);

  const orderAmount = task ? task.qty * task.unitPrice : 0;
  const taskProfit = task ? (orderAmount * task.commissionRate) / 100 : 0;

// ✅ Total Profit from API-completed orders (tasks before currentIndex)
const totalProfit = useMemo(() => {
  if (!Array.isArray(tasks) || currentIndex <= 0) return 0;

  return tasks.slice(0, currentIndex).reduce((sum, ct) => {
    const qty = Number(ct.quantity || 1);
    const unitPrice = Number(ct.rate || 0);
    const amount = qty * unitPrice;
    const profit = (amount * Number(ct.commission_rate || 0)) / 100;
    return sum + profit;
  }, 0);
}, [tasks, currentIndex]);
  

  // ✅ completed count is backend progress, not the UI viewIndex
  const completedCount = currentIndex;

  // ✅ UI only: submit animation, no backend call here
  const submit = () => {
    // 🔒 only allow submit if viewing the current task
    if (!task || isLoading || !isCurrentTask) return;

    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setIsSuccess(true);

          setCompleted((prev) => {
            // avoid duplicates
            if (prev.some((x) => x.id === task.id)) return prev;
            return [
              {
                id: task.id,
                title: task.title,
                profit: taskProfit,
                amount: orderAmount,
                time: fmtGMT(new Date().toISOString()),
              },
              ...prev,
            ];
          });

          return 100;
        }
        return p + 4;
      });
    }, 200);
  };

  // ✅ Prev / Next: only change UI viewIndex (NO backend)
  const goPrevUI = () => {
    if (isLoading) return;
    if (canPrev) setViewIndex((i) => i - 1);
  };

  const goNextUI = () => {
    if (isLoading) return;
    if (canNext) setViewIndex((i) => i + 1);
  };

  // ✅ ONLY place that completes current task in backend
  const proceedToNextTask = async () => {
    if (isLoading) return;
    try {
      await memberApi.post("/member/complete-task", {});
      setIsSuccess(false);
      await load(); // this will update currentIndex + tasks + sync viewIndex
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to complete Order");
    }
  };

  if (loading && !activeSet) {
    return (
      <div className="td-page" style={{ padding: 16 }}>
        Loading...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="td-page" style={{ padding: 16 }}>
        <button className="td-back" onClick={() => nav(-1)} type="button">
          ←
        </button>
        <div style={{ marginTop: 10 }}>{err || "No active order."}</div>
      </div>
    );
  }

  // Optional: label for viewed task status
  const viewedStatusText = isCurrentTask
    ? "Current Order"
    : viewIndex < currentIndex
    ? "Completed"
    : "Locked";

  return (
    <div className="td-page">
      {/* HEADER */}
      <header className="td-top">
        <button className="td-back" onClick={() => nav(-1)} disabled={isLoading} type="button">
          ←
        </button>

        <div className="td-tabs">
          <button
            className={"td-tab " + (tab === "active" ? "is-active" : "")}
            type="button"
            onClick={() => setTab("active")}
            disabled={isLoading}
          >
            Active Order
          </button>

          <button
            className={"td-tab " + (tab === "completed" ? "is-active" : "")}
            type="button"
            onClick={() => setTab("completed")}
            disabled={isLoading}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="td-balance">
          <div className="td-balanceBlock">
            <span className="td-balanceLabel">This Order Profit</span>
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
		{tab === "completed" ? (
		  <section className="td-card">
		    <div className="td-cardTop">
		      <div className="td-date">Completed Order History</div>
		      <span className="td-status is-ok">Completed</span>
		    </div>

		    {/* ✅ API-based completed tasks: tasks[0 .. currentIndex-1] */}
		    {currentIndex <= 0 ? (
		      <div className="td-empty">No completed orders yet.</div>
		    ) : (
		      <div className="td-completedList">
		        {tasks.slice(0, currentIndex).map((ct, idx) => {
		          const qty = Number(ct.quantity || 1);
		          const unitPrice = Number(ct.rate || 0);
		          const amount = qty * unitPrice;
		          const profit = (amount * Number(ct.commission_rate || 0)) / 100;

		          return (
		            <div key={ct.id} className="td-completedItem">
		              <div className="td-ciMain">
		                <div className="td-ciTitle">{ct.title || `Order ${idx + 1}`}</div>
		                <div className="td-ciMeta">
		                  <span>
		                    <b>{ct.id}</b>
		                  </span>
		                  <span className="td-ciDot">•</span>
		                  <span>
		                    SET-{activeSet?.set?.name ?? "-"}-#{idx + 1} / {totalTasks}
		                  </span>
		                </div>
		              </div>

		              <div className="td-ciRight">
		                <div className="td-ciAmount">${money(amount)}</div>
		                <div className="td-ciProfit">+${money(profit)}</div>
		              </div>
		            </div>
		          );
		        })}
		      </div>
		    )}
		  </section>		          
        ) : (
          <section className="td-card">
            <div className="td-cardTop">
              <div className="td-date">{fmtGMT(task.assignedAt)}</div>
              <span className="td-status">{viewedStatusText}</span>
            </div>

            <div className="td-title">{task.title}</div>
            {task.description ? <div className="td-desc">{task.description}</div> : null}

            <div className="td-summary" style={{ marginTop: 10 }}>
              <div className="td-row">
                <span>Ref</span>
                <span className="td-strong">{task.sponsorRef}</span>
              </div>
              <div className="td-row">
                <span>Set / Step</span>
                <span className="td-strong">
                  SET-{task.setId}-#{task.stepNo} / {task.totalTasks}
                </span>
              </div>
            </div>

            <div className="td-productRow">
              <div className="td-imageWrap">
                {task.image ? (
                  <img className="td-image" src={task.image} alt="order" />
                ) : (
                  <div className="td-imagePlaceholder">Your product image will appear here</div>
                )}
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
                    <div className="td-value">${money(orderAmount)}</div>
                  </div>
                </div>

                <div className="td-summary">
                  <div className="td-row">
                    <span>Estimated Order Commission</span>
                    <span className="td-commission">+${money(taskProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="td-actions">
              <button
                className="td-submit"
                onClick={submit}
                disabled={isLoading || !isCurrentTask}
                type="button"
              >
                Submit Order
              </button>

              {!isCurrentTask ? (
                <div className="td-hint">Submit is enabled only for the current order.</div>
              ) : (
                <div className="td-hint">Please wait while the system verifies and processes this order.</div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* BOTTOM BAR */}
      <footer className="td-bottomBar">
        <div>
          <div className="td-progressTitle">Orders Completed</div>
          <div className="td-progressValue">
            {completedCount} / {task.totalTasks}
          </div>
        </div>

        {/* ✅ bottom-right: Previous + Next side by side */}
        <div className="td-navBtns">
          <button
            className="td-navBtn"
            onClick={goPrevUI}
            disabled={isLoading || !canPrev}
            type="button"
          >
            ← Previous
          </button>

          <button
            className="td-navBtn is-primary"
            onClick={goNextUI}
            disabled={isLoading || !canNext}
            type="button"
          >
            Next →
          </button>
        </div>
      </footer>

      {isLoading && (
        <div className="td-overlay">
          <div className="td-loader"></div>
          <div className="td-loadingText">Processing order, please wait…</div>
          <div className="td-progressBar">
            <div className="td-progressFill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="td-overlay success">
          <div className="td-successCard">
            <h2>Order Successfully Completed</h2>
            <p>The commission has been recorded.</p>

            <div className="td-successMeta">
              <div>
                <div className="td-smLabel">Order Profit</div>
                <div className="td-smValue">+${money(taskProfit)}</div>
              </div>
              <div>
                <div className="td-smLabel">Order Amount</div>
                <div className="td-smValue">${money(orderAmount)}</div>
              </div>
            </div>

            <div className="td-successBtns">
              <button
                className="td-finishBtn"
                onClick={() => {
                  setIsSuccess(false);
                  setTab("completed");
                  proceedToNextTask();
                }}
                type="button"
              >
                View Completed
              </button>

              {/* ✅ ONLY this button completes backend task */}
              <button className="td-finishBtn is-next" onClick={proceedToNextTask} type="button">
                Proceed to Next Order →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
