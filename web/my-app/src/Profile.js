import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./profile.css";
import { checkRole, getUser } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen, FaBars,
  FaEnvelope, FaProjectDiagram, FaGithub, FaLinkedin,
  FaGlobe, FaQuoteLeft, FaPen, FaCheck, FaTimes
} from "react-icons/fa";

function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <>
      {open && <div className="pf-sidebar-overlay" onClick={onClose} />}
      <aside className={`pf-admin-sidebar ${open ? 'pf-sidebar-open' : ''}`}>
        <div className="pf-sidebar-header">
          <h2 className="pf-sidebar-title" onClick={() => navigate('/dashboard')}>DASHBOARD</h2>
        </div>
        <ul className="pf-sidebar-links">
          {["HOME", "PROFILE", "TEAM", "SETTINGS"].map((item) => (
            <li key={item}
              onClick={() => { if (item === "HOME") onClose(); }}
              className="pf-sidebar-item"
            >{item}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

function Navbar({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  return (
    <>
      <nav className="pf-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <button className="pf-hamburger" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
          )}
          <Link to="/home" className="pf-navbar-logo">
            <FaGraduationCap className="pf-logo-icon" />
            <span className="pf-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
        </div>
        <div className="pf-navbar-links">
          <Link to="/projects" className={`pf-nav-link${location.pathname === '/projects' ? ' pf-nav-link-active' : ''}`}>
            <FaFolderOpen className="pf-nav-icon" /> My Projects
          </Link>
          <Link to="/profile" className={`pf-nav-link${location.pathname === '/profile' ? ' pf-nav-link-active' : ''}`}>
            <FaUser className="pf-nav-icon" /> My Profile
          </Link>
          <Link to="/settings" className={`pf-nav-link${location.pathname === '/settings' ? ' pf-nav-link-active' : ''}`}>
            <FaCog className="pf-nav-icon" /> Settings
          </Link>
        </div>
        <div className="pf-navbar-right">
          <button className="pf-upload-btn">Upload Project</button>
        </div>
      </nav>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

function Profile() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);

  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [tempBio, setTempBio] = useState('');
  const [tempGithub, setTempGithub] = useState('');
  const [tempLinkedin, setTempLinkedin] = useState('');
  const [tempPortfolio, setTempPortfolio] = useState('');

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
      const fetchProfile = async () => {
        try {
          const data = await getUser(user.uid);
          if (data) {
            setProfileData(data);
            setBio(data.bio || '');
            setGithub(data.socialLinks?.github || '');
            setLinkedin(data.socialLinks?.linkedin || '');
            setPortfolio(data.socialLinks?.portfolio || '');
          }
        } catch (e) {
          console.error("Could not fetch profile data", e);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleEdit = () => {
    setTempBio(bio);
    setTempGithub(github);
    setTempLinkedin(linkedin);
    setTempPortfolio(portfolio);
    setEditing(true);
  };

  const handleConfirm = () => {
    setBio(tempBio);
    setGithub(tempGithub);
    setLinkedin(tempLinkedin);
    setPortfolio(tempPortfolio);
    setEditing(false);
  };

  const handleCancel = () => setEditing(false);

  const displayName = user?.displayName || profileData?.name || "User";
  const email = user?.email || "";
  const avatarSrc = user?.photoURL || null;
  const projectCount = profileData?.projectCount ?? 0;
  const year = profileData?.year || null;

  return (
    <div className="pf-page">
      <Navbar isAdmin={isAdmin} />
      <main className="pf-main-content">
        {loading ? (
          <div className="pf-spinner-wrapper"><div className="pf-spinner" /></div>
        ) : (
          <div className="pf-card">

            {/* Edit controls */}
            <div className="pf-card-actions">
              {!editing ? (
                <button className="pf-icon-btn" onClick={handleEdit} title="Edit profile">
                  <FaPen />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pf-icon-btn pf-icon-btn-save" onClick={handleConfirm} title="Save">
                    <FaCheck />
                  </button>
                  <button className="pf-icon-btn pf-icon-btn-cancel" onClick={handleCancel} title="Cancel">
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            {/* Left: avatar */}
            <div className="pf-card-left">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="pf-avatar" />
              ) : (
                <div className="pf-avatar-placeholder">
                  <FaUser />
                </div>
              )}
            </div>

            {/* Right: info */}
            <div className="pf-card-right">

              {/* 1. Name */}
              <h2 className="pf-name">{displayName}</h2>

              {/* 2. Bio */}
              {editing ? (
                <textarea
                  className="pf-textarea"
                  placeholder="Write a short bio about yourself..."
                  value={tempBio}
                  onChange={e => setTempBio(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
              ) : (
                bio ? (
                  <div className="pf-bio">
                    <FaQuoteLeft className="pf-bio-quote" />
                    <p>{bio}</p>
                  </div>
                ) : (
                  <p className="pf-placeholder-text">No bio yet</p>
                )
              )}

              {/* 3. Divider */}
              <div className="pf-divider" />

              {/* 4. Email, projects, grad year */}
              <div className="pf-details">
                <div className="pf-detail">
                  <FaEnvelope className="pf-detail-icon" />
                  <span>{email}</span>
                </div>
                <div className="pf-detail">
                  <FaProjectDiagram className="pf-detail-icon" />
                  <span>{projectCount} project{projectCount !== 1 ? 's' : ''} uploaded</span>
                </div>
                <div className="pf-detail">
                  <FaGraduationCap className="pf-detail-icon" />
                  <span>{year ? `Class of ${year}` : 'No graduation year specified'}</span>
                </div>
              </div>

              {/* 5. Social links */}
              {editing ? (
                <div className="pf-social-inputs">
                  <div className="pf-social-input-row">
                    <FaGithub className="pf-social-icon" />
                    <input className="pf-input" placeholder="GitHub URL" value={tempGithub} onChange={e => setTempGithub(e.target.value)} />
                  </div>
                  <div className="pf-social-input-row">
                    <FaLinkedin className="pf-social-icon" />
                    <input className="pf-input" placeholder="LinkedIn URL" value={tempLinkedin} onChange={e => setTempLinkedin(e.target.value)} />
                  </div>
                  <div className="pf-social-input-row">
                    <FaGlobe className="pf-social-icon" />
                    <input className="pf-input" placeholder="Portfolio URL" value={tempPortfolio} onChange={e => setTempPortfolio(e.target.value)} />
                  </div>
                </div>
              ) : (
                (github || linkedin || portfolio) ? (
                  <div className="pf-social-links">
                    {github && (
                      <a href={github} target="_blank" rel="noreferrer" className="pf-social-btn">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {linkedin && (
                      <a href={linkedin} target="_blank" rel="noreferrer" className="pf-social-btn">
                        <FaLinkedin /> LinkedIn
                      </a>
                    )}
                    {portfolio && (
                      <a href={portfolio} target="_blank" rel="noreferrer" className="pf-social-btn">
                        <FaGlobe /> Portfolio
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="pf-placeholder-text">No social links yet</p>
                )
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;