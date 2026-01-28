import { useNavigate } from "react-router-dom";
import "../styles/memberDeposit.css";
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

export default function DepositMethod() {
  const nav = useNavigate();

  return (
    <div className="page deposit-method">
      {/* Top header */}
      <div className="dm-header">
        <button className="dm-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="dm-header-title">
          <div className="dm-title">Deposit Funds</div>
          <div className="dm-sub">Choose a deposit method that is convenient and secure</div>
        </div>

        <button className="dm-help" onClick={() => nav("/service")} type="button">
          Support
        </button>
      </div>

      <div className="dm-wrap">
        {/* Profile + Balance card */}
        <div className="dm-profileCard">
          <div className="dm-profLeft">
            <div className="dm-avatar" aria-hidden="true" />
            <div className="dm-profMeta">
              <div className="dm-profRow">
                <span className="dm-profName">{user.name}</span>
                <span className="dm-vip">VIP {user.vip}</span>
              </div>

              <div className="dm-codeRow">
                <span className="dm-codeLabel">Reference code:</span>
                <span className="dm-codePill">{user.inviteCode}</span>
              </div>
            </div>
          </div>

          <div className="dm-balanceBox">
            <div className="dm-balLabel">Current Balance</div>
            <div className="dm-balValue">
              <span className="dm-balUnit">USDT</span>
              <span className="dm-balNum">{money(user.balance)}</span>
            </div>
            <div className="dm-balHint">Available to deposit and trade</div>
          </div>
        </div>

        {/* Deposit Options */}
        <div className="dm-options">
          {/* Crypto */}
          <div className="dm-card" onClick={() => nav("/member/deposit/crypto")} role="button" tabIndex={0}>
            <div className="dm-cardHead">
             <div className="dm-icon crypto usdt-badge">
  USDT
</div>

              <div className="dm-cardText">
                <div className="dm-cardTitle">Deposit by Crypto</div>
                <div className="dm-cardDesc">Fast, secure, and available 24/7</div>
              </div>
            </div>

            <div className="dm-list">
              <div className="dm-item">✔ Networks: TRC20 / ERC20 / BEP20</div>
              <div className="dm-item">✔ Auto-update after confirmations</div>
              <div className="dm-item">✔ Low fees (depends on network)</div>
            </div>

            <div className="dm-tip">
              Tip: Select the correct network. Wrong network deposits may not be recoverable.
            </div>

            <button className="dm-btn" type="button" onClick={(e) => { e.stopPropagation(); nav("/member/deposit/crypto"); }}>
              Continue
            </button>
          </div>

          {/* Bank */}
          <div className="dm-card" onClick={() => nav("/member/deposit/bank")} role="button" tabIndex={0}>
            <div className="dm-cardHead">
              <div className="dm-icon bank">🏦</div>
              <div className="dm-cardText">
                <div className="dm-cardTitle">Deposit by Bank</div>
                <div className="dm-cardDesc">Best for large / local currency deposits</div>
              </div>
            </div>

            <div className="dm-list">
              <div className="dm-item">✔ Local & international bank support</div>
              <div className="dm-item">✔ Manual verification for extra security</div>
              <div className="dm-item">✔ Processing time: 1–24 hours</div>
            </div>

            <div className="dm-tip">
              Tip: Use your own account name. Third-party deposits may be rejected for safety.
            </div>

            <button
              className="dm-btn outline"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nav("/member/deposit/bank");
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="dm-instructions">
          <div className="dm-instHead">
            <div className="dm-instTitle">Important Deposit Instructions</div>
            <span className="dm-instBadge">Security</span>
          </div>

          <ul className="dm-instList">
            <li>Always select the correct deposit method and network before sending.</li>
            <li>Do not send funds from third-party accounts (name must match your profile).</li>
            <li>Deposits sent to wrong addresses or networks may not be recoverable.</li>
            <li>For delays, contact Customer Service with TXID / receipt.</li>
          </ul>
        </div>
      </div>

      {/* ✅ OLD bottom bar (reusable) */}
      <MemberBottomNav active="mine" />
    </div>
  );
}