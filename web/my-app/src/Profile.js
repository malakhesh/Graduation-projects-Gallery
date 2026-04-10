import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./profile.css";
import { checkRole, getUser, updateUser, logOut, checkStatus } from './auth.js';
import { getUserProjs } from './projects.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import UploadModal from './UploadModal';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen,
  FaEnvelope, FaProjectDiagram, FaGithub, FaLinkedin,
  FaGlobe, FaQuoteLeft, FaPen, FaCheck, FaTimes, FaChevronDown, FaCamera, FaExclamationCircle
} from "react-icons/fa";


function Navbar({ isAdmin }) {
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
      <nav className="pf-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/home" className="pf-navbar-logo">
            <FaGraduationCap className="pf-logo-icon" />
            <span className="pf-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
          {isAdmin && (
            <Link to="/dashboard" className={`hg-dashboard-btn${location.pathname === '/dashboard' ? ' hg-dashboard-btn-active' : ''}`}>
              Dashboard
            </Link>
          )}
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
          <button className="pf-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="pf-avatar-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" className="pf-nav-avatar" />
              : <div className="pf-nav-avatar-placeholder"><FaUser /></div>
            }
            <FaChevronDown className={`pf-dropdown-arrow ${dropdownOpen ? 'pf-arrow-up' : ''}`} />
            {dropdownOpen && (
              <div className="pf-dropdown-menu">
                <div className="pf-dropdown-item pf-dropdown-item-active"><FaUser style={{ fontSize: '12px' }} /> My Profile</div>
                <div className="pf-dropdown-divider" />
                <button className="pf-dropdown-item pf-dropdown-logout" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

function Profile() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [violations, setViolations] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef();

  const [bio, setBio] = useState('');
  const [year, setYear] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');

  const [tempBio, setTempBio] = useState('');
  const [tempYear, setTempYear] = useState('');
  const [tempGithub, setTempGithub] = useState('');
  const [tempLinkedin, setTempLinkedin] = useState('');
  const [tempPortfolio, setTempPortfolio] = useState('');

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
      getUser(user.uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") {
          setProfileData(data);
          setBio(data.bio || '');
          setYear(data.year || '');
          setGithub(data.socialLinks?.github || '');
          setLinkedin(data.socialLinks?.linkedin || '');
          setPortfolio(data.socialLinks?.portfolio || '');
        }
        setLoading(false);
      });
      getUserProjs(user.uid).then((data) => {
        if (Array.isArray(data)) setProjectCount(data.length);
      });
      checkStatus(user.uid).then((res) => {
        if (res?.violations) setViolations(res.violations);
      });
    }
  }, [user]);

  const handleEdit = () => {
    setTempBio(bio); setTempYear(year); setTempGithub(github);
    setTempLinkedin(linkedin); setTempPortfolio(portfolio);
    setSaveError(null); setEditing(true);
  };

  const handleConfirm = async () => {
    setSaving(true); setSaveError(null);
    const result = await updateUser(user.uid, {
      bio: tempBio, year: tempYear,
      socialLinks: { github: tempGithub, linkedin: tempLinkedin, portfolio: tempPortfolio }
    });
    setSaving(false);
    if (result === "update-fail") { setSaveError("Failed to save. Please try again."); return; }
    setBio(tempBio); setYear(tempYear); setGithub(tempGithub);
    setLinkedin(tempLinkedin); setPortfolio(tempPortfolio);
    setEditing(false);
  };

  const handleCancel = () => { setEditing(false); setSaveError(null); };

  const displayName = user?.displayName || profileData?.name || "User";
  const email = user?.email || "";
  const avatarSrc = user?.photoURL || null;

  return (
    <div className="pf-page">
      <Navbar isAdmin={isAdmin} />
      <main className="pf-main-content">
        {loading ? (
          <div className="pf-spinner-wrapper"><div className="pf-spinner" /></div>
        ) : (
          <div className="pf-card">
            <div className="pf-card-actions">
              {!editing ? (
                <button className="pf-icon-btn" onClick={handleEdit} title="Edit profile"><FaPen /></button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="pf-icon-btn pf-icon-btn-save" onClick={handleConfirm} disabled={saving} title="Save">
                    {saving ? "..." : <FaCheck />}
                  </button>
                  <button className="pf-icon-btn pf-icon-btn-cancel" onClick={handleCancel} title="Cancel"><FaTimes /></button>
                </div>
              )}
            </div>

            <div className="pf-card-left">
              <div className="pf-avatar-wrapper-edit">
                {photoPreview
                  ? <img src={photoPreview} alt="Profile" className="pf-avatar" />
                  : avatarSrc
                  ? <img src={avatarSrc} alt="Profile" className="pf-avatar" />
                  : <div className="pf-avatar-placeholder"><FaUser /></div>
                }
                {editing && (
                  <button className="pf-avatar-edit-btn" onClick={() => photoRef.current.click()} title="Change photo">
                    <FaCamera />
                  </button>
                )}
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files[0];
                  if (file) setPhotoPreview(URL.createObjectURL(file));
                }} />
              </div>
            </div>

            <div className="pf-card-right">
              <h2 className="pf-name">{displayName}</h2>
              <div className="pf-divider" />

              <div className="pf-details">
                <div className="pf-detail">
                  <FaEnvelope className="pf-detail-icon" />
                  <span>{email}</span>
                </div>
                <div className="pf-detail">
                  <FaGraduationCap className="pf-detail-icon" />
                  {editing ? (
                    <input className="pf-input" placeholder="Graduation year e.g. 2025" value={tempYear} onChange={e => setTempYear(e.target.value)} maxLength={4} />
                  ) : (
                    year ? <span>Class of {year}</span> : <span className="pf-placeholder-text">No graduation year specified</span>
                  )}
                </div>
                <div className="pf-detail">
                  <FaProjectDiagram className="pf-detail-icon" />
                  <span>{projectCount} project{projectCount !== 1 ? 's' : ''} uploaded</span>
                </div>
                {violations > 0 && (
                  <div className="pf-detail">
                    <FaExclamationCircle className="pf-detail-icon" />
                    <span style={{ color: "rgb(164, 132, 109)", fontSize: "13px" }}>
                      {violations} violation{violations !== 1 ? 's' : ''} recorded
                    </span>
                  </div>
                )}
              </div>

              {editing ? (
                <textarea className="pf-textarea" placeholder="Write a short bio about yourself..." value={tempBio} onChange={e => setTempBio(e.target.value)} maxLength={300} rows={3} />
              ) : (
                bio
                  ? <div className="pf-bio"><FaQuoteLeft className="pf-bio-quote" /><p>{bio}</p></div>
                  : <p className="pf-placeholder-text">No bio yet</p>
              )}

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
                    {github && <a href={github} target="_blank" rel="noreferrer" className="pf-social-btn"><FaGithub /> GitHub</a>}
                    {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="pf-social-btn"><FaLinkedin /> LinkedIn</a>}
                    {portfolio && <a href={portfolio} target="_blank" rel="noreferrer" className="pf-social-btn"><FaGlobe /> Portfolio</a>}
                  </div>
                ) : (
                  <p className="pf-placeholder-text">No social links yet</p>
                )
              )}

              {saveError && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{saveError}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;