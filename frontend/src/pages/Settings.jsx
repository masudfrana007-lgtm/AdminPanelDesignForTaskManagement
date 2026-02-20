// src/pages/Settings.jsx
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export default function Settings() {
  const nav = useNavigate();

  const goToForgotPassword = () => {
    nav("/forgot-password");
  };

  return (
    <AppLayout>
      <div style={{ padding: "20px" }}>
        <h1>Settings</h1>
        <p>Manage your account settings here.</p>

        <button 
          onClick={goToForgotPassword} 
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Change / Forgot Password
        </button>
      </div>
    </AppLayout>
  );
}
