import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";

/* ---------- helpers ---------- */
function norm(v) {
  return String(v ?? "").trim();
}
function safeGender(v) {
  const g = String(v || "").toLowerCase();
  if (["male", "female", "other"].includes(g)) return g;
  return "";
}
function isEmail(v) {
  const s = norm(v);
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/* ---------- component ---------- */
export default function ProfileEdit() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [user, setUser] = useState(null); // original
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    phone: "",
    country: "",
    gender: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const loadMe = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const { data } = await memberApi.get("/member/me");
      setUser(data || null);

      setForm({
        nickname: norm(data?.nickname),
        email: norm(data?.email),
        phone: norm(data?.phone),
        country: norm(data?.country),
        gender: safeGender(data?.gender),
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const dirty = useMemo(() => {
    if (!user) return false;
    const a = {
      nickname: norm(user.nickname),
      email: norm(user.email),
      phone: norm(user.phone),
      country: norm(user.country),
      gender: safeGender(user.gender),
    };
    const b = {
      nickname: norm(form.nickname),
      email: norm(form.email),
      phone: norm(form.phone),
      country: norm(form.country),
      gender: safeGender(form.gender),
    };
    return (
      a.nickname !== b.nickname ||
      a.email !== b.email ||
      a.phone !== b.phone ||
      a.country !== b.country ||
      a.gender !== b.gender ||
      !!avatarFile
    );
  }, [user, form, avatarFile]);

  const setField = (k) => (e) => {
    setOk("");
    setErr("");
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  const pickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    setOk("");
    setErr("");
  };

  const validate = () => {
    const nickname = norm(form.nickname);
    const email = norm(form.email);
    const phone = norm(form.phone);

    if (!nickname) return "Nickname is required";
    if (!email) return "Email is required";
    if (!isEmail(email)) return "Invalid email format";
    if (!phone) return "Phone is required";
    return "";
  };

  const save = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    setErr("");
    setOk("");

    try {
      // 1) Update text fields
      await memberApi.patch("/member/me", {
        nickname: norm(form.nickname),
        email: norm(form.email),
        phone: norm(form.phone),
        country: norm(form.country) || null,
        gender: safeGender(form.gender) || null,
      });

      // 2) Optional: upload avatar file
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await memberApi.post("/member/avatar", fd); // no manual headers
        setAvatarFile(null);
      }

      setOk("Profile updated");
      await loadMe();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pe-page">
      <div className="pe-overlay" />

      <header className="pe-header">
        <button className="pe-back" onClick={() => nav(-1)}>
          ←
        </button>
        <div>
          <h1>Edit Profile</h1>
          <p>Update your personal information</p>
        </div>
      </header>

      <main className="pe-wrap">
        {err && (
          <div className="pe-card pe-error">
            <strong>Error</strong>
            <p>{err}</p>
          </div>
        )}

        {ok && (
          <div className="pe-card pe-ok">
            <strong>Success</strong>
            <p>{ok}</p>
          </div>
        )}

        {loading ? (
          <div className="pe-card">
            <div className="pe-title">Loading…</div>
          </div>
        ) : (
          <>
            {/* Avatar */}
            <section className="pe-card">
              <h3>Profile Photo</h3>

              <div className="pe-avatarRow">
                <div className="pe-avatar" onClick={pickAvatar} title="Change photo">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" />
                  ) : (
                    <span>{String(form.nickname || "U").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>

                <div className="pe-avatarActions">
                  <button className="pe-btn" onClick={pickAvatar}>
                    Choose photo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={onAvatarChange}
                  />
                  {avatarFile && (
                    <button
                      className="pe-btn ghost"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview("");
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="pe-muted">Photo will be uploaded when you press Save.</p>
            </section>

            {/* Editable fields */}
            <section className="pe-card">
              <h3>Account Information</h3>

              <label className="pe-field">
                <span>Nickname</span>
                <input value={form.nickname} onChange={setField("nickname")} />
              </label>

              <label className="pe-field">
                <span>Email</span>
                <input value={form.email} onChange={setField("email")} />
              </label>

              <label className="pe-field">
                <span>Phone</span>
                <input value={form.phone} onChange={setField("phone")} />
              </label>

              <label className="pe-field">
                <span>Country</span>
                <input value={form.country} onChange={setField("country")} placeholder="e.g. BD" />
              </label>

              <label className="pe-field">
                <span>Gender</span>
                <select value={form.gender} onChange={setField("gender")}>
                  <option value="">-</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="other">other</option>
                </select>
              </label>

              <div className="pe-actions">
                <button className="pe-btn ghost" onClick={loadMe} disabled={saving}>
                  Reset
                </button>
                <button className="pe-btn primary" onClick={save} disabled={!dirty || saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </section>

            {/* Non-editable info (optional display) */}
            <section className="pe-card pe-readonly">
              <h3>Read-only</h3>
              <div className="pe-row"><span>UID</span><span>{user?.short_id ?? "-"}</span></div>
              <div className="pe-row"><span>Ranking</span><span>{user?.ranking ?? "-"}</span></div>
              <div className="pe-row"><span>Status</span><span>{user?.approval_status ?? "-"}</span></div>
              <div className="pe-row"><span>Sponsor</span><span>{user?.sponsor_short_id ?? "-"}</span></div>
              <div className="pe-row"><span>Balance</span><span>{user?.balance ?? "0.00"}</span></div>
              <div className="pe-row"><span>Locked</span><span>{user?.locked_balance ?? "0.00"}</span></div>
              <p className="pe-muted">These cannot be changed by the client.</p>
            </section>
          </>
        )}
      </main>

      <div className="peNavSpacer" />
      <MemberBottomNav active="mine" />
    </div>
  );
}
