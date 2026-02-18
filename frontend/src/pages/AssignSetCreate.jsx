import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import "../styles/app.css";

export default function AssignSetCreate() {
  const nav = useNavigate();

  const [members, setMembers] = useState([]);
  const [sets, setSets] = useState([]);

  const [form, setForm] = useState({ member_id: null, set_id: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setErr("");
    try {
      const [mRes, sRes] = await Promise.all([api.get("/members"), api.get("/sets")]);
      setMembers(Array.isArray(mRes.data) ? mRes.data : []);
      setSets(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load members/sets");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ options for react-select
  const memberOptions = useMemo(() => {
    return members.map((m) => {
      const idText = m.short_id || m.id;
      return {
        value: m.id,
        label: `${m.nickname} — ${m.phone} (ID: ${idText})`,
        // extra searchable fields:
        searchText: `${m.nickname || ""} ${m.phone || ""} ${idText || ""}`.toLowerCase(),
      };
    });
  }, [members]);

  // ✅ custom filter: search by name/phone/id
  const filterOption = (candidate, input) => {
    const q = String(input || "").trim().toLowerCase();
    if (!q) return true;
    return candidate.data.searchText.includes(q);
  };

  const assign = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.member_id) return setErr("Please select a member");
    if (!form.set_id) return setErr("Please select a set");

    try {
      await api.post("/member-sets/assign", {
        member_id: Number(form.member_id),
        set_id: Number(form.set_id),
      });

      setOk("Set assigned");
      setTimeout(() => nav("/assign-sets"), 600);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to assign");
    }
  };

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Assign Set</h2>
            <div className="small">Select a member and a set.</div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 720 }}>
          <h3>Assign Set to Member</h3>
          <div className="hr" />

          <form onSubmit={assign} style={{ display: "grid", gap: 12 }}>
            {/* ✅ SEARCHABLE DROPDOWN */}
            <div>
              <div className="small">Member</div>

              <Select
                options={memberOptions}
                isClearable
                placeholder="Search by name / phone / ID..."
                filterOption={filterOption}
                onChange={(opt) =>
                  setForm((p) => ({ ...p, member_id: opt ? opt.value : null }))
                }
                value={memberOptions.find((o) => o.value === form.member_id) || null}
                // keep it matching your UI sizing
                styles={{
                  control: (base) => ({ ...base, minHeight: 42 }),
                  menu: (base) => ({ ...base, zIndex: 50 }),
                }}
              />

              <div className="small">
                Agent sees only their members. Owner sees own + agent members.
              </div>
            </div>

            <div>
              <div className="small">Set</div>
              <select
                value={form.set_id}
                onChange={(e) => setForm((p) => ({ ...p, set_id: e.target.value }))}
              >
                <option value="">-- Select Set --</option>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (max tasks: {s.max_tasks})
                  </option>
                ))}
              </select>
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn" onClick={() => nav("/assign-sets")}>
                Cancel
              </button>
              <button type="submit" className="btn">
                Assign
              </button>
            </div>

            <div className="small">Note: Only ONE active set at a time (backend enforces).</div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
