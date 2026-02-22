import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/memberDeposit.css";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import usdtIcon from "../assets/icons/usdt.png";

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(n || 0));
}

function vipLabel(ranking) {
  if (!ranking) return "-";
  if (/^V\d+$/.test(ranking)) {
    return "VIP " + ranking.slice(1);
  }
  return ranking;
}

export default function DepositMethod() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const [balance, setBalance] = useState(0);
  const [balanceShimmer, setBalanceShimmer] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const r = await memberApi.get("/member/me");
      setMe(r.data || null);
      setBalance(Number(r.data?.balance || 0));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
      setBalance(1500.75); // fallback demo balance
    }
  };

  const demo = {
    accountBalance: balance,
    vipLevel: vipLabel(me?.ranking) || "VIP 1",
    commissionRate: 3,
    availableMin: 10,
    availableMax: 50000,
  };

  const user = {
    referenceCode: "ABCD-1234",
    me: [
      { 
        nickname: "JohnDoe",
        ranking: "V3",
        sponsor_short_id: "SPONSOR123",
        balance: 1500.75,
        profileImage: null,
        uid: "U92837465",

      }

    ],
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setBalanceShimmer(true);
    const t = setTimeout(() => setBalanceShimmer(false), 1100);
    return () => clearTimeout(t);
  }, [balance]);

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

        <button className="dm-help" onClick={() => nav("/member/customerService")} type="button">
          Support
        </button>
      </div>

      <div className="dm-wrap">
        {err && <div className="dm-error">{err}</div>}

        {/* Profile + Balance card */}
        <section className="balanceCardAx">
          <div className="balanceLeft">
            {/* Profile Image and Info - Same Line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div className="pf-avatar">
                <img
                  src={`https://i.pravatar.cc/150?u=${me?.short_id || user.referenceCode}`}
                  alt="User Avatar"
                  className="mine-avatar-img"
                />
              </div>
              
              {/* Balance and UID Info */}
              <div className="balance-info">
                <div className="balanceLabelAx">Account Balance</div>
                <div className={`balanceValueW ${balanceShimmer ? "isShimmer" : ""}`}>
                  {money(demo.accountBalance)} <span className="unitW">USDT</span>
                </div>
                
                {/* UID Information */}
                <div className="uid-info">
                  <span className="uid-label">UID:</span>
                  <span className="uid-value">{me?.short_id || user.uid || "U92837465"}</span>
                </div>
              </div>
            </div>

            <div className="metaRowW">
              <span className="pillW pillAx">{demo.vipLevel}</span>
              {/* <span className="pillW pillAx">{demo.commissionRate}% Commission</span> */}
              <span className="pillW pillAx">
                {demo.availableMin}–{demo.availableMax} USDT
              </span>
            </div>
          </div>

          <div className="balanceRightW balanceRightAx">
            <div className="miniInfo">
              <div className="miniLabelAx">Available Range</div>
              <div className="miniValue">
                {demo.availableMin}–{demo.availableMax} USDT
              </div>
            </div>

            <div className="miniInfo">
              <div className="miniLabelAx">Commission Rate</div>
              <div className="miniValue">{demo.commissionRate}%</div>
            </div>
          </div>
        </section>

        {/* Deposit Options */}
        <div className="dm-options">
          {/* Crypto */}
          <div
            className="dm-card"
            onClick={() => nav("/member/deposit/crypto")}
            role="button"
            tabIndex={0}
          >
            <div className="dm-cardHead">
              <div className="dm-icon crypto usdt-badge">
                <img src={usdtIcon} alt="USDT" className="dm-icon-img" width="35" />
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

            <button
              className="dm-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nav("/member/deposit/crypto");
              }}
            >
              Continue
            </button>
          </div>

          {/* Bank */}
          <div
            className="dm-card"
            onClick={() => nav("/member/deposit/bank")}
            role="button"
            tabIndex={0}
          >
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

      <MemberBottomNav active="mine" />
    </div>
  );
}
