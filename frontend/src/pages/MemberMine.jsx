// src/pages/MemberMine.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaUserFriends, FaCaretSquareUp } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import TeamJoinPopup from "../components/TeamJoinPopup";
import InviteFriendsPopup from "../components/InviteFriendsPopup";
import "../styles/memberMine.css";


import memberApi from "../services/memberApi";

/* ✅ icons (adjust path if your structure is different) */
import teamIcon from "../assets/icons/team.png";
import depositIcon from "../assets/icons/deposit-new.png";
import withdrawalIcon from "../assets/icons/withdrawal-new.png";

import profileIcon from "../assets/icons/profile.png";
import securityIcon from "../assets/icons/Security.png";
import settingsIcon from "../assets/icons/settings.png";
import depositRec1Icon from "../assets/icons/DepositR.png";
import depositRec2Icon from "../assets/icons/DepositRR.png";

/* ---------------- CONFIG ---------------- */


function money(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
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

function rankLabel(r) {
  const x = String(r || "").trim().toUpperCase();
  if (x === "V1") return "VIP 1";
  if (x === "V2") return "VIP 2";
  if (x === "V3") return "VIP 3";
  return "Trial";
}

export default function MemberMine() {
  const nav = useNavigate();
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

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

  // ✅ map API -> UI fields (keep UI identical)
  const vip = rankLabel(me?.ranking);
  const balance = Number(me?.balance || 0);

  // "User ID" shown in UI:
  // best available is member.short_id (you already return it)
  const referenceCode = me?.sponsor_short_id || "-";

  // stable avatar seed
  const avatarSeed = referenceCode === "-" ? "guest" : referenceCode;

const avatarUrl =
  me?.avatar_url ||
  me?.photo_url ||
  me?.profile_photo_url ||
  me?.profile_picture_url ||
  me?.profile_photo ||
  "";

const hasAvatar = !!avatarUrl;

  return (
    <div className="minePage">
      <div className="mineContainer">
        {err && <div className="mineAlert error">{err}</div>}
        <div className="mine-hero">
          <div className="mine-hero-main">
            <div className="mine-hero-left">
              <div className="mine-hero-top">
                <div className="mine-avatar">
                  <img
                    src={hasAvatar ? avatarUrl : "/user.png"}
                    alt="User Avatar"
                    className="mine-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = "/user.png";
                    }}
                  />                  
                </div>
                <div className="mine-meta">
                  <div className="mine-vip">
                    <span className="mine-vip-pill">{vip}</span>
                  </div>

                  <div className="mine-ref">
                    <span className="mine-ref-label">User ID:</span>
                    <span className="mine-ref-code">{referenceCode}</span>
                  </div>
                </div>
              </div>

              <div className="mine-balance">
                <div className="mine-balance-title">My Account</div>
                <div className="mine-balance-row">
                  <span className="mine-balance-unit">USDT</span>
                  <span className="mine-balance-val">{money(balance)}</span>
                </div>
              </div>
            </div>

            <div className="mine-support">
              <button className="mine-support-btn" onClick={() => nav("/member/service")}>
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* ✅ QUICK ACTIONS (same design) */}
        <div className="mine-actions-wrap">
          <div className="mine-actions">
            <CardButton
              icon={<FaUsers />}
              label="Teams"
              onClick={() => setShowTeamPopup(true)}
            />
            <CardButton
              icon={<img src={depositIcon} alt="Deposit" className="custom-icon" />}
              label="Deposit"
              onClick={() => nav("/member/deposit")}
            />
            <CardButton
              icon={<img src={withdrawalIcon} alt="Withdrawal" className="custom-icon" />}
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

        {/* ✅ LISTS (same design) */}
        <div className="mine-lists">
          <div className="mine-list">
            <ListItem
              icon={<img src={profileIcon} alt="Profile" className="list-icon-img" />}
              label="Profile"
              onClick={() => nav("/profile")}
            />
            <ListItem
              icon={<img src={withdrawalIcon} alt="Beneficiary Management" className="list-icon-img" />}
              label="Beneficiary Management"
              onClick={() => nav("/beneficiary-management")}
            />
            <ListItem
              icon={<img src={settingsIcon} alt="Setting" className="list-icon-img" />}
              label="Setting"
              onClick={() => nav("/member/settings")}
            />
          </div>

          <div className="mine-list">
            <ListItem
              icon={<img src={depositRec1Icon} alt="Deposit Records" className="list-icon-img" />}
              label="Deposit Records"
              onClick={() => nav("/member/deposit/records")}
            />
            <ListItem
              icon={<FaCaretSquareUp />}
              label="Withdrawal Records"
              onClick={() => nav("/member/withdraw/records")}
            />
            <ListItem
              icon={<img src={securityIcon} alt="Security" className="list-icon-img" />}
              label="Security"
              onClick={() => nav("/security")}
            />
          </div>
        </div>
      </div>

      <MemberBottomNav active="mine" />

      <TeamJoinPopup
        isOpen={showTeamPopup}
        onClose={() => setShowTeamPopup(false)}
      />

      <InviteFriendsPopup
        isOpen={showInvitePopup}
        onClose={() => setShowInvitePopup(false)}
      />
    </div>
  );
}
