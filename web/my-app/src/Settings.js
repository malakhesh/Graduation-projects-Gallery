import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./settings.css";
import { checkRole, logOut } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import UploadModal from './UploadModal';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen, FaBars, FaChevronDown,
  FaUserEdit, FaEnvelope, FaLock, FaTrash
} from "react-icons/fa";

function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <>
      {open && <div className="st-sidebar-overlay" onClick={onClose} />}
      <aside className={`st-admin-sidebar ${open ? 'st-sidebar-open' : ''}`}>
        <div className="st-sidebar-header">
          <h2 className="st-sidebar-title" onClick={() => navigate('/dashboard')}>DASHBOARD</h2>
        </div>
        <ul className="st-sidebar-links">
          {["HOME", "PROFILE", "TEAM", "SETTINGS"].map((item) => (
            <li key={item} onClick={() => { if (item === "HOME") onClose(); }} className="st-sidebar-item">{item}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

function Navbar({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => { await logOut(); navigate('/'); };

  return (
    <>
      <nav className="st-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && <button className="st-hamburger" onClick={() => setSidebarOpen(true)}><FaBars /></button>}
          <Link to="/home" className="st-navbar-logo">
            <FaGraduationCap className="st-logo-icon" />
            <span className="st-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
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
          <button className="st-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="st-avatar-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="st-nav-avatar" />
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
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

const SECTIONS = [
  { key: "name",     label: "Change Name",     icon: <FaUserEdit /> },
  { key: "email",    label: "Change Email",     icon: <FaEnvelope /> },
  { key: "password", label: "Change Password",  icon: <FaLock /> },
  { key: "delete",   label: "Delete Account",   icon: <FaTrash />, danger: true },
];

function SectionContent({ sectionKey, user }) {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  if (sectionKey === "name") return (
    <div className="st-form">
      <p className="st-form-hint">Current name: <strong>{user?.displayName || "—"}</strong></p>
      <div className="st-field">
        <label className="st-label">New Name</label>
        <input className="st-input" placeholder="Enter new name" value={val1} onChange={e => setVal1(e.target.value)} autoComplete="off" />
      </div>
      <button className="st-save-btn" onClick={() => alert("Coming soon!")}>Save Name</button>
    </div>
  );

  if (sectionKey === "email") return (
    <div className="st-form">
      <p className="st-form-hint">Current email: <strong>{user?.email || "—"}</strong></p>
      <div className="st-field">
        <label className="st-label">New Email</label>
        <input className="st-input" placeholder="Enter new email" type="text" value={val1} onChange={e => setVal1(e.target.value)} autoComplete="new-email" />
      </div>
      <div className="st-field">
        <label className="st-label">Current Password (required)</label>
        <input className="st-input" placeholder="Enter your password" type="password" value={val2} onChange={e => setVal2(e.target.value)} autoComplete="new-password" />
      </div>
      <button className="st-save-btn" onClick={() => alert("Coming soon!")}>Save Email</button>
    </div>
  );

  if (sectionKey === "password") return (
    <div className="st-form">
      <div className="st-field">
        <label className="st-label">Current Password</label>
        <input className="st-input" placeholder="Enter current password" type="password" value={val1} onChange={e => setVal1(e.target.value)} autoComplete="current-password" />
      </div>
      <div className="st-field">
        <label className="st-label">New Password</label>
        <input className="st-input" placeholder="Enter new password" type="password" value={val2} onChange={e => setVal2(e.target.value)} autoComplete="new-password" />
      </div>
      <div className="st-field">
        <label className="st-label">Confirm New Password</label>
        <input className="st-input" placeholder="Confirm new password" type="password" value={val3} onChange={e => setVal3(e.target.value)} autoComplete="new-password" />
      </div>
      <button className="st-save-btn" onClick={() => alert("Coming soon!")}>Save Password</button>
    </div>
  );

  if (sectionKey === "delete") return (
    <div className="st-form">
      <p className="st-danger-text">⚠️ This will permanently delete your account and all your data. This action cannot be undone.</p>
      <div className="st-field">
        <label className="st-label st-label-danger">Enter your password to confirm</label>
        <input className="st-input st-input-danger" placeholder="Enter password" type="password" value={val1} onChange={e => setVal1(e.target.value)} autoComplete="current-password" />
      </div>
      <button className="st-save-btn st-delete-btn" onClick={() => alert("Coming soon!")}>Delete My Account</button>
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
          {/* Left strip */}
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

          {/* Right content */}
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