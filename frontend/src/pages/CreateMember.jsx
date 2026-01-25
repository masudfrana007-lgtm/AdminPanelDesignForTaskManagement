import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

const RANKS = ["Trial", "V1", "V2", "V3", "V4", "V5", "V6"];

export default function Members() {
  const me = getUser();

  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    country: "United States of America (+1)",
    phone: "",
    email: "",
    nickname: "",
    password: "",
    security_pin: "",
    ranking: "Trial",
    withdraw_privilege: "Enabled",
  });

  const load = async () => {
    const { data } = await api.get("/members");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const onChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setFieldErrors(p => ({ ...p, [key]: null }));
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setFieldErrors({});

    try {
      await api.post("/members", form);
      setForm({
        country: "United States of America (+1)",
        phone: "",
        email: "",
        nickname: "",
        password: "",
        security_pin: "",
        ranking: "Trial",
        withdraw_privilege: "Enabled",
      });
      setOk("Member created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      const data = e2?.response?.data;
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      else setErr(data?.message || "Failed");
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Create Member</h2>
            <div className="small">You are <span className="badge">{me.role}</span> (owner/agent can create members)</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Country *</div>
                <select value={form.country} onChange={(e) => onChange("country", e.target.value)}>
                  <option>United States of America (+1)</option>
                  <option>Bangladesh (+880)</option>
                  <option>India (+91)</option>
                  <option>United Kingdom (+44)</option>
                </select>
                {fieldErrors.country && <div className="error">{fieldErrors.country[0]}</div>}
              </div>

              <div>
                <div className="small">Phone Number *</div>
                <input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="Please Enter Phone Number" />
                {fieldErrors.phone && <div className="error">{fieldErrors.phone[0]}</div>}
              </div>

              <div>
                <div className="small">Email</div>
                <input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="Please Enter Email" />
                {fieldErrors.email && <div className="error">{fieldErrors.email[0]}</div>}
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Nickname *</div>
                <input value={form.nickname} onChange={(e) => onChange("nickname", e.target.value)} placeholder="Please Enter Nickname" />
                {fieldErrors.nickname && <div className="error">{fieldErrors.nickname[0]}</div>}
              </div>

              <div>
                <div className="small">Sponsor ID</div>
                <input value={me.short_id || me.id} disabled />
                <div className="small">Auto: owner/agent who creates the member</div>
              </div>

              <div>
                <div className="small">Ranking *</div>
                <select value={form.ranking} onChange={(e) => onChange("ranking", e.target.value)}>
                  {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {fieldErrors.ranking && <div className="error">{fieldErrors.ranking[0]}</div>}
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Withdraw Privilege *</div>
                <select value={form.withdraw_privilege} onChange={(e) => onChange("withdraw_privilege", e.target.value)}>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                {fieldErrors.withdraw_privilege && <div className="error">{fieldErrors.withdraw_privilege[0]}</div>}
              </div>

              <div>
                <div className="small">Password *</div>
                <input type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} />
                {fieldErrors.password && <div className="error">{fieldErrors.password[0]}</div>}
              </div>

              <div>
                <div className="small">Security PIN *</div>
                <input type="password" value={form.security_pin} onChange={(e) => onChange("security_pin", e.target.value)} placeholder="Please Enter Security PIN" />
                {fieldErrors.security_pin && <div className="error">{fieldErrors.security_pin[0]}</div>}
              </div>
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn" type="submit">Save & Create</button>
            </div>
          </form>
        </div>

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
                <th>Email</th>
                <th>Ranking</th>
                <th>Withdraw</th>
                <th>Sponsor</th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.short_id || m.id}>
                  <td>{m.short_id}</td>
                  <td>{m.nickname}</td>
                  <td>{m.phone}</td>
                  <td>{m.email || "-"}</td>
                  <td><span className="badge">{m.ranking}</span></td>
                  <td><span className="badge">{m.withdraw_privilege ? "Enabled" : "Disabled"}</span></td>
                  <td>{m.sponsor_short_id}</td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan="7" className="small">No members yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  </AppLayout>
  );
}
