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
    nickname: "",
    password: "",
    ranking: "Trial",
    withdraw_privilege: "Enabled",
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
    setFieldErrors((p) => ({ ...p, [key]: null }));
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setFieldErrors({});

    try {
      await api.post("/members", {
        nickname: form.nickname,
        phone: form.phone,
        country: form.country,
        password: form.password,
      });

      setForm({
        country: "United States of America (+1)",
        phone: "",
        nickname: "",
        password: "",
        ranking: "Trial",
        withdraw_privilege: "Enabled",
      });

      setOk("Member created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
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
