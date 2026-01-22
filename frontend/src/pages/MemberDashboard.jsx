import { useEffect, useRef, useState } from "react";
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
  const [celebrate, setCelebrate] = useState(false);

  const confettiCanvasRef = useRef(null);
  const confettiIntervalRef = useRef(null);

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

  /* ===============================
     CONFETTI ENGINE (NO LIB)
     =============================== */
  const startConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 180 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 30,
      color: `hsl(${Math.random() * 360}, 90%, 60%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05
    }));

    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;

      particles.forEach(p => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(angle);
        p.tilt = Math.sin(p.tiltAngle) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt, p.y);
        ctx.lineTo(p.x, p.y + p.tilt);
        ctx.stroke();

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
    };

    confettiIntervalRef.current = setInterval(draw, 16);

    setTimeout(() => {
      clearInterval(confettiIntervalRef.current);
      setCelebrate(false);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 10000); // 10 seconds
  };

  /* ===============================
     COMPLETE TASK
     =============================== */
  const completeTask = async () => {
    setErr(""); setOk("");
    try {
      await memberApi.post("/member/complete-task");
      await load();

      setOk("Task completed");

      setTimeout(() => setOk(""), 1200);

      // If set is completed → celebrate
      setTimeout(() => {
        if (data?.assignment?.status !== "completed") {
          setCelebrate(true);
          startConfetti();
        }
      }, 400);

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
      {/* ===============================
         CELEBRATION OVERLAY
         =============================== */}
      {celebrate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            textAlign: "center",
            animation: "fadeIn 0.4s ease"
          }}
        >
          <canvas
            ref={confettiCanvasRef}
            style={{ position: "absolute", inset: 0 }}
          />

          <div
            style={{
              zIndex: 2,
              background: "linear-gradient(135deg, #6d7bf3, #7b4da8)",
              padding: "40px 50px",
              borderRadius: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              animation: "popIn 0.6s ease"
            }}
          >
            <h1 style={{ margin: 0, fontSize: 36 }}>🎉 Congratulations!</h1>
            <p style={{ fontSize: 18, marginTop: 12 }}>
              You have successfully completed your package
            </p>
            <p style={{ fontSize: 14, opacity: 0.85 }}>
              Keep going — more rewards await 🚀
            </p>
          </div>
        </div>
      )}

      {/* ===============================
         ORIGINAL UI (UNCHANGED)
         =============================== */}
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
              Welcome, <b style={{ color: "#FFD700" }}>{me?.nickname}</b>
            </div>

            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              ID: {me?.short_id || me?.id} · Sponsor:{" "}
              <b style={{ color: "#FFD700" }}>{me?.sponsor_short_id}</b>
            </div>
          </div>

          <button className="btn danger" onClick={logout}>Logout</button>
        </div>

        {err && <div className="error">{err}</div>}
        {ok && <div className="ok">{ok}</div>}

        {!active ? (
          <div className="card">
            <h3>No Active Set</h3>
            <div className="small">{data?.message}</div>
          </div>
        ) : (
          <>
            <div className="card">
              <h3>Current Task</h3>
              <button
                className="btn"
                onClick={completeTask}
                disabled={data?.assignment?.status === "completed"}
              >
                Complete
              </button>
            </div>
          </>
        )}
      </div>
    </MemberLayout>
  );
}
