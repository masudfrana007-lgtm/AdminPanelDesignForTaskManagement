// src/pages/Settings.jsx
import { useState } from "react";
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
  FaChartLine,
  FaWallet,
  FaExchangeAlt,
  FaStar,
  FaCheckCircle,
  FaHeadset
} from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/settings.css";

export default function Settings() {
  const nav = useNavigate();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const languages = ["English", "বাংলা", "中文", "Español", "Français", "日本語"];
  const currencies = ["USD", "EUR", "BDT", "GBP", "JPY", "CNY"];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("memberToken");
      nav("/member/login");
    }
  };

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
        {/* Profile Card */}
        <div className="setProfileCard">
          <div className="setProfileHeader">
            <div className="setAvatarWrapper">
              <div className="setAvatar">
                <FaUserCircle />
              </div>
              <button className="setAvatarEdit" onClick={() => nav("/profile")}>
                <FaEdit />
              </button>
            </div>
            <div className="setProfileInfo">
              <div className="setProfileName">John Doe</div>
              <div className="setProfileEmail">member@example.com</div>
              <div className="setProfileBadge">
                <FaStar /> VIP Level 3
              </div>
            </div>
          </div>
          
          <div className="setStatsGrid">
            <div className="setStatCard">
              <div className="setStatIcon wallet">
                <FaWallet />
              </div>
              <div className="setStatValue">$12,450</div>
              <div className="setStatLabel">Total Balance</div>
            </div>
            <div className="setStatCard">
              <div className="setStatIcon transactions">
                <FaExchangeAlt />
              </div>
              <div className="setStatValue">248</div>
              <div className="setStatLabel">Transactions</div>
            </div>
            <div className="setStatCard">
              <div className="setStatIcon tasks">
                <FaCheckCircle />
              </div>
              <div className="setStatValue">156</div>
              <div className="setStatLabel">Tasks Done</div>
            </div>
          </div>
        </div>
        {/* Profile Section */}
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

        {/* Notifications */}
        <section className="setSection">
          <h2 className="setSectionTitle">
            <FaBell /> Notifications
          </h2>

          <div className="setCard">
            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper push">
                  <FaMobileAlt className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Push Notifications</div>
                  <div className="setToggleDesc">Receive app notifications</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>

            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper email">
                  <FaEnvelope className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Email Notifications</div>
                  <div className="setToggleDesc">Receive email updates</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>

            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper transaction">
                  <FaDollarSign className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Transaction Alerts</div>
                  <div className="setToggleDesc">Notify on deposits & withdrawals</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={transactionAlerts}
                  onChange={(e) => setTransactionAlerts(e.target.checked)}
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>

            <div className="setToggleItem">
              <div className="setToggleLeft">
                <div className="setToggleIconWrapper price">
                  <FaBell className="setToggleIcon" />
                </div>
                <div>
                  <div className="setToggleTitle">Price Alerts</div>
                  <div className="setToggleDesc">Crypto price change notifications</div>
                </div>
              </div>
              <label className="setToggle">
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={(e) => setPriceAlerts(e.target.checked)}
                />
                <span className="setToggleSlider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Preferences */}
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
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
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
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
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
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
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
                  checked={biometricLogin}
                  onChange={(e) => setBiometricLogin(e.target.checked)}
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

        {/* Footer Info */}
        {/* <div className="setFooter">
          <div className="setFooterTop">
            <div className="setFooterLogo">💰</div>
            <div className="setFooterBrand">Crypto Task Platform</div>
          </div>
          <div className="setFooterText">© 2026 All rights reserved.</div>
          <div className="setFooterTagline">Secure. Reliable. Professional.</div>
        </div> */}
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
}
