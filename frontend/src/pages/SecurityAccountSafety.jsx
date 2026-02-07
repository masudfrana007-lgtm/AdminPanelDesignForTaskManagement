import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt, FaKey, FaLock, FaUserShield, FaEye, FaExclamationTriangle } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/securityGuide.css";

const securitySections = [
  {
    icon: <FaKey />,
    title: "Strong Password Practices",
    description: "Users should create strong and unique passwords to safeguard their accounts. A secure password:",
    highlights: [
      "Is not reused on other platforms",
      "Combines letters, numbers, and symbols",
      "Is kept private and never shared"
    ],
    note: "The platform will never request user passwords through messages, email, or support channels."
  },
  {
    icon: <FaLock />,
    title: "Protecting Login Access",
    description: "Users are advised to avoid logging in from unknown or unsecured devices and networks. Public computers, shared devices, or untrusted Wi-Fi connections may increase the risk of unauthorized access.",
    highlights: [
      "Avoid public computers and shared devices",
      "Use secure Wi-Fi connections only",
      "Log out completely after each session"
    ],
    note: "If unusual login activity is detected, additional verification may be required to protect the account."
  },
  {
    icon: <FaUserShield />,
    title: "Consistent Profile Information",
    description: "Keeping profile information accurate and consistent helps reduce verification delays and improves account security. Mismatched or frequently changing data may trigger additional security checks to prevent misuse or fraudulent activity.",
    highlights: [
      "Keep personal information up to date",
      "Ensure consistency across all profile fields",
      "Update information promptly when changes occur"
    ],
    note: "Users should update their information promptly if any legitimate changes occur."
  },
  {
    icon: <FaEye />,
    title: "Monitoring and Risk Prevention",
    description: "The platform actively monitors accounts for unusual behavior, including irregular login patterns, suspicious transactions, or policy violations. These measures are intended to:",
    highlights: [
      "Prevent unauthorized withdrawals",
      "Protect user balances",
      "Maintain system integrity"
    ],
    note: "In certain cases, temporary restrictions may be applied while security reviews are conducted."
  }
];

const userResponsibility = {
  title: "User Responsibility and Awareness",
  description: "Users are responsible for maintaining the confidentiality of their login credentials and ensuring that their accounts are not accessed by third parties. Sharing accounts or allowing unauthorized access may result in security risks and account limitations.",
  conclusion: "By following recommended security practices, users help ensure a safe, reliable, and efficient experience on the platform."
};

function SecuritySection({ section, index }) {
  return (
    <div className={`security-section fadeIn delay-${index}`}>
      <div className="security-section-header">
        <div className="security-section-icon">
          {section.icon}
        </div>
        <h3 className="security-section-title">{section.title}</h3>
      </div>
      
      <p className="security-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="security-highlights">
          <ul className="security-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="security-list-item">
                <FaShieldAlt className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="security-note">
          <div className="note-icon">🔒</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function SecurityAccountSafety() {
  const navigate = useNavigate();

  return (
    <div className="security-guide-page">
      <div className="security-guide-container">
        {/* Header */}
        <header className="security-guide-header">
          <button className="security-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="security-guide-header-content">
            <h1 className="security-guide-header-title">Security & Account Safety</h1>
            <p className="security-guide-header-subtitle">Complete security guide</p>
          </div>
        </header>

        {/* Banner */}
        <div className="security-guide-banner">
          <img 
            src="/home/hero-4.png" 
            alt="Security & Account Safety" 
            className="security-guide-banner-image"
          />
          <div className="security-guide-banner-overlay">
            <div className="security-guide-banner-content">
              <div className="security-guide-banner-icon">
                <FaShieldAlt />
              </div>
              <h2 className="security-guide-banner-title">Security & Account Safety</h2>
              <p className="security-guide-banner-description">
                Protect your account with essential security practices
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="security-guide-content">
          {/* Introduction */}
          <div className="security-guide-intro fadeIn">
            <p className="security-guide-intro-text">
              Account security is a shared responsibility between the platform and its users. The system is designed with 
              protective controls in place, while users are encouraged to follow simple but essential security practices 
              to protect their accounts and ensure smooth processing of activities and withdrawals.
            </p>
            <div className="security-warning">
              <div className="warning-icon">
                <FaExclamationTriangle />
              </div>
              <p>
                <strong>Security is Essential:</strong> Following these guidelines helps protect your account 
                and ensures faster processing of withdrawals and activities.
              </p>
            </div>
          </div>

          {/* Security Sections */}
          <div className="security-guide-sections">
            {securitySections.map((section, index) => (
              <SecuritySection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* User Responsibility */}
          <div className="security-section fadeIn">
            <div className="security-section-header">
              <div className="security-section-icon">
                <FaUserShield />
              </div>
              <h3 className="security-section-title">{userResponsibility.title}</h3>
            </div>
            <p className="security-section-description">{userResponsibility.description}</p>
            <div className="security-conclusion">
              <div className="conclusion-icon">
                <FaShieldAlt />
              </div>
              <p>{userResponsibility.conclusion}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="security-guide-actions">
            <button 
              className="security-guide-profile-btn"
              onClick={() => navigate('/member/mine')}
            >
              <FaUserShield />
              Update My Profile
            </button>
            <button 
              className="security-guide-support-btn"
              onClick={() => navigate('/member/service')}
            >
              <FaShieldAlt />
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
}