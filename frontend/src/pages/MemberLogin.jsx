import { useState } from "react";
import { useNavigate } from "react-router-dom";
import memberApi from "../services/memberApi";
import { setMemberAuth } from "../memberAuth";
import "../styles/memberLogin.css";

export default function MemberLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.identifier.trim()) return setErr("Username or phone is required");
    if (!form.password.trim()) return setErr("Password is required");

    try {
      const { data } = await memberApi.post("/member-auth/login", {
        identifier: form.identifier.trim(),
        password: form.password,
      });

      setMemberAuth(data.token, data.member);
      setOk("Login success");
      setTimeout(() => nav("/member/dashboard"), 300);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <a className="small" onClick={() => nav("/")}>← Back to Home</a>
        </div>

        <div className="auth-icon">→</div>

        <div className="auth-title">Welcome Back</div>
        <div className="auth-sub">Sign in to your TK Branding account</div>

        <form onSubmit={login} style={{ display: "grid", gap: 12 }}>
          <div style={{ textAlign: "left" }}>
            <div className="small">Username or Phone</div>
            <input
              value={form.identifier}
              onChange={(e) => setForm((p) => ({ ...p, identifier: e.target.value }))}
              placeholder="Enter username or phone"
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <div className="small">Password</div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Enter your password"
            />
          </div>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit">Login</button>
        </form>

        <div className="auth-footer">
          Don’t have an account? <a onClick={() => nav("/member/signup")}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}
