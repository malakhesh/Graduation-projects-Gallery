import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import "./profile.css";

function RegistrationClosed() {
  return (
    <div className="pf-page" style={{ display: "flex", flexDirection: "column" }}>

      <style>{`
        .rc-card {
          width: 100%;
          max-width: 480px;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
          padding: 56px 48px;
          box-sizing: border-box;
        }
        .rc-icon-bubble {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .rc-title {
          font-family: 'Times New Roman', Times, serif;
          font-size: clamp(20px, 5vw, 26px);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .rc-body {
          font-size: clamp(13px, 3.5vw, 14px);
          color: var(--text-secondary);
          line-height: 1.75;
          margin: 0 0 6px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .rc-sub {
          font-size: clamp(12px, 3vw, 13px);
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 32px;
          font-family: Arial, Helvetica, sans-serif;
          font-style: italic;
        }
        @media (max-width: 540px) {
          .rc-card {
            padding: 40px 24px;
          }
          .rc-icon-bubble {
            width: 60px;
            height: 60px;
            font-size: 22px;
            margin-bottom: 18px;
          }
        }
        @media (max-width: 360px) {
          .rc-card {
            padding: 32px 16px;
          }
        }
      `}</style>

      <nav className="pf-navbar">
        <Link to="/" className="pf-navbar-logo">
          <FaGraduationCap className="pf-logo-icon" />
          <span className="pf-logo-text">
            <strong>Graduation</strong> Gallery
          </span>
        </Link>
      </nav>

      <main className="pf-main-content">
        <div className="pf-card rc-card">

          <div className="rc-icon-bubble">🔒</div>

          <h1 className="rc-title">Registration Closed</h1>

          <div className="pf-divider" style={{ margin: "0 auto 20px" }} />

          <p className="rc-body">
            New registrations are not being accepted at this time.
          </p>
          <p className="rc-sub">
            Please check back later or contact the administrator.
          </p>

          <Link to="/login" className="pf-social-btn" style={{ fontSize: "13px", fontWeight: "600", padding: "10px 28px" }}>
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default RegistrationClosed;