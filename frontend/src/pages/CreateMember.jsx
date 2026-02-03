import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getUser } from "../auth";
import "../styles/app.css";
import AppLayout from "../components/AppLayout";

const RANKS = ["Trial", "V1", "V2", "V3", "V4", "V5", "V6"];

function extractDialCode(countryLabel) {
  // e.g. "United States of America (+1)" -> "+1"
  const m = String(countryLabel || "").match(/\(\s*(\+\d+)\s*\)/);
  return m ? m[1] : "";
}

function digitsOnly(v) {
  return String(v || "").replace(/[^\d]/g, "");
}

// Build a canonical phone string: +<countrycode><numberdigits>
// Example: country "+1", phone "1235656" => "+11235656"
function buildFullPhone(countryLabel, phoneInput) {
  const dial = extractDialCode(countryLabel);
  const num = digitsOnly(phoneInput);

  if (!dial || !num) return "";

  // dial includes "+", remove plus for concatenation
  const dialDigits = digitsOnly(dial);
  return `+${dialDigits}${num}`;
}

// Normalize existing stored phone to canonical format using selected country code if missing
function normalizeStoredPhone(storedPhone, selectedCountryLabel) {
  const raw = String(storedPhone || "").trim();
  if (!raw) return "";

  // If it already starts with +, just canonicalize digits
  if (raw.startsWith("+")) {
    return `+${digitsOnly(raw)}`;
  }

  // If it doesn't start with +, assume it's a local number and prefix selected dial code
  return buildFullPhone(selectedCountryLabel, raw);
}

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
    gender: "",
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
    setErr("");
  };

  const normalizedNickname = useMemo(
    () => form.nickname.trim().toLowerCase(),
    [form.nickname]
  );

  const nicknameDuplicate = useMemo(() => {
    if (!normalizedNickname) return false;
    return list.some(
      (m) => String(m.nickname || "").trim().toLowerCase() === normalizedNickname
    );
  }, [list, normalizedNickname]);

  // ✅ canonical full phone for what user is entering
  const normalizedFullPhone = useMemo(
    () => buildFullPhone(form.country, form.phone),
    [form.country, form.phone]
  );

  // ✅ compare canonical full phone against canonicalized stored phones
  const phoneDuplicate = useMemo(() => {
    if (!normalizedFullPhone) return false;

    return list.some((m) => {
      const existing = normalizeStoredPhone(m.phone, form.country);
      return existing && existing === normalizedFullPhone;
    });
  }, [list, normalizedFullPhone, form.country]);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setFieldErrors({});

    if (!form.country.trim()) return setErr("Country is required");
    if (!form.phone.trim()) return setErr("Phone number is required");
    if (!form.nickname.trim()) return setErr("Nickname is required");
    if (!form.gender.trim()) return setErr("Gender is required");
    if (!form.password.trim()) return setErr("Password is required");

    if (nicknameDuplicate) return setErr("Username already exists");
    if (phoneDuplicate) return setErr("Phone number already exists");

    const fullPhone = buildFullPhone(form.country, form.phone);
    if (!fullPhone) return setErr("Invalid phone/country");

    try {
      await api.post("/members", {
        nickname: form.nickname.trim(),
        phone: fullPhone,              // ✅ send full phone to backend
        country: form.country,
        password: form.password,
        gender: form.gender,
        referral_code: me.short_id || String(me.id),
      });

      setForm({
        country: "United States of America (+1)",
        phone: "",
        nickname: "",
        gender: "",
        password: "",
        ranking: "Trial",
        withdraw_privilege: "Enabled",
      });

      setOk("Member created");
      await load();
      setTimeout(() => setOk(""), 1500);
    } catch (e2) {
      const data = e2?.response?.data;
      setErr(data?.message || "Failed");
    }
  };
  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Create Member</h2>
            <div className="small">
              You are <span className="badge">{me.role}</span> (owner/agent can create members)
            </div>
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
                <input
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="Please Enter Phone Number"
                />
                {/* ✅ live duplicate hint */}
                {form.phone.trim() && phoneDuplicate && (
                  <div className="error">Phone number already exists</div>
                )}
                {fieldErrors.phone && <div className="error">{fieldErrors.phone[0]}</div>}
              </div>

              {/* ✅ Gender added (backend requires) */}
              <div>
                <div className="small">Gender *</div>
                <select value={form.gender} onChange={(e) => onChange("gender", e.target.value)}>
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
                {fieldErrors.gender && <div className="error">{fieldErrors.gender[0]}</div>}
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Nickname *</div>
                <input
                  value={form.nickname}
                  onChange={(e) => onChange("nickname", e.target.value)}
                  placeholder="Please Enter Nickname"
                />
                {/* ✅ live duplicate hint */}
                {form.nickname.trim() && nicknameDuplicate && (
                  <div className="error">Username already exists</div>
                )}
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
                  {RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {fieldErrors.ranking && <div className="error">{fieldErrors.ranking[0]}</div>}
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div className="small">Withdraw Privilege *</div>
                <select
                  value={form.withdraw_privilege}
                  onChange={(e) => onChange("withdraw_privilege", e.target.value)}
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
                {fieldErrors.withdraw_privilege && (
                  <div className="error">{fieldErrors.withdraw_privilege[0]}</div>
                )}
              </div>

              <div>
                <div className="small">Password *</div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => onChange("password", e.target.value)}
                />
                {fieldErrors.password && <div className="error">{fieldErrors.password[0]}</div>}
              </div>

              <div />
            </div>

            {err && <div className="error">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="btn"
                type="submit"
                disabled={nicknameDuplicate || phoneDuplicate}
                title={nicknameDuplicate || phoneDuplicate ? "Fix duplicate fields first" : ""}
              >
                Save & Create
              </button>
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
