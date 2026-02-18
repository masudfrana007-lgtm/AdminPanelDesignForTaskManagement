// src/pages/WithdrawalMethod.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WithdrawalMethod.css";
import withdrawBg from "../assets/bg/withdraw.png";
// import usdtIcon from "../assets/icons/usdt.png";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import usdtIcon from "../assets/icons/usdt.png";

const API_HOST = "http://159.198.40.145:5010";

function toAbsUrl(p) {
  const s = String(p || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return API_HOST + s;
  return API_HOST + "/" + s;
}

function money(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function rankLabel(r) {
  const x = String(r || "").trim().toUpperCase();
  if (x === "V1") return 1;
  if (x === "V2") return 2;
  if (x === "V3") return 3;
  return 0;
}

export default function WithdrawalMethod() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const { data } = await memberApi.get("/member/me");
        setMe(data || null);
      } catch (e) {
        setMe(null);
        setErr(e?.response?.data?.message || "Failed to load profile");
      }
    })();
  }, []);

  // ✅ real values
  const vip = rankLabel(me?.ranking);
  const referenceCode = me?.sponsor_short_id || "-";
  const balance = Number(me?.balance || 0);

  // (optional) if you later want avatar image in the circle
  const rawAvatar =
    me?.avatar_url ||
    me?.photo_url ||
    me?.profile_photo_url ||
    me?.profile_picture_url ||
    me?.profile_photo ||
    "";
  const avatarUrl = toAbsUrl(rawAvatar);

  return (
    <div className="page wd-method" style={{ backgroundImage: `url(${withdrawBg})` }}>
      {/* Header */}
      <div className="wd-header">
        <button className="wd-back" onClick={() => nav(-1)} type="button">
          ←
        </button>

        <div className="wd-header-title">
          <div className="wd-title">Withdraw Funds</div>
          <div className="wd-sub">Choose a withdrawal method that is safe and convenient</div>
        </div>

        <button className="wd-help" onClick={() => nav("/member/service")} type="button">
          Support
        </button>
      </div>

      <div className="wd-wrap">
        {err ? <div className="wd-error">{err}</div> : null}

        {/* Profile + Balance */}
        <div className="wd-profileCard">
          <div className="wd-profLeft">
            {/* keep your existing avatar circle style.
               If you want the real photo, uncomment the <img> */}
            <div className="wd-avatar" aria-hidden="true">
              {/* {avatarUrl ? <img src={avatarUrl} alt="" /> : null} */}
            </div>

            <div className="wd-profMeta">
              <div className="wd-profRow">
                <span className="wd-profName">{me?.name || me?.nickname || "User"}</span>
                <span className="wd-vip">VIP {vip}</span>
              </div>

              <div className="wd-codeRow">
                <span className="wd-codeLabel">Reference code:</span>
                <span className="wd-codePill">{referenceCode}</span>
              </div>
            </div>
          </div>

          <div className="wd-balanceBox balanceRightAx">
            <div className="wd-balLabel">Available Balance</div>
            <div className="wd-balValue">
              <span className="wd-balUnit">USDT</span>
              <span className="wd-balNum">{money(balance)}</span>
            </div>
            <div className="wd-balHint">Withdrawals may require verification</div>
          </div>
        </div>

        {/* Options */}
        <div className="wd-options">
          <div className="wd-card" onClick={() => nav("/member/withdraw/crypto")} role="button" tabIndex={0}>
            <div className="wd-cardHead">
              <div className="dm-icon crypto usdt-badge">
                <img src={usdtIcon} alt="USDT" className="dm-icon-img" width="35" />
              </div>              
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

          <div className="wd-card" onClick={() => nav("/member/withdraw/bank")} role="button" tabIndex={0}>
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

      <MemberBottomNav active="mine" />
    </div>
  );
}
