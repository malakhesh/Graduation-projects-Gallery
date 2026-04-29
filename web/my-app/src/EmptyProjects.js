import React, { useEffect, useState } from "react";

const floatingIcons = [
  { icon: "📁", style: { top: "10%", left: "7%", animationDelay: "0s", fontSize: "24px", opacity: 0.18, transform: "rotate(-12deg)" } },
  { icon: "💡", style: { top: "18%", right: "9%", animationDelay: "0.7s", fontSize: "16px", opacity: 0.13, transform: "rotate(10deg)" } },
  { icon: "📂", style: { bottom: "22%", left: "12%", animationDelay: "1.3s", fontSize: "28px", opacity: 0.12, transform: "rotate(8deg)" } },
  { icon: "🖥️", style: { bottom: "16%", right: "7%", animationDelay: "0.4s", fontSize: "18px", opacity: 0.14, transform: "rotate(-18deg)" } },
  { icon: "📁", style: { top: "48%", left: "3%", animationDelay: "1.7s", fontSize: "14px", opacity: 0.1, transform: "rotate(5deg)" } },
  { icon: "✏️", style: { top: "58%", right: "4%", animationDelay: "1.0s", fontSize: "20px", opacity: 0.11, transform: "rotate(-8deg)" } },
];

export default function EmptyProjects() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ep-floatUp {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes ep-fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ep-accentPop {
          0% { transform: scaleY(0); transform-origin: top; }
          60% { transform: scaleY(1.1); }
          100% { transform: scaleY(1); }
        }
        @keyframes ep-wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .ep-float {
          position: absolute;
          animation: ep-floatUp 4s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
        .ep-card-enter {
          animation: ep-fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ep-accent {
          animation: ep-accentPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
        }
        .ep-icon-wiggle:hover {
          animation: ep-wiggle 0.4s ease-in-out infinite;
        }
        .ep-btn {
          background-color: var(--accent-dark);
          color: var(--text-inverse);
          border: none;
          padding: 11px 28px;
          border-radius: 20px;
          font-size: 13px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 6px;
        }
        .ep-btn:hover {
          background-color: var(--accent-darker);
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{
        position: "relative",
        width: "100%",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {floatingIcons.map((b, i) => (
          <span key={i} className="ep-float" style={{ ...b.style, animationDelay: b.style.animationDelay }}>
            {b.icon}
          </span>
        ))}

        <div
          className={visible ? "ep-card-enter" : ""}
          style={{
            opacity: visible ? 1 : 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "48px 52px",
            textAlign: "center",
            maxWidth: "360px",
            boxShadow: "0 4px 24px var(--shadow-md)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="ep-icon-wiggle" style={{
            fontSize: "56px",
            marginBottom: "16px",
            display: "inline-block",
            cursor: "default",
          }}>
            📂
          </div>

          <div className="ep-accent" style={{
            width: "36px",
            height: "4px",
            background: "var(--accent-dark)",
            borderRadius: "2px",
            margin: "0 auto 18px",
          }} />

          <h3 style={{
            fontFamily: "'Times New Roman', Times, serif",
            color: "var(--text-primary)",
            fontSize: "20px",
            fontWeight: "700",
            margin: "0 0 10px",
          }}>
            No projects yet
          </h3>

          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "var(--text-secondary)",
            fontSize: "13px",
            lineHeight: "1.6",
            margin: "0 0 24px",
          }}>
            You haven't uploaded any projects yet.<br />
            Share your work with the world!
          </p>

          <button className="ep-btn" onClick={() => window.location.href = '/home'}>
            Upload a Project
          </button>
        </div>
      </div>
    </>
  );
}