import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaTools } from "react-icons/fa";
import "./profile.css";

function MaintenancePage() {
  return (
    <div className="pf-page" style={{ display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav className="pf-navbar">
        <Link to="/" className="pf-navbar-logo">
          <FaGraduationCap className="pf-logo-icon" />
          <span className="pf-logo-text">
            <strong>Graduation</strong> Gallery
          </span>
        </Link>
      </nav>

      {/* Main */}
      <main className="pf-main-content">
        <div className="pf-card" style={{ maxWidth: "480px", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0", padding: "56px 48px" }}>

          <style>{`
            @keyframes maint-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>

          {/* Icon bubble */}
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "rgb(245, 239, 230)",
            border: "1px solid rgb(196, 173, 150)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "24px",
          }}>
            <FaTools style={{
              fontSize: "28px",
              color: "rgb(122, 78, 45)",
              animation: "maint-spin 6s linear infinite",
            }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "26px", fontWeight: "700",
            color: "rgb(44, 26, 14)",
            margin: "0 0 10px",
          }}>
            Under Maintenance
          </h1>

          {/* Divider */}
          <div className="pf-divider" style={{ margin: "0 auto 20px" }} />

          {/* Body */}
          <p style={{
            fontSize: "15px", color: "rgb(122, 78, 45)",
            lineHeight: "1.75", margin: "0 0 6px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}>
            Graduation Gallery is currently undergoing maintenance.
          </p>
          <p style={{
            fontSize: "13px", color: "rgb(160, 120, 80)",
            lineHeight: "1.6", margin: "0 0 32px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontStyle: "italic",
          }}>
            We'll be back shortly. Thank you for your patience.
          </p>

          {/* Button */}
          <Link to="/login" className="pf-social-btn" style={{ fontSize: "13px", fontWeight: "600", padding: "10px 28px" }}>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default MaintenancePage;