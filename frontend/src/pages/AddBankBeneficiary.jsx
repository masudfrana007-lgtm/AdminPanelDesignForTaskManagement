<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUniversity, FaUser, FaIdCard } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

const countries = [
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "TH", name: "Thailand", currency: "THB" },
  { code: "ID", name: "Indonesia", currency: "IDR" }
];

const accountTypes = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "checking", label: "Checking Account" }
];

export default function AddBankBeneficiary() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    bankCode: "", // SWIFT/IFSC/Sort Code
    accountType: "",
    country: "",
    currency: "",
    address: "",
    city: "",
    postalCode: "",
    relationship: "",
    purpose: ""
  });

  const relationships = [
    "Self", "Family Member", "Friend", "Business Partner", "Other"
  ];

  const purposes = [
    "Personal Transfer", "Family Support", "Business Payment", 
    "Investment", "Education", "Medical", "Other"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErr("");

    // Auto-set currency when country is selected
    if (field === "country") {
      const selectedCountry = countries.find(c => c.code === value);
      if (selectedCountry) {
        setFormData(prev => ({ ...prev, currency: selectedCountry.currency }));
      }
    }
  };

  const validateForm = () => {
    const required = [
      "beneficiaryName", "accountNumber", "confirmAccountNumber", 
      "bankName", "accountType", "country", "relationship", "purpose"
    ];

    for (const field of required) {
      if (!formData[field].trim()) {
        setErr(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setErr("Account numbers do not match");
      return false;
    }

    if (formData.accountNumber.length < 8) {
      setErr("Account number must be at least 8 characters");
      return false;
    }

    if (formData.beneficiaryName.length < 2) {
      setErr("Beneficiary name must be at least 2 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: API call to save bank beneficiary
      // await memberApi.post("/member/beneficiaries", {
      //   type: "bank",
      //   ...formData
      // });

      // Mock success
      setTimeout(() => {
        setSuccess("Bank beneficiary added successfully!");
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

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Add Bank Beneficiary</div>
            <div className="ben-sub">Add a new bank account recipient</div>
          </div>
        </div>

        {err && <div className="ben-alert error">{err}</div>}
        {success && <div className="ben-alert success">{success}</div>}

        {/* Form */}
        <form className="ben-form" onSubmit={handleSubmit}>
          {/* Beneficiary Information */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaUser /></div>
            <h3>Beneficiary Information</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Full Name (as per bank records) *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter beneficiary's full name"
              value={formData.beneficiaryName}
              onChange={(e) => handleInputChange("beneficiaryName", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">Relationship *</label>
              <select
                className="ben-select"
                value={formData.relationship}
                onChange={(e) => handleInputChange("relationship", e.target.value)}
              >
                <option value="">Select relationship</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Transfer Purpose *</label>
              <select
                className="ben-select"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
              >
                <option value="">Select purpose</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaUniversity /></div>
            <h3>Bank Account Details</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Bank Name *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">Account Type *</label>
              <select
                className="ben-select"
                value={formData.accountType}
                onChange={(e) => handleInputChange("accountType", e.target.value)}
              >
                <option value="">Select account type</option>
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Country *</label>
              <select
                className="ben-select"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Account Number *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Confirm Account Number *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Re-enter account number"
              value={formData.confirmAccountNumber}
              onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Bank Code (SWIFT/IFSC/Sort Code)</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter bank code if required"
              value={formData.bankCode}
              onChange={(e) => handleInputChange("bankCode", e.target.value)}
              maxLength={15}
            />
            <div className="ben-hint">Required for international transfers</div>
          </div>

          {/* Address Information */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaIdCard /></div>
            <h3>Address Information</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Address</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">City</label>
              <input
                type="text"
                className="ben-input"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Postal Code</label>
              <input
                type="text"
                className="ben-input"
                placeholder="Postal/ZIP code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                maxLength={10}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="ben-warning">
            <div className="warning-icon">⚠️</div>
            <div>
              <strong>Important:</strong> Ensure all bank details are accurate. 
              Incorrect information may cause transfer delays or failures.
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
                <FaUniversity />
                Add Bank Beneficiary
              </>
            )}
          </button>
        </form>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
=======
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUniversity, FaUser, FaIdCard } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

const countries = [
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "TH", name: "Thailand", currency: "THB" },
  { code: "ID", name: "Indonesia", currency: "IDR" }
];

const accountTypes = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "checking", label: "Checking Account" }
];

export default function AddBankBeneficiary() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    bankCode: "", // SWIFT/IFSC/Sort Code
    accountType: "",
    country: "",
    currency: "",
    address: "",
    city: "",
    postalCode: "",
    relationship: "",
    purpose: ""
  });

  const relationships = [
    "Self", "Family Member", "Friend", "Business Partner", "Other"
  ];

  const purposes = [
    "Personal Transfer", "Family Support", "Business Payment", 
    "Investment", "Education", "Medical", "Other"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErr("");

    // Auto-set currency when country is selected
    if (field === "country") {
      const selectedCountry = countries.find(c => c.code === value);
      if (selectedCountry) {
        setFormData(prev => ({ ...prev, currency: selectedCountry.currency }));
      }
    }
  };

  const validateForm = () => {
    const required = [
      "beneficiaryName", "accountNumber", "confirmAccountNumber", 
      "bankName", "accountType", "country", "relationship", "purpose"
    ];

    for (const field of required) {
      if (!formData[field].trim()) {
        setErr(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setErr("Account numbers do not match");
      return false;
    }

    if (formData.accountNumber.length < 8) {
      setErr("Account number must be at least 8 characters");
      return false;
    }

    if (formData.beneficiaryName.length < 2) {
      setErr("Beneficiary name must be at least 2 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: API call to save bank beneficiary
      // await memberApi.post("/member/beneficiaries", {
      //   type: "bank",
      //   ...formData
      // });

      // Mock success
      setTimeout(() => {
        setSuccess("Bank beneficiary added successfully!");
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

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Add Bank Beneficiary</div>
            <div className="ben-sub">Add a new bank account recipient</div>
          </div>
        </div>

        {err && <div className="ben-alert error">{err}</div>}
        {success && <div className="ben-alert success">{success}</div>}

        {/* Form */}
        <form className="ben-form" onSubmit={handleSubmit}>
          {/* Beneficiary Information */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaUser /></div>
            <h3>Beneficiary Information</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Full Name (as per bank records) *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter beneficiary's full name"
              value={formData.beneficiaryName}
              onChange={(e) => handleInputChange("beneficiaryName", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">Relationship *</label>
              <select
                className="ben-select"
                value={formData.relationship}
                onChange={(e) => handleInputChange("relationship", e.target.value)}
              >
                <option value="">Select relationship</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Transfer Purpose *</label>
              <select
                className="ben-select"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
              >
                <option value="">Select purpose</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaUniversity /></div>
            <h3>Bank Account Details</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Bank Name *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">Account Type *</label>
              <select
                className="ben-select"
                value={formData.accountType}
                onChange={(e) => handleInputChange("accountType", e.target.value)}
              >
                <option value="">Select account type</option>
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Country *</label>
              <select
                className="ben-select"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Account Number *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Confirm Account Number *</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Re-enter account number"
              value={formData.confirmAccountNumber}
              onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Bank Code (SWIFT/IFSC/Sort Code)</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Enter bank code if required"
              value={formData.bankCode}
              onChange={(e) => handleInputChange("bankCode", e.target.value)}
              maxLength={15}
            />
            <div className="ben-hint">Required for international transfers</div>
          </div>

          {/* Address Information */}
          <div className="ben-section-divider">
            <div className="section-icon"><FaIdCard /></div>
            <h3>Address Information</h3>
          </div>

          <div className="ben-form-group">
            <label className="ben-label">Address</label>
            <input
              type="text"
              className="ben-input"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="ben-form-row">
            <div className="ben-form-group">
              <label className="ben-label">City</label>
              <input
                type="text"
                className="ben-input"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="ben-form-group">
              <label className="ben-label">Postal Code</label>
              <input
                type="text"
                className="ben-input"
                placeholder="Postal/ZIP code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                maxLength={10}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="ben-warning">
            <div className="warning-icon">⚠️</div>
            <div>
              <strong>Important:</strong> Ensure all bank details are accurate. 
              Incorrect information may cause transfer delays or failures.
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
                <FaUniversity />
                Add Bank Beneficiary
              </>
            )}
          </button>
        </form>
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}