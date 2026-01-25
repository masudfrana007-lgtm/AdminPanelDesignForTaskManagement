import { useNavigate } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";
import "../styles/memberService.css";
import serviceLady from "../assets/customer-service-lady.png";

export default function MemberService() {
  const nav = useNavigate();

  return (
    <MemberLayout>
      <div className="svcPage">
        <div className="svcContent">
          <h1 className="svcTitle">Customer Service Center</h1>
          <div className="svcSub">
            Online customer service time 07:00-25:00 (UK)
          </div>

          {/* 👩‍💼 Lady Illustration */}
          <div className="svcIllustration">
            <img src={serviceLady} alt="Customer Service" />
          </div>

          {/* Button */}
          <button className="svcPill">
            <span className="svcPillIcon">🎧</span>
            Online customer service
          </button>
        </div>

        {/* Bottom Nav */}
        <div className="svcBottomNav">
          <button onClick={() => nav("/member/dashboard")} className="svcNavItem">
            <span className="svcNavIcon">⌂</span>
            <span className="svcNavText">Home</span>
          </button>

          <button className="svcNavItem active">
            <span className="svcNavIcon">⟲</span>
            <span className="svcNavText">Service</span>
          </button>

          <button onClick={() => nav("/member/menu")} className="svcNavItem">
            <span className="svcNavIcon">▦</span>
            <span className="svcNavText">Menu</span>
          </button>

          <button onClick={() => nav("/member/record")} className="svcNavItem">
            <span className="svcNavIcon">▤</span>
            <span className="svcNavText">Record</span>
          </button>

          <button onClick={() => nav("/member/mine")} className="svcNavItem mine">
            <span className="svcNavIcon">●</span>
            <span className="svcNavText">Mine</span>
          </button>
        </div>

        <div className="svcNavSpacer" />
      </div>
    </MemberLayout>
  );
}
