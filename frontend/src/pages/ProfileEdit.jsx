// src/pages/ProfileEdit.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";

/* ---------- CONFIG ---------- */
const API_HOST = import.meta.env.VITE_API_HOST || "";

// convert DB path like "/uploads/avatars/xx.jpg" into full URL
function toAbsUrl(p) {
  const s = String(p || "").trim();
  if (!s) return "";

  if (s.startsWith("http")) return s;

  // ALWAYS prepend API host
  return `${API_HOST}${s}`;
}

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

  // separate saving states
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [user, setUser] = useState(null); // original
  const [email, setEmail] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // clean up blob url to avoid memory leak
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // ✅ server avatar must be absolute URL (5010)
  const existingAvatar = useMemo(() => {
    const u = user || {};
    const raw =
      u.avatar_url ||
      u.photo_url ||
      u.profile_photo_url ||
      u.profile_picture_url ||
      u.profile_photo ||
      "";
    return toAbsUrl(raw);
  }, [user]);

  const shownAvatar = avatarPreview || existingAvatar;

  // separate dirty flags
  const emailDirty = useMemo(() => {
    if (!user) return false;
    return norm(user.email) !== norm(email);
  }, [user, email]);

  const photoDirty = useMemo(() => !!avatarFile, [avatarFile]);

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

  const validateEmail = () => {
    const e = norm(email);
    if (!e) return "Email is required";
    if (!isEmail(e)) return "Invalid email format";
    return "";
  };

  // ---------------------------
  // SAVE EMAIL (with confirm)
  // ---------------------------
  const saveEmail = async () => {
    const v = validateEmail();
    if (v) {
      setErr(v);
      return;
    }

    if (!emailDirty) {
      setOk("No changes to email");
      return;
    }

    const confirmed = window.confirm(`Confirm update email to:\n\n${norm(email)}`);
    if (!confirmed) return;

    setSavingEmail(true);
    setErr("");
    setOk("");

    try {
      await memberApi.patch("/member/me", { email: norm(email) });
      setOk("Email updated");
      await loadMe();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  };

  // ---------------------------
  // SAVE PHOTO (with confirm)
  // ---------------------------
  const savePhoto = async () => {
    if (!avatarFile) {
      setErr("Please choose a photo first");
      return;
    }

    const confirmed = window.confirm("Confirm update profile photo?");
    if (!confirmed) return;

    setSavingPhoto(true);
    setErr("");
    setOk("");

    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);

      // ✅ IMPORTANT:
      // - do NOT manually set Content-Type
      // - axios will set multipart boundary automatically
      const { data } = await memberApi.post("/member/avatar", fd);

      // cleanup preview/file
      setAvatarFile(null);
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview("");

      // ✅ instantly update UI without waiting (but still reload to be safe)
      if (data?.avatar_url) {
        setUser((p) => ({ ...(p || {}), avatar_url: data.avatar_url }));
      }

      setOk("Photo updated");
      await loadMe();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update photo");
    } finally {
      setSavingPhoto(false);
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
                    // key forces refresh if same URL but new file (cache-bust)
                    <img src={shownAvatar} alt="" key={shownAvatar} />
                  ) : (
                    <span>{initials(user?.nickname)}</span>
                  )}
                </div>

                <div className="pe-avatarActions">
                  <button
                    className="pe-btn"
                    onClick={pickAvatar}
                    disabled={savingPhoto || savingEmail}
                  >
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
                      disabled={savingPhoto || savingEmail}
                      onClick={() => {
                        if (avatarPreview?.startsWith("blob:"))
                          URL.revokeObjectURL(avatarPreview);
                        setAvatarFile(null);
                        setAvatarPreview("");
                        setOk("");
                        setErr("");
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <p className="pe-muted">Choose a photo, then press Save Photo.</p>

              <div className="pe-actions">
                <button
                  className="pe-btn primary"
                  onClick={savePhoto}
                  disabled={!photoDirty || savingPhoto || savingEmail}
                >
                  {savingPhoto ? "Saving…" : "Save Photo"}
                </button>
              </div>
            </section>

            {/* Email only */}
            <section className="pe-card">
              <h3>Account</h3>

              <label className="pe-field">
                <span>Email</span>
                <input
                  value={email}
                  onChange={(e) => {
                    setOk("");
                    setErr("");
                    setEmail(e.target.value);
                  }}
                />
              </label>

              <div className="pe-actions">
                <button
                  className="pe-btn ghost"
                  onClick={loadMe}
                  disabled={savingEmail || savingPhoto}
                >
                  Reset
                </button>

                <button
                  className="pe-btn primary"
                  onClick={saveEmail}
                  disabled={!emailDirty || savingEmail || savingPhoto}
                >
                  {savingEmail ? "Saving…" : "Save Email"}
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
