import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberLogin.css";
import api from "../services/api";

export default function MemberSignup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    username: "",
    country_code: "+880",
    phone: "",
    gender: "",
    password: "",
    confirm_password: "",
    referral_code: "",
    accept_terms: false,
  });

  const COUNTRY_CODES = [
    { code: "+880", label: "BD (+880)" },
    { code: "+91", label: "IN (+91)" },
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+971", label: "UAE (+971)" },
    { code: "+966", label: "SA (+966)" },
    { code: "+965", label: "KW (+965)" },
    { code: "+974", label: "QA (+974)" },
    { code: "+968", label: "OM (+968)" },
    { code: "+973", label: "BH (+973)" },
    { code: "+60", label: "MY (+60)" },
    { code: "+65", label: "SG (+65)" },
    { code: "+62", label: "ID (+62)" },
    { code: "+66", label: "TH (+66)" },
    { code: "+81", label: "JP (+81)" },
    { code: "+82", label: "KR (+82)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" },
    { code: "+39", label: "IT (+39)" },
    { code: "+7", label: "RU/KZ (+7)" },
  ];

  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const passwordsEntered = form.password.length > 0 || form.confirm_password.length > 0;
  const passwordsMatch =
    form.password.length > 0 &&
    form.confirm_password.length > 0 &&
    form.password === form.confirm_password;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    // required fields
    if (!form.username.trim()) return setErr("Username is required");
    if (!form.phone.trim()) return setErr("Phone number is required");
    if (!form.gender.trim()) return setErr("Gender is required");
    if (!form.password.trim()) return setErr("Password is required");
    if (!form.confirm_password.trim()) return setErr("Confirm password is required");
    if (!form.referral_code.trim()) return setErr("Referral code is required");
    if (!form.accept_terms) return setErr("You must accept Terms and Conditions");

    if (form.password !== form.confirm_password) {
      return setErr("Passwords do not match");
    }

    try {
      await api.post("/members", {
        nickname: form.username.trim(),
        phone: `${form.country_code}${form.phone.trim()}`,
        country: form.country_code,
        password: form.password,
        gender: form.gender,
        referral_code: form.referral_code.trim(), // ✅ MUST be a users.short_id
      });

      setOk("Signup successful. Await admin approval.");
      setTimeout(() => nav("/member/login"), 600);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        {/* Back */}
        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <a className="small" onClick={() => nav("/member/login")}>
            ← Back to Login
          </a>
        </div>

        {/* Icon */}
        {/* <div className="auth-icon">+</div> */}

        <div className="eoLogoRow">
          <div className="eoMark" aria-hidden="true">
            <span className="eoMarkInner">e</span>
          </div>
          <div className="eoBrand">eorder<span>.io</span>
          </div>
        </div>

        {/* Title */}
        <div className="auth-title">Sign Up</div>
        <div className="auth-sub">Join Eorder.io and start earning</div>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          {/* Username */}
          <div style={{ textAlign: "left" }}>
            <div className="small">Username</div>
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="Enter your username"
            />
          </div>

          {/* Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
            <select
              value={form.country_code}
              onChange={(e) => setForm((p) => ({ ...p, country_code: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 15,
                color: "#000",
                fontWeight: 500,
                outline: "none",
                background: "#fff",
              }}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>

            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Gender */}
          <div style={{ textAlign: "left" }}>
            <div className="small">Gender</div>
            <select
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 15,
                color: "#000",
                fontWeight: 500,
                outline: "none",
                background: "#fff",
              }}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Prefer not to say</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ textAlign: "left" }}>
            <div className="small">Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
              />
              <span
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: 14,
                  userSelect: "none",
                }}
                title={showPass ? "Hide" : "Show"}
              >
                {showPass ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ textAlign: "left" }}>
            <div className="small">Confirm Password</div>
            <input
              type={showPass ? "text" : "password"}
              value={form.confirm_password}
              onChange={(e) => setForm((p) => ({ ...p, confirm_password: e.target.value }))}
              placeholder="Confirm your password"
            />

            {/* ✅ red/green message (no alerts) */}
            {passwordsEntered && (
              <div className={passwordsMatch ? "ok" : "error"}>
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
          </div>

          {/* Referral */}
          <div style={{ textAlign: "left" }}>
            <div className="small">Referral Code</div>
            <input
              value={form.referral_code}
              onChange={(e) => setForm((p) => ({ ...p, referral_code: e.target.value }))}
              placeholder="Enter referral code"
            />
          </div>

          {/* Terms */}
          <label className="terms-row">
            <input
              type="checkbox"
              checked={form.accept_terms}
              onChange={(e) => setForm((p) => ({ ...p, accept_terms: e.target.checked }))}
            />
            <span className="terms-text">
              I accept the{" "}
              <span className="terms-link" onClick={() => alert("Terms page later")}>
                Terms and Conditions
              </span>
            </span>
          </label>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit" style={{ background: "#0ea5a4" }}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <a onClick={() => nav("/member/login")}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
