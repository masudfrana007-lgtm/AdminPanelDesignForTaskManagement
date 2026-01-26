import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/memberDepositUSDT.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberDepositUSDT() {
  const nav = useNavigate();
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20");
  const [depositAddress] = useState("TYTtpEcmvFf2TlvxxfUdVBMkYZhTvlxMH");

  const goBack = () => {
    nav(-1);
  };

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    // You can add a toast notification here
  };

  const handleNext = () => {
    console.log("Selected network:", selectedNetwork);
    // Navigate to next step or process deposit
  };

  return (
    <div className="depositUSDTPage">
      <div className="depositUSDTContainer">
        {/* Back Button */}
        <button className="backButton" onClick={goBack}>
          ←
        </button>

        {/* Page Title */}
        <h1 className="pageTitle">Deposit USDT</h1>

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

        {/* Select Network Section */}
        <div className="selectNetworkSection">
          <h2 className="selectNetworkTitle">Select Network</h2>
          
          <div className="networkOptions">
            {/* TRC20 Option */}
            <div 
              className={`networkOption ${selectedNetwork === 'TRC20' ? 'selected' : ''}`}
              onClick={() => handleNetworkSelect('TRC20')}
            >
              <div className="networkIcon trc20">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                  <circle cx="12" cy="12" r="10" fill="#FF060A"/>
                  <path d="M8.5 8.5L15.5 8.5L12 15.5Z" fill="white"/>
                </svg>
              </div>
              <div className="networkInfo">
                <div className="networkTitle">
                  <span>TRC20</span>
                  <span className="networkBadge fast">Fast</span>
                  <span className="networkBadge recommended">Recommended</span>
                </div>
                <span className="networkSubtitle">Tron Network</span>
              </div>
              <div className="networkArrow">›</div>
            </div>

            {/* ERC20 Option */}
            <div 
              className={`networkOption ${selectedNetwork === 'ERC20' ? 'selected' : ''}`}
              onClick={() => handleNetworkSelect('ERC20')}
            >
              <div className="networkIcon erc20">
                <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                  <path d="M12,1.75L5.75,12.25L12,16L18.25,12.25L12,1.75M12,17.25L5.75,13.5L12,22.25L18.25,13.5L12,17.25Z" fill="white"/>
                </svg>
              </div>
              <div className="networkInfo">
                <div className="networkTitle">
                  <span>ERC20</span>
                </div>
                <span className="networkSubtitle">Ethereum</span>
              </div>
              <div className="networkArrow">›</div>
            </div>

            {/* BSC Option */}
            <div 
              className={`networkOption ${selectedNetwork === 'BSC' ? 'selected' : ''}`}
              onClick={() => handleNetworkSelect('BSC')}
            >
              <div className="networkIcon bsc">
                <svg viewBox="0 0 24 24" fill="#F3BA2F" width="24" height="24">
                  <path d="M12 2L13.09 8.26L20 7L14.74 13.09L21 14.18L13.09 15.91L14.74 22L8.91 15.91L2 14.18L8.26 13.09L7 7L13.09 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="networkInfo">
                <div className="networkTitle">
                  <span>BSC</span>
                </div>
                <span className="networkSubtitle">Binance Smart Chain</span>
              </div>
              <div className="networkArrow">›</div>
            </div>
          </div>
        </div>

        {/* Deposit Address Section */}
        <div className="depositAddressSection">
          <div className="addressHeader">
            <span className="addressLabel">Deposit Address</span>
            <div className="addressInfo">ⓘ</div>
          </div>
          
          <div className="addressContainer">
            <div className="qrCode">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <rect x="0" y="0" width="100" height="100" fill="white"/>
                <rect x="5" y="5" width="20" height="20" fill="black"/>
                <rect x="75" y="5" width="20" height="20" fill="black"/>
                <rect x="5" y="75" width="20" height="20" fill="black"/>
                <rect x="10" y="10" width="10" height="10" fill="white"/>
                <rect x="80" y="10" width="10" height="10" fill="white"/>
                <rect x="10" y="80" width="10" height="10" fill="white"/>
                <rect x="30" y="30" width="5" height="5" fill="black"/>
                <rect x="40" y="35" width="5" height="5" fill="black"/>
                <rect x="50" y="30" width="5" height="5" fill="black"/>
                <rect x="60" y="35" width="5" height="5" fill="black"/>
                <rect x="35" y="45" width="5" height="5" fill="black"/>
                <rect x="45" y="50" width="5" height="5" fill="black"/>
                <rect x="55" y="45" width="5" height="5" fill="black"/>
                <rect x="30" y="60" width="5" height="5" fill="black"/>
                <rect x="50" y="65" width="5" height="5" fill="black"/>
                <rect x="65" y="60" width="5" height="5" fill="black"/>
              </svg>
            </div>
            
            <div className="addressInput">
              <input 
                type="text" 
                value={depositAddress} 
                readOnly
                className="addressField"
              />
              <button className="copyButton" onClick={copyAddress}>
                <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                  <path d="M16,1H4C2.9,1,2,1.9,2,3V17H4V3H16V1M19,5H8C6.9,5,6,5.9,6,7V21C6,22.1,6.9,23,8,23H19C20.1,23,21,22.1,21,21V7C21,5.9,20.1,5,19,5M19,21H8V7H19V21Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="addressWarnings">
            <div className="warningItem">
              <span className="warningDot">●</span>
              <span className="warningText">Send only USDT (TRC20) to this address</span>
            </div>
            <div className="warningItem">
              <span className="warningDot">●</span>
              <span className="warningText">Make sure the network is TRC20</span>
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