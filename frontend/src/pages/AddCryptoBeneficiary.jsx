<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBitcoin, FaCheck, FaCopy } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

const cryptoCurrencies = [
  { code: "BTC", name: "Bitcoin", icon: "₿" },
  { code: "ETH", name: "Ethereum", icon: "Ξ" },
  { code: "USDT", name: "Tether USD", icon: "₮" },
  { code: "USDC", name: "USD Coin", icon: "$" },
  { code: "BNB", name: "Binance Coin", icon: "⬢" },
  { code: "ADA", name: "Cardano", icon: "₳" },
  { code: "DOT", name: "Polkadot", icon: "●" },
  { code: "MATIC", name: "Polygon", icon: "⬟" }
];

function CurrencyOption({ currency, selected, onClick }) {
  return (
    <button
      type="button"
      className={`currency-option ${selected ? "selected" : ""}`}
      onClick={() => onClick(currency)}
    >
      <div className="currency-icon">{currency.icon}</div>
      <div className="currency-info">
        <div className="currency-code">{currency.code}</div>
        <div className="currency-name">{currency.name}</div>
      </div>
      {selected && <FaCheck className="selected-check" />}
    </button>
  );
}

export default function AddCryptoBeneficiary() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    currency: "",
    address: "",
    network: "",
    memo: "" // For currencies that require memo (like XRP, XLM)
  });

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const networks = {
    BTC: ["Bitcoin"],
    ETH: ["Ethereum (ERC-20)", "Binance Smart Chain (BEP-20)", "Polygon"],
    USDT: ["Ethereum (ERC-20)", "Tron (TRC-20)", "Binance Smart Chain (BEP-20)"],
    USDC: ["Ethereum (ERC-20)", "Binance Smart Chain (BEP-20)", "Polygon"],
    BNB: ["Binance Smart Chain (BEP-20)", "Binance Chain (BEP-2)"],
    ADA: ["Cardano"],
    DOT: ["Polkadot"],
    MATIC: ["Polygon", "Ethereum (ERC-20)"]
  };

  const requiresMemo = ["XRP", "XLM", "EOS"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErr("");
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setFormData(prev => ({ 
      ...prev, 
      currency: currency.code,
      network: networks[currency.code] ? networks[currency.code][0] : "",
      memo: "" 
    }));
    setShowCurrencyModal(false);
  };

  const validateAddress = (address, currency) => {
    // Basic validation patterns
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      USDT: /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/, // Multiple networks
      USDC: /^0x[a-fA-F0-9]{40}$/,
      BNB: /^(0x[a-fA-F0-9]{40}|bnb[a-z0-9]{39})$/,
      ADA: /^addr1[a-z0-9]{98}$/,
      DOT: /^1[a-km-zA-HJ-NP-Z1-9]{47}$/,
      MATIC: /^0x[a-fA-F0-9]{40}$/
    };

    return patterns[currency]?.test(address) || false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setErr("Beneficiary name is required");
      setLoading(false);
      return;
    }

    if (!formData.currency) {
      setErr("Please select a cryptocurrency");
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setErr("Wallet address is required");
      setLoading(false);
      return;
    }

    if (!validateAddress(formData.address, formData.currency)) {
      setErr(`Invalid ${formData.currency} address format`);
      setLoading(false);
      return;
    }

    if (!formData.network) {
      setErr("Please select a network");
      setLoading(false);
      return;
    }

    if (requiresMemo.includes(formData.currency) && !formData.memo.trim()) {
      setErr(`Memo is required for ${formData.currency} transactions`);
      setLoading(false);
      return;
    }

    try {
      // TODO: API call to save beneficiary
      // await memberApi.post("/member/beneficiaries", {
      //   type: "crypto",
      //   name: formData.name,
      //   currency: formData.currency,
      //   address: formData.address,
      //   network: formData.network,
      //   memo: formData.memo
      // });

      // Mock success
      setTimeout(() => {
        setSuccess("Crypto beneficiary added successfully!");
        setTimeout(() => {
          nav("/beneficiary-management");
        }, 1500);
      }, 1000);

    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add beneficiary");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (formData.address) {
      navigator.clipboard.writeText(formData.address);
      // You could show a toast notification here
    }
  };

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Add Crypto Beneficiary</div>
            <div className="ben-sub">Add a new cryptocurrency wallet</div>
          </div>
        </div>

        {err && <div className="ben-alert error">{err}</div>}
        {success && <div className="ben-alert success">{success}</div>}

        {/* Form */}
        <form className="ben-form" onSubmit={handleSubmit}>
          {/* Beneficiary Name */}
          <div className="ben-form-group">
            <label className="ben-label">Beneficiary Name *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="e.g., My Binance Wallet"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              maxLength={50}
            />
            <div className="ben-hint">Choose a name to identify this wallet</div>
          </div>

          {/* Currency Selection */}
          <div className="ben-form-group">
            <label className="ben-label">Cryptocurrency *</label>
            <button
              type="button"
              className="ben-select"
              onClick={() => setShowCurrencyModal(true)}
            >
              {selectedCurrency ? (
                <div className="selected-currency">
                  <span className="currency-icon">{selectedCurrency.icon}</span>
                  <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
                </div>
              ) : (
                <span>Select Cryptocurrency</span>
              )}
            </button>
          </div>

          {/* Network Selection */}
          {formData.currency && (
            <div className="ben-form-group">
              <label className="ben-label">Network *</label>
              <select
                className="ben-select"
                value={formData.network}
                onChange={(e) => handleInputChange("network", e.target.value)}
              >
                {networks[formData.currency]?.map(network => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
              <div className="ben-hint">Select the correct network to avoid loss of funds</div>
            </div>
          )}

          {/* Wallet Address */}
          <div className="ben-form-group">
            <label className="ben-label">Wallet Address *</label>
            <div className="ben-input-group">
              <input
                type="text"
                className="ben-input"
                placeholder="Enter wallet address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {formData.address && (
                <button type="button" className="ben-copy-btn" onClick={copyAddress}>
                  <FaCopy />
                </button>
              )}
            </div>
            <div className="ben-hint">Double-check the address to prevent loss of funds</div>
          </div>

          {/* Memo (if required) */}
          {requiresMemo.includes(formData.currency) && (
            <div className="ben-form-group">
              <label className="ben-label">Memo/Tag *</label>
              <input
                type="text"
                className="ben-input"
                placeholder="Enter memo/tag"
                value={formData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
              />
              <div className="ben-hint">Required for {formData.currency} transactions</div>
            </div>
          )}

          {/* Warning */}
          <div className="ben-warning">
            <div className="warning-icon">⚠️</div>
            <div>
              <strong>Important:</strong> Please ensure the wallet address and network are correct. 
              Sending funds to an incorrect address may result in permanent loss.
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="ben-submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Adding Beneficiary...
              </>
            ) : (
              <>
                <FaBitcoin />
                Add Crypto Beneficiary
              </>
            )}
          </button>
        </form>
      </div>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="ben-modal-backdrop" onClick={() => setShowCurrencyModal(false)}>
          <div className="ben-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ben-modal-header">
              <h3>Select Cryptocurrency</h3>
              <button 
                className="ben-modal-close" 
                onClick={() => setShowCurrencyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="ben-modal-body">
              <div className="currency-grid">
                {cryptoCurrencies.map(currency => (
                  <CurrencyOption
                    key={currency.code}
                    currency={currency}
                    selected={selectedCurrency?.code === currency.code}
                    onClick={handleCurrencySelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <MemberBottomNav active="mine" />
    </div>
  );
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBitcoin, FaCheck, FaCopy } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

const cryptoCurrencies = [
  { code: "BTC", name: "Bitcoin", icon: "₿" },
  { code: "ETH", name: "Ethereum", icon: "Ξ" },
  { code: "USDT", name: "Tether USD", icon: "₮" },
  { code: "USDC", name: "USD Coin", icon: "$" },
  { code: "BNB", name: "Binance Coin", icon: "⬢" },
  { code: "ADA", name: "Cardano", icon: "₳" },
  { code: "DOT", name: "Polkadot", icon: "●" },
  { code: "MATIC", name: "Polygon", icon: "⬟" }
];

function CurrencyOption({ currency, selected, onClick }) {
  return (
    <button
      type="button"
      className={`currency-option ${selected ? "selected" : ""}`}
      onClick={() => onClick(currency)}
    >
      <div className="currency-icon">{currency.icon}</div>
      <div className="currency-info">
        <div className="currency-code">{currency.code}</div>
        <div className="currency-name">{currency.name}</div>
      </div>
      {selected && <FaCheck className="selected-check" />}
    </button>
  );
}

export default function AddCryptoBeneficiary() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    currency: "",
    address: "",
    network: "",
    memo: "" // For currencies that require memo (like XRP, XLM)
  });

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const networks = {
    BTC: ["Bitcoin"],
    ETH: ["Ethereum (ERC-20)", "Binance Smart Chain (BEP-20)", "Polygon"],
    USDT: ["Ethereum (ERC-20)", "Tron (TRC-20)", "Binance Smart Chain (BEP-20)"],
    USDC: ["Ethereum (ERC-20)", "Binance Smart Chain (BEP-20)", "Polygon"],
    BNB: ["Binance Smart Chain (BEP-20)", "Binance Chain (BEP-2)"],
    ADA: ["Cardano"],
    DOT: ["Polkadot"],
    MATIC: ["Polygon", "Ethereum (ERC-20)"]
  };

  const requiresMemo = ["XRP", "XLM", "EOS"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErr("");
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setFormData(prev => ({ 
      ...prev, 
      currency: currency.code,
      network: networks[currency.code] ? networks[currency.code][0] : "",
      memo: "" 
    }));
    setShowCurrencyModal(false);
  };

  const validateAddress = (address, currency) => {
    // Basic validation patterns
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      USDT: /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/, // Multiple networks
      USDC: /^0x[a-fA-F0-9]{40}$/,
      BNB: /^(0x[a-fA-F0-9]{40}|bnb[a-z0-9]{39})$/,
      ADA: /^addr1[a-z0-9]{98}$/,
      DOT: /^1[a-km-zA-HJ-NP-Z1-9]{47}$/,
      MATIC: /^0x[a-fA-F0-9]{40}$/
    };

    return patterns[currency]?.test(address) || false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setErr("Beneficiary name is required");
      setLoading(false);
      return;
    }

    if (!formData.currency) {
      setErr("Please select a cryptocurrency");
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setErr("Wallet address is required");
      setLoading(false);
      return;
    }

    if (!validateAddress(formData.address, formData.currency)) {
      setErr(`Invalid ${formData.currency} address format`);
      setLoading(false);
      return;
    }

    if (!formData.network) {
      setErr("Please select a network");
      setLoading(false);
      return;
    }

    if (requiresMemo.includes(formData.currency) && !formData.memo.trim()) {
      setErr(`Memo is required for ${formData.currency} transactions`);
      setLoading(false);
      return;
    }

    try {
      // TODO: API call to save beneficiary
      // await memberApi.post("/member/beneficiaries", {
      //   type: "crypto",
      //   name: formData.name,
      //   currency: formData.currency,
      //   address: formData.address,
      //   network: formData.network,
      //   memo: formData.memo
      // });

      // Mock success
      setTimeout(() => {
        setSuccess("Crypto beneficiary added successfully!");
        setTimeout(() => {
          nav("/beneficiary-management");
        }, 1500);
      }, 1000);

    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add beneficiary");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (formData.address) {
      navigator.clipboard.writeText(formData.address);
      // You could show a toast notification here
    }
  };

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Add Crypto Beneficiary</div>
            <div className="ben-sub">Add a new cryptocurrency wallet</div>
          </div>
        </div>

        {err && <div className="ben-alert error">{err}</div>}
        {success && <div className="ben-alert success">{success}</div>}

        {/* Form */}
        <form className="ben-form" onSubmit={handleSubmit}>
          {/* Beneficiary Name */}
          <div className="ben-form-group">
            <label className="ben-label">Beneficiary Name *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="e.g., My Binance Wallet"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              maxLength={50}
            />
            <div className="ben-hint">Choose a name to identify this wallet</div>
          </div>

          {/* Currency Selection */}
          <div className="ben-form-group">
            <label className="ben-label">Cryptocurrency *</label>
            <button
              type="button"
              className="ben-select"
              onClick={() => setShowCurrencyModal(true)}
            >
              {selectedCurrency ? (
                <div className="selected-currency">
                  <span className="currency-icon">{selectedCurrency.icon}</span>
                  <span>{selectedCurrency.code} - {selectedCurrency.name}</span>
                </div>
              ) : (
                <span>Select Cryptocurrency</span>
              )}
            </button>
          </div>

          {/* Network Selection */}
          {formData.currency && (
            <div className="ben-form-group">
              <label className="ben-label">Network *</label>
              <select
                className="ben-select"
                value={formData.network}
                onChange={(e) => handleInputChange("network", e.target.value)}
              >
                {networks[formData.currency]?.map(network => (
                  <option key={network} value={network}>{network}</option>
                ))}
              </select>
              <div className="ben-hint">Select the correct network to avoid loss of funds</div>
            </div>
          )}

          {/* Wallet Address */}
          <div className="ben-form-group">
            <label className="ben-label">Wallet Address *</label>
            <div className="ben-input-group">
              <input
                type="text"
                className="ben-input"
                placeholder="Enter wallet address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {formData.address && (
                <button type="button" className="ben-copy-btn" onClick={copyAddress}>
                  <FaCopy />
                </button>
              )}
            </div>
            <div className="ben-hint">Double-check the address to prevent loss of funds</div>
          </div>

          {/* Memo (if required) */}
          {requiresMemo.includes(formData.currency) && (
            <div className="ben-form-group">
              <label className="ben-label">Memo/Tag *</label>
              <input
                type="text"
                className="ben-input"
                placeholder="Enter memo/tag"
                value={formData.memo}
                onChange={(e) => handleInputChange("memo", e.target.value)}
              />
              <div className="ben-hint">Required for {formData.currency} transactions</div>
            </div>
          )}

          {/* Warning */}
          <div className="ben-warning">
            <div className="warning-icon">⚠️</div>
            <div>
              <strong>Important:</strong> Please ensure the wallet address and network are correct. 
              Sending funds to an incorrect address may result in permanent loss.
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="ben-submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Adding Beneficiary...
              </>
            ) : (
              <>
                <FaBitcoin />
                Add Crypto Beneficiary
              </>
            )}
          </button>
        </form>
      </div>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="ben-modal-backdrop" onClick={() => setShowCurrencyModal(false)}>
          <div className="ben-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ben-modal-header">
              <h3>Select Cryptocurrency</h3>
              <button 
                className="ben-modal-close" 
                onClick={() => setShowCurrencyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="ben-modal-body">
              <div className="currency-grid">
                {cryptoCurrencies.map(currency => (
                  <CurrencyOption
                    key={currency.code}
                    currency={currency}
                    selected={selectedCurrency?.code === currency.code}
                    onClick={handleCurrencySelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <MemberBottomNav active="mine" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}