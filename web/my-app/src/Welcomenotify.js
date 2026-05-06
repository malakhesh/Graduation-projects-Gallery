import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────
   GOOGLE FONT INJECTION
   Added: Dancing Script for the calligraphic signature
───────────────────────────────────────── */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=EB+Garamond:wght@400;500&family=Great+Vibes&display=swap";

function ensureFont() {
  if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);

  if (!document.querySelector("#welcome-modal-sig-style")) {
    const style = document.createElement("style");
    style.id = "welcome-modal-sig-style";
    style.textContent = `
      .wm-signature {
        font-family: 'Great Vibes', cursive !important;
        font-size: 44px !important;
        font-weight: 400 !important;
        line-height: 1.2 !important;
        letter-spacing: 1px !important;
        font-style: normal !important;
        text-transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/* ─────────────────────────────────────────
   PAGE DEFINITIONS
───────────────────────────────────────── */
const PAGES = [
  {
    key: "welcome",
    palette: ["#a78bfa", "#818cf8", "#c4b5fd", "#7c3aed"],
    spotColor: "139,92,246",
    subtitle: "Welcome",
    title: "Graduation Projects Gallery",
    content: (S) => (
      <>
        <div style={S.illus}>
          <div style={S.iconMd}>🏛️</div>
          <div style={{ ...S.iconMd, ...S.iconLg }}>🎓</div>
          <div style={S.iconMd}>📚</div>
        </div>
        <p style={S.text}>
          A platform built for students, by students. We believe your graduation
          project deserves more than a drawer — it deserves an audience.
        </p>
        <div style={S.highlight}>
          Browse inspiring graduation projects from students across all
          disciplines, or share your own work with the world.
        </div>
        <p style={S.text}>
          Whether you're a student showcasing your final project, a professional
          scouting fresh talent, or simply curious — you're in the right place.
        </p>
      </>
    ),
  },
  {
    key: "upload",
    palette: ["#34d399", "#6ee7b7", "#a7f3d0", "#059669"],
    spotColor: "52,211,153",
    subtitle: "Uploading your work",
    title: "Share your project",
    content: (S) => (
      <>
        <div style={S.illus}>
          <div style={{ ...S.iconMd, ...S.iconLg }}>📤</div>
        </div>
        <Row S={S} icon="📍">
          Find the <strong style={S.strong}>Upload Project</strong> button in
          the top navigation bar — it's always visible once you're logged in.
        </Row>
        <Row S={S} icon="🔍">
          Every submission goes through an{" "}
          <strong style={S.strong}>admin review</strong> before it becomes
          public. This keeps the gallery high quality.
        </Row>
        <Row S={S} icon="⚠️">
          <strong style={S.strong}>Projects cannot be edited</strong> once
          submitted for review — take your time, fill everything in carefully,
          and make it count.
        </Row>
      </>
    ),
  },
  {
    key: "engage",
    palette: ["#f472b6", "#fb7185", "#fda4af", "#db2777"],
    spotColor: "244,114,182",
    subtitle: "Engage with the community",
    title: "React, rate & connect",
    content: (S) => (
      <>
        <div style={S.illus}>
          <div style={S.iconMd}>⭐</div>
          <div style={{ ...S.iconMd, ...S.iconLg }}>💬</div>
          <div style={S.iconMd}>🔗</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["⭐ Rate projects", "💬 Leave comments", "🔗 Share links", "🔖 Bookmark"].map(
            (c) => (
              <span key={c} style={S.chip}>
                {c}
              </span>
            )
          )}
        </div>
        <p style={S.text}>
          Every approved project can be rated, commented on, and shared.
          Constructive feedback goes a long way.
        </p>
        <div style={S.highlight}>
          Keep it respectful. Interactions that violate our community guidelines
          may result in a warning or restriction on your account.
        </div>
      </>
    ),
  },
  {
    key: "discover",
    palette: ["#38bdf8", "#7dd3fc", "#bae6fd", "#0284c7"],
    spotColor: "56,189,248",
    subtitle: "Finding what you love",
    title: "Discover projects",
    content: (S) => (
      <>
        <div style={S.illus}>
          <div style={S.iconMd}>🔍</div>
          <div style={{ ...S.iconMd, ...S.iconLg }}>🎞️</div>
          <div style={S.iconMd}>✨</div>
        </div>
        <Row S={S} icon="🔍">
          <strong style={S.strong}>Search bar</strong> — type any keyword,
          title, or topic to find relevant projects instantly.
        </Row>
        <Row S={S} icon="🎞️">
          <strong style={S.strong}>Filters & tags</strong> — browse by
          category, tech stack, or tag to narrow things down.
        </Row>
        <Row S={S} icon="✨">
          <strong style={S.strong}>Personalised picks</strong> — our AI studies
          what you browse and recommends projects tailored to your taste, right on
          your home page.
        </Row>
      </>
    ),
  },
  {
    key: "noticed",
    palette: ["#fbbf24", "#fcd34d", "#fde68a", "#d97706"],
    spotColor: "251,191,36",
    subtitle: "Your presence matters",
    title: "Get noticed by professionals",
    content: (S) => (
      <>
        <div style={S.illus}>
          <div style={S.iconMd}>👥</div>
          <div style={{ ...S.iconMd, ...S.iconLg }}>💼</div>
          <div style={S.iconMd}>🌐</div>
        </div>
        <p style={S.text}>
          This gallery isn't just for classmates — recruiters, professionals,
          and industry mentors browse it too. Your project could be your next
          opportunity.
        </p>
        <div style={S.highlight}>
          Visit your <strong style={S.strong}>Profile</strong> to add your
          LinkedIn, GitHub, and portfolio links. When someone finds your project
          inspiring, they can reach you directly through your profile card.
        </div>
        <p style={S.text}>
          Don't leave your profile empty — a complete profile makes you
          memorable and reachable.
        </p>
      </>
    ),
  },
  {
    key: "standards",
    palette: ["#f87171", "#fca5a5", "#fee2e2", "#dc2626"],
    spotColor: "248,113,113",
    subtitle: "Community standards",
    title: "Keeping it a safe space",
    content: (S) => (
      <>
        <Row
          S={S}
          icon="⚠️"
          iconStyle={{ background: "rgb(254 249 195)", borderColor: "rgb(253 224 71)" }}
        >
          <strong style={S.strong}>First violation</strong> — you'll receive a
          warning notification. Take it seriously.
        </Row>
        <Row
          S={S}
          icon="🚨"
          iconStyle={{ background: "rgb(254 226 226)", borderColor: "rgb(252 165 165)" }}
        >
          <strong style={S.strong}>Second violation</strong> — a final warning.
          Your account is at risk of suspension.
        </Row>
        <Row
          S={S}
          icon="🔒"
          iconStyle={{ background: "rgb(254 226 226)", borderColor: "rgb(248 113 113)" }}
        >
          <strong style={S.strong}>Third violation</strong> — your account is
          suspended. Contact an admin if you believe it's a mistake.
        </Row>
        <p style={{ ...S.text, fontSize: 13 }}>
          Stay in good standing: be respectful, avoid spam, don't misrepresent
          your work, and follow our community guidelines.
        </p>

        {/* ── Calligraphic signature ── */}
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            paddingTop: 18,
            marginTop: 6,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1.6px",
              margin: "0 0 6px",
              fontFamily: "'EB Garamond', serif",
            }}
          >
            Sincerely yours,
          </p>

          <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 34, color: "rgb(104,68,42)", margin: 0, lineHeight: 1.3, letterSpacing: 2 }}>
            The Development Team
          </p>
        </div>
      </>
    ),
  },
];

const TOTAL = PAGES.length;

/* ─────────────────────────────────────────
   ROW HELPER
───────────────────────────────────────── */
function Row({ S, icon, children, iconStyle = {} }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ ...S.rowIcon, ...iconStyle }}>{icon}</div>
      <p style={S.rowText}>{children}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
function ParticleCanvas({ palette }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef([]);

  const spawn = useCallback((w, h, pal) => {
    particlesRef.current = Array.from({ length: 32 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: pal[Math.floor(Math.random() * pal.length)],
      alpha: Math.random() * 0.45 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spawn(canvas.width, canvas.height, palette);
    };
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.025;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse));
        const hex = Math.floor(a * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + hex;
        ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(frameRef.current);
  }, [palette, spawn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    spawn(canvas.offsetWidth, canvas.offsetHeight, palette);
  }, [palette, spawn]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────── */
export default function WelcomeModal({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const page = PAGES[current];

  useEffect(() => {
    ensureFont();
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const navigate = useCallback((dir) => {
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0) return prev; // clamp at start
      if (next >= TOTAL) {
        // close on forward past last page
        setVisible(false);
        setTimeout(onClose, 300);
        return prev;
      }
      setContentKey((k) => k + 1);
      return next;
    });
  }, [onClose]);

  // ── Keyboard navigation ──────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  /* ── shared style tokens ── */
  const S = {
    text: {
      fontSize: 15.5,
      color: "var(--text-secondary)",
      lineHeight: 1.8,
      margin: 0,
      fontFamily: "'EB Garamond', serif",
    },
    highlight: {
      borderLeft: `2.5px solid rgba(${page.spotColor},0.7)`,
      padding: "10px 14px",
      background: `rgba(${page.spotColor},0.07)`,
      borderRadius: "0 8px 8px 0",
      fontSize: 15,
      color: "var(--text-secondary)",
      lineHeight: 1.65,
      fontFamily: "'EB Garamond', serif",
    },
    chip: {
      background: "var(--bg-active)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: "5px 14px",
      fontSize: 13.5,
      color: "var(--text-secondary)",
      fontWeight: 500,
    },
    illus: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      margin: "2px 0 6px",
    },
    iconMd: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "var(--bg-active)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
    },
    iconLg: {
      width: 66,
      height: 66,
      fontSize: 26,
      background: `rgba(${page.spotColor},0.12)`,
      border: `1px solid rgba(${page.spotColor},0.3)`,
    },
    rowIcon: {
      width: 33,
      height: 33,
      borderRadius: "50%",
      background: "var(--bg-active)",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      flexShrink: 0,
      marginTop: 2,
    },
    rowText: {
      fontSize: 15.5,
      color: "var(--text-secondary)",
      lineHeight: 1.7,
      margin: 0,
      fontFamily: "'EB Garamond', serif",
    },
    strong: {
      color: "var(--text-primary)",
      fontWeight: 600,
    },
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--overlay)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        transition: "opacity 0.3s ease",
        opacity: visible ? 1 : 0,
        overflow: "hidden",
      }}
      onClick={handleClose}
    >
      <ParticleCanvas palette={page.palette} />

      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 22,
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 560,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          transform: visible ? "translateY(0)" : "translateY(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 22,
            pointerEvents: "none",
            background: `radial-gradient(ellipse 80% 40% at 50% 0%, rgba(${page.spotColor},0.18) 0%, transparent 70%)`,
            transition: "background 0.6s ease",
            zIndex: 0,
          }}
        />

        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--text-muted)",
            zIndex: 10,
            lineHeight: 1,
          }}
          onClick={handleClose}
        >
          ✕
        </button>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            padding: "22px 32px 0",
            position: "relative",
            zIndex: 1,
          }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                borderRadius: 2,
                flex: 1,
                maxWidth: i === current ? 48 : 32,
                background:
                  i < current
                    ? "var(--border-strong)"
                    : i === current
                    ? `rgba(${page.spotColor},0.85)`
                    : "var(--border-subtle, rgba(0,0,0,0.1))",
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>

        {/* Page body */}
        <div
          key={contentKey}
          style={{
            flex: 1,
            padding: "26px 38px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            zIndex: 1,
            animation: "modalFadeUp 0.35s ease forwards",
          }}
        >
          {/* Subtitle */}
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.8px",
              margin: 0,
              fontFamily: "'EB Garamond', serif",
            }}
          >
            {page.subtitle}
          </p>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 25,
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {page.title}
          </h2>

          {page.content(S)}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 38px 26px",
            borderTop: "1px solid var(--border-subtle)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <button
            style={{
              fontSize: 14,
              fontWeight: 500,
              padding: "9px 20px",
              borderRadius: 20,
              cursor: current === 0 ? "default" : "pointer",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              opacity: current === 0 ? 0 : 1,
              pointerEvents: current === 0 ? "none" : "auto",
              transition: "all 0.2s",
              fontFamily: "'EB Garamond', serif",
              letterSpacing: "0.2px",
            }}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              letterSpacing: "1.2px",
              fontFamily: "'EB Garamond', serif",
            }}
          >
            {current + 1} of {TOTAL}
          </span>

          <button
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "9px 22px",
              borderRadius: 20,
              cursor: "pointer",
              border: "none",
              background: `rgba(${page.spotColor},1)`,
              color: "#fff",
              transition: "all 0.3s ease",
              fontFamily: "'EB Garamond', serif",
              letterSpacing: "0.3px",
              boxShadow: `0 4px 18px rgba(${page.spotColor},0.35)`,
            }}
            onClick={() => navigate(1)}
          >
            {current === TOTAL - 1 ? "Enter the gallery →" : "Next →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}