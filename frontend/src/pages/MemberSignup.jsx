import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberLogin.css";

export default function MemberSignup() {
  const nav = useNavigate();

  // UI only (no API yet)
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

  const [showPass, setShowPass] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // UI only - later API integration
    console.log("signup", form);
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
        <div className="auth-icon">+</div>

        {/* Title */}
        <div className="auth-title">Sign Up</div>
        <div className="auth-sub">
          Join Iconic Digital and start earning
        </div>

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
          <div style={{ textAlign: "left" }}>
            <div className="small">Phone Number</div>

            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10 }}>
              <input
                value={form.country_code}
                onChange={(e) => setForm((p) => ({ ...p, country_code: e.target.value }))}
                placeholder="+880"
                style={{ textAlign: "center" }}
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
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
              <option value="other">Other</option>
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
              onChange={(e) =>
                setForm((p) => ({ ...p, confirm_password: e.target.value }))
              }
              placeholder="Confirm your password"
            />
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
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.accept_terms}
              onChange={(e) => setForm((p) => ({ ...p, accept_terms: e.target.checked }))}
              style={{ marginTop: 3 }}
            />
            <span style={{ color: "#374151" }}>
              I accept the{" "}
              <a
                onClick={() => alert("Terms page later")}
                style={{ color: "#0ea5a4", fontWeight: 600, cursor: "pointer" }}
              >
                Terms and Conditions
              </a>
            </span>
          </label>

          <button className="btn" type="submit" style={{ background: "#0ea5a4" }}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <a onClick={() => nav("/member/login")}>Sign In</a>
        </div>
      </div>
    </div>
  );
}
