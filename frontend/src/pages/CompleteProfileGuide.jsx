import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaShieldAlt, FaLock, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/profileGuide.css";


const profileSections = [
    
  {
    icon: <FaUser />,
    title: "Accurate Personal Information",
    description: "Users are required to provide correct and up-to-date personal information, including their email address and phone number. This information is used strictly for account verification, security notifications, and important operational updates.",
    highlights: [
      "Account verification and confirmations",
      "Security alerts and login notifications", 
      "Withdrawal status updates",
      "Important policy or system announcements"
    ],
    note: "Using an incorrect or inactive email address may result in delayed access to services or missed security notifications."
  },
  {
    icon: <FaLock />,
    title: "Secure Password Management",
    description: "Choosing a strong and secure password is critical for protecting your account. Users are advised to follow best practices for account security.",
    highlights: [
      "Create a password that is unique and not used on other platforms",
      "Avoid sharing login credentials with anyone",
      "Update passwords periodically for enhanced security"
    ],
    note: "The platform will never ask users to disclose their password. Protecting login credentials is a shared responsibility and plays a key role in safeguarding account funds."
  },
  {
    icon: <FaCreditCard />,
    title: "Updating Payment Methods",
    description: "Adding and updating your payment or withdrawal method is required before initiating any financial transactions. This ensures that funds are processed accurately and sent to the correct destination.",
    highlights: [
      "The payment method belongs to them or is authorized for use",
      "All required fields are filled correctly",
      "Bank or wallet information matches the account holder's details"
    ],
    note: "Incorrect or incomplete payment information may cause transaction delays or failures."
  },
  {
    icon: <FaShieldAlt />,
    title: "Verification for Withdrawals",
    description: "To maintain compliance and prevent unauthorized activity, profile verification is required before withdrawals can be processed. Verification helps protect both users and the platform from fraud, errors, and misuse.",
    highlights: [
      "Faster withdrawal approvals",
      "Reduced verification requests",
      "A more reliable transaction experience"
    ],
    note: null
  }
];
const benefits = [
  "Secure handling of funds",
  "Accurate communication",
  "Compliance with operational standards",
  "A smooth and professional user experience"
];

function ProfileSection({ section, index }) {

  return (
    <div className={`profile-section fadeIn delay-${index}`}>
      <div className="profile-section-header">
        <div className="profile-section-icon">
          {section.icon}
        </div>
        <h3 className="profile-section-title">{section.title}</h3>
      </div>
      
      <p className="profile-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="profile-highlights">
          <p className="highlights-intro">An accurate email address is essential, as it serves as the primary channel for:</p>
          <ul className="profile-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="profile-list-item">
                <FaCheckCircle className="list-icon" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="profile-note">
          <div className="note-icon">⚠️</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function CompleteProfileGuide() {
  const navigate = useNavigate();

  return (
    <div className="profile-guide-page">
      <div className="profile-guide-container">
        {/* Header */}
        <header className="profile-guide-header">
          <button className="profile-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="profile-guide-header-content">
            <h1 className="profile-guide-header-title">Profile Management</h1>
            <p className="profile-guide-header-subtitle">Complete your profile for full access</p>
          </div>
        </header>

        {/* Banner */}
        <div className="profile-guide-banner">
          <img 
            src="/home/hero-4.png" 
            alt="Complete Profile" 
            className="profile-guide-banner-image"
          />
          <div className="profile-guide-banner-overlay">
            <div className="profile-guide-banner-content">
              <div className="profile-guide-banner-icon">
                <FaUser />
              </div>
              <h2 className="profile-guide-banner-title">Complete Your Profile</h2>
              <p className="profile-guide-banner-description">
                The first and most important step to accessing all platform features
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-guide-content">
          {/* Introduction */}
          <div className="profile-guide-intro fadeIn">
            <p className="profile-guide-intro-text">
              Completing your profile is the first and most important step to accessing all features of the platform. 
              A fully updated profile ensures smooth communication, secure transactions, and uninterrupted access to 
              withdrawals, earnings, and account services.
            </p>
          </div>

          {/* Profile Sections */}
          <div className="profile-guide-sections">
            {profileSections.map((section, index) => (
              <ProfileSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Why It Matters */}
          <div className="profile-guide-importance fadeIn">
            <div className="importance-header">
              <div className="importance-icon">
                <FaCheckCircle />
              </div>
              <h3 className="importance-title">Why Profile Completion Matters</h3>
            </div>
            <p className="importance-description">
              Completing your profile is not only a requirement—it is a safeguard. It ensures:
            </p>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <FaCheckCircle className="benefit-icon" />
                  <span className="benefit-text">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="importance-note">
              <p>
                Users are encouraged to review their profile regularly and update any information 
                that changes over time.
              </p>
            </div>
          </div>

          {/* Action Button */}
          {/* <div className="profile-guide-actions">
            <button 
              className="profile-guide-update-btn"
              onClick={() => navigate('/profile')}
            >
              <FaUser />
              Update My Profile
            </button>
          </div> */}
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
}