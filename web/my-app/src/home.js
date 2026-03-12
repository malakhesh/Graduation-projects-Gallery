import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UploadModal from './UploadModal';
import "./home.css";
import { logOut, checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaGraduationCap, FaUser, FaBell, FaSearch, FaFilter, FaChevronDown, FaBookOpen, FaBookmark, FaFolderOpen, FaBriefcase, FaShoppingCart, FaFilm, FaNewspaper, FaBars } from "react-icons/fa";

const projects = [
  { id: 1, title: "AI Robotics Research", author: "Emily Johnson", date: "May 12, 2024", tags: ["Technology", "Engineering"], tagClass: ["hg-tag-brown", "hg-tag-brown"], image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=220&fit=crop", avatar: "https://i.pravatar.cc/32?img=1" },
  { id: 2, title: 'Art Installation "City Lights"', author: "David Miller", date: "May 8, 2024", tags: ["Art", "Design"], tagClass: ["hg-tag-brown", "hg-tag-brown"], image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=220&fit=crop", avatar: "https://i.pravatar.cc/32?img=3" },
  { id: 3, title: "Eco-Friendly Architecture", author: "Sarah Lee", date: "April 28, 2024", tags: ["Architecture", "Environment"], tagClass: ["hg-tag-brown", "hg-tag-brown"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop", avatar: "https://i.pravatar.cc/32?img=5" },
];

const exploreTags = [
  { label: "Business", icon: <FaBriefcase /> },
  { label: "Education", icon: <FaBookOpen /> },
  { label: "E-commerce", icon: <FaShoppingCart /> },
  { label: "Entertainment", icon: <FaFilm /> },
  { label: "Blog", icon: <FaNewspaper /> },
];

function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  return (
    <>
      {open && <div className="hg-sidebar-overlay" onClick={onClose} />}
      <aside className={`hg-admin-sidebar ${open ? 'hg-sidebar-open' : ''}`}>
        <div className="hg-sidebar-header">
          <h2 className="hg-sidebar-title" onClick={() => navigate('/dashboard')}>DASHBOARD</h2>
        </div>
        <ul className="hg-sidebar-links">
          {["HOME", "PROFILE", "TEAM", "SETTINGS"].map((item) => (
            <li key={item}
              onClick={() => { if (item === "HOME") onClose(); }}
              className="hg-sidebar-item"
            >{item}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

export function Navbar({ isAdmin }) {
  const [hasNotifications] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };



  return (
    <>
      <nav className="hg-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <button className="hg-hamburger" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
          )}
          <Link to="/home" className="hg-navbar-logo">
            <FaGraduationCap className="hg-logo-icon" />
            <span className="hg-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
        </div>

        <div className="hg-navbar-links">
          <Link to="/projects" className={`hg-nav-link${location.pathname === '/projects' ? ' hg-nav-link-active' : ''}`}>
            <FaFolderOpen className="hg-nav-icon" /> My Projects
          </Link>
          <Link to="/bookmarks" className={`hg-nav-link${location.pathname === '/bookmarks' ? ' hg-nav-link-active' : ''}`}>
            <FaBookmark className="hg-nav-icon" /> Bookmarks
          </Link>
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className={`hg-nav-link${notifOpen ? ' hg-nav-link-active' : ''}`}
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <span className="hg-notif-wrapper">
                <FaBell className="hg-nav-icon" />
                {hasNotifications && <span className="hg-notif-dot" />}
              </span>
              Notifications
            </button>
            {notifOpen && (
              <div className="hg-notif-dropdown">
                <div className="hg-notif-dropdown-header">Notifications</div>
                <div className="hg-notif-empty">
                  <FaBell className="hg-notif-empty-icon" />
                  <p className="hg-notif-empty-text">No notifications yet</p>
                  <p className="hg-notif-empty-sub">When someone interacts with<br />your projects, you'll see it here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hg-navbar-right">
          <button className="hg-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="hg-avatar-wrapper" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User avatar" className="hg-user-avatar" />
            ) : (
              <div className="hg-user-avatar-placeholder">
                <FaUser className="hg-user-avatar-icon" />
              </div>
            )}
            <FaChevronDown className={`hg-dropdown-arrow ${dropdownOpen ? 'hg-arrow-up' : ''}`} />
            {dropdownOpen && (
              <div className="hg-dropdown-menu">
                <Link to="/profile" className="hg-dropdown-item">
                  <FaUser className="hg-dropdown-icon" /> My Profile
                </Link>
                <div className="hg-dropdown-divider" />
                <button className="hg-dropdown-item hg-dropdown-logout" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSubmit={async (data) => {
            console.log("Project submitted:", data);
            // Wire to Firestore later
          }}
        />
      )}
    </>
  );
}

function SearchBar({ search, setSearch }) {
  return (
    <div className="hg-search-wrapper">
      <div className="hg-search-bar">
        <FaSearch className="hg-search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="hg-search-input"
        />
        <div className="hg-search-divider" />
        <button className="hg-filter-btn"><FaFilter className="hg-filter-icon" /> Filters</button>
      </div>
      <div className="hg-buttons-row">
        <button className="hg-btn-outline">All Projects</button>
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="hg-project-card">
      <div className="hg-card-header">
        <h3 className="hg-card-title">{project.title}</h3>
        <div className="hg-card-author">
          <img src={project.avatar} alt={project.author} className="hg-author-avatar" />
          <div>
            <p className="hg-author-name">{project.author}</p>
            <p className="hg-author-date">{project.date}</p>
          </div>
        </div>
      </div>
      <div className="hg-card-image-wrapper">
        <img src={project.image} alt={project.title} className="hg-card-image" />
      </div>
      <div className="hg-card-footer">
        <span className="hg-tag hg-tag-brown">{project.tags[0]}</span>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="hg-spinner-wrapper">
      <div className="hg-spinner" />
    </div>
  );
}

function RecentProjects({ search }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <section className="hg-section">
      <h2 className="hg-section-title">Recommended Projects</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="hg-projects-grid">
          {filtered.length > 0 ? filtered.map((project) => <ProjectCard key={project.id} project={project} />) : <p className="hg-no-results">No projects found for "{search}"</p>}
        </div>
      )}
    </section>
  );
}

function ExploreTags() {
  return (
    <section className="hg-section">
      <h2 className="hg-section-title">Explore by Tags</h2>
      <div className="hg-tags-grid">
        {exploreTags.map((tag) => (
          <div key={tag.label} className="hg-tag-card">
            <span className="hg-tag-icon">{tag.icon}</span>
            <span className="hg-tag-label">{tag.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => {
        setIsAdmin(role === 'admin');
      });
    }
  }, [user]);

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <SearchBar search={search} setSearch={setSearch} />
        <RecentProjects search={search} />
        <ExploreTags />
      </main>
    </div>
  );
}

export default Home;