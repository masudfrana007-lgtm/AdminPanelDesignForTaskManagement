<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaRoute, FaShieldAlt, FaCheckCircle, FaEye, FaLock } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/platformGuide.css";

const platformSections = [
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
    icon: <FaCheckCircle />,
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

function PlatformSection({ section, index }) {
  return (
    <div className={`platform-section fadeIn delay-${index}`}>
      <div className="platform-section-header">
        <div className="platform-section-icon">
          {section.icon}
        </div>
        <h3 className="platform-section-title">{section.title}</h3>
      </div>
      
      <p className="platform-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="platform-highlights">
          <ul className="platform-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="platform-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="platform-note">
          <div className="note-icon">💡</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function PlatformGuide() {
  const navigate = useNavigate();

  return (
    <div className="platform-guide-page">
      <div className="platform-guide-container">
        {/* Header */}
        <header className="platform-guide-header">
          <button className="platform-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="platform-guide-header-content">
            <h1 className="platform-guide-header-title">Understand the Platform</h1>
            <p className="platform-guide-header-subtitle">Complete platform overview</p>
          </div>
        </header>

        {/* Banner */}
        <div className="platform-guide-banner">
          <img 
            src="/home/hero-1.png" 
            alt="Understand the Platform" 
            className="platform-guide-banner-image"
          />
          <div className="platform-guide-banner-overlay">
            <div className="platform-guide-banner-content">
              <div className="platform-guide-banner-icon">
                <FaBuilding />
              </div>
              <h2 className="platform-guide-banner-title">Understand the Platform</h2>
              <p className="platform-guide-banner-description">
                Structured, transparent, and secure workflow for all users
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="platform-guide-content">
          {/* Introduction */}
          <div className="platform-guide-intro fadeIn">
            <p className="platform-guide-intro-text">
              The platform is built around a structured and transparent workflow designed to help users operate with clarity, 
              confidence, and security. Every process—from task participation to withdrawal—is organized to ensure accuracy, 
              fairness, and accountability.
            </p>
            <div className="platform-importance">
              <div className="importance-icon">
                <FaShieldAlt />
              </div>
              <p>
                <strong>Understanding how the platform functions is essential for avoiding mistakes and ensuring a smooth user experience.</strong>
              </p>
            </div>
          </div>

          {/* Platform Sections */}
          <div className="platform-guide-sections">
            {platformSections.map((section, index) => (
              <PlatformSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Building Confidence */}
          <div className="platform-section fadeIn">
            <div className="platform-section-header">
              <div className="platform-section-icon">
                <FaShieldAlt />
              </div>
              <h3 className="platform-section-title">{buildingConfidence.title}</h3>
            </div>
            <p className="platform-section-description">{buildingConfidence.description}</p>
            <div className="platform-confidence">
              <div className="confidence-icon">
                <FaCheckCircle />
              </div>
              <p>{buildingConfidence.conclusion}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="platform-guide-actions">
            <button 
              className="platform-guide-start-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaCheckCircle />
              Start Using Platform
            </button>
            <button 
              className="platform-guide-rules-btn"
              onClick={() => navigate('/rules-and-instructions')}
            >
              <FaBuilding />
              Read Platform Rules
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
=======
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBuilding, FaRoute, FaShieldAlt, FaCheckCircle, FaEye, FaLock } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/platformGuide.css";

const platformSections = [
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
    icon: <FaCheckCircle />,
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

function PlatformSection({ section, index }) {
  return (
    <div className={`platform-section fadeIn delay-${index}`}>
      <div className="platform-section-header">
        <div className="platform-section-icon">
          {section.icon}
        </div>
        <h3 className="platform-section-title">{section.title}</h3>
      </div>
      
      <p className="platform-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="platform-highlights">
          <ul className="platform-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="platform-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="platform-note">
          <div className="note-icon">💡</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function PlatformGuide() {
  const navigate = useNavigate();

  return (
    <div className="platform-guide-page">
      <div className="platform-guide-container">
        {/* Header */}
        <header className="platform-guide-header">
          <button className="platform-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="platform-guide-header-content">
            <h1 className="platform-guide-header-title">Understand the Platform</h1>
            <p className="platform-guide-header-subtitle">Complete platform overview</p>
          </div>
        </header>

        {/* Banner */}
        <div className="platform-guide-banner">
          <img 
            src="/home/hero-1.png" 
            alt="Understand the Platform" 
            className="platform-guide-banner-image"
          />
          <div className="platform-guide-banner-overlay">
            <div className="platform-guide-banner-content">
              <div className="platform-guide-banner-icon">
                <FaBuilding />
              </div>
              <h2 className="platform-guide-banner-title">Understand the Platform</h2>
              <p className="platform-guide-banner-description">
                Structured, transparent, and secure workflow for all users
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="platform-guide-content">
          {/* Introduction */}
          <div className="platform-guide-intro fadeIn">
            <p className="platform-guide-intro-text">
              The platform is built around a structured and transparent workflow designed to help users operate with clarity, 
              confidence, and security. Every process—from task participation to withdrawal—is organized to ensure accuracy, 
              fairness, and accountability.
            </p>
            <div className="platform-importance">
              <div className="importance-icon">
                <FaShieldAlt />
              </div>
              <p>
                <strong>Understanding how the platform functions is essential for avoiding mistakes and ensuring a smooth user experience.</strong>
              </p>
            </div>
          </div>

          {/* Platform Sections */}
          <div className="platform-guide-sections">
            {platformSections.map((section, index) => (
              <PlatformSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Building Confidence */}
          <div className="platform-section fadeIn">
            <div className="platform-section-header">
              <div className="platform-section-icon">
                <FaShieldAlt />
              </div>
              <h3 className="platform-section-title">{buildingConfidence.title}</h3>
            </div>
            <p className="platform-section-description">{buildingConfidence.description}</p>
            <div className="platform-confidence">
              <div className="confidence-icon">
                <FaCheckCircle />
              </div>
              <p>{buildingConfidence.conclusion}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="platform-guide-actions">
            <button 
              className="platform-guide-start-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaCheckCircle />
              Start Using Platform
            </button>
            <button 
              className="platform-guide-rules-btn"
              onClick={() => navigate('/rules-and-instructions')}
            >
              <FaBuilding />
              Read Platform Rules
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}