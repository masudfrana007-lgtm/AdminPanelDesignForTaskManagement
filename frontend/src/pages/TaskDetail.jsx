import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TaskDetail.css";
import memberApi from "../services/memberApi";

/* ---------------- utils ---------------- */

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
  return `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}/${d.getUTCFullYear()} ${pad2(
    d.getUTCHours()
  )}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} (GMT)`;
}

function toImageUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base = import.meta.env.VITE_API_URL || "http://localhost:5010";
  return base.replace(/\/$/, "") + (src.startsWith("/") ? src : `/${src}`);
}

/* ---------------- component ---------------- */

export default function TaskDetail() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [activeSet, setActiveSet] = useState(null);

  // UI navigation index (does NOT touch backend)
  const [viewIndex, setViewIndex] = useState(0);

  // submit overlay
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [completedLocal, setCompletedLocal] = useState([]);

  /* ---------------- load live data ---------------- */

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await memberApi.get("/member/active-set");
      setActiveSet(r.data || null);
    } catch (e) {
      setActiveSet(null);
      setErr(e?.response?.data?.message || "Failed to load active task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- derived state ---------------- */

  const tasks = activeSet?.tasks || [];
  const currentIndex = Number(activeSet?.assignment?.current_task_index || 0);
  const totalTasks = Number(activeSet?.total_tasks || tasks.length || 0);

  // always sync UI with backend progress
  useEffect(() => {
    setViewIndex(currentIndex);
  }, [currentIndex]);

  const canPrev = viewIndex > 0;
  const canNext = viewIndex < tasks.length - 1;
  const isCurrentTask = viewIndex === currentIndex;

  const t = tasks[viewIndex];

  const task = useMemo(() => {
    if (!activeSet?.active || !t) return null;

    return {
      id: t.id,
      title: t.title || "Task",
      description: t.description || "",
      image: toImageUrl(t.image_url),

      qty: Number(t.quantity || 1),
      unitPrice: Number(t.rate || 0),
      commissionRate: Number(t.commission_rate || 0),

      assignedAt: activeSet.assignment?.created_at,
      sponsorRef: activeSet.sponsor_short_id || "—",

      setId: activeSet.set?.id,
      stepNo: viewIndex + 1,
      totalTasks,
    };
  }, [activeSet, t, viewIndex, totalTasks]);

  const orderAmount = task ? task.qty * task.unitPrice : 0;
  const taskProfit = task ? (orderAmount * task.commissionRate) / 100 : 0;

  const totalProfit = completedLocal.reduce((s, x) => s + (x.profit || 0), 0);

  /* ---------------- UI navigation only ---------------- */

  const goPrev = () => {
    if (!isSubmitting && canPrev) setViewIndex((i) => i - 1);
  };

  const goNext = () => {
    if (!isSubmitting && canNext) setViewIndex((i) => i + 1);
  };

  /* ---------------- submit (UI only) ---------------- */

  const submit = () => {
    if (!isCurrentTask || isSubmitting) return;

    setIsSubmitting(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setIsSubmitting(false);
          setIsSuccess(true);

          setCompletedLocal((prev) => [
            {
              id: task.id,
              title: task.title,
              profit: taskProfit,
              amount: orderAmount,
              time: fmtGMT(new Date().toISOString()),
            },
            ...prev,
          ]);

          return 100;
        }
        return p + 4;
      });
    }, 200);
  };

  /* ---------------- backend completion (ONLY here) ---------------- */

  const proceedNext = async () => {
    try {
      await memberApi.post("/member/complete-task", {});
      setIsSuccess(false);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to complete task");
    }
  };

  /* ---------------- guards ---------------- */

  if (loading && !activeSet) {
    return <div className="td-page" style={{ padding: 16 }}>Loading…</div>;
  }

  if (!task) {
    return (
      <div className="td-page" style={{ padding: 16 }}>
        <button className="td-back" onClick={() => nav(-1)}>←</button>
        <div style={{ marginTop: 10 }}>{err || "No active task."}</div>
      </div>
    );
  }

  /* ---------------- render ---------------- */

  return (
    <div className="td-page">
      <header className="td-top">
        <button className="td-back" onClick={() => nav(-1)} disabled={isSubmitting}>
          ←
        </button>

        <div className="td-balance">
          <div className="td-balanceBlock">
            <span>This Task Profit</span>
            <span className="profit">+${money(taskProfit)}</span>
          </div>
          <div className="td-balanceBlock">
            <span>Total Profit</span>
            <span className="profit">${money(totalProfit)}</span>
          </div>
        </div>
      </header>

      <main className="td-wrap">
        <section className="td-card">
          <div className="td-cardTop">
            <div className="td-date">{fmtGMT(task.assignedAt)}</div>
            <span className="td-status">
              {isCurrentTask
                ? "Current Task"
                : viewIndex < currentIndex
                ? "Completed"
                : "Locked"}
            </span>
          </div>

          <div className="td-title">{task.title}</div>
          {task.description && <div className="td-desc">{task.description}</div>}

          <div className="td-summary">
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
                <img src={task.image} className="td-image" alt="task" />
              ) : (
                <div className="td-imagePlaceholder">Product image</div>
              )}
            </div>

            <div className="td-metrics">
              <div className="td-grid">
                <div className="td-box"><div>Quantity</div><b>{task.qty}</b></div>
                <div className="td-box"><div>Unit Price</div><b>${money(task.unitPrice)}</b></div>
                <div className="td-box"><div>Commission</div><b>{task.commissionRate}%</b></div>
                <div className="td-box"><div>Order Amount</div><b>${money(orderAmount)}</b></div>
              </div>

              <div className="td-row">
                <span>Estimated Commission</span>
                <span className="td-commission">+${money(taskProfit)}</span>
              </div>
            </div>
          </div>

          <div className="td-actions">
            <button
              className="td-submit"
              onClick={submit}
              disabled={!isCurrentTask || isSubmitting}
            >
              Submit Task
            </button>

            {!isCurrentTask && (
              <div className="td-hint">Only the current task can be submitted.</div>
            )}
          </div>
        </section>
      </main>

      <footer className="td-bottomBar">
        <div className="td-progressValue">
          {currentIndex} / {totalTasks}
        </div>

        <div className="td-navBtns">
          <button className="td-navBtn" onClick={goPrev} disabled={!canPrev || isSubmitting}>
            ← Previous
          </button>
          <button className="td-navBtn is-primary" onClick={goNext} disabled={!canNext || isSubmitting}>
            Next →
          </button>
        </div>
      </footer>

      {isSubmitting && (
        <div className="td-overlay">
          <div className="td-loader"></div>
          <div className="td-progressBar">
            <div className="td-progressFill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="td-overlay success">
          <div className="td-successCard">
            <h2>Task Completed</h2>
            <p>Commission recorded successfully.</p>

            <button className="td-finishBtn is-next" onClick={proceedNext}>
              Proceed to Next Task →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
