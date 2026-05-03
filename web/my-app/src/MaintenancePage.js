import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaTools } from "react-icons/fa";
import "./profile.css";

function MaintenancePage() {
  return (
    <div className="pf-page" style={{ display: "flex", flexDirection: "column" }}>

      <style>{`
        @keyframes maint-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .mp-card {
          width: 100%;
          max-width: 480px;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
          padding: 56px 48px;
          box-sizing: border-box;
        }
        .mp-icon-bubble {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .mp-icon-bubble svg {
          font-size: 28px;
          color: var(--text-secondary);
          animation: maint-spin 6s linear infinite;
        }
        .mp-title {
          font-family: 'Times New Roman', Times, serif;
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .mp-body {
          font-size: clamp(13px, 3.5vw, 15px);
          color: var(--text-secondary);
          line-height: 1.75;
          margin: 0 0 6px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .mp-sub {
          font-size: clamp(12px, 3vw, 13px);
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 32px;
          font-family: Arial, Helvetica, sans-serif;
          font-style: italic;
        }
        @media (max-width: 540px) {
          .mp-card {
            padding: 40px 24px;
          }
          .mp-icon-bubble {
            width: 60px;
            height: 60px;
            margin-bottom: 18px;
          }
          .mp-icon-bubble svg {
            font-size: 22px;
          }
        }
        @media (max-width: 360px) {
          .mp-card {
            padding: 32px 16px;
          }
        }
      `}</style>

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
        <div className="pf-card mp-card">

          {/* Icon bubble */}
          <div className="mp-icon-bubble">
            <FaTools />
          </div>

          {/* Title */}
          <h1 className="mp-title">Under Maintenance</h1>

          {/* Divider */}
          <div className="pf-divider" style={{ margin: "0 auto 20px" }} />

          {/* Body */}
          <p className="mp-body">
            Graduation Gallery is currently undergoing maintenance.
          </p>
          <p className="mp-sub">
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