import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/memberLogin.css";

const COUNTRY_CODES = [
  { code: "+880", label: "BD (+880)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
];

export default function MemberSignup() {
  const nav = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    nickname: "",
    country_code: "+880",
    phone: "",
    gender: "",
    password: "",
    confirm_password: "",
    referral_code: "",
    accept_terms: false,
  });

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    if (!form.accept_terms) {
      return setErr("You must accept Terms & Conditions");
    }
    if (form.password !== form.confirm_password) {
      return setErr("Passwords do not match");
    }

    try {
      await api.post("/members", {
        nickname: form.nickname,
        phone: `${form.country_code}${form.phone}`,
        country: form.country_code,
        password: form.password,
        gender: form.gender,
        referral_code: form.referral_code || null,
      });

      setOk("Signup successful. Await admin approval.");
      setTimeout(() => nav("/member/login"), 1500);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <a className="small" onClick={() => nav("/member/login")}>
            ← Back to Login
          </a>
        </div>

        <div className="auth-icon">+</div>
        <div className="auth-title">Sign Up</div>
        <div className="auth-sub">Join TK Branding and start earning</div>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="small">Username</div>
            <input
              value={form.nickname}
              onChange={(e) => setForm(p => ({ ...p, nickname: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
            <select
              value={form.country_code}
              onChange={(e) => setForm(p => ({ ...p, country_code: e.target.value }))}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input
              value={form.phone}
              onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>

          <div>
            <div className="small">Gender</div>
            <select
              value={form.gender}
              onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <div className="small">Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <span
                onClick={() => setShowPass(s => !s)}
                style={{ position: "absolute", right: 12, top: "50%", cursor: "pointer" }}
              >
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div>
            <div className="small">Confirm Password</div>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm(p => ({ ...p, confirm_password: e.target.value }))}
            />
          </div>

          <label className="terms-row">
            <input
              type="checkbox"
              checked={form.accept_terms}
              onChange={(e) => setForm(p => ({ ...p, accept_terms: e.target.checked }))}
            />
            <span>I accept the <span className="terms-link">Terms and Conditions</span></span>
          </label>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit" style={{ background: "#0ea5a4" }}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
