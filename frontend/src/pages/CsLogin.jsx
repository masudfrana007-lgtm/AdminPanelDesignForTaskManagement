// src/pages/CsLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi"; // you can use any axios instance

export default function CsLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "cs@gmail.com", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    const email = form.email.trim();
    const password = form.password;

    if (!email) return setErr("Email is required");
    if (!password.trim()) return setErr("Password is required");

    try {
      const { data } = await memberApi.post("/cs/login", { email, password });

      if (data?.ok) {
        setOk("Login success");
        setTimeout(() => nav("/support"), 200); // ✅ go to admin support inbox
      } else {
        setErr(data?.message || "Login failed");
      }
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-title">CS Login</div>
        <div className="auth-sub">Access support inbox</div>

        <form onSubmit={login} style={{ display: "grid", gap: 12 }}>
          <div style={{ textAlign: "left" }}>
            <div className="small">Email</div>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="cs@gmail.com"
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <div className="small">Password</div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="cs123456"
            />
          </div>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
