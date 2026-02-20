import { Routes, Route, Navigate } from "react-router-dom";
import EorderLanding from "./pages/EorderLanding.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import ContactUs from "./pages/ContactUs.jsx";

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<EorderLanding />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<ContactUs />} />
      {/* placeholders for your existing pages */}
      <Route path="/login" element={<div style={{padding:24}}>Login page route placeholder</div>} />
      <Route path="/signup" element={<div style={{padding:24}}>Signup page route placeholder</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
