import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TaskDetail.css";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import confetti from "canvas-confetti";

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

  // ✅ member wallet/profile (balance)
  const [me, setMe] = useState(null);
  const balance = Number(me?.balance || 0);

  // UI tabs
  const [tab, setTab] = useState("active");

  // overlay
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showComboWin, setShowComboWin] = useState(false);

  // ✅ insufficient balance popup
  const [showInsufficient, setShowInsufficient] = useState(false);

  const goDeposit = () => {
    setShowInsufficient(false);
    nav("/member/deposit");
  };

  const goSupport = () => {
    setShowInsufficient(false);
    nav("/member/customerService");
  };

  // ✅ UI navigation index (Prev/Next changes this only)
  const [viewIndex, setViewIndex] = useState(0);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [setRes, meRes] = await Promise.all([
        memberApi.get("/member/active-set"),
        memberApi.get("/member/me"),
      ]);

      setActiveSet(setRes.data || null);
      setMe(meRes.data || null);
    } catch (e) {
      setActiveSet(null);
      setMe(null);
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

  // ✅ show the task at viewIndex
  const t = tasks[viewIndex] || null;

  // ✅ map backend -> UI
  const task = useMemo(() => {

    if (!activeSet?.active || !t) return null;

    return {
      id: String(t.id),
      title: t.title || "Order",
      description: t.description || "",
      image: toImageUrl(t.image_url),

      type: String(t.task_type || t.taskType || "regular"),

      qty: Number(t.quantity || 1),
      unitPrice: Number(t.rate || 0),
      commissionRate: Number(t.commission_rate || 0),

      assignedAt: activeSet.assignment?.created_at || null,
      sponsorRef: activeSet.sponsor_short_id || "—",
      setId: activeSet.set?.name ?? null,

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

  // ✅ completed count is backend progress
  const completedCount = currentIndex;

  // ✅ Combo task: show big win confetti when page loads (per task)
  useEffect(() => {
    if (!task) return;

    const type = String(task.type || "").toLowerCase();
    if (type !== "combo") return;
    if (!isCurrentTask) return;

    setShowComboWin(true);

    // 🎉 festival-style confetti for ~2.2s
    const end = Date.now() + 2200;

    const frame = () => {
      confetti({
        particleCount: 18,
        spread: 70,
        startVelocity: 20,
        gravity: 1.2,
        ticks: 300,
        origin: { x: Math.random(), y: -0.05 }, // ✅ from top
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();

    // auto close after a bit (optional)
    const tmr = setTimeout(() => setShowComboWin(false), 2600);
    return () => clearTimeout(tmr);
  }, [task ? `${task.id}:${task.type}` : null, isCurrentTask]);

  const submit = () => {
    if (!task || isLoading || !isCurrentTask) return;

    if (balance < orderAmount) {
      setErr("");
      setShowInsufficient(true);
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setIsSuccess(true);
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
      await load();
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

  return (
    <div className="td-page">
      {/* HEADER (matches your CSS) */}
      <header className="td-top">
        <div className="td-topInner">
          <button className="td-back" onClick={() => nav(-1)} disabled={isLoading} type="button">
            ←
          </button>

          <div className="td-headMid">
            <div className="td-titleRow">
              <div className="td-pageTitle">Task Details</div>
              <div className="td-pageSub">
                Task <b>{task.stepNo}</b> of <b>{task.totalTasks}</b> • {task.id}
              </div>
            </div>

            <div className="td-tabs">
              <button
                className={"td-tab " + (tab === "active" ? "is-active" : "")}
                type="button"
                onClick={() => setTab("active")}
                disabled={isLoading}
              >
                Active
              </button>

              <button
                className={"td-tab " + (tab === "completed" ? "is-active" : "")}
                type="button"
                onClick={() => setTab("completed")}
                disabled={isLoading}
              >
                Completed <span className="td-tabCount">{completedCount}</span>
              </button>
            </div>
          </div>

          <div className="td-finance">
            <div className="td-finItem">
              <div className="td-finLabel">Wallet Balance</div>
              <div className="td-finValue">${money(balance)}</div>
            </div>

            <div className="td-finItem">
              <div className="td-finLabel">This Order Profit</div>
              <div className="td-finValue is-profit">+${money(taskProfit)}</div>
            </div>

            <div className="td-finItem">
              <div className="td-finLabel">Total Profit</div>
              <div className="td-finValue is-profit">${money(totalProfit)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="td-wrap">
        <div className="td-container">
          {tab === "completed" ? (
            <section className="td-card">
              <div className="td-cardHead">
                <div>
                  <div className="td-cardTitle">Completed Order History</div>
                  <div className="td-cardSub">Orders completed in this session.</div>
                </div>
                <span className="td-pill ok">Completed</span>
              </div>

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
                            <span className="td-ciId">{ct.id}</span>
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
            <>
              <section className="td-card">
                <div className="td-cardHead">
                  <div>
                    <div className="td-cardTitle">{task.title}</div>
                  </div>
                  <span className="td-pill warn">{isCurrentTask ? "Pending" : "Locked"}</span>
                </div>


                    <div className="td-lr">
                  {/* LEFT */}
                  <div className="td-left">
                    <div className="td-imageBox">
                      {task.image ? (
                        <img
                          src={task.image}
                          alt="product"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
                        />
                      ) : (
                        <div className="td-imagePlaceholder">Your product image will appear here</div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="td-right">
                    {err ? (
                      <div className="td-empty" style={{ marginBottom: 10 }}>
                        {err}
                      </div>
                    ) : null}

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
                        <div className="td-label">Order Total</div>
                        <div className="td-value">${money(orderAmount)}</div>
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
                      ) : balance < orderAmount ? (
                        <div className="td-hint">Insufficient balance — you will be redirected to Deposit.</div>
                      ) : (
                        <div className="td-hint">Please wait while the system verifies and processes this order.</div>
                      )}
                    </div>
                  </div>
                 </div>


                  {/* ✅ FULL WIDTH BELOW BOTH */}
                  {/*<div className="td-miniMeta" style={{ gridColumn: "1 / -1" }}>*/}
                 <div className="td-miniMeta">
{/*                    <div className="td-miniRow">
                      <span>Created</span>
                      <b>{fmtGMT(task.assignedAt)}</b>
                    </div>

                    <div className="td-miniRow">
                      <span>Order Amount</span>
                      <b>${money(orderAmount)}</b>
                    </div>

                    <div className="td-miniRow">
                      <span>Estimated Commission</span>
                      <b className="td-profitText">+${money(taskProfit)}</b>
                    </div>
*/}
                    {/* ✅ Product Description */}
                    {task.description ? (
                      <div className="td-miniRow" style={{ alignItems: "flex-start" }}>
                        <span>Description</span>
                        <b style={{ maxWidth: "70%", lineHeight: 1.45 }}>
                          {task.description}
                        </b>
                      </div>
                    ) : null}
                  </div>


              </section>

              <section className="td-rules">
                <div className="td-rulesTitle">Rules & Notes</div>
                <ul className="td-rulesList">
                  <li>Confirm the order amount and commission before submitting.</li>
                  <li>Do not submit incorrect information or fake proof.</li>
                  <li>Tasks should be completed within the required time window.</li>
                  <li>If you face issues, contact Customer Service and attach screenshots.</li>
                </ul>
              </section>
            </>
          )}
        </div>
      </main>

      {/* BOTTOM BAR (matches your CSS) */}
      <footer className="td-bottomBar">
        <div className="td-bottomInner">
          <div className="td-progress">
            <div className="td-progressTitle">Completed</div>
            <div className="td-progressValue">
              {completedCount} / {task.totalTasks}
            </div>
          </div>

          <div className="td-navBtns">
            <button className="td-navBtn" onClick={goPrevUI} disabled={isLoading || !canPrev} type="button">
              ← Previous
            </button>

            <button className="td-navBtn is-primary" onClick={goNextUI} disabled={isLoading || !canNext} type="button">
              Next →
            </button>
          </div>
        </div>
      </footer>

      {/* ✅ COMBO BIG WIN OVERLAY */}
      {showComboWin && (
        <div
          className="td-overlay"
          style={{ background: "rgba(0,0,0,.70)", zIndex: 9999 }}
          onClick={() => setShowComboWin(false)}
        >
          <div
            className="td-successCard"
            style={{ maxWidth: 560, textAlign: "center", transform: "scale(1.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>🎉 Congratulations!</h2>
            <p style={{ fontSize: 16, opacity: 0.95, marginBottom: 16 }}>
              You received a <b>COMBO</b> task — <b>Big Win Festival</b> 🎊
            </p>

            <div className="td-successMeta" style={{ justifyContent: "center" }}>
              <div>
                <div className="td-smLabel">Order Profit</div>
                <div className="td-smValue">+${money(taskProfit)}</div>
              </div>
              <div>
                <div className="td-smLabel">Order Amount</div>
                <div className="td-smValue">${money(orderAmount)}</div>
              </div>
            </div>

            <div className="td-successBtns" style={{ justifyContent: "center" }}>
              <button className="td-finishBtn is-next" type="button" onClick={() => setShowComboWin(false)}>
                Start Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY (matches your CSS) */}
      {isLoading && (
        <div className="td-overlay">
          <div className="td-loadingCard">
            <div className="td-loader"></div>
            <div className="td-loadingText">Processing order, please wait…</div>
            <div className="td-progressBar">
              <div className="td-progressFill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS OVERLAY (matches your CSS) */}
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

              <button className="td-finishBtn is-next" onClick={proceedToNextTask} type="button">
                Proceed to Next Order →
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ✅ INSUFFICIENT BALANCE POPUP */}
      {showInsufficient && (
        <div className="td-modalOverlay" onClick={() => setShowInsufficient(false)}>
          <div className="td-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="td-modalTop">
              <div className="td-modalTitle">Recharge Required</div>
              <button className="td-modalClose" onClick={() => setShowInsufficient(false)} type="button">
                ✕
              </button>
            </div>

            <div className="td-modalText">
              your current balance is lower than the package order, please recharge
            </div>

            <div className="td-modalGrid">
              <div className="td-modalBox">
                <div className="td-modalLabel">Current Balance</div>
                <div className="td-modalBig">${money(balance)}</div>
                <div className="td-modalSmall">Available in your wallet</div>
              </div>

              <div className="td-modalBox">
                <div className="td-modalLabel">Required Amount</div>
                <div className="td-modalBig">${money(orderAmount)}</div>
                <div className="td-modalSmall">Needed to submit this order</div>
              </div>
            </div>

            <div className="td-modalBtns">
              <button className="td-modalDeposit" type="button" onClick={goDeposit}>
                Deposit
              </button>

              <button className="td-modalSupport" type="button" onClick={goSupport}>
                Contact Support
              </button>
            </div>

            <button className="td-modalSecondary" type="button" onClick={() => setShowInsufficient(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* ✅ SAME bottom bar (reusable) */}
      <MemberBottomNav active="mine" />            
    </div>
  );
}
