import serviceLady from "../assets/customer-service-lady.png";
import "../styles/memberService.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberService() {
  // Replace later with real support link
  const openSupport = () => {
    alert("Support link later");
  };

  return (
    <div className="svcPage">
      <div className="svcContent">
        <h1 className="svcTitle">Customer Service Center</h1>
        <div className="svcSub">Online customer service time 07:00-25:00 (UK)</div>

        {/* 👩‍💼 Lady Illustration */}
        <div className="svcIllustration">
          <img src={serviceLady} alt="Customer Service" />
        </div>

        {/* Button */}
        <button className="svcPill" type="button" onClick={openSupport}>
          <span className="svcPillIcon">🎧</span>
          Online customer service
        </button>
      </div>

      {/* Reusable Bottom Nav */}
      <MemberBottomNav active="service" />

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="svcNavSpacer" />
    </div>
  );
}
