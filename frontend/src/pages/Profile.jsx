import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);

  const user = {
    name: "John Doe",
    uid: "U92837465",
    email: "john****@mail.com",
    phone: "+855 **** 234",
    country: "Cambodia",
    registered: "2024-07-18",
    lastLogin: "2026-01-28 02:41",
    level: "VIP 1",
    kyc: "Verified",
    twoFA: true,
    status: "Active",
  };

  const pickAvatar = () => fileRef.current.click();

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="pf-page">
      <div className="pf-overlay" />

      {/* Header */}
      <header className="pf-header">
        <button className="pf-back" onClick={() => window.history.back()}>
          ←
        </button>
        <div>
          <h1>Profile</h1>
          <p>Manage your personal information and security</p>
        </div>
      </header>

      <main className="pf-wrap">
        {/* Top profile card */}
        <section className="pf-card pf-top">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            
            {/* Left Side: Avatar + User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              <div className="pf-avatarWrap" onClick={pickAvatar}>
                <div className="pf-avatar">
                  {/* {avatar ? <img src={avatar} alt="avatar" /> : "JD"} */}
                  <img
                    src={`https://i.pravatar.cc/150?u=${user.uid}`}
                    alt="User Avatar"
                    className="mine-avatar-img"
                  />
                </div>
                <div className="pf-avatarHint">Change photo</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onAvatarChange}
                />
              </div>

              <div className="pf-basic">
                <div className="pf-name">{user.name}</div>
                <div className="pf-uid">
                  UID: {user.uid}
                  <button onClick={() => navigator.clipboard.writeText(user.uid)}>
                    Copy
                  </button>
                </div>

                <div className="pf-tags">
                  <span className="pf-tag gold">{user.level}</span>
                  <span className="pf-tag green">{user.status}</span>
                </div>
              </div>
            </div>

            {/* Right Side: Support Button */}
            <div className="pf-support">
              <button 
                className="pf-btn primary"
                onClick={() => navigate('/member/service')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  padding: '10px 16px'
                }}
              >
                🎧 Support
              </button>
            </div>

          </div>
        </section>

        {/* Grid */}
        <section className="pf-grid">
          {/* Account info */}
          <div className="pf-card">
            <h3>Account Information</h3>

            <div className="pf-row">
              <span>Email</span>
              <span>{user.email}</span>
            </div>

            <div className="pf-row">
              <span>Phone</span>
              <span>{user.phone}</span>
            </div>

            <div className="pf-row">
              <span>Country / Region</span>
              <span>{user.country}</span>
            </div>

            <div className="pf-row">
              <span>Registered On</span>
              <span>{user.registered}</span>
            </div>

            <div className="pf-row">
              <span>Last Login</span>
              <span>{user.lastLogin}</span>
            </div>
          </div>

          {/* Security */}
          <div className="pf-card">
            <h3>Security Status</h3>

            <div className="pf-row">
              <span>KYC</span>
              <span className="ok">{user.kyc}</span>
            </div>

            <div className="pf-row">
              <span>Two-Factor Authentication</span>
              <span className={user.twoFA ? "ok" : "warn"}>
                {user.twoFA ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="pf-row">
              <span>Account Status</span>
              <span className="ok">{user.status}</span>
            </div>

            <div className="pf-actions">
              <button className="pf-btn primary">Enable / Manage 2FA</button>
              <button className="pf-btn ghost">Change Password</button>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="pf-card pf-danger">
          <h3>Account Actions</h3>
          <button className="pf-btn warn">Log Out</button>
        </section>
      </main>

	{/* spacer so content doesn't hide behind nav */}
	<div className="pfNavSpacer" />

	<MemberBottomNav active="mine" />      
    </div>
  );
}