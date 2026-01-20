import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuth } from "../auth";
import "../styles/app.css";
import TopMenu from "../components/TopMenu";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@local.com");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data);
      nav("/", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
     <>
    <TopMenu />
    <div className="container" style={{ maxWidth: 480, marginTop: 70 }}>
      <div className="card">
        <h2>Login</h2>
        <div className="small">Admin / Owner / Agent</div>
        <div className="hr" />

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div>
            <div className="small">Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="small">Password</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {err && <div className="error">{err}</div>}

          <button className="btn" type="submit">Login</button>
        </form>

        <div className="hr" />
        <div className="small">
          Default admin after seeding: <span className="badge">admin@local.com / admin123</span>
        </div>
      </div>
    </div>
    </>
  );
}
