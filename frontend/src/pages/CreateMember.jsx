import { useEffect, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import AppLayout from "../components/AppLayout";

const RANKS = ["Trial", "V1", "V2", "V3", "V4", "V5", "V6"];

export default function CreateMember() {
  const me = getUser();

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
            <div className="small">
              You are <span className="badge">{me.role}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
            <div>
              <div className="small">Sponsor ID</div>
              <input value={me.short_id} disabled />
            </div>

            <div>
              <div className="small">Nickname *</div>
              <input value={form.nickname} onChange={e => onChange("nickname", e.target.value)} />
              {fieldErrors.nickname && <div className="error">{fieldErrors.nickname[0]}</div>}
            </div>

            <div>
              <div className="small">Phone *</div>
              <input value={form.phone} onChange={e => onChange("phone", e.target.value)} />
            </div>

            <div>
              <div className="small">Ranking *</div>
              <select value={form.ranking} onChange={e => onChange("ranking", e.target.value)}>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <button className="btn">Create</button>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
