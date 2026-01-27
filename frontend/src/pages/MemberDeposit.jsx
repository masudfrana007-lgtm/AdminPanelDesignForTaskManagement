import { useNavigate } from "react-router-dom";
import "../styles/memberDeposit.css";
import MemberBottomNav from "../components/MemberBottomNav";


const user = {
  balance: 97280.12,
};

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function DepositMethod() {
  const nav = useNavigate();

  return (
    <div className="page deposit-method">
      {/* Top bar */}
      <div className="dm-topbar">
        <button className="dm-back" onClick={() => nav(-1)} type="button">
          ←
        </button>
        <div className="dm-topbar-title">
          <h2>Deposit Funds</h2>
          <p>Choose a deposit method that is convenient and secure</p>
        </div>
        <div className="dm-topbar-spacer" />
      </div>

      {/* Balance block */}
      <div className="dm-wrap">
        <div className="dm-balance">
          <div className="dm-balance-left">
            <div className="dm-balance-title">Wallet Balance</div>
            <div className="dm-balance-sub">Available for trading & withdrawals</div>
          </div>
          <div className="dm-balance-right">
            <div className="dm-balance-unit">USDT</div>
            <div className="dm-balance-val">{money(user.balance)}</div>
          </div>
        </div>

        {/* Options */}
        <div className="dm-options">
          {/* Crypto */}
          <div className="dm-card" onClick={() => nav("/deposit")} role="button" tabIndex={0}>
            <div className="dm-card-head">
              <div className="dm-icon crypto">💎</div>
              <div className="dm-card-title">
                <h3>Deposit by Crypto</h3>
                <p>Fast, secure, and available 24/7</p>
              </div>
            </div>

            <div className="dm-card-body">
              <div className="dm-points">
                <div className="dm-point">✔ Supported networks: TRC20 / ERC20 / BEP20</div>
                <div className="dm-point">✔ Balance updates after confirmations</div>
                <div className="dm-point">✔ Low fees (network dependent)</div>
              </div>

              <div className="dm-note">
                Tip: Always select the correct network. Sending to the wrong network may cause permanent loss.
              </div>
            </div>

            <button className="dm-btn" type="button" onClick={(e) => { e.stopPropagation(); nav("/deposit"); }}>
              Continue
            </button>
          </div>

          {/* Bank */}
          <div className="dm-card" onClick={() => nav("/deposit-bank")} role="button" tabIndex={0}>
            <div className="dm-card-head">
              <div className="dm-icon bank">🏦</div>
              <div className="dm-card-title">
                <h3>Deposit by Bank</h3>
                <p>Suitable for large & local currency deposits</p>
              </div>
            </div>

            <div className="dm-card-body">
              <div className="dm-points">
                <div className="dm-point">✔ Local & international transfer support</div>
                <div className="dm-point">✔ Manual verification for extra security</div>
                <div className="dm-point">✔ Processing time: 1–24 hours</div>
              </div>

              <div className="dm-note">
                Tip: Use your own bank account name. Third-party deposits can be rejected for safety.
              </div>
            </div>

            <button
              className="dm-btn outline"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nav("/deposit-bank");
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="dm-info">
          <div className="dm-info-head">
            <h4>Important Deposit Instructions</h4>
            <span className="dm-badge">Security</span>
          </div>

          <ul>
            <li>• Always select the correct deposit method and network before sending.</li>
            <li>• Do not send funds from third-party accounts (name must match your profile).</li>
            <li>• Deposits sent to wrong addresses or networks may not be recoverable.</li>
            <li>• If your deposit is pending too long, contact Customer Service with TXID / receipt.</li>
          </ul>
        </div>      
      </div>

      {/* Bottom Navigation */}
      <MemberBottomNav active="mine" />      
    </div>
  );
}