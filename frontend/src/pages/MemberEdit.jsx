// src/pages/MemberEdit.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import { getUser } from "../auth";
import "../styles/app.css";

const RANKS = ["Trial", "V1", "V2", "V3", "V4", "V5", "V6"];
const STATUSES = ["pending", "approved", "rejected"];
const GENDERS = ["male", "female", "other"];

function norm(v) {
  return String(v ?? "").trim();
}

function buildPatch(original, form) {
  // only send changed fields
  const patch = {};

  const fields = [
    "nickname",
    "phone",
    "email",
    "country",
    "ranking",
    "gender",
    "approval_status",
    "sponsor_short_id",
  ];

  for (const k of fields) {
    const a = norm(original?.[k]);
    const b = norm(form?.[k]);
    if (a !== b) patch[k] = b; // backend handles "" -> null for email/country if you want
  }

  // boolean
  if (Boolean(original?.withdraw_privilege) !== Boolean(form?.withdraw_privilege)) {
    patch.withdraw_privilege = !!form.withdraw_privilege;
  }

  // password
  if (norm(form?.new_password)) {
    patch.new_password = norm(form.new_password);
  }

  return patch;
}

export default function MemberEdit() {
  const me = getUser();
  const nav = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [orig, setOrig] = useState(null);

  const [form, setForm] = useState({
    nickname: "",
    phone: "",
    email: "",
    country: "",
    ranking: "Trial",
    gender: "other",
    approval_status: "pending",
    withdraw_privilege: true,
    sponsor_short_id: "",
    new_password: "",
    confirm_password: "",
  });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const isOwner = me?.role === "owner";

  useEffect(() => {
    if (!isOwner) return; // UI guard
    (async () => {
      setErr("");
      setOk("");
      setLoading(true);
      try {
        const { data } = await api.get(`/members/${id}`);
        setOrig(data || null);
        setForm((f) => ({
          ...f,
          nickname: data?.nickname || "",
          phone: data?.phone || "",
          email: data?.email || "",
          country: data?.country || "",
          ranking: data?.ranking || "Trial",
          gender: data?.gender || "other",
          approval_status: data?.approval_status || "pending",
          withdraw_privilege: !!data?.withdraw_privilege,
          sponsor_short_id: data?.sponsor_short_id || "",
          new_password: "",
          confirm_password: "",
        }));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load member");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isOwner]);

  const dirty = useMemo(() => {
    if (!orig) return false;
    const patch = buildPatch(orig, form);
    return Object.keys(patch).length > 0;
  }, [orig, form]);

  const onChange = (k) => (e) => {
    const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [k]: v }));
  };

  const validate = () => {
    if (!norm(form.nickname)) return "Nickname is required";
    if (!norm(form.phone)) return "Phone is required";
    if (!RANKS.includes(form.ranking)) return "Invalid ranking";
    if (!STATUSES.includes(form.approval_status)) return "Invalid status";
    if (!GENDERS.includes(form.gender)) return "Invalid gender";

    if (norm(form.new_password)) {
      if (form.new_password.length < 4) return "Password too short";
      if (form.new_password !== form.confirm_password) return "Password confirm does not match";
    }
    return "";
  };

  const save = async () => {
    setErr("");
    setOk("");

    const v = validate();
    if (v) return setErr(v);

    if (!orig) return;

    const patch = buildPatch(orig, form);
    if (!Object.keys(patch).length) return setErr("No changes to save");

    try {
      await api.patch(`/members/${id}`, patch);

      // reload to get fresh data
      const { data } = await api.get(`/members/${id}`);
      setOrig(data || null);
      setForm((f) => ({
        ...f,
        new_password: "",
        confirm_password: "",
      }));

      setOk("Saved");
      setTimeout(() => setOk(""), 1200);
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    }
  };

  if (!isOwner) {
    return (
      <AppLayout>
        <div className="container">
          <div className="card">
            <h3>Not allowed</h3>
            <div className="small">Only owner can edit members.</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container">
        <div className="topbar">
          <div>
            <h2>Edit Member</h2>
            <div className="small">
              Member ID: <span className="badge">{id}</span>
              {orig?.short_id ? (
                <>
                  {" "} • Short ID: <span className="badge">{orig.short_id}</span>
                </>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={() => nav(-1)}>
              ← Back
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="small">Loading…</div>
          ) : (
            <>
              {err && <div className="error">{err}</div>}
              {ok && <div className="ok">{ok}</div>}

              <div className="hr" />

              <div className="grid2">
                <div>
                  <div className="label">Nickname</div>
                  <input className="input" value={form.nickname} onChange={onChange("nickname")} />
                </div>

                <div>
                  <div className="label">Phone</div>
                  <input className="input" value={form.phone} onChange={onChange("phone")} />
                </div>

                <div>
                  <div className="label">Email (optional)</div>
                  <input className="input" value={form.email} onChange={onChange("email")} />
                </div>

                <div>
                  <div className="label">Country (optional)</div>
                  <input className="input" value={form.country} onChange={onChange("country")} />
                </div>

                <div>
                  <div className="label">Ranking</div>
                  <select className="input" value={form.ranking} onChange={onChange("ranking")}>
                    {RANKS.map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="label">Approval status</div>
                  <select
                    className="input"
                    value={form.approval_status}
                    onChange={onChange("approval_status")}
                  >
                    {STATUSES.map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="label">Gender</div>
                  <select className="input" value={form.gender} onChange={onChange("gender")}>
                    {GENDERS.map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="label">Withdraw privilege</div>
                  <label className="small" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!form.withdraw_privilege}
                      onChange={onChange("withdraw_privilege")}
                    />
                    Enabled
                  </label>
                </div>

                <div>
                  <div className="label">Sponsor short id (referral code)</div>
                  <input
                    className="input"
                    value={form.sponsor_short_id}
                    onChange={onChange("sponsor_short_id")}
                    placeholder="e.g. 8-char code from users.short_id"
                  />
                  <div className="small">Must match a user short_id with role owner/agent.</div>
                </div>
              </div>

              <div className="hr" />

              <h3 style={{ marginTop: 0 }}>Change password</h3>
              <div className="small">Leave empty to keep current password.</div>

              <div className="grid2" style={{ marginTop: 10 }}>
                <div>
                  <div className="label">New password</div>
                  <input
                    className="input"
                    type="password"
                    value={form.new_password}
                    onChange={onChange("new_password")}
                  />
                </div>

                <div>
                  <div className="label">Confirm password</div>
                  <input
                    className="input"
                    type="password"
                    value={form.confirm_password}
                    onChange={onChange("confirm_password")}
                  />
                </div>
              </div>

              <div className="hr" />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" type="button" onClick={save} disabled={!dirty}>
                  Save changes
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    if (!orig) return;
                    setErr("");
                    setOk("");
                    setForm((f) => ({
                      ...f,
                      nickname: orig.nickname || "",
                      phone: orig.phone || "",
                      email: orig.email || "",
                      country: orig.country || "",
                      ranking: orig.ranking || "Trial",
                      gender: orig.gender || "other",
                      approval_status: orig.approval_status || "pending",
                      withdraw_privilege: !!orig.withdraw_privilege,
                      sponsor_short_id: orig.sponsor_short_id || "",
                      new_password: "",
                      confirm_password: "",
                    }));
                  }}
                >
                  Reset
                </button>

                {!dirty && <span className="small">No unsaved changes.</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
