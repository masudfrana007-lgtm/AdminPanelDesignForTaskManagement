import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

export default function Members() {
  const me = getUser();

  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    country: "United States of America (+1)",
    phone: "",
    nickname: "",
    gender: "",            // ✅ added (backend requires)
    referral_code: "",     // ✅ added (you said needed for saving, no checking)
    password: "",
  });

  const load = async () => {
    const { data } = await api.get("/members");
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    // ✅ match backend required fields
    if (!form.country.trim()) return setErr("Country is required");
    if (!form.phone.trim()) return setErr("Phone number is required");
    if (!form.nickname.trim()) return setErr("Nickname is required");
    if (!form.gender.trim()) return setErr("Gender is required");
    if (!form.referral_code.trim()) return setErr("Referral code is required");
    if (!form.password.trim()) return setErr("Password is required");

    try {
      await api.post("/members", {
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        password: form.password,
        gender: form.gender, // ✅ required by backend
        referral_code: form.referral_code.trim(), // ✅ stored, NOT checked in admin UI
      });

      setForm({
        country: "United States of America (+1)",
        phone: "",
        nickname: "",
        gender: "",
        referral_code: "",
        password: "",
      });

      setOk("Member created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      // ✅ backend already returns "Username already exists" / "Phone number already exists"
      setErr(e2?.response?.data?.message || "Failed");
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Create Member</h2>
            <div className="small">
              You are <span className="badge">{me.role}</span>{" "}
              (owner/agent can create members)
            </div>
          </div>
        </div>

        {/* CREATE MEMBER */}
        <div className="card" style={{ marginBottom: 14 }}>
          <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Country *</div>
                <select
                  value={form.country}
                  onChange={(e) => onChange("country", e.target.value)}
                >
                  <option>United States of America (+1)</option>
                  <option>Bangladesh (+880)</option>
                  <option>India (+91)</option>
                  <option>United Kingdom (+44)</option>
                </select>
              </div>

              <div>
                <div className="small">Phone Number *</div>
                <input
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="Please Enter Phone Number"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Nickname *</div>
                <input
                  value={form.nickname}
                  onChange={(e) => onChange("nickname", e.target.value)}
                  placeholder="Please Enter Nickname"
                />
              </div>

              <div>
                <div className="small">Sponsor ID</div>
                <input value={me.short_id || me.id} disabled />
                <div className="small">Auto: owner/agent who creates the member</div>
              </div>
            </div>

            {/* ✅ Add Gender (UI only) */}
            <div style={{ textAlign: "left" }}>
              <div className="small">Gender *</div>
              <select
                value={form.gender}
                onChange={(e) => onChange("gender", e.target.value)}
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

            {/* ✅ Add Referral Code (no checking, just stored) */}
            <div>
              <div className="small">Referral Code *</div>
              <input
                value={form.referral_code}
                onChange={(e) => onChange("referral_code", e.target.value)}
                placeholder="Enter referral code"
              />
              <div className="small">
                Stored only. No validation here.
              </div>
            </div>

            <div>
              <div className="small">Password *</div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
              />
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn" type="submit">
                Save & Create
              </button>
            </div>
          </form>
        </div>

        {/* MEMBERS LIST */}
        <div className="card">
          <h3>Members List</h3>
          <div className="small">
            Agent sees only their members. Owner sees own + members created by their agents.
          </div>
          <div className="hr" />

          <table className="table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Nickname</th>
                <th>Phone</th>
                <th>Ranking</th>
                <th>Status</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.short_id || m.id}>
                  <td>{m.short_id}</td>
                  <td>{m.nickname}</td>
                  <td>{m.phone}</td>
                  <td>
                    <span className="badge">{m.ranking}</span>
                  </td>
                  <td>
                    <span className="badge">{m.approval_status}</span>
                  </td>
                  <td>{m.sponsor_short_id}</td>
                </tr>
              ))}

              {!list.length && (
                <tr>
                  <td colSpan="6" className="small">
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
