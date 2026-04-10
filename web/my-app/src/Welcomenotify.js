import React, { useState } from "react";
import { createPortal } from "react-dom";

const TOTAL = 6;

function Page1() {
  return (
    <>
      <div style={styles.illus}>
        <div style={styles.iconCircle}>&#127979;</div>
        <div style={{ ...styles.iconCircle, width: 68, height: 68, fontSize: 28, background: "rgb(223,205,192)" }}>&#127891;</div>
        <div style={styles.iconCircle}>&#128218;</div>
      </div>
      <p style={styles.subtitle}>Welcome</p>
      <h2 style={styles.title}>Graduation Projects Gallery</h2>
      <p style={styles.text}>A platform built for students, by students. We believe that your graduation project deserves more than a drawer — it deserves an audience.</p>
      <div style={styles.highlight}>
        Browse and discover inspiring graduation projects from students across all disciplines, or share your own work with the world.
      </div>
      <p style={styles.text}>Whether you're a student showcasing your final project, a professional scouting fresh talent, or simply curious — you're in the right place.</p>
    </>
  );
}

function Page2() {
  return (
    <>
      <div style={styles.illus}>
        <div style={{ ...styles.iconCircle, width: 64, height: 64, fontSize: 26, background: "rgb(223,205,192)" }}>&#128228;</div>
      </div>
      <p style={styles.subtitle}>Uploading your work</p>
      <h2 style={styles.title}>Share your project</h2>
      <Row icon="&#128205;">
        Find the <strong style={styles.strong}>Upload Project</strong> button in the top navigation bar — it's always visible once you're logged in.
      </Row>
      <Row icon="&#128269;">
        Every submission goes through an <strong style={styles.strong}>admin review</strong> before it becomes public. This keeps the gallery high quality.
      </Row>
      <Row icon="&#9888;">
        <strong style={styles.strong}>Projects cannot be edited</strong> once submitted for review — so take your time, fill everything in carefully, and make it count.
      </Row>
    </>
  );
}

function Page3() {
  return (
    <>
      <div style={styles.illus}>
        <div style={styles.iconCircle}>&#11088;</div>
        <div style={{ ...styles.iconCircle, width: 64, height: 64, fontSize: 26, background: "rgb(223,205,192)" }}>&#128172;</div>
        <div style={styles.iconCircle}>&#128279;</div>
      </div>
      <p style={styles.subtitle}>Engage with the community</p>
      <h2 style={styles.title}>React, rate & connect</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["⭐ Rate projects", "💬 Leave comments", "🔗 Share links", "🔖 Bookmark favourites"].map(c => (
          <span key={c} style={styles.chip}>{c}</span>
        ))}
      </div>
      <p style={styles.text}>Every approved project on the gallery can be rated, commented on, and shared. Feel free to engage with your peers' work — constructive feedback goes a long way.</p>
      <div style={styles.highlight}>
        Keep it positive and respectful. Interactions that violate our community guidelines may result in a warning or restriction on your account.
      </div>
    </>
  );
}

function Page4() {
  return (
    <>
      <div style={styles.illus}>
        <div style={styles.iconCircle}>&#128269;</div>
        <div style={{ ...styles.iconCircle, width: 64, height: 64, fontSize: 26, background: "rgb(223,205,192)" }}>&#127775;</div>
        <div style={styles.iconCircle}>&#127903;</div>
      </div>
      <p style={styles.subtitle}>Finding what you love</p>
      <h2 style={styles.title}>Discover projects</h2>
      <Row icon="&#128269;">
        <strong style={styles.strong}>Search bar</strong> — type any keyword, title, or topic to find relevant projects instantly.
      </Row>
      <Row icon="&#127903;">
        <strong style={styles.strong}>Filters & tags</strong> — browse by category, tech stack, or tag to narrow things down.
      </Row>
      <Row icon="&#127775;">
        <strong style={styles.strong}>Personalised recommendations</strong> — head to your <strong style={styles.strong}>Settings</strong> and fill in your preferences to get tailored picks on your home page.
      </Row>
    </>
  );
}

function Page5() {
  return (
    <>
      <div style={styles.illus}>
        <div style={styles.iconCircle}>&#128101;</div>
        <div style={{ ...styles.iconCircle, width: 64, height: 64, fontSize: 26, background: "rgb(223,205,192)" }}>&#128188;</div>
        <div style={styles.iconCircle}>&#127760;</div>
      </div>
      <p style={styles.subtitle}>Your presence matters</p>
      <h2 style={styles.title}>Get noticed by professionals</h2>
      <p style={styles.text}>This gallery isn't just for classmates — professionals, recruiters, and industry mentors browse it too. Your project could be your next opportunity.</p>
      <div style={styles.highlight}>
        Visit your <strong style={styles.strong}>Profile</strong> to add your LinkedIn, GitHub, and portfolio links. When someone finds your project inspiring, they can reach you directly through your profile card.
      </div>
      <p style={styles.text}>Don't leave your profile empty — a complete profile makes you memorable and reachable.</p>
    </>
  );
}

function Page6() {
  return (
    <>
      <p style={styles.subtitle}>Community standards</p>
      <h2 style={styles.title}>Keeping it a safe space</h2>
      <Row icon="⚠️" iconStyle={{ background: "rgb(255,243,205)", borderColor: "rgb(255,224,102)", color: "rgb(133,100,4)" }}>
        <strong style={styles.strong}>First violation</strong> — you'll receive a warning notification. Take it seriously.
      </Row>
      <Row icon="🚨" iconStyle={{ background: "rgb(248,215,218)", borderColor: "rgb(245,198,203)", color: "rgb(114,28,36)" }}>
        <strong style={styles.strong}>Second violation</strong> — a final warning. Your account is at risk of suspension.
      </Row>
      <Row icon="🔒" iconStyle={{ background: "rgb(248,215,218)", borderColor: "rgb(245,198,203)", color: "rgb(114,28,36)" }}>
        <strong style={styles.strong}>Third violation</strong> — your account is suspended for a period of time. Contact an admin if you believe it's a mistake.
      </Row>
      <p style={{ ...styles.text, fontSize: 13 }}>
        To stay in good standing: be respectful in comments, avoid spam, don't misrepresent your work, and follow our community guidelines.
      </p>
      <div style={{ borderTop: "1px solid rgb(235,225,215)", paddingTop: 14, marginTop: 4 }}>
        <p style={{ fontSize: 11, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 2px" }}>Sincerely yours,</p>
        <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 34, color: "rgb(104,68,42)", margin: 0, lineHeight: 1.3, letterSpacing: 2 }}>
          The Development Team
      </p>
      </div>
    </>
  );
}

function Row({ icon, children, iconStyle = {} }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ ...styles.rowIcon, ...iconStyle }}>{icon}</div>
      <p style={{ fontSize: 13.5, color: "rgb(104,68,42)", lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

const pages = [Page1, Page2, Page3, Page4, Page5, Page6];

export default function WelcomeModal({ onClose }) {
  const [current, setCurrent] = useState(0);
  const PageComponent = pages[current];

  const goNext = () => {
    if (current < TOTAL - 1) setCurrent(c => c + 1);
    else onClose();
  };
  const goBack = () => setCurrent(c => Math.max(c - 1, 0));

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button style={styles.closeBtn} onClick={onClose}>&#x2715;</button>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "20px 24px 0" }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ ...styles.dot, background: i <= current ? "rgb(164,132,109)" : "rgb(223,205,192)" }} />
          ))}
        </div>

        {/* Page content */}
        <div style={styles.body}>
          <PageComponent />
        </div>

        {/* Footer nav */}
        <div style={styles.footer}>
          <button
            style={{ ...styles.btn, ...styles.btnOutline, opacity: current === 0 ? 0 : 1, pointerEvents: current === 0 ? "none" : "auto" }}
            onClick={goBack}
          >
            &#8592; Back
          </button>
          <span style={{ fontSize: 12, color: "rgb(164,132,109)" }}>{current + 1} / {TOTAL}</span>
          <button style={{ ...styles.btn, ...styles.btnFill }} onClick={goNext}>
            {current === TOTAL - 1 ? "Get started" : "Next \u2192"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(47,28,15,0.55)",
    zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  modal: {
    background: "rgb(254,251,245)",
    borderRadius: 24,
    border: "1.5px solid rgb(185,174,167)",
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  closeBtn: {
    position: "absolute", top: 14, right: 14,
    background: "rgba(254,251,245,0.85)",
    border: "1.5px solid rgb(185,174,167)",
    borderRadius: "50%",
    width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 15,
    color: "rgb(104,68,42)", zIndex: 10,
  },
  dot: { width: 28, height: 4, borderRadius: 2, transition: "background 0.3s" },
  body: { flex: 1, padding: "24px 36px 12px", display: "flex", flexDirection: "column", gap: 14 },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 36px 24px",
    borderTop: "1px solid rgb(235,225,215)",
  },
  btn: {
    borderRadius: 20, padding: "9px 22px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "Arial, Helvetica, sans-serif",
    transition: "all 0.2s", border: "1.5px solid rgb(185,174,167)",
  },
  btnOutline: { background: "none", color: "rgb(104,68,42)" },
  btnFill: { background: "rgb(164,132,109)", color: "rgb(254,251,245)", borderColor: "rgb(164,132,109)" },
  illus: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "4px 0 8px" },
  iconCircle: {
    width: 54, height: 54, borderRadius: "50%",
    background: "rgb(243,236,229)", border: "1.5px solid rgb(185,174,167)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
  },
  subtitle: { fontSize: 13, color: "rgb(164,132,109)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 },
  title: { fontFamily: "'Times New Roman', Times, serif", fontSize: 22, fontWeight: 700, color: "rgb(47,28,15)", margin: 0, lineHeight: 1.3 },
  text: { fontSize: 14, color: "rgb(104,68,42)", lineHeight: 1.75, margin: 0 },
  highlight: {
    background: "rgb(243,236,229)", borderLeft: "3px solid rgb(164,132,109)",
    borderRadius: "0 8px 8px 0", padding: "10px 14px",
    fontSize: 13, color: "rgb(104,68,42)", lineHeight: 1.6,
  },
  chip: {
    background: "rgb(243,236,229)", border: "1px solid rgb(185,174,167)",
    borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "rgb(104,68,42)", fontWeight: 600,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgb(243,236,229)", border: "1px solid rgb(185,174,167)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, flexShrink: 0, marginTop: 2,
  },
  strong: { color: "rgb(47,28,15)", fontWeight: 600 },
};