import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";

/* ---------- helpers ---------- */
function norm(v) {
  return String(v ?? "").trim();
}
function isEmail(v) {
  const s = norm(v);
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function initials(name) {
  const s = norm(name) || "U";
  return s.slice(0, 1).toUpperCase();
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
  const [email, setEmail] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // if backend returns any of these, we’ll show it when no new preview is picked
  const existingAvatar =
    user?.avatar_url || user?.photo_url || user?.profile_photo_url || user?.profile_picture_url || "";

  const loadMe = async () => {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const { data } = await memberApi.get("/member/me");
      setUser(data || null);
      setEmail(norm(data?.email));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
      setUser(null);
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  // clean up blob url to avoid memory leak
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const dirty = useMemo(() => {
    if (!user) return false;
    const a = norm(user.email);
    const b = norm(email);
    return a !== b || !!avatarFile;
  }, [user, email, avatarFile]);

  const pickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    // revoke old preview if any
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    setOk("");
    setErr("");
  };

  const validate = () => {
    const e = norm(email);
    if (!e) return "Email is required";
    if (!isEmail(e)) return "Invalid email format";
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
      // 1) Update email only
      await memberApi.patch("/member/me", { email: norm(email) });

      // 2) Optional: upload avatar file
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await memberApi.post("/member/avatar", fd); // ✅ no manual headers
        setAvatarFile(null);

        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview("");
      }

      setOk("Profile updated");
      await loadMe();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const shownAvatar = avatarPreview || existingAvatar;

  return (
    <div className="pe-page">
      <div className="pe-overlay" />

      <header className="pe-header">
        <button className="pe-back" onClick={() => nav(-1)}>
          ←
        </button>
        <div>
          <h1>Edit Profile</h1>
          <p>Update your email and photo</p>
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
                  {shownAvatar ? (
                    <img src={shownAvatar} alt="" />
                  ) : (
                    <span>{initials(user?.nickname)}</span>
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
                        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
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

            {/* Email only */}
            <section className="pe-card">
              <h3>Account</h3>

              <label className="pe-field">
                <span>Email</span>
                <input value={email} onChange={(e) => { setOk(""); setErr(""); setEmail(e.target.value); }} />
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
          </>
        )}
      </main>

      <div className="peNavSpacer" />
      <MemberBottomNav active="mine" />
    </div>
  );
}
