// src/pages/CsLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ use admin/owner/agent axios

export default function CsLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      // ✅ backend returns { token, user }
      const { data } = await api.post("/cs/login", { email, password });

      if (!data?.token) {
        setErr(data?.message || "Login failed");
        return;
      }

      // ✅ store same keys as normal admin auth (so your api interceptor works)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || null));

      setOk("Login success");
      setTimeout(() => nav("/support"), 200);
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
              autoComplete="username"
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <div className="small">Password</div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="cs123456"
              autoComplete="current-password"
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
