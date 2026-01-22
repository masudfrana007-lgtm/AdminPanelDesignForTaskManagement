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
		<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: white; text-align: center; max-width: 500px; margin: 20px auto; position: relative; overflow: hidden;"> <svg width="200" height="60" viewBox="0 0 200 60" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); z-index: 2; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));" xmlns="http://www.w3.org/2000/svg"> <!-- TK Editable SVG Logo --> <defs> <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" /> <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" /> <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" /> </linearGradient> <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style="stop-color:#1E3A8A;stop-opacity:1" /> <stop offset="50%" style="stop-color:#3B82F6;stop-opacity:1" /> <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" /> </linearGradient> <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"> <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/> </filter> </defs> <!-- T Letter --> <path d="M10 5 L10 50 L50 50 L50 30 L70 30 L70 50 L90 50 L90 5 L10 5 Z" fill="url(#goldGrad)" stroke="#B8860B" stroke-width="1.5" filter="url(#shadow)"/> <!-- K Letter --> <path d="M110 5 L150 5 L150 27.5 L110 27.5 M110 27.5 L140 50 L150 50 L130 35 L110 35 Z" fill="url(#navyGrad)" stroke="#1E40AF" stroke-width="1.5" filter="url(#shadow)"/> <!-- Branding text small --> <text x="95" y="42" font-family="'Arial Black', sans-serif" font-size="12" font-weight="bold" fill="#E5E7EB" letter-spacing="0.5">BRANDING</text> </svg> <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px; position: relative; z-index: 1;"> <h2 style="margin: 0; font-size: 2.2em; font-weight: 700; background: linear-gradient(45deg, #fff 0%, #f0f0f0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 2px;">TK Branding</h2> </div> <div className="small" style="font-size: 0.95em; opacity: 0.95; margin: 5px 0;"> Welcome, <b style="color: #ffd700; font-weight: 600;">{me?.nickname}</b> (ID: {me?.short_id || me?.id}) </div> <div className="small" style="font-size: 0.95em; opacity: 0.95;"> Sponsor ID: <b style="color: #ffd700; font-weight: 600;">{me?.sponsor_short_id}</b> </div> </div>

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
