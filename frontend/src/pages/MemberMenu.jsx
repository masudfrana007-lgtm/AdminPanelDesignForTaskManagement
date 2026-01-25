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
  <div className="fxOverlay" role="dialog" aria-modal="true">
    {/* Confetti layer */}
    <div className="fxConfetti" aria-hidden="true">
      {Array.from({ length: 70 }).map((_, i) => (
        <span
          key={i}
          className="fxConfettiPiece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.2}s`,
            animationDuration: `${3.8 + Math.random() * 2.2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>

    {/* Spotlight glow */}
    <div className="fxGlow" aria-hidden="true" />

    {/* Modal */}
    <div className="fxModal">
      <div className="fxTopRow">
        <div className="fxBadge">PACKAGE COMPLETED</div>

        {/* optional close */}
        <button
          className="fxClose"
          onClick={() => setShowCongrats(false)}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>
      </div>

      <div className="fxIconWrap" aria-hidden="true">
        <div className="fxRing" />
        <div className="fxTrophy">🏆</div>
      </div>

      <h2 className="fxTitle">
        Congratulations <span className="fxSpark">✨</span>
      </h2>

      <p className="fxText">
        You have successfully completed your package.
      </p>

      <div className="fxFooter">
        <div className="fxMiniPill">+ Bonus Eligible</div>
        <div className="fxMiniPill">Status: Completed ✅</div>
      </div>

      <div className="fxActions">
        <button
          className="fxPrimary"
          type="button"
          onClick={() => setShowCongrats(false)}
        >
          Awesome!
        </button>
      </div>
    </div>
  </div>
)}
      
    </div>
  );
}
