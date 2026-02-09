<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaWallet, FaUniversity, FaBitcoin, FaTrash, FaEdit } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

// Mock data for demonstration
const mockBeneficiaries = [
  {
    id: 1,
    type: "crypto",
    name: "My Binance Wallet",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    currency: "BTC",
    created: "2024-01-15"
  },
  {
    id: 2,
    type: "bank",
    name: "John Doe",
    accountNumber: "****8765",
    bankName: "ABC Bank",
    created: "2024-01-10"
  },
  {
    id: 3,
    type: "crypto",
    name: "USDT Wallet",
    address: "0x742d35Cc6634C0532925a3b8D9c8AC8AB0e85C",
    currency: "USDT",
    created: "2024-01-08"
  }
];

function BeneficiaryCard({ beneficiary, onEdit, onDelete }) {
  const isCrypto = beneficiary.type === "crypto";
  
  return (
    <div className="beneficiary-card">
      <div className="beneficiary-icon">
        {isCrypto ? <FaBitcoin /> : <FaUniversity />}
      </div>
      <div className="beneficiary-info">
        <div className="beneficiary-name">{beneficiary.name}</div>
        <div className="beneficiary-detail">
          {isCrypto 
            ? `${beneficiary.currency}: ${beneficiary.address.slice(0, 12)}...${beneficiary.address.slice(-6)}`
            : `${beneficiary.bankName}: ${beneficiary.accountNumber}`
          }
        </div>
        <div className="beneficiary-date">Added: {beneficiary.created}</div>
      </div>
      <div className="beneficiary-actions">
        <button className="btn-edit" onClick={() => onEdit(beneficiary)}>
          <FaEdit />
        </button>
        <button className="btn-delete" onClick={() => onDelete(beneficiary)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <div className="action-title">{title}</div>
        <div className="action-subtitle">{subtitle}</div>
      </div>
      <div className="action-arrow">›</div>
    </button>
  );
}

export default function BeneficiaryManagement() {
  const nav = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    setLoading(true);
    setErr("");
    try {
      // For now, using mock data
      // In the future, replace with: const { data } = await memberApi.get("/member/beneficiaries");
      setTimeout(() => {
        setBeneficiaries(mockBeneficiaries);
        setLoading(false);
      }, 500);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load beneficiaries");
      setBeneficiaries([]);
      setLoading(false);
    }
  };

  const handleEdit = (beneficiary) => {
    // TODO: Implement edit functionality
    console.log("Edit beneficiary:", beneficiary);
  };

  const handleDelete = async (beneficiary) => {
    if (!window.confirm(`Are you sure you want to delete ${beneficiary.name}?`)) return;
    
    try {
      // TODO: API call to delete beneficiary
      // await memberApi.delete(`/member/beneficiaries/${beneficiary.id}`);
      setBeneficiaries(prev => prev.filter(b => b.id !== beneficiary.id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete beneficiary");
    }
  };

  const cryptoBeneficiaries = beneficiaries.filter(b => b.type === "crypto");
  const bankBeneficiaries = beneficiaries.filter(b => b.type === "bank");

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Beneficiary Management</div>
            <div className="ben-sub">Manage your withdrawal recipients</div>
          </div>
        </div>

        {err && (
          <div className="ben-alert error">{err}</div>
        )}

        {/* Add New Section */}
        <div className="ben-section">
          <div className="ben-section-title">Add New Beneficiary</div>
          <div className="ben-actions">
            <ActionCard
              icon={<FaBitcoin />}
              title="Crypto Account"
              subtitle="Add cryptocurrency wallet address"
              onClick={() => nav("/beneficiary/add/crypto")}
            />
            <ActionCard
              icon={<FaUniversity />}
              title="Bank Account"
              subtitle="Add traditional bank account"
              onClick={() => nav("/beneficiary/add/bank")}
            />
          </div>
        </div>

        {/* Existing Beneficiaries */}
        {!loading && beneficiaries.length > 0 && (
          <>
            {cryptoBeneficiaries.length > 0 && (
              <div className="ben-section">
                <div className="ben-section-title">
                  Crypto Beneficiaries ({cryptoBeneficiaries.length})
                </div>
                <div className="ben-list">
                  {cryptoBeneficiaries.map(beneficiary => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {bankBeneficiaries.length > 0 && (
              <div className="ben-section">
                <div className="ben-section-title">
                  Bank Beneficiaries ({bankBeneficiaries.length})
                </div>
                <div className="ben-list">
                  {bankBeneficiaries.map(beneficiary => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && beneficiaries.length === 0 && (
          <div className="ben-empty">
            <div className="ben-empty-icon">
              <FaWallet />
            </div>
            <div className="ben-empty-title">No Beneficiaries Added</div>
            <div className="ben-empty-text">
              Add your first beneficiary to start making withdrawals
            </div>
          </div>
        )}

        {loading && (
          <div className="ben-loading">
            <div className="ben-spinner"></div>
            <div>Loading beneficiaries...</div>
          </div>
        )}
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaWallet, FaUniversity, FaBitcoin, FaTrash, FaEdit } from "react-icons/fa";
import MemberBottomNav from "../components/MemberBottomNav";
import memberApi from "../services/memberApi";
import "../styles/beneficiaryManagement.css";

// Mock data for demonstration
const mockBeneficiaries = [
  {
    id: 1,
    type: "crypto",
    name: "My Binance Wallet",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    currency: "BTC",
    created: "2024-01-15"
  },
  {
    id: 2,
    type: "bank",
    name: "John Doe",
    accountNumber: "****8765",
    bankName: "ABC Bank",
    created: "2024-01-10"
  },
  {
    id: 3,
    type: "crypto",
    name: "USDT Wallet",
    address: "0x742d35Cc6634C0532925a3b8D9c8AC8AB0e85C",
    currency: "USDT",
    created: "2024-01-08"
  }
];

function BeneficiaryCard({ beneficiary, onEdit, onDelete }) {
  const isCrypto = beneficiary.type === "crypto";
  
  return (
    <div className="beneficiary-card">
      <div className="beneficiary-icon">
        {isCrypto ? <FaBitcoin /> : <FaUniversity />}
      </div>
      <div className="beneficiary-info">
        <div className="beneficiary-name">{beneficiary.name}</div>
        <div className="beneficiary-detail">
          {isCrypto 
            ? `${beneficiary.currency}: ${beneficiary.address.slice(0, 12)}...${beneficiary.address.slice(-6)}`
            : `${beneficiary.bankName}: ${beneficiary.accountNumber}`
          }
        </div>
        <div className="beneficiary-date">Added: {beneficiary.created}</div>
      </div>
      <div className="beneficiary-actions">
        <button className="btn-edit" onClick={() => onEdit(beneficiary)}>
          <FaEdit />
        </button>
        <button className="btn-delete" onClick={() => onDelete(beneficiary)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <div className="action-title">{title}</div>
        <div className="action-subtitle">{subtitle}</div>
      </div>
      <div className="action-arrow">›</div>
    </button>
  );
}

export default function BeneficiaryManagement() {
  const nav = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    setLoading(true);
    setErr("");
    try {
      // For now, using mock data
      // In the future, replace with: const { data } = await memberApi.get("/member/beneficiaries");
      setTimeout(() => {
        setBeneficiaries(mockBeneficiaries);
        setLoading(false);
      }, 500);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load beneficiaries");
      setBeneficiaries([]);
      setLoading(false);
    }
  };

  const handleEdit = (beneficiary) => {
    // TODO: Implement edit functionality
    console.log("Edit beneficiary:", beneficiary);
  };

  const handleDelete = async (beneficiary) => {
    if (!window.confirm(`Are you sure you want to delete ${beneficiary.name}?`)) return;
    
    try {
      // TODO: API call to delete beneficiary
      // await memberApi.delete(`/member/beneficiaries/${beneficiary.id}`);
      setBeneficiaries(prev => prev.filter(b => b.id !== beneficiary.id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete beneficiary");
    }
  };

  const cryptoBeneficiaries = beneficiaries.filter(b => b.type === "crypto");
  const bankBeneficiaries = beneficiaries.filter(b => b.type === "bank");

  return (
    <div className="beneficiary-page">
      <div className="ben-wrap">
        {/* Header */}
        <div className="ben-header">
          <button className="ben-back" onClick={() => nav(-1)}>
            <FaArrowLeft />
          </button>
          <div className="ben-header-title">
            <div className="ben-title">Beneficiary Management</div>
            <div className="ben-sub">Manage your withdrawal recipients</div>
          </div>
        </div>

        {err && (
          <div className="ben-alert error">{err}</div>
        )}

        {/* Add New Section */}
        <div className="ben-section">
          <div className="ben-section-title">Add New Beneficiary</div>
          <div className="ben-actions">
            <ActionCard
              icon={<FaBitcoin />}
              title="Crypto Account"
              subtitle="Add cryptocurrency wallet address"
              onClick={() => nav("/beneficiary/add/crypto")}
            />
            <ActionCard
              icon={<FaUniversity />}
              title="Bank Account"
              subtitle="Add traditional bank account"
              onClick={() => nav("/beneficiary/add/bank")}
            />
          </div>
        </div>

        {/* Existing Beneficiaries */}
        {!loading && beneficiaries.length > 0 && (
          <>
            {cryptoBeneficiaries.length > 0 && (
              <div className="ben-section">
                <div className="ben-section-title">
                  Crypto Beneficiaries ({cryptoBeneficiaries.length})
                </div>
                <div className="ben-list">
                  {cryptoBeneficiaries.map(beneficiary => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {bankBeneficiaries.length > 0 && (
              <div className="ben-section">
                <div className="ben-section-title">
                  Bank Beneficiaries ({bankBeneficiaries.length})
                </div>
                <div className="ben-list">
                  {bankBeneficiaries.map(beneficiary => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && beneficiaries.length === 0 && (
          <div className="ben-empty">
            <div className="ben-empty-icon">
              <FaWallet />
            </div>
            <div className="ben-empty-title">No Beneficiaries Added</div>
            <div className="ben-empty-text">
              Add your first beneficiary to start making withdrawals
            </div>
          </div>
        )}

        {loading && (
          <div className="ben-loading">
            <div className="ben-spinner"></div>
            <div>Loading beneficiaries...</div>
          </div>
        )}
      </div>

      <MemberBottomNav active="mine" />
    </div>
  );
>>>>>>> 1ba30e45ec52d38adc53c791d3522916f3da5b0c
}