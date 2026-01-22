import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/app.css";
import memberApi from "../services/memberApi";
import { setMemberAuth } from "../memberAuth";

export default function MemberLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", security_pin: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    try {
      const { data } = await memberApi.post("/member-auth/login", form);
      setMemberAuth(data.token, data.member);
      setOk("Login success");
      setTimeout(() => nav("/member/dashboard"), 300);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: 40 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Member Login</h2>
        <div className="small">Login with email + security PIN</div>
        <div className="hr" />

        <form onSubmit={login} style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="small">Email</div>
            <input
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="user@email.com"
            />
          </div>

          <div>
            <div className="small">Security PIN</div>
            <input
              type="password"
              value={form.security_pin}
              onChange={(e) => setForm(p => ({ ...p, security_pin: e.target.value }))}
              placeholder="****"
            />
          </div>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
