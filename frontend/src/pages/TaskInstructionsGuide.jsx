import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPuzzlePiece, FaFileAlt, FaCheckCircle, FaEye, FaUserCheck } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/taskGuide.css";

const taskSections = [
  {
    icon: <FaFileAlt />,
    title: "Follow Task Instructions Carefully",
    description: "Before starting any task, users are required to read and understand all task instructions in full. Tasks must be completed in the exact order and manner specified. Skipping steps, altering sequences, or applying personal interpretation may result in task rejection.",
    highlights: [
      "Follow the assigned workflow step by step",
      "Complete tasks within the given timeframe",
      "Ensure all required actions are performed"
    ],
    note: "Failure to follow instructions may lead to delayed approval or cancellation of task rewards."
  },
  {
    icon: <FaCheckCircle />,
    title: "Submission of Required Proof",
    description: "Some tasks require proof of completion, such as screenshots, links, or data records. When proof is requested, users must ensure accuracy and completeness.",
    highlights: [
      "Submit only authentic and original proof",
      "Ensure all relevant details are clearly visible",
      "Upload proof within the specified submission period"
    ],
    note: "Incomplete, unclear, or incorrect proof may cause the task to be marked as invalid."
  },
  {
    icon: <FaUserCheck />,
    title: "Accuracy and Authenticity",
    description: "All task-related data must be accurate and truthful. Maintaining integrity in task completion is essential for a fair environment for all users.",
    highlights: [
      "Submitting fake, reused, or edited screenshots",
      "Providing misleading or fabricated information", 
      "Copying task results from other users"
    ],
    note: "Any attempt to submit false evidence or inaccurate data may result in task rejection, loss of earnings, or account review.",
    isProhibited: true
  },
  {
    icon: <FaEye />,
    title: "Task Review and Verification",
    description: "Completed tasks may undergo manual or automated review to verify accuracy and compliance. This process ensures fairness and protects the interests of all users.",
    highlights: [
      "Additional clarification may be requested",
      "Tasks may remain under review before approval",
      "Rewards are credited only after successful verification"
    ],
    note: null
  }
];

const responsibilities = [
  "Read task instructions thoroughly before starting",
  "Complete tasks accurately within deadlines",
  "Submit authentic proof when required",
  "Maintain honest and fair participation"
];

function TaskSection({ section, index }) {
  return (
    <div className={`task-section fadeIn delay-${index}`}>
      <div className="task-section-header">
        <div className="task-section-icon">
          {section.icon}
        </div>
        <h3 className="task-section-title">{section.title}</h3>
      </div>
      
      <p className="task-section-description">{section.description}</p>
      
      {section.highlights && (
        <div className="task-highlights">
          <p className="highlights-intro">
            {section.isProhibited ? "The following actions are strictly prohibited:" : "Users should:"}
          </p>
          <ul className="task-list">
            {section.highlights.map((highlight, idx) => (
              <li key={idx} className="task-list-item">
                {section.isProhibited ? (
                  <span className="prohibited-icon">⊗</span>
                ) : (
                  <FaCheckCircle className="list-icon" />
                )}
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {section.note && (
        <div className="task-note">
          <div className="note-icon">⚠️</div>
          <p>{section.note}</p>
        </div>
      )}
    </div>
  );
}

export default function TaskInstructionsGuide() {
  const navigate = useNavigate();

  return (
    <div className="task-guide-page">
      <div className="task-guide-container">
        {/* Header */}
        <header className="task-guide-header">
          <button className="task-guide-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="task-guide-header-content">
            <h1 className="task-guide-header-title">Task Instructions</h1>
            <p className="task-guide-header-subtitle">Complete tasks correctly and earn rewards</p>
          </div>
        </header>

        {/* Banner */}
        <div className="task-guide-banner">
          <img 
            src="/home/profile.png" 
            alt="Do Tasks Correctly" 
            className="task-guide-banner-image"
          />
          <div className="task-guide-banner-overlay">
            <div className="task-guide-banner-content">
              <div className="task-guide-banner-icon">
                <FaPuzzlePiece />
              </div>
              <h2 className="task-guide-banner-title">Do Tasks Correctly</h2>
              <p className="task-guide-banner-description">
                Follow instructions carefully to ensure accurate earnings and timely approval
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="task-guide-content">
          {/* Introduction */}
          <div className="task-guide-intro fadeIn">
            <p className="task-guide-intro-text">
              To ensure accurate earnings and timely approval, all users must complete tasks strictly according to 
              the provided instructions. Each task is designed with specific requirements, and proper execution is 
              essential for maintaining system integrity and fairness.
            </p>
          </div>

          {/* Task Sections */}
          <div className="task-guide-sections">
            {taskSections.map((section, index) => (
              <TaskSection 
                key={section.title} 
                section={section} 
                index={index}
              />
            ))}
          </div>

          {/* Responsibilities */}
          <div className="task-guide-responsibility fadeIn">
            <div className="responsibility-header">
              <div className="responsibility-icon">
                <FaUserCheck />
              </div>
              <h3 className="responsibility-title">Responsibility and Fair Participation</h3>
            </div>
            <p className="responsibility-description">
              Users are responsible for the quality and accuracy of their task submissions. Honest participation 
              helps maintain a reliable ecosystem where all users are treated fairly.
            </p>
            <div className="responsibilities-grid">
              {responsibilities.map((responsibility, index) => (
                <div key={index} className="responsibility-item">
                  <FaCheckCircle className="responsibility-item-icon" />
                  <span className="responsibility-text">{responsibility}</span>
                </div>
              ))}
            </div>
            <div className="responsibility-warning">
              <div className="warning-icon">⚠️</div>
              <p>
                <strong>Important:</strong> Consistent failure to complete tasks correctly or repeated violations 
                may lead to restrictions on task access or further account action.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="task-guide-actions">
            <button 
              className="task-guide-start-btn"
              onClick={() => navigate('/member/tasks')}
            >
              <FaPuzzlePiece />
              Start Working on Tasks
            </button>
            <button 
              className="task-guide-help-btn"
              onClick={() => navigate('/member/service')}
            >
              <FaFileAlt />
              Need Help?
            </button>
          </div>
        </div>
      </div>

      <MemberBottomNav active="home" />
    </div>
  );
}