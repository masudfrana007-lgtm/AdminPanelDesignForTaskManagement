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

  // ✅ ADD
  const [celebrate, setCelebrate] = useState(false);

  const load = async () => {
    setErr(""); setOk("");
    try {
      const res = await memberApi.get("/member/active-set");
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => { load(); }, []);

  const fmt = (d) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleString(); } catch { return d; }
  };

  const completeTask = async () => {
    setErr(""); setOk("");
    try {
      await memberApi.post("/member/complete-task");

      // ✅ ADD — trigger animation
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2200);

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
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
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

    <h2 style={{ margin: 0, fontSize: "1.9rem", fontWeight: 800 }}>
      TK Branding
    </h2>
  </div>

  <div style={{ fontSize: 14 }}>
    Welcome,&nbsp;<b style={{ color: "#FFD700" }}>{me?.nickname}</b>
  </div>

  <div style={{ fontSize: 13, marginTop: 4 }}>
    ID: {me?.short_id || me?.id}
  </div>
</div>

        <button className="btn danger" onClick={logout}>Logout</button>
      </div>

      {err && <div className="error">{err}</div>}
      {ok && <div className="ok">{ok}</div>}

      {!active ? (
        <div className="card">
          <h3>No Active Set</h3>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>Active Package</h3>
            <div className="small"><b>Set:</b> {data?.set?.name}</div>
            <div className="small"><b>Completed:</b> {data?.assignment?.current_task_index}</div>
          </div>

          <div className="card">
            <h3>Current Task</h3>

            <b>{data.current_task?.title}</b>
            <div className="small">{data.current_task?.description}</div>

            <button
              className="btn"
              onClick={completeTask}
              disabled={data?.assignment?.status === "completed"}
              style={{ marginTop: 10 }}
            >
              Complete
            </button>
          </div>
        </>
      )}
    </div>

    {/* 🎉 ADD — COMPLETION ANIMATION */}
    {celebrate && (
      <div className="celebrate-overlay">
        <div className="confetti">
          {[...Array(50)].map((_, i) => <span key={i} />)}
        </div>

        <div className="celebrate-box">
          🎉 Task Completed!
        </div>
      </div>
    )}

    {/* ✅ ADD — INLINE CSS (SAFE) */}
    <style>{`
      .celebrate-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .celebrate-box {
        background: #fff;
        padding: 30px 50px;
        border-radius: 18px;
        font-size: 22px;
        font-weight: 800;
        animation: pop 0.5s ease;
        z-index: 2;
      }

      .confetti span {
        position: absolute;
        width: 8px;
        height: 14px;
        background: hsl(${Math.random()*360}, 80%, 60%);
        top: -20px;
        left: ${Math.random()*100}%;
        animation: fall 2s linear infinite;
      }

      @keyframes fall {
        to { transform: translateY(110vh) rotate(360deg); }
      }

      @keyframes pop {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `}</style>

    </MemberLayout>
  );
}
