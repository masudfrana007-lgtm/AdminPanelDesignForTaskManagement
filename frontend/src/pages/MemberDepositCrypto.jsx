import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/memberDepositCrypto.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberDepositCrypto() {
  const nav = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState("USDT");

  const goBack = () => {
    nav(-1);
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  const handleNext = () => {
    if (selectedCoin === "USDT") {
      nav("/member/deposit/usdt");
    } else {
      console.log("Selected coin:", selectedCoin);
      // Handle other coins
    }
  };

  return (
    <div className="depositCryptoPage">
      <div className="depositCryptoContainer">
        {/* Back Button */}
        <button className="backButton" onClick={goBack}>
          ←
        </button>

        {/* Page Title */}
        <h1 className="pageTitle">Deposit Crypto</h1>

        {/* Wallet Balance Card */}
        <div className="walletBalanceCard">
          <div className="balanceHeader">
            <div className="walletIcon">
              <svg viewBox="0 0 24 24" fill="#8B7355" width="24" height="24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
              </svg>
            </div>
            <span className="walletLabel">Wallet Balance</span>
          </div>
          <div className="balanceAmount">
            <span className="amount">$1,280.45</span>
            <span className="currency">USD</span>
          </div>
          <div className="balanceEquivalent">
            ≈ 1,245.32 USDT
          </div>
        </div>

        {/* Select Coin Section */}
        <div className="selectCoinSection">
          <h2 className="selectCoinTitle">Select Coin</h2>
          
          <div className="coinOptions">
            {/* USDT Option */}
            <div 
              className={`coinOption ${selectedCoin === 'USDT' ? 'selected' : ''}`}
              onClick={() => {
                handleCoinSelect('USDT');
                nav("/member/deposit/usdt");
              }}
            >
              <div className="coinIcon usdt">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="#26A17B"/>
                  <path d="M12.87 6.75H9.11V8.37H12.87V6.75Z" fill="white"/>
                  <path d="M12.87 8.95H9.11V10.56H12.87V8.95Z" fill="white"/>
                  <path d="M15.17 6.75V8.37H17.25V10.56H15.17V17.25H12.87V10.56H9.11V17.25H6.75V10.56H4.75V8.37H6.75V6.75H15.17Z" fill="white"/>
                </svg>
              </div>
              <div className="coinInfo">
                <span className="coinName">USDT</span>
                <span className="coinSubname">USDT</span>
              </div>
              <div className="coinArrow">›</div>
            </div>

            {/* BSC Option */}
            <div 
              className={`coinOption ${selectedCoin === 'BSC' ? 'selected' : ''}`}
              onClick={() => handleCoinSelect('BSC')}
            >
              <div className="coinIcon bsc">
                <svg viewBox="0 0 24 24" fill="#F3BA2F" width="24" height="24">
                  <path d="M12 2L13.09 8.26L20 7L14.74 13.09L21 14.18L13.09 15.91L14.74 22L8.91 15.91L2 14.18L8.26 13.09L7 7L13.09 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="coinInfo">
                <span className="coinName">BSC</span>
                <span className="coinSubname">BSC</span>
              </div>
              <div className="coinArrow">›</div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button className="nextButton" onClick={handleNext}>
          Next
        </button>
      </div>

      {/* Bottom Navigation */}
      <MemberBottomNav active="mine" />
    </div>
  );
}