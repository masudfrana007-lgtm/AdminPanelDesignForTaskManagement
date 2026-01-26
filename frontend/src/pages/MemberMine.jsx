import MemberBottomNav from "../components/MemberBottomNav";
import { useNavigate } from "react-router-dom";
import "../styles/memberMine.css";

export default function MemberMine() {
  const nav = useNavigate();

  const handleDepositClick = () => {
    nav("/member/deposit");
  };
  return (
    <div className="minePage">
      <div className="mineContainer">
        {/* Header Section */}
        <div className="mineHeader">
          <div className="profileIcon">
            <div className="avatarCircle"></div>
            <span className="vipBadge">VIP</span>
          </div>
          <div className="invitationCode">
            <span className="inviteLabel">Invitation code:</span>
            <span className="inviteCode">●●●●●●●</span>
          </div>
        </div>

        {/* Account Balance Section */}
        <div className="accountSection">
          <h2 className="accountTitle">My Account</h2>
          <div className="balanceDisplay">
            <span className="currency">USDT</span>
            <span className="amount">97,280.12</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quickActions">
          <div className="actionItem">
            <div className="actionIcon teams">
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2 1l-3 4-3-4c-.46-.63-1.2-1-2-1H5.46c-.8 0-1.54.37-2 1L1 15.5h2.5V22h3v-6h2v6h3zm-11-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
            <span className="actionLabel">Teams</span>
          </div>
          <div className="actionItem">
            <div className="actionIcon record">
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                <path d="M15,14L16,15L19,12L20,13L16,17L14,15L15,14Z"/>
              </svg>
            </div>
            <span className="actionLabel">Record</span>
          </div>
          <div className="actionItem">
            <div className="actionIcon wallet">
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                <path d="M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1M12,3.18L5,6.3V11.22C5,15.54 8.07,19.68 12,20.92C15.93,19.68 19,15.54 19,11.22V6.3L12,3.18M15.09,8L16.5,9.41L10.5,15.41L7.5,12.41L8.91,11L10.5,12.59L15.09,8Z"/>
              </svg>
            </div>
            <span className="actionLabel">Wallet management</span>
          </div>
          <div className="actionItem">
            <div className="actionIcon invite">
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                <circle cx="9" cy="12" r="2"/>
                <path d="M6,18C6,16.34 7.34,15 9,15C10.66,15 12,16.34 12,18H6Z"/>
                <circle cx="16" cy="13" r="1.5"/>
              </svg>
            </div>
            <span className="actionLabel">Invite friends</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="menuSection">
          <div className="menuColumn">
            <div className="menuItem">
              <div className="menuIcon profile">
                <span>👤</span>
              </div>
              <span className="menuLabel">Profile</span>
              <span className="menuArrow">›</span>
            </div>
            <div className="menuItem" onClick={handleDepositClick}>
              <div className="menuIcon deposit">
                <span>📊</span>
              </div>
              <span className="menuLabel">Deposit</span>
              <span className="menuArrow">›</span>
            </div>
            <div className="menuItem">
              <div className="menuIcon settings">
              <span>💳</span>
              </div>
              <span className="menuLabel">Deposit records</span>
              <span className="menuArrow">›</span>
            </div>
          </div>
          <div className="menuColumn">
            <div className="menuItem">
              <div className="menuIcon deposit">
                <span>💳</span>
              </div>
              <span className="menuLabel">Wallet</span>
              <span className="menuArrow">›</span>
            </div>
            <div className="menuItem">
              <div className="menuIcon withdraw">
                <span>📤</span>
              </div>
              <span className="menuLabel">Withdrawal</span>
              <span className="menuArrow">›</span>
            </div>
            <div className="menuItem">
              <div className="menuIcon settings">
                <span>⚙️</span>
              </div>
              <span className="menuLabel">Setting</span>
              <span className="menuArrow">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Bottom Navigation */}
      <MemberBottomNav active="mine" />
    </div>
  );
}
