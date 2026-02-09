<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBook, FaRoute, FaShieldAlt, FaCheckCircle, FaEye, FaLock, FaUsers } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/platformRulesGuide.css";

const platformRulesSections = [
  {
    icon: <FaRoute />,
    title: "A Structured and Transparent Workflow",
    description: "The platform follows a clearly defined operational flow:",
    highlights: [
      "Task Assignment → Task Completion → Review & Verification → Status Update → Withdrawal"
    ],
    note: "Each stage is visible to the user and designed to minimize uncertainty. This structured approach ensures that all activities are traceable and that users always understand what action is required at each step."
  },
  {
    icon: <FaUsers />,
    title: "Clear Operational Rules",
    description: "Rules and guidelines are in place to protect both users and the system. These rules ensure:",
    highlights: [
      "Fair participation for all users",
      "Prevention of misuse, duplication, or manipulation",
      "Consistent outcomes across all tasks and transactions"
    ],
    note: "By following these rules, users help maintain a reliable and professional environment."
  },
  {
    icon: <FaEye />,
    title: "Review and Verification Process",
    description: "All tasks and financial actions are subject to review. Verification helps ensure:",
    highlights: [
      "Tasks are completed according to instructions",
      "Submitted data and proof are authentic",
      "Earnings are calculated accurately"
    ],
    note: "This process protects users from errors and safeguards the integrity of the platform."
  },
  {
    icon: <FaLock />,
    title: "Security and Account Protection",
    description: "Security checks are integrated into every critical action. These measures help:",
    highlights: [
      "Protect user accounts and balances",
      "Detect unusual or unauthorized activity",
      "Prevent fraudulent behavior and data misuse"
    ],
    note: "Users are encouraged to keep their login credentials secure and ensure their account information remains up to date."
  }
];

const buildingConfidence = {
  title: "Building Confidence Through Transparency",
  description: "The platform is designed to be predictable and understandable. Clear statuses, visible timelines, and defined processes allow users to make informed decisions and trust the results they receive.",
  conclusion: "By fully understanding the platform, users can participate confidently, reduce errors, and experience a smooth and reliable workflow."
};

function PlatformRulesSection({ section, index }) {
  return (
    <div className={`platform-rules-section fadeIn delay-${index}`}>
      <div className="platform-rules-section-header">
        <div className="platform-rules-section-icon">
          {section.icon}
        </div>
        <h3 className="platform-rules-section-title">{section.title}</h3>
      </div>
      
      <p className="platform-rules-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="platform-rules-highlights">
          <ul className="platform-rules-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="platform-rules-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="platform-rules-note">
          <div className="note-icon">📋</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function PlatformRulesGuide() {
  const navigate = useNavigate();

  return (
    <div className="platform-rules-guide-page">
      <div className="platform-rules-guide-container">
        {/* Header */}
        <header className="platform-rules-guide-header">
          <button className="platform-rules-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="platform-rules-guide-header-content">
            <h1 className="platform-rules-guide-header-title">Platform Rules</h1>
            <p className="platform-rules-guide-header-subtitle">Complete platform rules guide</p>
          </div>
        </header>

        {/* Banner */}
        <div className="platform-rules-guide-banner">
          <img 
            src="/home/hero-3.png" 
            alt="Platform Rules" 
            className="platform-rules-guide-banner-image"
          />
          <div className="platform-rules-guide-banner-overlay">
            <div className="platform-rules-guide-banner-content">
              <div className="platform-rules-guide-banner-icon">
                <FaBook />
              </div>
              <h2 className="platform-rules-guide-banner-title">Platform Rules</h2>
              <p className="platform-rules-guide-banner-description">
                Essential guidelines for fair and secure platform usage
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="platform-rules-guide-content">
          {/* Introduction */}
          <div className="platform-rules-guide-intro fadeIn">
            <p className="platform-rules-guide-intro-text">
              The platform is built around a structured and transparent workflow designed to help users operate with clarity, 
              confidence, and security. Every process—from task participation to withdrawal—is organized to ensure accuracy, 
              fairness, and accountability.
            </p>
            <div className="platform-rules-importance">
              <div className="importance-icon">
                <FaShieldAlt />
              </div>
              <p>
                <strong>Understanding how the platform functions is essential for avoiding mistakes and ensuring a smooth user experience.</strong>
              </p>
            </div>
          </div>

          {/* Platform Rules Sections */}
          <div className="platform-rules-guide-sections">
            {platformRulesSections.map((section, index) => (
              <PlatformRulesSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Building Confidence */}
          <div className="platform-rules-section fadeIn">
            <div className="platform-rules-section-header">
              <div className="platform-rules-section-icon">
                <FaShieldAlt />
              </div>
              <h3 className="platform-rules-section-title">{buildingConfidence.title}</h3>
            </div>
            <p className="platform-rules-section-description">{buildingConfidence.description}</p>
            <div className="platform-rules-confidence">
              <div className="confidence-icon">
                <FaCheckCircle />
              </div>
              <p>{buildingConfidence.conclusion}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="platform-rules-guide-actions">
            <button 
              className="platform-rules-guide-start-btn"
              onClick={() => navigate('/rules-and-instructions')}
            >
              <FaBook />
              Read Detailed Rules
            </button>
            <button 
              className="platform-rules-guide-tasks-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaCheckCircle />
              Start Tasks
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
=======
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBook, FaRoute, FaShieldAlt, FaCheckCircle, FaEye, FaLock, FaUsers } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/platformRulesGuide.css";

const platformRulesSections = [
  {
    icon: <FaRoute />,
    title: "A Structured and Transparent Workflow",
    description: "The platform follows a clearly defined operational flow:",
    highlights: [
      "Task Assignment → Task Completion → Review & Verification → Status Update → Withdrawal"
    ],
    note: "Each stage is visible to the user and designed to minimize uncertainty. This structured approach ensures that all activities are traceable and that users always understand what action is required at each step."
  },
  {
    icon: <FaUsers />,
    title: "Clear Operational Rules",
    description: "Rules and guidelines are in place to protect both users and the system. These rules ensure:",
    highlights: [
      "Fair participation for all users",
      "Prevention of misuse, duplication, or manipulation",
      "Consistent outcomes across all tasks and transactions"
    ],
    note: "By following these rules, users help maintain a reliable and professional environment."
  },
  {
    icon: <FaEye />,
    title: "Review and Verification Process",
    description: "All tasks and financial actions are subject to review. Verification helps ensure:",
    highlights: [
      "Tasks are completed according to instructions",
      "Submitted data and proof are authentic",
      "Earnings are calculated accurately"
    ],
    note: "This process protects users from errors and safeguards the integrity of the platform."
  },
  {
    icon: <FaLock />,
    title: "Security and Account Protection",
    description: "Security checks are integrated into every critical action. These measures help:",
    highlights: [
      "Protect user accounts and balances",
      "Detect unusual or unauthorized activity",
      "Prevent fraudulent behavior and data misuse"
    ],
    note: "Users are encouraged to keep their login credentials secure and ensure their account information remains up to date."
  }
];

const buildingConfidence = {
  title: "Building Confidence Through Transparency",
  description: "The platform is designed to be predictable and understandable. Clear statuses, visible timelines, and defined processes allow users to make informed decisions and trust the results they receive.",
  conclusion: "By fully understanding the platform, users can participate confidently, reduce errors, and experience a smooth and reliable workflow."
};

function PlatformRulesSection({ section, index }) {
  return (
    <div className={`platform-rules-section fadeIn delay-${index}`}>
      <div className="platform-rules-section-header">
        <div className="platform-rules-section-icon">
          {section.icon}
        </div>
        <h3 className="platform-rules-section-title">{section.title}</h3>
      </div>
      
      <p className="platform-rules-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="platform-rules-highlights">
          <ul className="platform-rules-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="platform-rules-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="platform-rules-note">
          <div className="note-icon">📋</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function PlatformRulesGuide() {
  const navigate = useNavigate();

  return (
    <div className="platform-rules-guide-page">
      <div className="platform-rules-guide-container">
        {/* Header */}
        <header className="platform-rules-guide-header">
          <button className="platform-rules-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="platform-rules-guide-header-content">
            <h1 className="platform-rules-guide-header-title">Platform Rules</h1>
            <p className="platform-rules-guide-header-subtitle">Complete platform rules guide</p>
          </div>
        </header>

        {/* Banner */}
        <div className="platform-rules-guide-banner">
          <img 
            src="/home/hero-3.png" 
            alt="Platform Rules" 
            className="platform-rules-guide-banner-image"
          />
          <div className="platform-rules-guide-banner-overlay">
            <div className="platform-rules-guide-banner-content">
              <div className="platform-rules-guide-banner-icon">
                <FaBook />
              </div>
              <h2 className="platform-rules-guide-banner-title">Platform Rules</h2>
              <p className="platform-rules-guide-banner-description">
                Essential guidelines for fair and secure platform usage
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="platform-rules-guide-content">
          {/* Introduction */}
          <div className="platform-rules-guide-intro fadeIn">
            <p className="platform-rules-guide-intro-text">
              The platform is built around a structured and transparent workflow designed to help users operate with clarity, 
              confidence, and security. Every process—from task participation to withdrawal—is organized to ensure accuracy, 
              fairness, and accountability.
            </p>
            <div className="platform-rules-importance">
              <div className="importance-icon">
                <FaShieldAlt />
              </div>
              <p>
                <strong>Understanding how the platform functions is essential for avoiding mistakes and ensuring a smooth user experience.</strong>
              </p>
            </div>
          </div>

          {/* Platform Rules Sections */}
          <div className="platform-rules-guide-sections">
            {platformRulesSections.map((section, index) => (
              <PlatformRulesSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Building Confidence */}
          <div className="platform-rules-section fadeIn">
            <div className="platform-rules-section-header">
              <div className="platform-rules-section-icon">
                <FaShieldAlt />
              </div>
              <h3 className="platform-rules-section-title">{buildingConfidence.title}</h3>
            </div>
            <p className="platform-rules-section-description">{buildingConfidence.description}</p>
            <div className="platform-rules-confidence">
              <div className="confidence-icon">
                <FaCheckCircle />
              </div>
              <p>{buildingConfidence.conclusion}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="platform-rules-guide-actions">
            <button 
              className="platform-rules-guide-start-btn"
              onClick={() => navigate('/rules-and-instructions')}
            >
              <FaBook />
              Read Detailed Rules
            </button>
            <button 
              className="platform-rules-guide-tasks-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaCheckCircle />
              Start Tasks
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}