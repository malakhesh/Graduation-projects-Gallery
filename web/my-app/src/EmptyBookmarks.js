import React, { useEffect, useState } from "react";

const floatingBookmarks = [
  { style: { top: "12%", left: "8%", animationDelay: "0s", fontSize: "22px", opacity: 0.18, transform: "rotate(-15deg)" } },
  { style: { top: "20%", right: "10%", animationDelay: "0.8s", fontSize: "16px", opacity: 0.13, transform: "rotate(10deg)" } },
  { style: { bottom: "25%", left: "14%", animationDelay: "1.4s", fontSize: "28px", opacity: 0.12, transform: "rotate(8deg)" } },
  { style: { bottom: "18%", right: "8%", animationDelay: "0.4s", fontSize: "18px", opacity: 0.15, transform: "rotate(-20deg)" } },
  { style: { top: "45%", left: "4%", animationDelay: "1.8s", fontSize: "14px", opacity: 0.1, transform: "rotate(5deg)" } },
  { style: { top: "55%", right: "5%", animationDelay: "1.1s", fontSize: "20px", opacity: 0.11, transform: "rotate(-8deg)" } },
];

export default function EmptyBookmarks() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ribbonPop {
          0% { transform: scaleY(0); transform-origin: top; }
          60% { transform: scaleY(1.1); }
          100% { transform: scaleY(1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .eb-float {
          position: absolute;
          color: var(--text-secondary);
          animation: floatUp 4s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
        .eb-card-enter {
          animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .eb-ribbon {
          animation: ribbonPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
        }
        .eb-icon-wiggle:hover {
          animation: wiggle 0.4s ease-in-out infinite;
        }
        .eb-btn {
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
        .eb-btn:hover {
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
        {floatingBookmarks.map((b, i) => (
          <span key={i} className="eb-float" style={{ ...b.style, animationDelay: b.style.animationDelay }}>
            🔖
          </span>
        ))}

        <div
          className={visible ? "eb-card-enter" : ""}
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
          <div className="eb-icon-wiggle" style={{
            fontSize: "56px",
            marginBottom: "16px",
            display: "inline-block",
            cursor: "default",
          }}>
            🔖
          </div>

          <div className="eb-ribbon" style={{
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
            No bookmarks yet
          </h3>

          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "var(--text-secondary)",
            fontSize: "13px",
            lineHeight: "1.6",
            margin: "0 0 24px",
          }}>
            When you find projects you love,<br />
            save them here for later.
          </p>

          <button className="eb-btn" onClick={() => window.location.href = '/home'}>
            Explore Projects
          </button>
        </div>
      </div>
    </>
  );
}