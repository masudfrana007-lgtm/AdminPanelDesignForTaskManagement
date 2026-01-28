// src/pages/WithdrawalMethod.jsx
import { useNavigate } from "react-router-dom";
import "../styles/WithdrawalMethod.css";
import withdrawBg from "../assets/bg/withdraw.png";
import MemberBottomNav from "../components/MemberBottomNav";

const user = {
  name: "User",
  vip: 3,
  inviteCode: "ABCD-1234",
  balance: 97280.12,
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function WithdrawalMethod() {
  const nav = useNavigate();

  return (
    <div
      className="page wd-method"
      style={{ backgroundImage: `url(${withdrawBg})` }}
    >
      {/* Header */}
      <div className="wd-header">
        <button className="wd-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="wd-header-title">
          <div className="wd-title">Withdraw Funds</div>
          <div className="wd-sub">
            Choose a withdrawal method that is safe and convenient
          </div>
        </div>

        {/* ✅ make sure this route exists in your router */}
        <button className="wd-help" onClick={() => nav("/member/service")} type="button">
          Support
        </button>
      </div>

      <div className="wd-wrap">
        {/* Profile + Balance */}
        <div className="wd-profileCard">
          <div className="wd-profLeft">
            <div className="wd-avatar" aria-hidden="true" />
            <div className="wd-profMeta">
              <div className="wd-profRow">
                <span className="wd-profName">{user.name}</span>
                <span className="wd-vip">VIP {user.vip}</span>
              </div>

              <div className="wd-codeRow">
                <span className="wd-codeLabel">Reference code:</span>
                <span className="wd-codePill">{user.inviteCode}</span>
              </div>
            </div>
          </div>

          <div className="wd-balanceBox">
            <div className="wd-balLabel">Available Balance</div>
            <div className="wd-balValue">
              <span className="wd-balUnit">USDT</span>
              <span className="wd-balNum">{money(user.balance)}</span>
            </div>
            <div className="wd-balHint">Withdrawals may require verification</div>
          </div>
        </div>

        {/* Options */}
        <div className="wd-options">
          <div
            className="wd-card"
            onClick={() => nav("/member/withdraw/crypto")}
            role="button"
            tabIndex={0}
          >
            <div className="wd-cardHead">
              <div className="wd-icon usdt-badge">USDT</div>
              <div className="wd-cardText">
                <div className="wd-cardTitle">Withdraw by Crypto</div>
                <div className="wd-cardDesc">Send USDT to your external wallet securely</div>
              </div>
            </div>

            <div className="wd-list">
              <div className="wd-item">✔ Supported networks: TRC20 / ERC20 / BEP20</div>
              <div className="wd-item">✔ Processing time: 5–30 minutes (network dependent)</div>
              <div className="wd-item">✔ Confirm your address carefully</div>
            </div>

            <div className="wd-tip">
              Tip: Wrong address/network withdrawals cannot be reversed. Double-check before submitting.
            </div>

            <button
              className="wd-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nav("/member/withdraw/crypto");
              }}
            >
              Continue
            </button>
          </div>

          <div
            className="wd-card"
            onClick={() => nav("/member/withdraw/bank")}
            role="button"
            tabIndex={0}
          >
            <div className="wd-cardHead">
              <div className="wd-icon bank">🏦</div>
              <div className="wd-cardText">
                <div className="wd-cardTitle">Withdraw to Bank</div>
                <div className="wd-cardDesc">Transfer funds to your bank account</div>
              </div>
            </div>

            <div className="wd-list">
              <div className="wd-item">✔ Local & international bank support</div>
              <div className="wd-item">✔ Manual review for safety</div>
              <div className="wd-item">✔ Processing time: 1–24 hours</div>
            </div>

            <div className="wd-tip">
              Tip: Account name must match your profile. Third-party withdrawals may be rejected.
            </div>

            <button
              className="wd-btn outline"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nav("/member/withdraw/bank");
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="wd-instructions">
          <div className="wd-instHead">
            <div className="wd-instTitle">Important Withdrawal Instructions</div>
            <span className="wd-instBadge">Security</span>
          </div>

          <ul className="wd-instList">
            <li>Withdrawals may require identity or security verification depending on account risk level.</li>
            <li>Make sure the destination address/account details are correct before submitting.</li>
            <li>Crypto withdrawals to wrong networks/addresses are not recoverable.</li>
            <li>For bank withdrawals, use your own account (name must match your profile).</li>
            <li>If your withdrawal is delayed, contact Customer Service with your transaction details.</li>
          </ul>
        </div>
      </div>

      {/* ✅ SAME bottom bar (reusable) */}
      <MemberBottomNav active="mine" />      
    </div>
  );
}
