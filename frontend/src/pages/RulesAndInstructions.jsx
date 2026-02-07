import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBook, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaGavel } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/rulesGuide.css";

const rulesSections = [
  {
    icon: <FaGavel />,
    title: "Single Account Policy",
    description: "Each user is permitted to operate only one account on the platform. Creating or using duplicate or multiple accounts, whether intentionally or unintentionally, is strictly prohibited.",
    highlights: [
      "Multiple accounts registered by the same individual",
      "Multiple accounts accessed from the same device, IP address, or network",
      "Accounts created to gain unfair advantages, bonuses, or task access"
    ],
    note: "The system actively monitors unusual account activity. Any detection of duplicate accounts may lead to immediate account review or permanent restriction."
  },
  {
    icon: <FaShieldAlt />,
    title: "Device & Access Monitoring",
    description: "To protect platform integrity, device identifiers and access patterns may be monitored. Using multiple accounts from the same device, browser, or environment is not allowed unless explicitly authorized by the platform.",
    highlights: [
      "Device identifiers are actively monitored",
      "Access patterns are tracked for security",
      "Same device usage for multiple accounts is prohibited",
      "Authorization required for shared device access"
    ],
    note: "Attempts to bypass system controls or masking techniques may be treated as a violation of platform rules."
  },
  {
    icon: <FaExclamationTriangle />,
    title: "Prohibition of Fake or Misleading Information",
    description: "All information submitted on the platform must be accurate and truthful. Any form of fabricated evidence or false documentation will result in immediate account review.",
    highlights: [
      "Providing fake or manipulated transaction information",
      "Uploading false payment confirmations or edited screenshots",
      "Submitting incorrect or misleading account details",
      "Falsifying task completion data"
    ],
    note: "Any form of fabricated evidence or false documentation may lead to loss of earnings or permanent suspension."
  },
  {
    icon: <FaCheckCircle />,
    title: "Screenshot & Proof Submission Guidelines",
    description: "When screenshots or visual proof are required, they must meet specific standards to ensure authenticity and verifiability.",
    highlights: [
      "Screenshots must be original and unedited",
      "Information must be clearly visible and verifiable",
      "Reused or duplicated screenshots are not allowed"
    ],
    note: "Submitting altered or reused proof undermines platform trust and will be treated as a serious violation."
  }
];

const consequences = [
  "Account suspension or permanent restriction", 
  "Loss of earnings and accumulated rewards",
  "Withdrawal delays or account freezing",
  "Immediate account review and investigation"
];

const fairUsePoints = [
  "Conduct audits and reviews at any time",
  "Request additional verification when necessary", 
  "Take corrective action to protect system fairness"
];

function RulesSection({ section, index }) {
  return (
    <div className={`rules-section fadeIn delay-${index}`}>
      <div className="rules-section-header">
        <div className="rules-section-icon">
          {section.icon}
        </div>
        <h3 className="rules-section-title">{section.title}</h3>
      </div>
      
      <p className="rules-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="rules-highlights">
          <p className="highlights-intro">Key requirements include:</p>
          <ul className="rules-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="rules-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="rules-note">
          <div className="note-icon">⚠️</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function RulesAndInstructions() {
  const navigate = useNavigate();

  return (
    <div className="rules-guide-page">
      <div className="rules-guide-container">
        {/* Header */}
        <header className="rules-guide-header">
          <button className="rules-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="rules-guide-header-content">
            <h1 className="rules-guide-header-title">Platform Rules</h1>
            <p className="rules-guide-header-subtitle">Essential guidelines for all users</p>
          </div>
        </header>

        {/* Banner */}
        <div className="rules-guide-banner">
          <img 
            src="/home/hero-1.png" 
            alt="Rules and Instructions" 
            className="rules-guide-banner-image"
          />
          <div className="rules-guide-banner-overlay">
            <div className="rules-guide-banner-content">
              <div className="rules-guide-banner-icon">
                <FaBook />
              </div>
              <h2 className="rules-guide-banner-title">Read Rules & Instructions</h2>
              <p className="rules-guide-banner-description">
                Understand platform guidelines before starting any activities
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rules-guide-content">
          {/* Introduction */}
          <div className="rules-guide-intro fadeIn">
            <p className="rules-guide-intro-text">
              Before participating in any task, campaign, or financial activity on the platform, all users are 
              required to carefully review and understand the rules and operational guidelines. These rules are 
              designed to ensure fairness, system integrity, and a secure environment for all users.
            </p>
            <div className="rules-warning">
              <div className="warning-icon">
                <FaExclamationTriangle />
              </div>
              <p>
                <strong>Important Notice:</strong> Failure to comply with platform rules may result in account 
                suspension, restriction of withdrawals, or permanent account termination.
              </p>
            </div>
          </div>

          {/* Rules Sections */}
          <div className="rules-guide-sections">
            {rulesSections.map((section, index) => (
              <RulesSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Fair Use & Ethical Participation */}
          <div className="rules-section fadeIn">
            <div className="rules-section-header">
              <div className="rules-section-icon">
                <FaShieldAlt />
              </div>
              <h3 className="rules-section-title">Fair Use & Ethical Participation</h3>
            </div>
            <p className="rules-section-description">
              Users are expected to participate honestly and responsibly. Any attempt to manipulate results, 
              exploit system loopholes, or interfere with platform operations is strictly forbidden.
            </p>
            <div className="rules-highlights">
              <p className="highlights-intro">The platform reserves the right to:</p>
              <ul className="rules-list">
                {fairUsePoints.map((point, index) => (
                  <li key={index} className="rules-list-item">
                    <FaCheckCircle className="list-icon" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consequences */}
          <div className="rules-section fadeIn">
            <div className="rules-section-header">
              <div className="rules-section-icon">
                <FaExclamationTriangle />
              </div>
              <h3 className="rules-section-title">Potential Consequences</h3>
            </div>
            <p className="rules-section-description">
              Violations of platform rules may result in the following actions:
            </p>
            <div className="rules-highlights">
              <ul className="rules-list">
                {consequences.map((consequence, index) => (
                  <li key={index} className="rules-list-item">
                    <FaExclamationTriangle className="list-icon" />
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Acknowledgment of Rules */}
          <div className="rules-section fadeIn">
            <div className="rules-section-header">
              <div className="rules-section-icon">
                <FaBook />
              </div>
              <h3 className="rules-section-title">Acknowledgment of Rules</h3>
            </div>
            <p className="rules-section-description">
              By continuing to use the platform, users acknowledge that they have read, understood, and 
              agreed to comply with all rules and instructions. These guidelines exist to protect both 
              users and the platform and to ensure a secure and reliable experience for everyone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="rules-guide-actions">
            <button 
              className="rules-guide-understand-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaCheckCircle />
              I Understand the Rules
            </button>
            <button 
              className="rules-guide-support-btn"
              onClick={() => navigate('/member/service')}
            >
              <FaBook />
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
}