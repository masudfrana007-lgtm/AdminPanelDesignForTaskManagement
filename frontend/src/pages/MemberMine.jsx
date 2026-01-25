import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberMine.css";

export default function MemberMine() {
  return (
    <div className="minePage">
      <div className="mineContent">
        <h2 className="mineTitle">My Profile</h2>
        <p className="mineSub">Profile page coming soon.</p>
      </div>

      {/* Reusable Bottom Navigation */}
      <MemberBottomNav active="mine" />
    </div>
  );
}
