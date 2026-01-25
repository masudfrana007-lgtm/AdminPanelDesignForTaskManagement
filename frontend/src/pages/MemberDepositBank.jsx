import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/memberDepositBank.css";
import MemberBottomNav from "../components/MemberBottomNav";

export default function MemberDepositBank() {
  const nav = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedBank, setSelectedBank] = useState("");

  const goBack = () => {
    nav(-1);
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
  };

  const handleNext = () => {
    console.log("Selected bank:", selectedBank);
    // Navigate to next step or process bank deposit
  };

  const banks = [
    {
      name: "Chase",
      logo: "chase",
      recommended: false
    },
    {
      name: "Bank of America",
      logo: "boa",
      recommended: true
    },
    {
      name: "Wells Fargo",
      logo: "wellsfargo",
      recommended: false
    },
    {
      name: "citibank",
      logo: "citi",
      recommended: false
    },
    {
      name: "Capital One",
      logo: "capitalone",
      recommended: false
    },
    {
      name: "HSBC",
      logo: "hsbc",
      recommended: false
    }
  ];

  return (
    <div className="depositBankPage">
      <div className="depositBankContainer">
        {/* Back Button */}
        <button className="backButton" onClick={goBack}>
          ←
        </button>

        {/* Page Title */}
        <h1 className="pageTitle">Deposit by Bank</h1>

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
          <div className="balanceDetails">
            <span className="balanceEquivalent">≈ 1,245.32 USDT</span>
            <div className="statusIndicator">
              <span className="statusDot active"></span>
              <span className="statusText">+300 (2 days ago)</span>
              <span className="activeText">Active</span>
            </div>
          </div>
        </div>

        {/* Select Country Section */}
        <div className="selectCountrySection">
          <h2 className="selectCountryTitle">Select Country</h2>
          
          <div className="countryOption">
            <div className="countryFlag">
              <span className="flagIcon">🇺🇸</span>
            </div>
            <div className="countryInfo">
              <span className="countryName">United States</span>
            </div>
            <div className="countryArrow">›</div>
          </div>
        </div>

        {/* Select Bank Section */}
        <div className="selectBankSection">
          <h2 className="selectBankTitle">Select Bank</h2>
          
          <div className="bankGrid">
            {banks.map((bank) => (
              <div 
                key={bank.name}
                className={`bankOption ${selectedBank === bank.name ? 'selected' : ''}`}
                onClick={() => handleBankSelect(bank.name)}
              >
                {bank.recommended && (
                  <div className="recommendedBadge">Recommended</div>
                )}
                <div className={`bankLogo ${bank.logo}`}>
                  {bank.name === "Chase" && (
                    <svg viewBox="0 0 100 100" fill="#117ACA" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#117ACA"/>
                      <rect x="20" y="20" width="60" height="60" rx="30" fill="white"/>
                      <rect x="30" y="30" width="40" height="40" rx="20" fill="#117ACA"/>
                    </svg>
                  )}
                  {bank.name === "Bank of America" && (
                    <svg viewBox="0 0 100 100" fill="#E31837" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#E31837"/>
                      <polygon points="20,20 80,20 50,60" fill="white"/>
                      <polygon points="30,70 70,70 50,80" fill="white"/>
                    </svg>
                  )}
                  {bank.name === "Wells Fargo" && (
                    <svg viewBox="0 0 100 100" fill="#D71921" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#D71921"/>
                      <text x="50" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">WELLS</text>
                      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">FARGO</text>
                    </svg>
                  )}
                  {bank.name === "citibank" && (
                    <svg viewBox="0 0 100 100" fill="#056DAE" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#056DAE"/>
                      <text x="50" y="60" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">citi</text>
                    </svg>
                  )}
                  {bank.name === "Capital One" && (
                    <svg viewBox="0 0 100 100" fill="#004879" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#004879"/>
                      <text x="50" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Capital</text>
                      <text x="50" y="65" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">One</text>
                    </svg>
                  )}
                  {bank.name === "HSBC" && (
                    <svg viewBox="0 0 100 100" fill="#DB0011" width="40" height="40">
                      <rect width="100" height="100" rx="8" fill="#DB0011"/>
                      <rect x="20" y="30" width="20" height="20" fill="white"/>
                      <rect x="60" y="30" width="20" height="20" fill="white"/>
                      <rect x="20" y="50" width="20" height="20" fill="white"/>
                      <rect x="60" y="50" width="20" height="20" fill="white"/>
                    </svg>
                  )}
                </div>
                <div className="bankInfo">
                  <span className="bankName">{bank.name}</span>
                  <span className="bankDetails">Manual • 1-2 hours</span>
                </div>
                <div className="bankArrow">›</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="securityNote">
          <span className="securityIcon">🔒</span>
          <span className="securityText">Your funds are protected with bank-level encryption</span>
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