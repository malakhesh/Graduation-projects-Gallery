import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./settings.css";
import { checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen, FaBars, FaChevronDown
} from "react-icons/fa";
import { useRef } from "react";
import { logOut } from './auth.js';

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
            <li key={item}
              onClick={() => { if (item === "HOME") onClose(); }}
              className="st-sidebar-item"
            >{item}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

function Navbar({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };
  return (
    <>
      <nav className="st-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <button className="st-hamburger" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
          )}
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
          <button className="st-upload-btn">Upload Project</button>
          <div className="st-avatar-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="st-nav-avatar" />
            ) : (
              <div className="st-nav-avatar-placeholder"><FaUser /></div>
            )}
            <FaChevronDown className={`st-dropdown-arrow ${dropdownOpen ? 'st-arrow-up' : ''}`} />
            {dropdownOpen && (
              <div className="st-dropdown-menu">
                <div className="st-dropdown-item st-dropdown-item-active">
                  <FaCog style={{fontSize: '12px'}} /> Settings
                </div>
                <div className="st-dropdown-divider" />
                <button className="st-dropdown-item st-dropdown-logout" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function Settings() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
    }
  }, [user]);

  return (
    <div className="st-page">
      <Navbar isAdmin={isAdmin} />
      <main className="st-main-content">
        {/* Settings content coming soon */}
      </main>
    </div>
  );
}

export default Settings;