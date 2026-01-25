import MemberBottomNav from "../components/MemberBottomNav";
import "../styles/memberMenu.css";

export default function MemberMenu() {
  return (
    <div className="menuPage">
      <div className="menuContent">
        <h2 className="menuTitle">Menu</h2>
        <p className="menuSub">More features coming soon.</p>
      </div>

      {/* Reusable Bottom Navigation */}
      <MemberBottomNav active="menu" />
    </div>
  );
}
