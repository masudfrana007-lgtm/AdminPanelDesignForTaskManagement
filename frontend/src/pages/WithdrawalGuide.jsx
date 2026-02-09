<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWallet, FaUniversity, FaBitcoin, FaShieldAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/withdrawalGuide.css";

const withdrawalSections = [
  {
    icon: <FaWallet />,
    title: "Available Withdrawal Methods",
    description: "Users can choose their preferred withdrawal method based on availability and eligibility. Currently supported options may include:",
    highlights: [
      "Bank transfer",
      "Cryptocurrency withdrawal"
    ],
    note: "Each method follows a defined processing workflow and may have different settlement times depending on the selected network or financial institution."
  },
  {
    icon: <FaCheckCircle />,
    title: "Withdrawal Request Process",
    description: "To initiate a withdrawal, users must:",
    highlights: [
      "Ensure their profile and payment details are fully completed",
      "Select the desired withdrawal method",
      "Enter the withdrawal amount within the permitted limits",
      "Submit the request for processing"
    ],
    note: "Requests submitted with incomplete or incorrect information may be delayed or rejected to ensure fund security."
  },
  {
    icon: <FaShieldAlt />,
    title: "Verification and Review",
    description: "All withdrawal requests are subject to verification before processing. This review process helps:",
    highlights: [
      "Confirm account ownership",
      "Prevent unauthorized or fraudulent activity",
      "Ensure compliance with internal financial controls"
    ],
    note: "During this stage, the withdrawal status may appear as Pending, Under Review, or Approved."
  },
  {
    icon: <FaClock />,
    title: "Withdrawal Status Tracking",
    description: "Users can monitor the progress of their withdrawal through the status timeline. The timeline provides clear visibility into each stage of the process, including:",
    highlights: [
      "Request submission",
      "Verification and review",
      "Processing",
      "Completion"
    ],
    note: "This tracking system ensures transparency and allows users to stay informed throughout the entire withdrawal cycle."
  }
];

const processingInfo = {
  title: "Processing Time and Completion",
  description: "Processing times may vary depending on the selected withdrawal method, network conditions, and verification requirements. While most withdrawals are handled promptly, delays may occur in cases requiring additional review or external confirmation.",
  conclusion: "Once completed, the withdrawn amount will be transferred to the selected bank account or crypto wallet."
};

const importantGuidelines = [
  "Withdrawals are processed only from available balances",
  "Account details must match the user's verified information", 
  "Multiple or duplicate withdrawal requests may be restricted",
  "The platform does not process withdrawals based on external requests or messages"
];

function WithdrawalSection({ section, index }) {
  return (
    <div className={`withdrawal-section fadeIn delay-${index}`}>
      <div className="withdrawal-section-header">
        <div className="withdrawal-section-icon">
          {section.icon}
        </div>
        <h3 className="withdrawal-section-title">{section.title}</h3>
      </div>
      
      <p className="withdrawal-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="withdrawal-highlights">
          <ul className="withdrawal-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="withdrawal-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="withdrawal-note">
          <div className="note-icon">💡</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function WithdrawalGuide() {
  const navigate = useNavigate();

  return (
    <div className="withdrawal-guide-page">
      <div className="withdrawal-guide-container">
        {/* Header */}
        <header className="withdrawal-guide-header">
          <button className="withdrawal-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="withdrawal-guide-header-content">
            <h1 className="withdrawal-guide-header-title">Request Withdrawal</h1>
            <p className="withdrawal-guide-header-subtitle">Complete withdrawal guide</p>
          </div>
        </header>

        {/* Banner */}
        <div className="withdrawal-guide-banner">
          <img 
            src="/home/winwin.png" 
            alt="Request Withdrawal" 
            className="withdrawal-guide-banner-image"
          />
          <div className="withdrawal-guide-banner-overlay">
            <div className="withdrawal-guide-banner-content">
              <div className="withdrawal-guide-banner-icon">
                <FaWallet />
              </div>
              <h2 className="withdrawal-guide-banner-title">Request Withdrawal</h2>
              <p className="withdrawal-guide-banner-description">
                Secure, transparent, and traceable withdrawal process
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="withdrawal-guide-content">
          {/* Introduction */}
          <div className="withdrawal-guide-intro fadeIn">
            <p className="withdrawal-guide-intro-text">
              Once earnings are available in your account balance, users may submit a withdrawal request through the platform. 
              The withdrawal process is designed to be transparent, secure, and traceable, ensuring that funds are transferred 
              accurately and responsibly.
            </p>
          </div>

          {/* Withdrawal Sections */}
          <div className="withdrawal-guide-sections">
            {withdrawalSections.map((section, index) => (
              <WithdrawalSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Processing Information */}
          <div className="withdrawal-section fadeIn">
            <div className="withdrawal-section-header">
              <div className="withdrawal-section-icon">
                <FaClock />
              </div>
              <h3 className="withdrawal-section-title">{processingInfo.title}</h3>
            </div>
            <p className="withdrawal-section-description">{processingInfo.description}</p>
            <div className="withdrawal-completion">
              <div className="completion-icon">
                <FaCheckCircle />
              </div>
              <p>{processingInfo.conclusion}</p>
            </div>
          </div>

          {/* Important Guidelines */}
          <div className="withdrawal-section fadeIn">
            <div className="withdrawal-section-header">
              <div className="withdrawal-section-icon">
                <FaExclamationTriangle />
              </div>
              <h3 className="withdrawal-section-title">Important Withdrawal Guidelines</h3>
            </div>
            <p className="withdrawal-section-description">
              To avoid delays or issues, users should note:
            </p>
            <div className="withdrawal-guidelines">
              <ul className="withdrawal-list">
                {importantGuidelines.map((guideline, idx) => (
                  <li key={idx} className="withdrawal-list-item">
                    <FaExclamationTriangle className="list-icon warning" />
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="withdrawal-conclusion">
              <p>Following these guidelines helps ensure a smooth and reliable withdrawal experience.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="withdrawal-guide-actions">
            <button 
              className="withdrawal-guide-start-btn"
              onClick={() => navigate('/member/withdraw')}
            >
              <FaWallet />
              Start Withdrawal
            </button>
            <button 
              className="withdrawal-guide-wallet-btn"
              onClick={() => navigate('/member/withdraw')}
            >
              <FaUniversity />
              View My Wallet
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
=======
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWallet, FaUniversity, FaBitcoin, FaShieldAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/withdrawalGuide.css";

const withdrawalSections = [
  {
    icon: <FaWallet />,
    title: "Available Withdrawal Methods",
    description: "Users can choose their preferred withdrawal method based on availability and eligibility. Currently supported options may include:",
    highlights: [
      "Bank transfer",
      "Cryptocurrency withdrawal"
    ],
    note: "Each method follows a defined processing workflow and may have different settlement times depending on the selected network or financial institution."
  },
  {
    icon: <FaCheckCircle />,
    title: "Withdrawal Request Process",
    description: "To initiate a withdrawal, users must:",
    highlights: [
      "Ensure their profile and payment details are fully completed",
      "Select the desired withdrawal method",
      "Enter the withdrawal amount within the permitted limits",
      "Submit the request for processing"
    ],
    note: "Requests submitted with incomplete or incorrect information may be delayed or rejected to ensure fund security."
  },
  {
    icon: <FaShieldAlt />,
    title: "Verification and Review",
    description: "All withdrawal requests are subject to verification before processing. This review process helps:",
    highlights: [
      "Confirm account ownership",
      "Prevent unauthorized or fraudulent activity",
      "Ensure compliance with internal financial controls"
    ],
    note: "During this stage, the withdrawal status may appear as Pending, Under Review, or Approved."
  },
  {
    icon: <FaClock />,
    title: "Withdrawal Status Tracking",
    description: "Users can monitor the progress of their withdrawal through the status timeline. The timeline provides clear visibility into each stage of the process, including:",
    highlights: [
      "Request submission",
      "Verification and review",
      "Processing",
      "Completion"
    ],
    note: "This tracking system ensures transparency and allows users to stay informed throughout the entire withdrawal cycle."
  }
];

const processingInfo = {
  title: "Processing Time and Completion",
  description: "Processing times may vary depending on the selected withdrawal method, network conditions, and verification requirements. While most withdrawals are handled promptly, delays may occur in cases requiring additional review or external confirmation.",
  conclusion: "Once completed, the withdrawn amount will be transferred to the selected bank account or crypto wallet."
};

const importantGuidelines = [
  "Withdrawals are processed only from available balances",
  "Account details must match the user's verified information", 
  "Multiple or duplicate withdrawal requests may be restricted",
  "The platform does not process withdrawals based on external requests or messages"
];

function WithdrawalSection({ section, index }) {
  return (
    <div className={`withdrawal-section fadeIn delay-${index}`}>
      <div className="withdrawal-section-header">
        <div className="withdrawal-section-icon">
          {section.icon}
        </div>
        <h3 className="withdrawal-section-title">{section.title}</h3>
      </div>
      
      <p className="withdrawal-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="withdrawal-highlights">
          <ul className="withdrawal-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="withdrawal-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="withdrawal-note">
          <div className="note-icon">💡</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function WithdrawalGuide() {
  const navigate = useNavigate();

  return (
    <div className="withdrawal-guide-page">
      <div className="withdrawal-guide-container">
        {/* Header */}
        <header className="withdrawal-guide-header">
          <button className="withdrawal-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="withdrawal-guide-header-content">
            <h1 className="withdrawal-guide-header-title">Request Withdrawal</h1>
            <p className="withdrawal-guide-header-subtitle">Complete withdrawal guide</p>
          </div>
        </header>

        {/* Banner */}
        <div className="withdrawal-guide-banner">
          <img 
            src="/home/winwin.png" 
            alt="Request Withdrawal" 
            className="withdrawal-guide-banner-image"
          />
          <div className="withdrawal-guide-banner-overlay">
            <div className="withdrawal-guide-banner-content">
              <div className="withdrawal-guide-banner-icon">
                <FaWallet />
              </div>
              <h2 className="withdrawal-guide-banner-title">Request Withdrawal</h2>
              <p className="withdrawal-guide-banner-description">
                Secure, transparent, and traceable withdrawal process
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="withdrawal-guide-content">
          {/* Introduction */}
          <div className="withdrawal-guide-intro fadeIn">
            <p className="withdrawal-guide-intro-text">
              Once earnings are available in your account balance, users may submit a withdrawal request through the platform. 
              The withdrawal process is designed to be transparent, secure, and traceable, ensuring that funds are transferred 
              accurately and responsibly.
            </p>
          </div>

          {/* Withdrawal Sections */}
          <div className="withdrawal-guide-sections">
            {withdrawalSections.map((section, index) => (
              <WithdrawalSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Processing Information */}
          <div className="withdrawal-section fadeIn">
            <div className="withdrawal-section-header">
              <div className="withdrawal-section-icon">
                <FaClock />
              </div>
              <h3 className="withdrawal-section-title">{processingInfo.title}</h3>
            </div>
            <p className="withdrawal-section-description">{processingInfo.description}</p>
            <div className="withdrawal-completion">
              <div className="completion-icon">
                <FaCheckCircle />
              </div>
              <p>{processingInfo.conclusion}</p>
            </div>
          </div>

          {/* Important Guidelines */}
          <div className="withdrawal-section fadeIn">
            <div className="withdrawal-section-header">
              <div className="withdrawal-section-icon">
                <FaExclamationTriangle />
              </div>
              <h3 className="withdrawal-section-title">Important Withdrawal Guidelines</h3>
            </div>
            <p className="withdrawal-section-description">
              To avoid delays or issues, users should note:
            </p>
            <div className="withdrawal-guidelines">
              <ul className="withdrawal-list">
                {importantGuidelines.map((guideline, idx) => (
                  <li key={idx} className="withdrawal-list-item">
                    <FaExclamationTriangle className="list-icon warning" />
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="withdrawal-conclusion">
              <p>Following these guidelines helps ensure a smooth and reliable withdrawal experience.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="withdrawal-guide-actions">
            <button 
              className="withdrawal-guide-start-btn"
              onClick={() => navigate('/member/withdraw')}
            >
              <FaWallet />
              Start Withdrawal
            </button>
            <button 
              className="withdrawal-guide-wallet-btn"
              onClick={() => navigate('/member/withdraw')}
            >
              <FaUniversity />
              View My Wallet
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}