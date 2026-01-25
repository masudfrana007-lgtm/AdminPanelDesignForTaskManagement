import { useEffect, useState } from "react";
import memberApi from "../services/memberApi";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberMenu.css";

export default function MemberMenu() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const load = async () => {
    setErr("");
    setOk("");
    try {
      const res = await memberApi.get("/member/active-set");
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const completeTask = async () => {
    setErr("");
    setOk("");
    try {
      await memberApi.post("/member/complete-task");

      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 10000);

      setOk("Task completed");
      await load();
      setTimeout(() => setOk(""), 1200);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed");
    }
  };

  const active = data?.active;

  return (
    <div className="menuPage">
      <div className="menuContent">
        <div className="menuHeader">
          <div>
            <div className="menuTitle">Menu</div>
            <div className="menuSub">Task & package section</div>
          </div>
        </div>

        {err && <div className="menuAlert error">{err}</div>}
        {ok && <div className="menuAlert ok">{ok}</div>}

        {!active ? (
          <div className="menuCard">
            <div className="menuCardTitle">No Active Set</div>
            <div className="menuSmall">
              {data?.message || "Please contact your sponsor to assign a set."}
            </div>
          </div>
        ) : (
          <>
            {/* Active Package */}
            <div className="menuCard">
              <div className="menuCardTitle">Active Package</div>
              <div className="menuHr" />

              <div className="menuGrid2">
                <div>
                  <div className="menuSmall">
                    <b>Set Name:</b> {data?.set?.name}
                  </div>
                  <div className="menuSmall">
                    <b>Total Tasks:</b> {data?.total_tasks}
                  </div>
                  <div className="menuSmall">
                    <b>Set Amount:</b> {data?.set_amount}
                  </div>
                  <div className="menuSmall">
                    <b>Status:</b>{" "}
                    <span className="menuBadge">{data?.assignment?.status}</span>
                  </div>
                </div>

                <div>
                  <div className="menuSmall">
                    <b>Assigned At:</b> {fmt(data?.assignment?.created_at)}
                  </div>
                  <div className="menuSmall">
                    <b>Last Activity:</b> {fmt(data?.assignment?.updated_at)}
                  </div>
                  <div className="menuSmall">
                    <b>Completed Tasks:</b> {data?.assignment?.current_task_index}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Task */}
            <div className="menuCard">
              <div className="menuCardTitle">Current Task</div>
              <div className="menuSmall">Complete tasks one by one.</div>
              <div className="menuHr" />

              {!data?.current_task ? (
                <div className="menuSmall">No current task found.</div>
              ) : (
                <div className="taskRow">
                  {data.current_task.image_url && (
                    <img
                      className="taskImg"
                      src={`${import.meta.env.VITE_API_URL}${data.current_task.image_url}`}
                      alt=""
                    />
                  )}

                  <div className="taskInfo">
                    <div className="taskTitle">{data.current_task.title}</div>
                    {!!data.current_task.description && (
                      <div className="menuSmall">{data.current_task.description}</div>
                    )}

                    <div className="menuSmall taskMeta">
                      Qty: {data.current_task.quantity} | Rate: {data.current_task.rate} |
                      Commission: {data.current_task.commission_rate}%
                    </div>

                    <div className="menuSmall">
                      Amount: <b>{data.current_task.price}</b>
                    </div>
                  </div>

                  <div className="taskAction">
                    <button
                      className="menuBtn"
                      onClick={completeTask}
                      disabled={data?.assignment?.status === "completed"}
                      title={
                        data?.assignment?.status === "completed"
                          ? "Completed"
                          : "Complete current task"
                      }
                    >
                      Complete
                    </button>

                    {data?.assignment?.status === "completed" && (
                      <div className="menuSmall" style={{ marginTop: 8 }}>
                        Package completed ✅
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <MemberBottomNav active="menu" />

      {/* Congrats Overlay (same as your dashboard) */}
      {showCongrats && (
        <>
          <style>{`
            .congrats-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.75);
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: fadeIn 0.5s ease;
            }

            .congrats-box {
              background: linear-gradient(135deg, #ffd700, #ff9800);
              padding: 50px 60px;
              border-radius: 24px;
              text-align: center;
              color: #1e1e1e;
              box-shadow: 0 30px 80px rgba(0,0,0,0.5);
              position: relative;
              overflow: hidden;
              animation: popIn 0.6s ease;
              max-width: 92vw;
            }

            .congrats-box h1 {
              font-size: 2.2rem;
              margin-bottom: 12px;
            }

            .congrats-box p {
              font-size: 1.05rem;
              font-weight: 500;
            }

            .confetti span {
              position: absolute;
              top: -20px;
              width: 8px;
              height: 14px;
              animation: fall 3s linear infinite;
            }

            .confetti span:nth-child(4n) { background: #ff1744; }
            .confetti span:nth-child(4n+1) { background: #00e5ff; }
            .confetti span:nth-child(4n+2) { background: #7cff00; }
            .confetti span:nth-child(4n+3) { background: #ffd700; }

            @keyframes fall {
              0% { transform: translateY(0) rotate(0); opacity: 1; }
              100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
            }

            @keyframes popIn {
              0% { transform: scale(0.6); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          <div className="congrats-overlay">
            <div className="congrats-box">
              <h1>🎉 Congratulations! 🎉</h1>
              <p>You have successfully completed your package</p>

              <div className="confetti">
                {Array.from({ length: 36 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
