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
    <div className="auth-page">
      <div className="card auth-card">

        {/* Back */}
        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <a className="small" onClick={() => nav("/")}>
            ← Back to Home
          </a>
        </div>

        {/* Icon */}
        <div className="auth-icon">→</div>

        {/* Title */}
        <div className="auth-title">Welcome Back</div>
        <div className="auth-sub">
          Sign in to your Iconic Digital account
        </div>

        <form onSubmit={login} style={{ display: "grid", gap: 12 }}>
          <div style={{ textAlign: "left" }}>
            <div className="small">Email</div>
            <input
              value={form.email}
              onChange={(e) =>
                setForm(p => ({ ...p, email: e.target.value }))
              }
              placeholder="Enter your email"
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <div className="small">Password</div>
            <input
              type="password"
              value={form.security_pin}
              onChange={(e) =>
                setForm(p => ({ ...p, security_pin: e.target.value }))
              }
              placeholder="Enter your password"
            />
          </div>

          {err && <div className="error">{err}</div>}
          {ok && <div className="ok">{ok}</div>}

          <button className="btn" type="submit">
            Login
          </button>
        </form>

        <div className="auth-footer">
          Don’t have an account? <a onClick={() => nav("/signup")}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}
