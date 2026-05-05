import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "./photo.jpg";
import { sendContactMessage } from "./Messages.js";

export default function App() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionRefs = useRef({});

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState(null);
  const [contactLimit, setContactLimit] = useState(null);
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#f0ebe0";
    document.body.style.fontFamily = "'Georgia', serif";
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.backgroundColor = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.dataset.section]: true }));
          }
        });
      },
      { threshold: 0.12 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setModal(null); };
    if (modal) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modal]);

  useEffect(() => {
    if (modal !== "contact") {
      setContactForm({ name: "", email: "", message: "" });
      setContactStatus(null);
    }
  }, [modal]);

  // Close menu on scroll
  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
  }, [scrolled]);

  const registerRef = (name) => (el) => {
    sectionRefs.current[name] = el;
    if (el) el.dataset.section = name;
  };

  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleContactSubmit = async () => {
    const { name, email, message } = contactForm;
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setContactStatus("sending");
    const result = await sendContactMessage({ name, email, message });
    if (result.ok) {
      setContactStatus("ok");
      setContactForm({ name: "", email: "", message: "" });
    } else {
      setContactStatus(result.reason);
    }
    if (result.reason === "limit") {
    setContactLimit(result.limit);
  }

  };

  const features = [
    { icon: "◈", title: "Smart Search", desc: "Search projects by name, keyword, or technology with instant results." },
    { icon: "◉", title: "Filter by Year & Tech Stack", desc: "Narrow down projects by graduation year and technology stack." },
    { icon: "◆", title: "Faculty Reviews", desc: "Read faculty ratings and detailed comments on every project." },
    { icon: "◇", title: "Project Documentation", desc: "Access PDF reports, GitHub links, and full project breakdowns." },
  ];

  const projects = [
    { tag: "Computer Science", title: "AI-Powered Diagnosis Assistant", year: "2024", tech: ["Python", "TensorFlow", "React"], score: 5 },
    { tag: "Software Engineering", title: "Real-Time Collaborative Code Editor", year: "2023", tech: ["Node.js", "WebSocket", "Vue"], score: 4 },
    { tag: "Data Science", title: "Traffic Flow Prediction Using Deep Learning", year: "2024", tech: ["PyTorch", "Pandas", "Streamlit"], score: 5 },
    { tag: "Cybersecurity", title: "Zero-Trust Network Access Framework", year: "2023", tech: ["Go", "Docker", "Kubernetes"], score: 4 },
    { tag: "HCI", title: "Accessible AR Navigation for the Visually Impaired", year: "2022", tech: ["Unity", "C#", "ARCore"], score: 5 },
    { tag: "Computer Science", title: "Distributed Ledger for Academic Records", year: "2024", tech: ["Solidity", "Ethereum", "React"], score: 3 },
    { tag: "Embedded Systems", title: "Smart Irrigation System with ML Forecasting", year: "2023", tech: ["Arduino", "MQTT", "Flask"], score: 4 },
    { tag: "Networks", title: "SDN-Based Load Balancer for Cloud", year: "2022", tech: ["OpenFlow", "Python", "Mininet"], score: 5 },
    { tag: "Bioinformatics", title: "Gene Expression Clustering Platform", year: "2024", tech: ["R", "Shiny", "Bioconductor"], score: 4 },
    { tag: "Mobile Dev", title: "Mental Health Companion App", year: "2023", tech: ["Flutter", "Firebase", "Dart"], score: 5 },
    { tag: "Computer Vision", title: "Sign Language Recognition via CNN", year: "2022", tech: ["OpenCV", "Keras", "Python"], score: 4 },
    { tag: "NLP", title: "Arabic Sentiment Analysis Engine", year: "2024", tech: ["BERT", "FastAPI", "HuggingFace"], score: 5 },
  ];

  const row1 = projects.slice(0, 6);
  const row2 = projects.slice(6);

  const MarqueeCard = ({ p }) => (
    <div style={styles.marqueeCard}>
      <span style={styles.cardTag}>{p.tag}</span>
      <p style={styles.cardTitle}>{p.title}</p>
      <p style={styles.cardMeta}>Class of {p.year}</p>
      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {p.tech.map((t) => (
          <span key={t} style={styles.techBadge}>{t}</span>
        ))}
      </div>
      <div style={styles.cardDots}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ ...styles.dot, ...(i < p.score ? styles.dotActive : {}) }} />
        ))}
      </div>
    </div>
  );

  const contactModalContent = (
    <div>
      <h2 style={styles.modalTitle}>Contact Us</h2>
      <p style={styles.modalSub}>Have a question or feedback? We'd love to hear from you.</p>

      {contactStatus === "ok" && (
        <div style={styles.alertSuccess}>✅ Your message was sent successfully! We'll get back to you soon.</div>
      )}
      {contactStatus === "limit" && (
        <div style={styles.alertWarn}>⚠️ You've reached the daily limit of {contactLimit} messages. Please try again tomorrow.</div>
      )}
      {contactStatus === "disabled" && (
        <div style={styles.alertWarn}>🔒 The contact form is currently disabled. Please try again later.</div>
      )}
      {contactStatus === "error" && (
        <div style={styles.alertError}>❌ Something went wrong. Please try again.</div>
      )}

      {contactStatus !== "ok" && contactStatus !== "disabled" && (
        <>
          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Name</label>
            <input style={styles.modalInput} type="text" placeholder="Your full name"
              value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Email</label>
            <input style={styles.modalInput} type="email" placeholder="you@university.edu"
              value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div style={styles.modalField}>
            <label style={styles.modalLabel}>Message</label>
            <textarea style={{ ...styles.modalInput, height: "110px", resize: "vertical" }}
              placeholder="Write your message here..." value={contactForm.message}
              onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))} />
          </div>
          <button
            style={{ ...styles.modalBtn, opacity: contactStatus === "sending" ? 0.6 : 1, cursor: contactStatus === "sending" ? "not-allowed" : "pointer" }}
            onClick={handleContactSubmit} disabled={contactStatus === "sending"}>
            {contactStatus === "sending" ? "Sending…" : "Send Message"}
          </button>
        </>
      )}
    </div>
  );

  const teamMembers = [
    { initials: "MA", name: "Menna Allah Adel", role: "Frontend Developer", color: "#6b4c2a" },
    { initials: "MH", name: "Malak Hisham", role: "Frontend Developer", color: "#8a6040" },
    { initials: "NM", name: "Nada Mahmoud", role: "Mobile Application", color: "#5a3a1a" },
    { initials: "SM", name: "Shahd Mamdouh", role: "Backend Developer", color: "#7a5030" },
    { initials: "SA", name: "Salam Anter", role: "Mobile Application", color: "#7a5030" },
    { initials: "SN", name: "Salam Nour", role: "Mobile Application", color: "#7a5030" },
  ];

  const modalContent = {
    contact: contactModalContent,
    team: (
      <div>
        <h2 style={styles.modalTitle}>Meet the Team</h2>
        <p style={styles.modalSub}>The people behind the Graduation Projects Gallery Portal.</p>
        <div style={styles.teamGrid}>
          {teamMembers.map((m, idx) => (
            <div key={idx} style={styles.teamCard}>
              <div style={{ ...styles.teamAvatar, background: m.color }}>{m.initials}</div>
              <p style={styles.teamName}>{m.name}</p>
              <p style={styles.teamRole}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    copyright: (
      <div>
        <h2 style={styles.modalTitle}>Copyright & Legal</h2>
        <p style={styles.modalSub}>Important information about intellectual property and usage rights.</p>
        <div style={styles.copyrightBlock}>
          <h3 style={styles.copyrightHeading}>© 2026 Graduation Projects Gallery Portal</h3>
          <p style={styles.copyrightText}>All content on this platform — including project descriptions, reports, media, and source code submitted by students — remains the intellectual property of the respective authors unless otherwise stated.</p>
          <p style={styles.copyrightText}>The platform itself, including its design, branding, and software infrastructure, is owned and operated by the Graduation Projects Gallery team. Unauthorized reproduction or redistribution is prohibited.</p>
          <div style={styles.copyrightDivider} />
          <h3 style={styles.copyrightHeading}>Student Work</h3>
          <p style={styles.copyrightText}>Students retain full ownership of their submitted projects. By uploading, they grant the platform a non-exclusive license to display and archive their work for academic and educational purposes.</p>
          <div style={styles.copyrightDivider} />
          <h3 style={styles.copyrightHeading}>Contact</h3>
          <p style={styles.copyrightText}>For copyright-related inquiries, please reach out via the Contact page or email us at <span style={{ color: "#6b4c2a" }}>legal@gpgallery.edu</span></p>
        </div>
      </div>
    ),
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {modal && (
        <div style={styles.overlay} onClick={() => setModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setModal(null)} aria-label="Close">✕</button>
            {modalContent[modal]}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <Link to="/" style={styles.logo}>
          <span style={{ ...styles.logoText, ...(scrolled ? styles.logoTextScrolled : {}) }}>
            Graduation Projects<span style={styles.logoAccent}> Gallery</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul style={styles.navLinks} className="nav-desktop">
          <li style={{ ...styles.navItem, ...(scrolled ? styles.navItemScrolled : {}) }} onClick={scrollToAbout}>
            <a href="#about" style={{ color: "inherit", textDecoration: "none" }} onClick={(e) => e.preventDefault()}>About</a>
          </li>
          <li style={{ ...styles.navItem, ...(scrolled ? styles.navItemScrolled : {}) }} onClick={() => navigate("/login")}>Login</li>
          <li style={styles.navCta} onClick={() => navigate("/signup")}>Register</li>
        </ul>

        {/* Hamburger */}
        <button
          className="hamburger"
          style={{ ...styles.hamburger, ...(scrolled ? styles.hamburgerScrolled : {}) }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span style={{ ...styles.hamburgerLine, ...(menuOpen ? styles.hamburgerLine1Open : {}) }} />
          <span style={{ ...styles.hamburgerLine, opacity: menuOpen ? 0 : 1 }} />
          <span style={{ ...styles.hamburgerLine, ...(menuOpen ? styles.hamburgerLine3Open : {}) }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <ul style={styles.mobileMenuList}>
            <li style={styles.mobileMenuItem} onClick={scrollToAbout}>About</li>
            <li style={styles.mobileMenuItem} onClick={() => { navigate("/login"); setMenuOpen(false); }}>Login</li>
            <li style={{ ...styles.mobileMenuItem, ...styles.mobileMenuCta }} onClick={() => { navigate("/signup"); setMenuOpen(false); }}>Register</li>
          </ul>
        </div>
      )}

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBg}>
          <img src={heroImage} alt="" style={styles.heroBgImg} />
          <div style={styles.heroBgOverlay} />
        </div>
        <div style={styles.heroContent}>
          <div className="hero-fade-in" style={styles.heroLabel}>
            <span style={styles.heroLabelDot} />
            Graduation Projects Gallery Portal
          </div>
          <h1 className="hero-fade-in hero-delay-1" style={styles.heroTitle}>
            Your work is your legacy —
            <br />
            <span style={styles.heroTitleAccent}>let the world witness it.</span>
          </h1>
          <p className="hero-fade-in hero-delay-2" style={styles.heroDesc}>
            Whether you're a student seeking inspiration, uploading your finest work,
            or a faculty member discovering tomorrow's talent — this is where academic excellence lives on.
          </p>
        </div>
        <div style={styles.heroScroll}>
          <div className="scroll-indicator" />
          <span style={styles.heroScrollText}>Scroll to explore</span>
        </div>
      </section>

      {/* STATS BAR */}
      <div ref={registerRef("stats")} className="stats-bar"
        style={{ ...styles.statsBar, ...(visibleSections.stats ? styles.fadeIn : styles.fadeOut) }}>
        {[
          { num: "500+", label: "Projects Archived" },
          { num: "12", label: "Graduation Years" },
          { num: "80+", label: "Technologies Covered" },
          { num: "200+", label: "Faculty Reviews" },
        ].map((s, i) => (
          <div key={i} style={styles.statItem} className="stat-item">
            <span style={styles.statNum}>{s.num}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section ref={registerRef("features")} className="features-section"
        style={{ ...styles.features, ...(visibleSections.features ? styles.fadeIn : styles.fadeOut) }}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>What we offer</span>
          <h2 style={styles.sectionTitle}>Platform Features</h2>
          <p style={styles.sectionSub}>Built to help students and faculty explore, evaluate, and celebrate academic work.</p>
        </div>
        <div style={styles.featuresGrid} className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card"
              style={{
                ...styles.featureCard,
                opacity: visibleSections.features ? 1 : 0,
                transform: visibleSections.features ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={registerRef("about")} className="about-section"
        style={{ ...styles.about, ...(visibleSections.about ? styles.fadeIn : styles.fadeOut) }}>
        <div style={styles.aboutInner} className="about-inner">
          <div style={styles.aboutLeft}>
            <span style={styles.sectionTag}>Our mission</span>
            <h2 style={styles.aboutTitle}>More Than an Archive.</h2>
            <div style={styles.aboutDivider} />
            <p style={styles.aboutText}>
              Great work deserves more than a submission date. The Graduation Projects Gallery Portal
              was built so that every project — every sleepless night, every breakthrough, every line of code —
              finds a permanent, proud home.
            </p>
            <p style={styles.aboutText}>
              For students, it's a source of inspiration and a stage to showcase what they've built.
              For faculty, it's a window into emerging talent and a tool for meaningful evaluation.
              For everyone, it's proof that ideas born in classrooms can genuinely change things.
            </p>
            <p style={styles.aboutText}>
              Because the best projects don't end at graduation — they're just getting started.
            </p>
          </div>
          <div style={styles.aboutRight}>
            <div style={styles.aboutCard}>
              <div style={styles.aboutCardAccent} />
              <blockquote style={styles.aboutQuote}>
                "A living archive of academic excellence — where every project tells a story worth telling."
              </blockquote>
              <div style={styles.aboutCardStats} className="about-card-stats">
                <div style={styles.aboutCardStat}>
                  <span style={styles.aboutCardStatNum}>500+</span>
                  <span style={styles.aboutCardStatLabel}>Projects preserved</span>
                </div>
                <div style={styles.aboutCardStatDivider} />
                <div style={styles.aboutCardStat}>
                  <span style={styles.aboutCardStatNum}>200+</span>
                  <span style={styles.aboutCardStatLabel}>Faculty reviews</span>
                </div>
                <div style={styles.aboutCardStatDivider} />
                <div style={styles.aboutCardStat}>
                  <span style={styles.aboutCardStatNum}>12</span>
                  <span style={styles.aboutCardStatLabel}>Years of history</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section ref={registerRef("marquee")}
        style={{ ...styles.marqueeSection, ...(visibleSections.marquee ? styles.fadeIn : styles.fadeOut) }}>
        <div style={styles.sectionHeader} className="marquee-header">
          <span style={styles.sectionTag}>From the archive</span>
          <h2 style={styles.sectionTitle}>Featured Projects</h2>
          <p style={styles.sectionSub}>A glimpse into the work that defines generations of graduates.</p>
        </div>
        <div style={styles.marqueeTrackWrap}>
          <div style={styles.marqueeFadeLeft} />
          <div style={styles.marqueeFadeRight} />
          <div className="marquee-row-left">
            {[...row1, ...row1].map((p, i) => <MarqueeCard key={i} p={p} />)}
          </div>
        </div>
        <div style={{ ...styles.marqueeTrackWrap, marginTop: "16px" }}>
          <div style={styles.marqueeFadeLeft} />
          <div style={styles.marqueeFadeRight} />
          <div className="marquee-row-right">
            {[...row2, ...row2].map((p, i) => <MarqueeCard key={i} p={p} />)}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer} className="footer">
        <div style={styles.footerTop} className="footer-top">
          <div style={styles.footerBrand}>
            <span style={styles.footerLogoFull}>
              Graduation Projects<span style={styles.footerLogoAccent}> Gallery</span>
            </span>
            <p style={styles.footerTagline}>Preserving academic excellence, one project at a time.</p>
          </div>
          <div style={styles.footerLinks} className="footer-links">
            <span style={styles.footerLink} onClick={scrollToAbout}>About</span>
            <span style={styles.footerLink} onClick={() => setModal("contact")}>Contact</span>
            <span style={styles.footerLink} onClick={() => setModal("team")}>Team</span>
            <span style={styles.footerLink} onClick={() => setModal("copyright")}>Copyright</span>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2026 Graduation Projects Gallery Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    backgroundColor: "#f0ebe0",
    color: "#6b5540",          /* ← بني فاتح بدل الأسود */
    minHeight: "100vh",
    fontFamily: "'Georgia', serif",
    overflowX: "hidden",
  },

  /* ALERTS */
  alertSuccess: {
    background: "rgba(60,120,60,0.12)", border: "1px solid rgba(60,120,60,0.3)",
    color: "#3a6a2a", borderRadius: "8px", padding: "12px 16px",
    fontSize: "14px", marginBottom: "20px", fontFamily: "'Georgia', serif", lineHeight: 1.5,
  },
  alertWarn: {
    background: "rgba(180,120,20,0.12)", border: "1px solid rgba(180,120,20,0.3)",
    color: "#7a5010", borderRadius: "8px", padding: "12px 16px",
    fontSize: "14px", marginBottom: "20px", fontFamily: "'Georgia', serif", lineHeight: 1.5,
  },
  alertError: {
    background: "rgba(160,40,40,0.1)", border: "1px solid rgba(160,40,40,0.3)",
    color: "#8a1010", borderRadius: "8px", padding: "12px 16px",
    fontSize: "14px", marginBottom: "20px", fontFamily: "'Georgia', serif", lineHeight: 1.5,
  },

  /* MODAL */
  overlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(20,15,10,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
    backdropFilter: "blur(4px)",
  },
  modalBox: {
    background: "#f0ebe0",
    border: "1px solid rgba(107,76,42,0.2)",
    borderRadius: "16px",
    padding: "48px 44px",
    maxWidth: "520px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 24px 60px rgba(20,15,10,0.25)",
  },
  modalClose: {
    position: "absolute", top: "20px", right: "20px",
    background: "none", border: "none", cursor: "pointer",
    fontSize: "16px", color: "#9a8f84", lineHeight: 1, padding: "4px 8px",
  },
  modalTitle: {
    fontSize: "26px", fontFamily: "'Georgia', serif", fontWeight: "normal",
    color: "#3a2a1a", margin: "0 0 8px 0",
  },
  modalSub: {
    fontSize: "14px", color: "#8a7a6e", fontFamily: "'Georgia', serif",
    lineHeight: 1.6, margin: "0 0 28px 0",
  },
  modalField: { marginBottom: "18px" },
  modalLabel: {
    display: "block", fontSize: "12px", color: "#6b4c2a",
    letterSpacing: "1px", textTransform: "uppercase",
    fontFamily: "'Georgia', serif", marginBottom: "7px",
  },
  modalInput: {
    width: "100%", boxSizing: "border-box",
    padding: "10px 14px", fontSize: "14px",
    fontFamily: "'Georgia', serif", color: "#3a2a1a",
    background: "#e8e2d5", border: "1px solid rgba(107,76,42,0.2)",
    borderRadius: "6px", outline: "none",
  },
  modalBtn: {
    marginTop: "8px",
    background: "#6b4c2a", color: "#f5f0ea",
    border: "none", borderRadius: "6px",
    padding: "11px 28px", fontSize: "13px",
    fontFamily: "'Georgia', serif", fontWeight: "bold",
    cursor: "pointer", letterSpacing: "0.5px",
  },

  /* TEAM */
  teamGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "8px" },
  teamCard: {
    background: "#e8e2d5", borderRadius: "10px",
    padding: "24px 20px", textAlign: "center",
    border: "1px solid rgba(107,76,42,0.12)",
  },
  teamAvatar: {
    width: "52px", height: "52px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 14px auto",
    fontSize: "16px", fontWeight: "bold", color: "#f5f0ea",
    fontFamily: "'Georgia', serif",
  },
  teamName: { fontSize: "15px", fontFamily: "'Georgia', serif", color: "#3a2a1a", margin: "0 0 4px 0", fontWeight: "normal" },
  teamRole: { fontSize: "12px", color: "#9a8f84", fontFamily: "'Georgia', serif", margin: 0, letterSpacing: "0.3px" },

  /* COPYRIGHT */
  copyrightBlock: { marginTop: "4px" },
  copyrightHeading: {
    fontSize: "14px", fontFamily: "'Georgia', serif",
    color: "#4a3828", margin: "0 0 10px 0", fontWeight: "bold", letterSpacing: "0.3px",
  },
  copyrightText: {
    fontSize: "14px", color: "#7a6558", fontFamily: "'Georgia', serif",
    lineHeight: 1.75, margin: "0 0 14px 0",
  },
  copyrightDivider: { height: "1px", background: "rgba(107,76,42,0.15)", margin: "20px 0" },

  /* NAVBAR */
  navbar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 60px", transition: "all 0.3s ease", background: "transparent",
  },
  navbarScrolled: {
    background: "rgba(240,235,224,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(30,26,22,0.08)",
    padding: "14px 60px",
    boxShadow: "0 1px 12px rgba(30,26,22,0.06)",
  },
  logo: { textDecoration: "none", display: "flex", alignItems: "center" },
  logoText: {
    color: "#f5f0ea", fontSize: "20px", fontFamily: "'Georgia', serif",
    fontWeight: "bold", letterSpacing: "0.5px", fontStyle: "italic",
    textShadow: "0 1px 8px rgba(0,0,0,0.25)", transition: "color 0.3s",
  },
  logoTextScrolled: { color: "#3a2a1a", textShadow: "none" },
  logoAccent: { color: "#e8c47a", fontStyle: "normal", fontWeight: "normal" },
  navLinks: { listStyle: "none", display: "flex", gap: "32px", margin: 0, padding: 0, alignItems: "center" },
  navItem: {
    color: "rgba(245,240,234,0.85)", cursor: "pointer",
    fontSize: "14px", fontFamily: "'Georgia', serif", transition: "color 0.2s",
  },
  navItemScrolled: { color: "#6b5540" },   /* ← بني فاتح */
  navCta: {
    color: "#fff", background: "#6b4c2a", cursor: "pointer",
    fontSize: "13px", fontFamily: "'Georgia', serif",
    padding: "8px 18px", borderRadius: "4px",
    letterSpacing: "0.5px", fontWeight: "bold",
  },

  /* HAMBURGER */
  hamburger: {
    display: "none", flexDirection: "column", gap: "5px",
    background: "none", border: "none", cursor: "pointer", padding: "4px",
  },
  hamburgerScrolled: {},
  hamburgerLine: {
    display: "block", width: "22px", height: "1.5px",
    background: "rgba(245,240,234,0.9)", transition: "all 0.25s ease",
    transformOrigin: "center",
  },
  hamburgerLine1Open: { transform: "translateY(6.5px) rotate(45deg)", background: "#3a2a1a" },
  hamburgerLine3Open: { transform: "translateY(-6.5px) rotate(-45deg)", background: "#3a2a1a" },

  /* MOBILE MENU */
  mobileMenu: {
    position: "fixed", top: "60px", left: 0, right: 0,
    zIndex: 99, background: "rgba(240,235,224,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(107,76,42,0.12)",
    boxShadow: "0 8px 24px rgba(30,26,22,0.1)",
  },
  mobileMenuList: { listStyle: "none", margin: 0, padding: "12px 0" },
  mobileMenuItem: {
    padding: "14px 32px", fontSize: "15px",
    fontFamily: "'Georgia', serif", color: "#6b5540",
    cursor: "pointer", borderBottom: "1px solid rgba(107,76,42,0.07)",
  },
  mobileMenuCta: {
    color: "#6b4c2a", fontWeight: "bold",
    borderBottom: "none",
  },

  /* HERO */
  hero: {
    position: "relative", height: "100vh", minHeight: "600px",
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", overflow: "hidden",
  },
  heroBg: { position: "absolute", inset: 0, zIndex: 0 },
  heroBgImg: {
    width: "100%", height: "100%",
    objectFit: "cover", objectPosition: "center 25%",
    filter: "saturate(0.6) brightness(0.5)",
  },
  heroBgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, rgba(20,15,10,0.25) 0%, rgba(20,15,10,0.5) 55%, #f0ebe0 100%)",
  },
  heroContent: { position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px", padding: "0 24px" },
  heroLabel: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    background: "rgba(200,169,122,0.18)", border: "1px solid rgba(200,169,122,0.4)",
    color: "#f0d49a", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase",
    fontFamily: "'Georgia', serif", padding: "6px 16px", borderRadius: "20px", marginBottom: "28px",
  },
  heroLabelDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#f0d49a", display: "inline-block" },
  heroTitle: {
    fontSize: "clamp(28px, 6vw, 72px)", fontFamily: "'Georgia', serif",
    fontWeight: "normal", color: "#f8f4ee", lineHeight: 1.2, margin: "0 0 24px 0", letterSpacing: "-0.5px",
  },
  heroTitleAccent: { color: "#e8c47a", fontStyle: "italic" },
  heroDesc: {
    fontSize: "clamp(14px, 2.2vw, 17px)", color: "rgba(248,244,238,0.75)", lineHeight: 1.8,
    maxWidth: "620px", margin: "0 auto", fontFamily: "'Georgia', serif",
  },
  heroScroll: {
    position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)",
    zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
  },
  heroScrollText: {
    fontSize: "11px", color: "rgba(248,244,238,0.5)",
    letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Georgia', serif",
  },

  /* STATS */
  statsBar: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    borderTop: "1px solid rgba(30,26,22,0.08)", borderBottom: "1px solid rgba(30,26,22,0.08)",
    background: "#e8e2d5",
  },
  statItem: {
    padding: "36px 24px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "6px", borderRight: "1px solid rgba(30,26,22,0.07)",
  },
  statNum: { fontSize: "32px", fontFamily: "'Georgia', serif", color: "#6b4c2a", fontWeight: "normal" },
  statLabel: { fontSize: "12px", color: "#9a8478", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Georgia', serif" },

  /* FEATURES */
  features: { padding: "100px 60px", maxWidth: "1200px", margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: "60px" },
  sectionTag: {
    display: "inline-block", color: "#7a5c3a", fontSize: "11px",
    letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Georgia', serif", marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "clamp(24px, 4vw, 42px)", fontFamily: "'Georgia', serif",
    fontWeight: "normal", color: "#3a2a1a", margin: "0 0 16px 0",
  },
  sectionSub: {
    fontSize: "16px", color: "#8a7a6e", maxWidth: "500px",
    margin: "0 auto", lineHeight: 1.7, fontFamily: "'Georgia', serif",
  },
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px", border: "1px solid rgba(30,26,22,0.1)",
    borderRadius: "12px", overflow: "hidden", background: "rgba(30,26,22,0.08)",
  },
  featureCard: { padding: "40px 32px", background: "#e8e2d5", cursor: "default" },
  featureIcon: { fontSize: "22px", color: "#7a5c3a", marginBottom: "20px", display: "block" },
  featureTitle: { fontSize: "16px", fontFamily: "'Georgia', serif", fontWeight: "normal", color: "#3a2a1a", margin: "0 0 12px 0" },
  featureDesc: { fontSize: "14px", color: "#8a7a6e", lineHeight: 1.7, margin: 0, fontFamily: "'Georgia', serif" },

  /* ABOUT */
  about: {
    padding: "100px 60px",
    background: "#e4ddd0",
    borderTop: "1px solid rgba(30,26,22,0.08)",
    borderBottom: "1px solid rgba(30,26,22,0.08)",
  },
  aboutInner: {
    maxWidth: "1100px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center",
  },
  aboutLeft: {},
  aboutTitle: {
    fontSize: "clamp(24px, 3vw, 38px)", fontFamily: "'Georgia', serif",
    fontWeight: "normal", color: "#3a2a1a", margin: "12px 0 24px 0",
  },
  aboutDivider: { width: "48px", height: "2px", background: "#7a5c3a", marginBottom: "28px" },
  aboutText: { fontSize: "16px", color: "#7a6558", lineHeight: 1.85, fontFamily: "'Georgia', serif", marginBottom: "18px" },
  aboutRight: {},
  aboutCard: {
    position: "relative", background: "#ede7da",
    border: "1px solid rgba(107,76,42,0.2)", borderRadius: "12px",
    padding: "48px 40px 36px 40px", overflow: "hidden",
    boxShadow: "0 4px 24px rgba(30,26,22,0.06)",
  },
  aboutCardAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
    background: "linear-gradient(90deg, #7a5c3a, transparent)",
  },
  aboutQuote: { margin: "0 0 36px 0", fontSize: "19px", fontFamily: "'Georgia', serif", fontStyle: "italic", color: "#6b4a28", lineHeight: 1.75 },
  aboutCardStats: { display: "flex", alignItems: "center", borderTop: "1px solid rgba(107,76,42,0.12)", paddingTop: "28px" },
  aboutCardStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  aboutCardStatNum: { fontSize: "26px", fontFamily: "'Georgia', serif", color: "#7a5c3a", fontWeight: "normal" },
  aboutCardStatLabel: { fontSize: "11px", color: "#9a8478", letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "'Georgia', serif", textAlign: "center" },
  aboutCardStatDivider: { width: "1px", height: "36px", background: "rgba(107,76,42,0.15)" },

  /* MARQUEE */
  marqueeSection: {
    padding: "100px 0",
    background: "#ddd6c8",
    borderTop: "1px solid rgba(30,26,22,0.08)",
    borderBottom: "1px solid rgba(30,26,22,0.08)",
    overflow: "hidden",
  },
  marqueeTrackWrap: { position: "relative", overflow: "hidden" },
  marqueeFadeLeft: {
    position: "absolute", top: 0, bottom: 0, left: 0, width: "120px",
    background: "linear-gradient(to right, #ddd6c8, transparent)",
    zIndex: 2, pointerEvents: "none",
  },
  marqueeFadeRight: {
    position: "absolute", top: 0, bottom: 0, right: 0, width: "120px",
    background: "linear-gradient(to left, #ddd6c8, transparent)",
    zIndex: 2, pointerEvents: "none",
  },
  marqueeCard: {
    background: "rgba(255,255,255,0.45)",
    border: "1px solid rgba(107,76,42,0.18)",
    borderRadius: "12px",
    padding: "20px 24px",
    width: "260px",
    flexShrink: 0,
    transition: "background 0.3s, border-color 0.3s",
  },
  cardTag: {
    display: "inline-block", background: "rgba(107,76,42,0.15)", color: "#7a5c3a",
    fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
    padding: "3px 10px", borderRadius: "20px", marginBottom: "12px", fontFamily: "'Georgia', serif",
  },
  cardTitle: { fontSize: "14px", color: "#3a2a1a", fontWeight: "normal", lineHeight: 1.5, marginBottom: "8px", fontFamily: "'Georgia', serif" },
  cardMeta: { fontSize: "12px", color: "#9a8478", letterSpacing: "0.3px", fontFamily: "'Georgia', serif" },
  techBadge: { fontSize: "10px", color: "#7a5c3a", background: "rgba(107,76,42,0.12)", padding: "2px 8px", borderRadius: "3px", fontFamily: "'Georgia', serif" },
  cardDots: { display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" },
  dot: { width: "6px", height: "6px", borderRadius: "50%", background: "rgba(107,76,42,0.2)" },
  dotActive: { background: "#9a7040" },

  /* FOOTER */
  footer: { borderTop: "1px solid rgba(30,26,22,0.1)", padding: "60px", background: "#d8d1c3" },
  footerTop: {
    maxWidth: "1100px", margin: "0 auto 40px auto",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px",
  },
  footerBrand: {},
  footerLogoFull: { display: "block", color: "#4a3828", fontSize: "18px", fontFamily: "'Georgia', serif", fontWeight: "bold", fontStyle: "italic" },
  footerLogoAccent: { color: "#7a5c3a", fontStyle: "normal", fontWeight: "normal" },
  footerTagline: { fontSize: "13px", color: "#9a8478", fontFamily: "'Georgia', serif", marginTop: "10px", fontStyle: "italic" },
  footerLinks: { display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "center" },
  footerLink: { color: "#8a7260", cursor: "pointer", fontSize: "13px", fontFamily: "'Georgia', serif", letterSpacing: "0.3px", transition: "color 0.2s" },
  footerBottom: { maxWidth: "1100px", margin: "0 auto", paddingTop: "28px", borderTop: "1px solid rgba(30,26,22,0.1)" },
  footerCopy: { fontSize: "12px", color: "#9a8478", fontFamily: "'Georgia', serif", margin: 0, textAlign: "center" },

  fadeIn: { opacity: 1, transform: "translateY(0)", transition: "opacity 0.7s ease, transform 0.7s ease" },
  fadeOut: { opacity: 0, transform: "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" },
};

const css = `
  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollBounce {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50%       { transform: translateY(6px); opacity: 1; }
  }
  @keyframes marqueeLeft {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes marqueeRight {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }

  .hero-fade-in  { animation: heroFadeIn 0.9s ease forwards; opacity: 0; }
  .hero-delay-1  { animation-delay: 0.2s; }
  .hero-delay-2  { animation-delay: 0.4s; }

  .scroll-indicator {
    width: 1px; height: 48px;
    background: linear-gradient(to bottom, rgba(240,212,154,0.9), transparent);
    animation: scrollBounce 1.8s ease-in-out infinite;
  }

  .marquee-row-left  { display: flex; gap: 16px; width: max-content; animation: marqueeLeft 38s linear infinite; }
  .marquee-row-right { display: flex; gap: 16px; width: max-content; animation: marqueeRight 44s linear infinite; }

  .marquee-row-left:hover,
  .marquee-row-right:hover { animation-play-state: paused; }

  .feature-card:hover { background: #dfd9cc !important; }

  a { text-decoration: none; }
  nav a { color: inherit; }

  /* ── Tablet (≤ 1024px) ── */
  @media (max-width: 1024px) {
    .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .about-inner   { grid-template-columns: 1fr !important; gap: 40px !important; }
  }

  /* ── Mobile (≤ 700px) ── */
  @media (max-width: 700px) {
    /* Navbar */
    nav { padding: 16px 20px !important; }
    .nav-desktop { display: none !important; }
    .hamburger   { display: flex !important; }

    /* Hamburger lines color when scrolled */
    .hamburger-scrolled span { background: #3a2a1a !important; }

    /* Hero */
    section[style*="100vh"] > div:nth-child(3) { padding: 0 20px !important; }

    /* Stats: 2 columns */
    .stats-bar { grid-template-columns: repeat(2, 1fr) !important; }
    .stat-item { padding: 24px 16px !important; }

    /* Features: 1 column */
    .features-section { padding: 60px 20px !important; }
    .features-grid    { grid-template-columns: 1fr !important; }
    .feature-card     { padding: 28px 24px !important; }

    /* About */
    .about-section { padding: 60px 20px !important; }
    .about-inner   { grid-template-columns: 1fr !important; gap: 32px !important; }
    .about-card-stats { flex-direction: column !important; gap: 16px !important; }

    /* Marquee header */
    .marquee-header { padding: 0 20px !important; }

    /* Footer */
    .footer       { padding: 40px 20px !important; }
    .footer-top   { flex-direction: column !important; gap: 24px !important; }
    .footer-links { gap: 16px !important; }

    /* Modals */
    .modal-box { padding: 32px 20px !important; }
  }

  /* ── Small mobile (≤ 400px) ── */
  @media (max-width: 400px) {
    .stats-bar { grid-template-columns: repeat(2, 1fr) !important; }
    .team-grid { grid-template-columns: 1fr !important; }
  }
`;