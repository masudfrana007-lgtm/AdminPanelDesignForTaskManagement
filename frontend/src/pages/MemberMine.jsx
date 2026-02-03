// src/pages/MemberMine.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import TeamJoinPopup from "../components/TeamJoinPopup";
import InviteFriendsPopup from "../components/InviteFriendsPopup";
import "../styles/memberMine.css";

/* ✅ icons (adjust path if your structure is different) */
import teamIcon from "../assets/icons/Team.jpg";
import depositIcon from "../assets/icons/deposit-new.jpg";
import withdrawalIcon from "../assets/icons/withdrawal-new.png";

import profileIcon from "../assets/icons/profile.PNG";
import securityIcon from "../assets/icons/Security.PNG";
import settingsIcon from "../assets/icons/settings.PNG";
import depositRec1Icon from "../assets/icons/DepositR.PNG";
import depositRec2Icon from "../assets/icons/DepositRR.PNG";

const user = {
  vip: 3,
  balance: 97280.12,
  referenceCode: "ABCD-1234",
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function CardButton({ icon, label, onClick }) {
  return (
    <button className="mine-action" onClick={onClick} type="button">
      <div className="mine-action-icon">{icon}</div>
      <div className="mine-action-label">{label}</div>
    </button>
  );
}

function ListItem({ icon, label, onClick }) {
  return (
    <button className="mine-item" onClick={onClick} type="button">
      <div className="mine-item-left">
        <span className="mine-item-ico">{icon}</span>
        <span className="mine-item-label">{label}</span>
      </div>
      <span className="mine-item-arrow">›</span>
    </button>
  );
}

export default function MemberMine() {
  const nav = useNavigate();
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  return (
    <div className="minePage">
      <div className="mineContainer">
        {/* ✅ NEW HEADER (from new page) */}
        <div className="mine-hero">
          <div className="mine-hero-top">
            <div className="mine-avatar" />
            <div className="mine-meta">
              <div className="mine-vip">
                <span className="mine-vip-pill">VIP {user.vip}</span>
              </div>

              <div className="mine-ref">
                <span className="mine-ref-label">Reference code:</span>
                <span className="mine-ref-code">{user.referenceCode}</span>
              </div>
            </div>
          </div>

          <div className="mine-balance">
            <div className="mine-balance-title">My Account</div>
            <div className="mine-balance-row">
              <span className="mine-balance-unit">USDT</span>
              <span className="mine-balance-val">{money(user.balance)}</span>
            </div>
          </div>
        </div>

        {/* ✅ NEW QUICK ACTIONS */}
        <div className="mine-actions-wrap">
          <div className="mine-actions">
            <CardButton
              icon={<img src={teamIcon} alt="Teams" className="custom-icon" />}
              label="Teams"
              onClick={() => setShowTeamPopup(true)}
            />
            <CardButton
              icon={<img src={depositIcon} alt="Deposit" className="custom-icon" />}
              label="Deposit"
              onClick={() => nav("/member/deposit")}
            />
            <CardButton
              icon={
                <img
                  src={withdrawalIcon}
                  alt="Withdrawal"
                  className="custom-icon"
                />
              }
              label="Withdrawal"
              onClick={() => nav("/member/withdraw")}
            />
            <CardButton
              icon={<FaUserFriends />}
              label="Invite friends"
              onClick={() => setShowInvitePopup(true)}
            />
          </div>
        </div>

        {/* ✅ NEW LISTS */}
        <div className="mine-lists">
          <div className="mine-list">
            <ListItem
              icon={<img src={profileIcon} alt="Profile" className="list-icon-img" />}
              label="Profile"
              onClick={() => nav("/profile")}
            />
            <ListItem
              icon={
                <img
                  src={withdrawalIcon}
                  alt="Withdrawal Management"
                  className="list-icon-img"
                />
              }
              label="Withdrawal Management"
              onClick={() => nav("/withdrawal-management")}
            />
            <ListItem
              icon={<img src={settingsIcon} alt="Setting" className="list-icon-img" />}
              label="Setting"
              onClick={() => nav("/setting")}
            />
          </div>

          <div className="mine-list">
            <ListItem
              icon={
                <img
                  src={depositRec1Icon}
                  alt="Deposit Records"
                  className="list-icon-img"
                />
              }
              label="Deposit Records"
              onClick={() => nav("/deposit-records")}
            />
            <ListItem
              icon={
                <img
                  src={depositRec2Icon}
                  alt="Deposit Records"
                  className="list-icon-img"
                />
              }
              label="Deposit Records"
              onClick={() => nav("/deposit-records")}
            />
            <ListItem
              icon={<img src={securityIcon} alt="Security" className="list-icon-img" />}
              label="Security"
              onClick={() => nav("/security")}
            />
          </div>
        </div>
      </div>

      {/* ✅ OLD bottom bar (reusable) */}
      <MemberBottomNav active="mine" />

      {/* ✅ Team Join Popup */}
      <TeamJoinPopup 
        isOpen={showTeamPopup} 
        onClose={() => setShowTeamPopup(false)} 
      />

      {/* ✅ Invite Friends Popup */}
      <InviteFriendsPopup 
        isOpen={showInvitePopup} 
        onClose={() => setShowInvitePopup(false)} 
      />
    </div>
  );
}
