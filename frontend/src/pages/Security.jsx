// src/pages/Security.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShieldAlt, 
  FaLock, 
  FaMobileAlt, 
  FaKey, 
  FaFingerprint, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaHistory,
  FaClock
} from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/security.css";

export default function Security() {
  const nav = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [withdrawalVerification, setWithdrawalVerification] = useState(true);

  const securityScore = 85; // Out of 100

  const securityLogs = [
    {
      id: 1,
      action: "Password Changed",
      device: "Chrome on Windows",
      location: "Dhaka, Bangladesh",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      action: "Login Attempt",
      device: "Mobile App (Android)",
      location: "Dhaka, Bangladesh",
      time: "5 hours ago",
      status: "success"
    },
    {
      id: 3,
      action: "Withdrawal Request",
      device: "Chrome on Windows",
      location: "Dhaka, Bangladesh",
      time: "1 day ago",
      status: "verified"
    },
    {
      id: 4,
      action: "Failed Login",
      device: "Unknown Device",
      location: "Unknown Location",
      time: "2 days ago",
      status: "blocked"
    }
  ];

  const devices = [
    {
      id: 1,
      name: "Chrome on Windows",
      lastActive: "Active Now",
      location: "Dhaka, Bangladesh",
      isCurrent: true
    },
    {
      id: 2,
      name: "Mobile App (Android)",
      lastActive: "5 hours ago",
      location: "Dhaka, Bangladesh",
      isCurrent: false
    }
  ];

  return (
    <div className="securityPage">
      {/* Header */}
      <header className="secHeader">
        <button className="secBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>
        <div className="secTitle">Security Center</div>
        <div style={{ width: 44 }} />
      </header>

      <div className="secContainer">
        {/* Security Score */}
        <section className="secScoreCard">
          <div className="secScoreHeader">
            <FaShieldAlt className="secScoreIcon" />
            <div>
              <div className="secScoreTitle">Security Score</div>
              <div className="secScoreSubtitle">Your account is well protected</div>
            </div>
          </div>
          <div className="secScoreCircle">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="10"
                strokeDasharray={`${(securityScore / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="secScoreValue">{securityScore}</div>
          </div>
        </section>

        {/* Security Features */}
        <section className="secSection">
          <h2 className="secSectionTitle">
            <FaLock /> Security Features
          </h2>

          <div className="secCard">
            <div className="secFeature">
              <div className="secFeatureLeft">
                <FaMobileAlt className="secFeatureIcon enabled" />
                <div className="secFeatureInfo">
                  <div className="secFeatureTitle">Two-Factor Authentication</div>
                  <div className="secFeatureDesc">
                    {twoFactorEnabled ? "Enabled - Your account is protected" : "Disabled - Enable for better security"}
                  </div>
                </div>
              </div>
              <label className="secToggle">
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
                <span className="secToggleSlider"></span>
              </label>
            </div>

            <div className="secFeature">
              <div className="secFeatureLeft">
                <FaFingerprint className="secFeatureIcon" />
                <div className="secFeatureInfo">
                  <div className="secFeatureTitle">Biometric Login</div>
                  <div className="secFeatureDesc">
                    {biometricEnabled ? "Enabled - Use fingerprint to login" : "Disabled - Enable fingerprint access"}
                  </div>
                </div>
              </div>
              <label className="secToggle">
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                />
                <span className="secToggleSlider"></span>
              </label>
            </div>

            <div className="secFeature">
              <div className="secFeatureLeft">
                <FaExclamationTriangle className="secFeatureIcon enabled" />
                <div className="secFeatureInfo">
                  <div className="secFeatureTitle">Withdrawal Verification</div>
                  <div className="secFeatureDesc">
                    {withdrawalVerification ? "Enabled - Extra verification for withdrawals" : "Disabled - No extra verification"}
                  </div>
                </div>
              </div>
              <label className="secToggle">
                <input
                  type="checkbox"
                  checked={withdrawalVerification}
                  onChange={(e) => setWithdrawalVerification(e.target.checked)}
                />
                <span className="secToggleSlider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Password & Keys */}
        <section className="secSection">
          <h2 className="secSectionTitle">
            <FaKey /> Password & Authentication
          </h2>

          <div className="secCard">
            <button className="secActionItem" onClick={() => alert("Change password feature")}>
              <div className="secActionLeft">
                <FaLock className="secActionIcon" />
                <div>
                  <div className="secActionTitle">Change Password</div>
                  <div className="secActionDesc">Last changed 30 days ago</div>
                </div>
              </div>
              <span className="secActionArrow">›</span>
            </button>

            <button className="secActionItem" onClick={() => alert("Manage API keys")}>
              <div className="secActionLeft">
                <FaKey className="secActionIcon" />
                <div>
                  <div className="secActionTitle">API Keys</div>
                  <div className="secActionDesc">Manage your API access keys</div>
                </div>
              </div>
              <span className="secActionArrow">›</span>
            </button>
          </div>
        </section>

        {/* Active Devices */}
        <section className="secSection">
          <h2 className="secSectionTitle">
            <FaMobileAlt /> Active Devices
          </h2>

          <div className="secCard">
            {devices.map((device) => (
              <div key={device.id} className={`secDevice ${device.isCurrent ? "current" : ""}`}>
                <div className="secDeviceInfo">
                  <div className="secDeviceHeader">
                    <div className="secDeviceName">{device.name}</div>
                    {device.isCurrent && <span className="secDeviceBadge">Current</span>}
                  </div>
                  <div className="secDeviceMeta">
                    <FaClock /> {device.lastActive}
                  </div>
                  <div className="secDeviceMeta">📍 {device.location}</div>
                </div>
                {!device.isCurrent && (
                  <button className="secDeviceRemove" onClick={() => alert("Remove device")}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Security Activity Log */}
        <section className="secSection">
          <h2 className="secSectionTitle">
            <FaHistory /> Recent Security Activity
          </h2>

          <div className="secCard">
            {securityLogs.map((log) => (
              <div key={log.id} className="secLog">
                <div className="secLogIcon">
                  {log.status === "success" && <FaCheckCircle className="success" />}
                  {log.status === "verified" && <FaShieldAlt className="verified" />}
                  {log.status === "blocked" && <FaExclamationTriangle className="blocked" />}
                </div>
                <div className="secLogInfo">
                  <div className="secLogAction">{log.action}</div>
                  <div className="secLogDetails">
                    {log.device} • {log.location}
                  </div>
                  <div className="secLogTime">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Tips */}
        <section className="secSection">
          <div className="secTips">
            <div className="secTipIcon">💡</div>
            <div className="secTipContent">
              <div className="secTipTitle">Security Tips</div>
              <ul className="secTipList">
                <li>Never share your password or 2FA codes with anyone</li>
                <li>Use a strong, unique password for your account</li>
                <li>Enable all available security features</li>
                <li>Review your security activity regularly</li>
                <li>Be cautious of phishing attempts</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}
