// src/pages/MemberSettings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaGlobe,
  FaDollarSign,
  FaEye,
  FaMoon,
  FaInfoCircle,
  FaFileContract,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaEnvelope,
  FaMobileAlt,
  FaLock,
  FaLanguage,
  FaEdit,
  FaStar,
  FaCheckCircle,
  FaHeadset
} from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberSettings.css";

import memberApi from "../services/memberApi";

// Helper functions
const rankLabel = (r) => {
  if (!r) return "Trial";
  if (r === "V1") return "VIP 1";
  if (r === "V2") return "VIP 2";
  if (r === "V3") return "VIP 3";
  return "Trial";
};

const money = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
};

const API_HOST = "http://159.198.40.145:5010";
const toAbsUrl = (p) => {
  const s = String(p || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return API_HOST + s;
  return API_HOST + "/" + s;
};

export default function MemberSettings() {
  const nav = useNavigate();

  const languages = ["English", "বাংলা", "中文", "Español", "Français", "日本語"];
  const currencies = ["USD", "EUR", "BDT", "GBP", "JPY", "CNY"];

  const [member, setMember] = useState(null);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    transactionAlerts: true,
    priceAlerts: false,
    darkMode: false,
    biometricLogin: false,
    language: "English",
    currency: "USD",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const { data } = await memberApi.get("/member/me");
        setMember(data);

        setSettings((prev) => ({
          ...prev,
          pushNotifications: data.pushNotifications ?? true,
          emailNotifications: data.emailNotifications ?? true,
          transactionAlerts: data.transactionAlerts ?? true,
          priceAlerts: data.priceAlerts ?? false,
          darkMode: data.darkMode ?? false,
          biometricLogin: data.biometricLogin ?? false,
          language: data.language ?? "English",
          currency: data.currency ?? "USD",
        }));
      } catch (e) {
        setMember(null);
        setErr(e?.response?.data?.message || "Failed to load profile");
      }
    })();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("memberToken");
      nav("/member/login");
    }
  };

  // Prepare data for UI
  const avatarUrl = toAbsUrl(
    member?.avatar_url ||
      member?.photo_url ||
      member?.profile_photo_url ||
      member?.profile_picture_url ||
      member?.profile_photo ||
      ""
  );

  const hasAvatar = !!avatarUrl;
  const vip = rankLabel(member?.ranking);
  const balance = Number(member?.balance || 0);
  const transactions = member?.transactions || 0;
  const tasksDone = member?.tasksDone || 0;

  return (
    <div className="settingsPage">
      {/* Header */}
      <header className="setHeader">
        <button className="setBack" onClick={() => nav(-1)} aria-label="Back">
          ←
        </button>
        <div className="setTitle">Settings</div>
        <div style={{ width: 44 }} />
      </header>

      <div className="setContainer">
        {err && <div className="mineAlert error">{err}</div>}

        {/* Profile Card */}
        <div className="setProfileCard">
          <div className="setProfileHeader">
            <div className="setAvatarWrapper">
              <div className="setAvatar">
                {hasAvatar ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="setAvatarImg"
                    onError={(e) => (e.currentTarget.src = "/user.png")}
                  />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <button className="setAvatarEdit" onClick={() => nav("/profile")}>
                <FaEdit />
              </button>
            </div>
            <div className="setProfileInfo">
              <div className="setProfileName">{member?.name || "Guest"}</div>
              <div className="setProfileEmail">{member?.email || "-"}</div>
              <div className="setProfileBadge">
                <FaStar /> {vip}
              </div>
            </div>
          </div>

          <div className="setStatsGrid">
            <div className="setStatCard">
              <div className="setStatIcon wallet">
                <FaWallet />
              </div>
              <div className="setStatValue">${money(balance)}</div>
              <div className="setStatLabel">Total Balance</div>
            </div>
            <div className="setStatCard">
              <div className="setStatIcon transactions">
                <FaExchangeAlt />
              </div>
              <div className="setStatValue">{transactions}</div>
              <div className="setStatLabel">Transactions</div>
            </div>
            <div className="setStatCard">
              <div className="setStatIcon tasks">
                <FaCheckCircle />
              </div>
              <div className="setStatValue">{tasksDone}</div>
              <div className="setStatLabel">Tasks Done</div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaUserCircle /> Account
          </h2>

          <div className="setCard">
            <button className="setItem" onClick={() => nav("/profile")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper profile">
                  <FaUserCircle className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">Profile Information</div>
                  <div className="setItemDesc">Update your personal details</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>

            <button className="setItem" onClick={() => nav("/security")}>
              <div className="setItemLeft">
                <FaShieldAlt className="setItemIcon" />
                <div>
                  <div className="setItemTitle">Security Center</div>
                  <div className="setItemDesc">Manage security settings</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>

            <button className="setItem" onClick={() => nav("/beneficiary-management")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper wallet">
                  <FaDollarSign className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">Beneficiary Management</div>
                  <div className="setItemDesc">Manage saved wallets & bank accounts</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaBell /> Notifications
          </h2>

          <div className="setCard">
            {["pushNotifications", "emailNotifications", "transactionAlerts", "priceAlerts"].map((key) => {
              const iconMap = {
                pushNotifications: <FaMobileAlt />,
                emailNotifications: <FaEnvelope />,
                transactionAlerts: <FaDollarSign />,
                priceAlerts: <FaBell />,
              };
              const titleMap = {
                pushNotifications: "Push Notifications",
                emailNotifications: "Email Notifications",
                transactionAlerts: "Transaction Alerts",
                priceAlerts: "Price Alerts",
              };
              const descMap = {
                pushNotifications: "Receive app notifications",
                emailNotifications: "Receive email updates",
                transactionAlerts: "Notify on deposits & withdrawals",
                priceAlerts: "Crypto price change notifications",
              };
              return (
                <div className="setToggleItem" key={key}>
                  <div className="setToggleLeft">
                    <div className="setToggleIconWrapper">
                      {iconMap[key]}
                    </div>
                    <div>
                      <div className="setToggleTitle">{titleMap[key]}</div>
                      <div className="setToggleDesc">{descMap[key]}</div>
                    </div>
                  </div>
                  <label className="setToggle">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                    />
                    <span className="setToggleSlider"></span>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaGlobe /> Preferences
          </h2>
          <div className="setCard">
            <div className="setSelectItem">
              <div className="setSelectTop">
                <div className="setSelectIconWrapper language">
                  <FaLanguage className="setSelectIcon" />
                </div>
                <div>
                  <div className="setSelectTitle">Language</div>
                  <div className="setSelectDesc">App display language</div>
                </div>
              </div>
              <select
                className="setSelect"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="setSelectItem">
              <div className="setSelectTop">
                <div className="setSelectIconWrapper currency">
                  <FaDollarSign className="setSelectIcon" />
                </div>
                <div>
                  <div className="setSelectTitle">Currency</div>
                  <div className="setSelectDesc">Preferred display currency</div>
                </div>
              </div>
              <select
                className="setSelect"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper dark">
                  <FaMoon className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Dark Mode</div>
                  <div className="setToggleDesc">Enable dark theme (Coming soon)</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  disabled
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaLock /> Privacy & Security
          </h2>
          <div className="setCard">
            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper privacy">
                  <FaEye className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Hide Balance</div>
                  <div className="setToggleDesc">Hide balance on dashboard</div>
                </div>
              </div>
              <label className="setToggle">
                <input type="checkbox" />
                <span className="setToggleSlider"></span>
              </label>
            </div>

            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper lock">
                  <FaLock className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Biometric Login</div>
                  <div className="setToggleDesc">Use fingerprint to login</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={settings.biometricLogin}
                  onChange={(e) => setSettings({ ...settings, biometricLogin: e.target.checked })}
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>

            <button className="setItem" onClick={() => nav("/security")}>
              <div className="setItemLeft">
                <FaShieldAlt className="setItemIcon" />
                <div>
                  <div className="setItemTitle">Advanced Security</div>
                  <div className="setItemDesc">2FA, devices, activity logs</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>
          </div>
        </section>

        {/* About & Legal */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaInfoCircle /> About & Legal
          </h2>
          <div className="setCard">
            <button className="setItem" onClick={() => alert("Version 1.0.0")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper info">
                  <FaInfoCircle className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">App Version</div>
                  <div className="setItemDesc">1.0.0 (Build 2026.02)</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>

            <button className="setItem" onClick={() => alert("Terms of Service")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper legal">
                  <FaFileContract className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">Terms of Service</div>
                  <div className="setItemDesc">Read our terms and conditions</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>

            <button className="setItem" onClick={() => alert("Privacy Policy")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper privacy">
                  <FaShieldAlt className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">Privacy Policy</div>
                  <div className="setItemDesc">How we protect your data</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>

            <button className="setItem" onClick={() => alert("Help Center")}>
              <div className="setItemLeft">
                <div className="setItemIconWrapper help">
                  <FaHeadset className="setItemIcon" />
                </div>
                <div>
                  <div className="setItemTitle">Help Center</div>
                  <div className="setItemDesc">FAQs and support</div>
                </div>
              </div>
              <span className="setItemArrow">›</span>
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="setSection">
          <button className="setLogoutBtn" onClick={handleLogout}>
            <FaSignOutAlt className="setLogoutIcon" />
            <span>Logout Account</span>
          </button>
        </section>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}