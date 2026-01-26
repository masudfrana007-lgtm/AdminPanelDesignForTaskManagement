import { useNavigate } from "react-router-dom";
import "../styles/memberDeposit.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberDeposit() {
  const nav = useNavigate();

  const goBack = () => {
    nav(-1);
  };

  const handleCryptoClick = () => {
    nav("/member/deposit/crypto");
  };

  const handleBankClick = () => {
    nav("/member/deposit/bank");
  };

  return (
    <div className="depositPage">
      <div className="depositContainer">
        {/* Back Button */}
        <button className="backButton" onClick={goBack}>
          ←
        </button>

        {/* Wallet Balance Card */}
        <div className="walletCard">
          <div className="balanceLabel">Wallet Balance</div>
          <div className="balanceAmount">
            <span className="amount">$1,280.45</span>
            <span className="currency">USD</span>
          </div>
          <div className="balanceDetails">
            <span className="balanceText">≈ 1,245.32 USDT</span>
            <div className="statusIndicator">
              <span className="statusDot active"></span>
              <span className="statusText">+300 (2 days ago)</span>
              <span className="activeText">Active</span>
            </div>
          </div>
        </div>

        {/* Deposit Methods */}
        <div className="depositMethods">
          <h2 className="methodsTitle">Choose Deposit Method</h2>
          
          {/* Crypto Deposit */}
          <div className="methodCard crypto" onClick={handleCryptoClick}>
            <div className="methodHeader">
              <div className="methodIcon crypto">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <div className="methodInfo">
                <div className="methodTitle">
                  <span>Deposit by Crypto</span>
                  <span className="methodBadge fast">Fast</span>
                  <span className="methodBadge recommended">Recommended</span>
                </div>
                <div className="methodSubtitle">USDT / BTC / ETH supported</div>
                <div className="methodDetails">
                  <span>Instant confirmation</span>
                  <span>Low fees</span>
                </div>
              </div>
              <div className="methodArrow">›</div>
            </div>
          </div>

          {/* Bank Deposit */}
          <div className="methodCard bank" onClick={handleBankClick}>
            <div className="methodHeader">
              <div className="methodIcon bank">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                  <path d="M11.5,1L2,6V8H21V6M16,10V17H19V19H2V17H5V10H7V17H9V10H11V17H13V10H15V17H17V10H16Z"/>
                </svg>
              </div>
              <div className="methodInfo">
                <div className="methodTitle">
                  <span>Deposit by Bank</span>
                  <span className="methodBadge manual">Manual</span>
                  <span className="methodBadge time">1-2 hours</span>
                </div>
                <div className="methodSubtitle">Local & International banks</div>
                <div className="methodDetails">
                  <span>Manual verification</span>
                  <span>Secure transfer</span>
                </div>
              </div>
              <div className="methodArrow">›</div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="securityNote">
          <span className="securityIcon">🔒</span>
          <span className="securityText">Your funds are protected with bank-level encryption</span>
        </div>

        {/* Recent Activity */}
        <div className="recentActivity">
          <h3 className="activityTitle">Recent Deposit Activity</h3>
          
          <div className="activityItem">
            <div className="activityInfo">
              <span className="activityAmount">+$500</span>
              <span className="activityMethod">Crypto (USDT)</span>
            </div>
            <div className="activityMeta">
              <span className="activityTime">1 hour ago</span>
            </div>
          </div>

          <div className="activityItem">
            <div className="activityInfo">
              <span className="activityAmount">+$200</span>
              <span className="activityMethod">Bank Transfer</span>
            </div>
            <div className="activityMeta">
              <span className="activityTime">Pending</span>
              <span className="pendingBadge">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MemberBottomNav active="mine" />
    </div>
  );
}