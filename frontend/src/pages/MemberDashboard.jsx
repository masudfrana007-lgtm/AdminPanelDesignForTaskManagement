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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 20,
    padding: "22px 20px 18px",
    color: "#fff",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  }}
>
  {/* Logo + Brand */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      marginBottom: 12,
    }}
  >
    {/* TK Logo */}
    <svg
      width="52"
      height="52"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>

        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* T */}
      <path
        d="M10 15 H90 V30 H60 V85 H40 V30 H10 Z"
        fill="url(#goldGrad)"
      />

      {/* K */}
      <path
        d="M60 15 V85 H75 V55 L90 85 H110 L85 50 L110 15 H90 L75 40 V15 Z"
        fill="url(#blueGrad)"
        transform="scale(0.7) translate(35 20)"
      />
    </svg>

    {/* Brand Text */}
    <h2
      style={{
        margin: 0,
        fontSize: "1.9rem",
        fontWeight: 800,
        letterSpacing: "1.5px",
        background: "linear-gradient(90deg, #ffffff, #e5e7eb)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      TK Branding
    </h2>
  </div>

  {/* User Info */}
  <div className="small" style={{ opacity: 0.95 }}>
    Welcome,{" "}
    <b style={{ color: "#FFD700", fontWeight: 600 }}>
      {me?.nickname}
    </b>{" "}
    (ID: {me?.short_id || me?.id})
  </div>

  <div className="small" style={{ marginTop: 4, opacity: 0.95 }}>
    Sponsor ID:{" "}
    <b style={{ color: "#FFD700", fontWeight: 600 }}>
      {me?.sponsor_short_id}
    </b>
  </div>
</div>

        
        <button className="btn danger" onClick={logout}>Logout</button>
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
    </MemberLayout>
  );
}
