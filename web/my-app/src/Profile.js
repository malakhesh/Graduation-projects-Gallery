import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./profile.css";
import { checkRole, getUser, updateUser, logOut, checkStatus } from './auth.js';
import { getUserProjs } from './projects.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import UploadModal from './UploadModal';
import { listenNotifs, markAllSeen, markRead } from './notifications.js';
import {
  FaGraduationCap, FaUser, FaCog, FaFolderOpen,
  FaEnvelope, FaProjectDiagram, FaGithub, FaLinkedin,
  FaGlobe, FaQuoteLeft, FaPen, FaCheck, FaTimes, FaChevronDown, FaCamera, FaExclamationCircle,
  FaBars, FaBell, FaBookmark
} from "react-icons/fa";

const CLOUDINARY_CLOUD = "df4nquqin";
const CLOUDINARY_PRESET = "snqtqhha";

function Navbar({ isAdmin, photoURL }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const dropdownRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;
    const unsub = listenNotifs(user.uid, (data) => setNotifs(data));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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

  const avatarUrl = photoURL || user?.photoURL || null;

  return (
    <>
      <nav className="pf-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="pf-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
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
          {/* Bell — mobile only */}
          <div ref={mobileNotifRef} className="pf-mobile-bell-wrapper">
            <button className={`pf-mobile-bell${notifOpen ? " pf-mobile-bell-active" : ""}`} onClick={handleBellClick} aria-label="Notifications">
              <span className="pf-notif-wrapper">
                <FaBell />
                {hasUnseen && <span className="pf-notif-dot" />}
              </span>
            </button>
            {notifOpen && (
              <div className="pf-notif-dropdown">
                <div className="pf-notif-dropdown-header">Notifications</div>
                {notifs.length === 0 ? (
                  <div className="pf-notif-empty">
                    <FaBell style={{ fontSize: 36, color: "rgb(185,174,167)" }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(104,68,42)" }}>No notifications yet</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.map((n) => (
                      <div key={n.id} style={{ padding: "12px 18px", borderBottom: "1px solid rgb(235,225,215)", fontSize: 13, color: "rgb(47,28,15)", background: n.seen ? "transparent" : "rgb(243,232,220)" }}>
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="pf-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="pf-avatar-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="pf-nav-avatar" />
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

      {/* Sidebar overlay */}
      {sidebarOpen && <div className="pf-sidebar-overlay" onClick={closeSidebar} />}
      <div className={`pf-admin-sidebar${sidebarOpen ? " pf-sidebar-open" : ""}`}>
        <div className="pf-sidebar-header">
          <Link to="/home" className="pf-sidebar-title" onClick={closeSidebar}>Graduation Gallery</Link>
          <button onClick={closeSidebar} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, color: "rgb(104,68,42)", cursor: "pointer", padding: "4px 6px", borderRadius: 8 }}>
            <FaTimes />
          </button>
        </div>
        <ul className="pf-sidebar-links">
          <li className={`pf-sidebar-item${location.pathname === '/projects' ? ' pf-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/projects'); }}>
            <FaFolderOpen style={{ marginRight: 10 }} /> My Projects
          </li>
          <li className={`pf-sidebar-item${location.pathname === '/bookmarks' ? ' pf-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/bookmarks'); }}>
            <FaBookmark style={{ marginRight: 10 }} /> Bookmarks
          </li>
          <li className={`pf-sidebar-item${location.pathname === '/profile' ? ' pf-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/profile'); }}>
            <FaUser style={{ marginRight: 10 }} /> My Profile
          </li>
          <li className={`pf-sidebar-item${location.pathname === '/settings' ? ' pf-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/settings'); }}>
            <FaCog style={{ marginRight: 10 }} /> Settings
          </li>
          <li style={{ height: 1, background: "rgb(185,174,167)", margin: "8px 0", listStyle: "none" }} />
          <li className="pf-sidebar-item" onClick={() => { closeSidebar(); setShowUpload(true); }}>
            <span style={{ marginRight: 10 }}>＋</span> Upload Project
          </li>
          {isAdmin && (
            <li className={`pf-sidebar-item${location.pathname === '/dashboard' ? ' pf-sidebar-item-active' : ''}`} onClick={() => { closeSidebar(); navigate('/dashboard'); }}>
              Dashboard
            </li>
          )}
          <li style={{ height: 1, background: "rgb(185,174,167)", margin: "8px 0", listStyle: "none" }} />
          <li className="pf-sidebar-item" style={{ color: "rgb(180,60,60)" }} onClick={async () => { closeSidebar(); await logOut(); navigate('/'); }}>
            Log Out
          </li>
        </ul>
      </div>

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
  const [photoFile, setPhotoFile] = useState(null);
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

    let photoURL = profileData?.photoURL || user?.photoURL || null;

    if (photoFile) {
      try {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        photoURL = data.secure_url;
      } catch {
        setSaving(false);
        setSaveError("Photo upload failed. Please try again.");
        return;
      }
    }

    const result = await updateUser(user.uid, {
      bio: tempBio,
      year: tempYear,
      photoURL,
      socialLinks: { github: tempGithub, linkedin: tempLinkedin, portfolio: tempPortfolio }
    });

    setSaving(false);
    if (result === "update-fail") { setSaveError("Failed to save. Please try again."); return; }

    setBio(tempBio); setYear(tempYear); setGithub(tempGithub);
    setLinkedin(tempLinkedin); setPortfolio(tempPortfolio);
    setProfileData((prev) => ({ ...prev, photoURL }));
    setPhotoFile(null);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const displayName = user?.displayName || profileData?.name || "User";
  const email = user?.email || "";
  const avatarSrc = photoPreview || profileData?.photoURL || user?.photoURL || null;

  return (
    <div className="pf-page">
      <Navbar isAdmin={isAdmin} photoURL={avatarSrc} />
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
                {avatarSrc
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
                  if (file) {
                    setPhotoFile(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }
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