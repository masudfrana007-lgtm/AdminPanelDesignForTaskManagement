import { useEffect, useState } from "react";
import "../styles/app.css";
import memberApi from "../services/memberApi";
import { getMember, memberLogout } from "../memberAuth";
import { useNavigate } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";

export default function MemberDashboard() {
  const nav = useNavigate();
  const me = getMember();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const load = async () => {
    setErr(""); setOk("");
    try {
      const res = await memberApi.get("/member/active-set");
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
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

      // Immediately show congratulations
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 10000); // hide after 10s

      setOk("Task completed");
      await load();
      setTimeout(() => setOk(""), 1200);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed");
    }
  };

  const logout = () => {
    memberLogout();
    nav("/member/login");
  };

  const active = data?.active;

  return (
    <MemberLayout>
      <div className="container" style={{ marginTop: 20 }}>
        <div className="topbar">
          <div
            style={{
              background: "linear-gradient(135deg, #6d7bf3, #7b4da8)",
              borderRadius: 22,
              padding: "26px 30px",
              color: "#fff",
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
              marginBottom: 28,
              position: "relative",
            }}
          >
            {/* Brand Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #FFD700, #FFB300)",
                  color: "#1e1e1e",
                  fontWeight: 900,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                }}
              >
                TK
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  letterSpacing: "1px",
                }}
              >
                Eorder.io
              </h2>
            </div>

            <div style={{ fontSize: 14, opacity: 0.95 }}>
              Welcome,&nbsp;
              <b style={{ color: "#FFD700" }}>{me?.nickname}</b>
            </div>

            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              ID: {me?.short_id || me?.id} · Sponsor:{" "}
              <b style={{ color: "#FFD700" }}>{me?.sponsor_short_id}</b>
            </div>

            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.25)",
                marginTop: 14,
              }}
            />
          </div>

          <button className="btn danger" onClick={logout}>
            Logout
          </button>
        </div>

        {err && <div className="error" style={{ marginBottom: 10 }}>{err}</div>}
        {ok && <div className="ok" style={{ marginBottom: 10 }}>{ok}</div>}

        {!active ? (
          <div className="card">
            <h3>No Active Set</h3>
            <div className="small">{data?.message || "Please contact your sponsor to assign a set."}</div>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 12 }}>
              <h3 style={{ marginTop: 0 }}>Active Package</h3>
              <div className="hr" />

              <div className="row" style={{ alignItems: "stretch" }}>
                <div className="col">
                  <div className="small"><b>Set Name:</b> {data?.set?.name}</div>
                  <div className="small"><b>Total Tasks:</b> {data?.total_tasks}</div>
                  <div className="small"><b>Set Amount:</b> {data?.set_amount}</div>
                  <div className="small"><b>Status:</b> <span className="badge">{data?.assignment?.status}</span></div>
                </div>

                <div className="col">
                  <div className="small"><b>Assigned At:</b> {fmt(data?.assignment?.created_at)}</div>
                  <div className="small"><b>Last Activity:</b> {fmt(data?.assignment?.updated_at)}</div>
                  <div className="small"><b>Completed Tasks:</b> {data?.assignment?.current_task_index}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Current Task</h3>
              <div className="small">You can complete tasks one by one.</div>
              <div className="hr" />

              {!data?.current_task ? (
                <div className="small">No current task found.</div>
              ) : (
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {data.current_task.image_url && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${data.current_task.image_url}`}
                      alt=""
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: 10,
                        objectFit: "cover",
                        border: "1px solid #ddd"
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16 }}>
                      <b>{data.current_task.title}</b>
                    </div>
                    <div className="small">{data.current_task.description || ""}</div>

                    <div className="small" style={{ marginTop: 6 }}>
                      Qty: {data.current_task.quantity} | Rate: {data.current_task.rate} | Commission: {data.current_task.commission_rate}%
                    </div>

                    <div className="small">
                      Amount: <b>{data.current_task.price}</b>
                    </div>
                  </div>

                  <div style={{ minWidth: 180, textAlign: "right" }}>
                    <button
                      className="btn"
                      onClick={completeTask}
                      disabled={data?.assignment?.status === "completed"}
                      title={data?.assignment?.status === "completed" ? "Completed" : "Complete current task"}
                    >
                      Complete
                    </button>
                    {data?.assignment?.status === "completed" && (
                      <div className="small" style={{ marginTop: 6 }}>
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

      {/* Congratulations Overlay */}
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
            }

            .congrats-box h1 {
              font-size: 2.6rem;
              margin-bottom: 12px;
            }

            .congrats-box p {
              font-size: 1.1rem;
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
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </MemberLayout>
  );
}
