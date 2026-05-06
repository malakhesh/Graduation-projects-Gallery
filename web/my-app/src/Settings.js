import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./settings.css";
import { checkRole, logOut, getUser } from './auth.js';
import { updateUserEmail, updateUserPassword, updateUserName, deleteAccount } from './setting.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import UploadModal from './UploadModal';
import { listenNotifs, markAllSeen } from './notifications.js';
import { getUserProjs, setHidden } from './projects.js';
import { applyTheme } from './applyTheme.js';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen, FaChevronDown,
  FaUserEdit, FaEnvelope, FaLock, FaTrash, FaBars, FaBell, FaTimes,
  FaBookmark, FaEye, FaEyeSlash, FaExternalLinkAlt, FaPalette,
  FaSun, FaMoon, FaClock, FaDesktop
} from "react-icons/fa";

function Navbar({ isAdmin }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const dropdownRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;
    getUser(user.uid).then((data) => {
      if (data && data !== "no-data" && data !== "get-fail") {
        setProfilePhoto(data.photoURL || null);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenNotifs(user.uid, (data) => setNotifs(data));
    return () => unsub();
  }, [user]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const hasUnseen = notifs.some((n) => !n.seen);

  const handleBellClick = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && user && hasUnseen) {
      const unseenIds = notifs.filter((n) => !n.seen).map((n) => n.id);
      await markAllSeen(user.uid, unseenIds);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      const inMobile = mobileNotifRef.current && mobileNotifRef.current.contains(e.target);
      if (!inMobile) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => { await logOut(); navigate('/'); };
  const closeSidebar = () => setSidebarOpen(false);

  const avatarUrl = profilePhoto || user?.photoURL || null;

  return (
    <>
      <nav className="st-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="st-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <Link to="/home" className="st-navbar-logo">
            <FaGraduationCap className="st-logo-icon" />
            <span className="st-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
          {isAdmin && (
            <Link to="/dashboard" className={`hg-dashboard-btn${location.pathname === '/dashboard' ? ' hg-dashboard-btn-active' : ''}`}>
              Dashboard
            </Link>
          )}
        </div>
        <div className="st-navbar-links">
          <Link to="/projects" className={`st-nav-link${location.pathname === '/projects' ? ' st-nav-link-active' : ''}`}>
            <FaFolderOpen className="st-nav-icon" /> My Projects
          </Link>
          <Link to="/profile" className={`st-nav-link${location.pathname === '/profile' ? ' st-nav-link-active' : ''}`}>
            <FaUser className="st-nav-icon" /> My Profile
          </Link>
          <Link to="/settings" className={`st-nav-link${location.pathname === '/settings' ? ' st-nav-link-active' : ''}`}>
            <FaCog className="st-nav-icon" /> Settings
          </Link>
        </div>
        <div className="st-navbar-right">
          <div ref={mobileNotifRef} className="st-mobile-bell-wrapper">
            <button className={`st-mobile-bell${notifOpen ? " st-mobile-bell-active" : ""}`} onClick={handleBellClick} aria-label="Notifications">
              <span className="st-notif-wrapper">
                <FaBell />
                {hasUnseen && <span className="st-notif-dot" />}
              </span>
            </button>
            {notifOpen && (
              <div className="st-notif-dropdown">
                <div className="st-notif-dropdown-header">Notifications</div>
                {notifs.length === 0 ? (
                  <div className="st-notif-empty">
                    <FaBell style={{ fontSize: 36, color: "var(--text-faint)" }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>No notifications yet</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.map((n) => (
                      <div key={n.id} style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 13,
                        color: "var(--text-primary)",
                        background: n.seen ? "transparent" : "var(--bg-notif-unread)",
                      }}>
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="st-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="st-avatar-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="st-nav-avatar" />
              : <div className="st-nav-avatar-placeholder"><FaUser /></div>
            }
            <FaChevronDown className={`st-dropdown-arrow ${dropdownOpen ? 'st-arrow-up' : ''}`} />
            {dropdownOpen && (
              <div className="st-dropdown-menu">
                <div className="st-dropdown-item st-dropdown-item-active"><FaCog style={{ fontSize: '12px' }} /> Settings</div>
                <div className="st-dropdown-divider" />
                <button className="st-dropdown-item st-dropdown-logout" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {sidebarOpen && <div className="st-sidebar-overlay" onClick={closeSidebar} />}
      <div className={`st-admin-sidebar${sidebarOpen ? " st-sidebar-open" : ""}`}>
        <div className="st-sidebar-header">
          <Link to="/home" className="st-sidebar-title" onClick={closeSidebar}>Graduation Gallery</Link>
          <button onClick={closeSidebar} style={{
            marginLeft: "auto", background: "none", border: "none",
            fontSize: 18, color: "var(--accent-dark)", cursor: "pointer",
            padding: "4px 6px", borderRadius: 8,
          }}>
            <FaTimes />
          </button>
        </div>
        <ul className="st-sidebar-links">
          <li className={`st-sidebar-item${location.pathname === '/projects' ? ' st-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/projects'); }}>
            <FaFolderOpen style={{ marginRight: 10 }} /> My Projects
          </li>
          <li className={`st-sidebar-item${location.pathname === '/bookmarks' ? ' st-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/bookmarks'); }}>
            <FaBookmark style={{ marginRight: 10 }} /> Bookmarks
          </li>
          <li className={`st-sidebar-item${location.pathname === '/profile' ? ' st-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/profile'); }}>
            <FaUser style={{ marginRight: 10 }} /> My Profile
          </li>
          <li className={`st-sidebar-item${location.pathname === '/settings' ? ' st-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/settings'); }}>
            <FaCog style={{ marginRight: 10 }} /> Settings
          </li>
          <li style={{ height: 1, background: "var(--border)", margin: "8px 0", listStyle: "none" }} />
          <li className="st-sidebar-item" onClick={() => { closeSidebar(); setShowUpload(true); }}>
            <span style={{ marginRight: 10 }}>＋</span> Upload Project
          </li>
          {isAdmin && (
            <li className={`st-sidebar-item${location.pathname === '/dashboard' ? ' st-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/dashboard'); }}>
              Dashboard
            </li>
          )}
          <li style={{ height: 1, background: "var(--border)", margin: "8px 0", listStyle: "none" }} />
          <li className="st-sidebar-item" style={{ color: "var(--danger)" }} onClick={async () => { closeSidebar(); await logOut(); navigate('/'); }}>
            Log Out
          </li>
        </ul>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

// ===========================
// PROJECT MANAGEMENT SECTION
// ===========================
function ProjectManagement({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingAll, setTogglingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getUserProjs(user.uid).then((data) => {
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
    });
  }, [user]);

  const allHidden = projects.length > 0 && projects.every((p) => p.hidden);
  const anyVisible = projects.some((p) => !p.hidden);

  const toggleOne = async (proj) => {
    setTogglingId(proj.id);
    const newHidden = !proj.hidden;
    await setHidden(proj.id, newHidden);
    setProjects((prev) => prev.map((p) => p.id === proj.id ? { ...p, hidden: newHidden } : p));
    setTogglingId(null);
  };

  const toggleAll = async () => {
    setTogglingAll(true);
    const newHidden = anyVisible;
    await Promise.all(projects.map((p) => setHidden(p.id, newHidden)));
    setProjects((prev) => prev.map((p) => ({ ...p, hidden: newHidden })));
    setTogglingAll(false);
  };

  const STATUS_COLORS = {
    approved: { bg: "var(--success-bg)",  color: "var(--success-text)", label: "Approved" },
    pending:  { bg: "var(--warning-bg)",  color: "var(--warning-text)", label: "Pending" },
    rejected: { bg: "var(--danger-bg)",   color: "var(--danger-text)",  label: "Rejected" },
  };

  if (loading) return (
    <div className="st-spinner-wrapper"><div className="st-spinner" /></div>
  );

  if (projects.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "var(--text-muted)" }}>
      <FaFolderOpen style={{ fontSize: 44, opacity: 0.3 }} />
      <p style={{ fontSize: 14, fontFamily: "Arial, sans-serif" }}>You haven't uploaded any projects yet.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "Arial, sans-serif" }}>
          {projects.length} project{projects.length !== 1 ? "s" : ""} · hidden projects are only visible to you
        </p>
        <button
          onClick={toggleAll}
          disabled={togglingAll}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 16px", borderRadius: 20,
            border: "1.5px solid var(--border)",
            background: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            color: anyVisible ? "var(--text-secondary)" : "var(--success)",
            fontFamily: "Arial, sans-serif", transition: "all 0.2s",
          }}
        >
          {togglingAll
            ? "Updating..."
            : anyVisible
              ? <><FaEyeSlash style={{ fontSize: 12 }} /> Hide all</>
              : <><FaEye style={{ fontSize: 12 }} /> Show all</>
          }
        </button>
      </div>

      {projects.map((proj) => {
        const statusStyle = STATUS_COLORS[proj.status] || STATUS_COLORS.pending;
        const isToggling = togglingId === proj.id;
        const image = proj.imgUrl || proj.image;

        return (
          <div
            key={proj.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 14,
              border: "1.5px solid var(--border)",
              background: proj.hidden ? "var(--bg-active)" : "var(--bg-card)",
              opacity: proj.hidden ? 0.75 : 1,
              transition: "all 0.2s",
            }}
          >
            {image && (
              <img
                src={image}
                alt={proj.title}
                style={{ width: 52, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
                fontFamily: "Arial, sans-serif", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
                textDecoration: proj.hidden ? "line-through" : "none",
                opacity: proj.hidden ? 0.6 : 1,
              }}>
                {proj.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: statusStyle.bg, color: statusStyle.color,
                  fontFamily: "Arial, sans-serif", textTransform: "capitalize",
                }}>
                  {statusStyle.label}
                </span>
                {proj.hidden && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: "var(--bg-tag)", color: "var(--text-secondary)",
                    fontFamily: "Arial, sans-serif",
                  }}>
                    Hidden
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => navigate(`/project/${proj.id}`)}
                title="View project"
                style={{
                  background: "none", border: "1.5px solid var(--border)",
                  borderRadius: "50%", width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-secondary)", fontSize: 11,
                  transition: "all 0.2s",
                }}
              >
                <FaExternalLinkAlt />
              </button>
              <button
                onClick={() => toggleOne(proj)}
                disabled={isToggling}
                title={proj.hidden ? "Show project" : "Hide project"}
                style={{
                  background: proj.hidden ? "var(--accent-dark)" : "none",
                  border: "1.5px solid var(--border)",
                  borderRadius: "50%", width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: isToggling ? "default" : "pointer",
                  color: proj.hidden ? "var(--text-inverse)" : "var(--text-secondary)",
                  fontSize: 11, transition: "all 0.2s",
                }}
              >
                {isToggling ? "…" : proj.hidden ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===========================
// THEME SECTION
// ===========================
const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    desc: "Always use light mode",
    icon: <FaSun />,
    preview: { bg: "#fffbf5", accent: "rgb(104,68,42)", dot: "#f3e8dc" },
  },
  {
    value: "caramel",
    label: "Caramel",
    desc: "Warm amber tones, easier on the eyes",
    icon: <FaMoon style={{ color: "#d29a58" }} />,
    preview: { bg: "#2c1800", accent: "#d29a58", dot: "#3d2510" },
  },
  {
    value: "dark",
    label: "Dark",
    desc: "Always use dark mode",
    icon: <FaMoon />,
    preview: { bg: "#1a1210", accent: "#c4a882", dot: "#2a1f18" },
  },
  {
    value: "auto",
    label: "Auto",
    desc: "Light 6am–6pm · Dark 6pm–6am",
    icon: <FaClock />,
    preview: { bg: "linear-gradient(135deg, #fffbf5 50%, #1a1210 50%)", accent: "rgb(104,68,42)", dot: "#888" },
  },
  {
    value: "system",
    label: "System",
    desc: "Matches your device setting",
    icon: <FaDesktop />,
    preview: { bg: "#e8e0d8", accent: "rgb(104,68,42)", dot: "#c8bdb5" },
  },
];

function ThemeSection() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gg-theme") || "system");

  const handleSelect = (val) => {
    setTheme(val);
    localStorage.setItem("gg-theme", val);
    applyTheme(val);
  };

  const hour = new Date().getHours();
  const autoCurrently = hour >= 6 && hour < 18 ? "light" : "dark";

  return (
    <div className="st-form">
      <p className="st-form-hint" style={{ marginBottom: 20 }}>
        Choose how Graduation Gallery looks for you. Changes apply instantly.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {THEME_OPTIONS.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderRadius: 14,
                border: isActive ? "2px solid var(--border-strong)" : "1.5px solid var(--border)",
                background: isActive ? "var(--bg-active)" : "var(--bg-card)",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: opt.preview.bg,
                border: "1.5px solid var(--border)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: opt.preview.accent,
                overflow: "hidden",
              }}>
                {opt.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0, fontFamily: "Arial, sans-serif",
                }}>
                  {opt.label}
                  {opt.value === "auto" && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 20,
                      background: autoCurrently === "light" ? "var(--warning-bg)" : "var(--bg-tag)",
                      color: autoCurrently === "light" ? "var(--warning-text)" : "var(--text-secondary)",
                      verticalAlign: "middle",
                    }}>
                      {autoCurrently === "light" ? "☀ Light now" : "🌙 Dark now"}
                    </span>
                  )}
                </p>
                <p style={{
                  fontSize: 12, color: "var(--text-secondary)",
                  margin: "2px 0 0", fontFamily: "Arial, sans-serif",
                }}>
                  {opt.desc}
                </p>
              </div>

              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: isActive ? "none" : "1.5px solid var(--border)",
                background: isActive ? "var(--accent-dark)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s",
              }}>
                {isActive && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p style={{
        fontSize: 12, color: "var(--text-muted)", marginTop: 16,
        fontFamily: "Arial, sans-serif", textAlign: "center",
      }}>
        {theme === "system"
          ? `Showing ${window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"} mode (device setting)`
          : theme === "auto"
          ? `Showing ${autoCurrently} mode (${hour}:00 local time)`
          : theme === "caramel"
          ? "Caramel mode active"
          : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode active`
        }
      </p>
    </div>
  );
}

// ===========================
// SECTIONS CONFIG
// ===========================
const SECTIONS = [
  { key: "theme",    label: "Appearance",        icon: <FaPalette /> },
  { key: "projects", label: "Project Management", icon: <FaFolderOpen /> },
  { key: "name",     label: "Change Name",        icon: <FaUserEdit /> },
  { key: "email",    label: "Change Email",       icon: <FaEnvelope /> },
  { key: "password", label: "Change Password",    icon: <FaLock /> },
  { key: "delete",   label: "Delete Account",     icon: <FaTrash />, danger: true },
];

function SectionContent({ sectionKey, user }) {
  const navigate = useNavigate();
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => { setError(""); setSuccess(""); };

  if (sectionKey === "theme")    return <ThemeSection />;
  if (sectionKey === "projects") return <ProjectManagement user={user} />;

  if (sectionKey === "name") return (
    <div className="st-form">
      <p className="st-form-hint">Current name: <strong>{user?.displayName || "—"}</strong></p>
      <div className="st-field">
        <label className="st-label">New Name</label>
        <input className="st-input" placeholder="Enter new name" value={val1} onChange={e => { setVal1(e.target.value); reset(); }} autoComplete="off" />
      </div>
      {error   && <p className="st-msg st-msg-error">{error}</p>}
      {success && <p className="st-msg st-msg-success">{success}</p>}
      <button className="st-save-btn" disabled={loading} onClick={async () => {
        if (!val1.trim()) { setError("Please enter a name."); return; }
        setLoading(true); reset();
        const result = await updateUserName(user.uid, val1.trim());
        setLoading(false);
        if (result === "name-updated") { setSuccess("Name updated successfully."); setVal1(""); }
        else setError("Failed to update name. Please try again.");
      }}>
        {loading ? "Saving..." : "Save Name"}
      </button>
    </div>
  );

  if (sectionKey === "email") return (
    <div className="st-form">
      <p className="st-form-hint">Current email: <strong>{user?.email || "—"}</strong></p>
      <div className="st-field">
        <label className="st-label">New Email</label>
        <input className="st-input" placeholder="Enter new email" type="text" value={val1} onChange={e => { setVal1(e.target.value); reset(); }} autoComplete="new-email" />
      </div>
      <div className="st-field">
        <label className="st-label">Current Password (required)</label>
        <input className="st-input" placeholder="Enter your password" type="password" value={val2} onChange={e => { setVal2(e.target.value); reset(); }} autoComplete="current-password" />
      </div>
      {error   && <p className="st-msg st-msg-error">{error}</p>}
      {success && <p className="st-msg st-msg-success">{success}</p>}
      <button className="st-save-btn" disabled={loading} onClick={async () => {
        if (!val1.trim()) { setError("Please enter a new email."); return; }
        if (!val2)        { setError("Please enter your password."); return; }
        setLoading(true); reset();
        const result = await updateUserEmail(val1.trim(), val2);
        setLoading(false);
        if (result === "email-updated") { setSuccess("Email updated successfully."); setVal1(""); setVal2(""); }
        else setError("Failed to update email. Check your password and try again.");
      }}>
        {loading ? "Saving..." : "Save Email"}
      </button>
    </div>
  );

  if (sectionKey === "password") return (
    <div className="st-form">
      <div className="st-field">
        <label className="st-label">Current Password</label>
        <input className="st-input" placeholder="Enter current password" type="password" value={val1} onChange={e => { setVal1(e.target.value); reset(); }} autoComplete="current-password" />
      </div>
      <div className="st-field">
        <label className="st-label">New Password</label>
        <input className="st-input" placeholder="Enter new password" type="password" value={val2} onChange={e => { setVal2(e.target.value); reset(); }} autoComplete="new-password" />
      </div>
      <div className="st-field">
        <label className="st-label">Confirm New Password</label>
        <input className="st-input" placeholder="Confirm new password" type="password" value={val3} onChange={e => { setVal3(e.target.value); reset(); }} autoComplete="new-password" />
      </div>
      {error   && <p className="st-msg st-msg-error">{error}</p>}
      {success && <p className="st-msg st-msg-success">{success}</p>}
      <button className="st-save-btn" disabled={loading} onClick={async () => {
        if (!val1)           { setError("Please enter your current password."); return; }
        if (!val2)           { setError("Please enter a new password."); return; }
        if (val2 !== val3)   { setError("New passwords do not match."); return; }
        if (val2.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true); reset();
        const result = await updateUserPassword(val1, val2);
        setLoading(false);
        if (result === "password-updated") { setSuccess("Password updated successfully."); setVal1(""); setVal2(""); setVal3(""); }
        else setError("Failed to update password. Check your current password and try again.");
      }}>
        {loading ? "Saving..." : "Save Password"}
      </button>
    </div>
  );

  if (sectionKey === "delete") return (
    <div className="st-form">
      <p className="st-danger-text">⚠️ This will permanently delete your account and all your data. This action cannot be undone.</p>
      <div className="st-field">
        <label className="st-label st-label-danger">Enter your password to confirm</label>
        <input className="st-input st-input-danger" placeholder="Enter password" type="password" value={val1} onChange={e => { setVal1(e.target.value); reset(); }} autoComplete="current-password" />
      </div>
      {error   && <p className="st-msg st-msg-error">{error}</p>}
      {success && <p className="st-msg st-msg-success">{success}</p>}
      <button className="st-save-btn st-delete-btn" disabled={loading} onClick={async () => {
        if (!val1) { setError("Please enter your password."); return; }
        setLoading(true); reset();
        const result = await deleteAccount(val1);
        setLoading(false);
        if (result === "account-deleted") { navigate("/"); }
        else setError("Failed to delete account. Check your password and try again.");
      }}>
        {loading ? "Deleting..." : "Delete My Account"}
      </button>
    </div>
  );

  return null;
}

function Settings() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (user) checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
  }, [user]);

  return (
    <div className="st-page">
      <Navbar isAdmin={isAdmin} />
      <main className="st-main-content">
        <div className="st-card">
          <div className="st-strip">
            <p className="st-strip-label">Account Settings</p>
            {SECTIONS.map(({ key, label, icon, danger }) => (
              <button
                key={key}
                className={`st-strip-btn${danger ? " st-strip-btn-danger" : ""}${active === key ? " st-strip-btn-active" : ""}`}
                onClick={() => setActive(active === key ? null : key)}
              >
                <span className="st-strip-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <div className="st-content">
            {active ? (
              <>
                <h2 className="st-content-title">{SECTIONS.find(s => s.key === active)?.label}</h2>
                <div className="st-content-divider" />
                <SectionContent key={active} sectionKey={active} user={user} />
              </>
            ) : (
              <div className="st-content-empty">
                <FaCog className="st-content-empty-icon" />
                <p>Select a setting to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;