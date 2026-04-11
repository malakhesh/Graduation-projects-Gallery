import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UploadModal from './UploadModal';
import WelcomeModal from './Welcomenotify.js';
import "./home.css";
import { logOut, checkRole, addBookmark, removeBookmark, getBookmarks } from './auth.js';
import { auth } from './firebase.js';
import { addReport } from './reports.js'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { getApproved, notifyBookmark } from './projects.js';
import { listenNotifs, markAllSeen, markRead } from './notifications.js';
import { ProjectCard, ProjectModal } from './ProjectCard.js';
import { FilterPanel } from './FilterPanel.js';
import { useFilters } from './useFilters.js';
import {
  FaGraduationCap, FaUser, FaBell, FaSearch, FaFilter, FaChevronDown,
  FaBookOpen, FaBookmark, FaFolderOpen, FaBriefcase, FaShoppingCart, FaFilm, FaNewspaper,
  FaBars, FaTimes
} from "react-icons/fa";

const exploreTags = [
  { label: "Business", icon: <FaBriefcase /> },
  { label: "Education", icon: <FaBookOpen /> },
  { label: "E-commerce", icon: <FaShoppingCart /> },
  { label: "Entertainment", icon: <FaFilm /> },
  { label: "Blog", icon: <FaNewspaper /> },
];

function NotifItem({ notif, uid, onProjectOpen, onWelcomeOpen }) {
  const isUnread = !notif.read;
  const isUnseen = !notif.seen;
  const bg = isUnseen ? "rgb(243, 232, 220)" : "transparent";

  const handleClick = async () => {
    if (!notif.clickable) return;
    await markRead(uid, notif.id);
    if (notif.type === "welcome") { onWelcomeOpen(); return; }
    if (notif.projectId && onProjectOpen) onProjectOpen(notif.projectId);
  };

  const typeLabel = {
    welcome: "Welcome",
    approved: "Approved",
    rejected: "Not Approved",
    comment: "New Comment",
    rating: "New Rating",
    bookmark: "Bookmarked",
  }[notif.type] || "Notification";

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "12px 18px",
        background: bg,
        borderBottom: "1px solid rgb(235, 225, 215)",
        cursor: notif.clickable ? "pointer" : "default",
        transition: "background 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      onMouseEnter={e => { if (notif.clickable) e.currentTarget.style.background = "rgb(235, 222, 208)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgb(164, 132, 109)", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Arial, Helvetica, sans-serif" }}>
          {typeLabel}
        </span>
        {isUnread && notif.clickable && (
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(164, 132, 109)", flexShrink: 0 }} />
        )}
      </div>
      <p style={{ fontSize: 13, color: "rgb(47, 28, 15)", margin: 0, lineHeight: 1.5, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: isUnread ? 600 : 400 }}>
        {notif.message}
      </p>
      {notif.createdAt && (
        <span style={{ fontSize: 11, color: "rgb(164, 132, 109)", fontFamily: "Arial, Helvetica, sans-serif" }}>
          {notif.createdAt.toDate?.().toLocaleDateString() || ""}
        </span>
      )}
    </div>
  );
}

export function Navbar({ isAdmin }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileNotifRef = useRef(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;
    const unsub = listenNotifs(user.uid, (data) => setNotifs(data));
    return () => unsub();
  }, [user]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
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

  const handleProjectOpen = (projectId) => {
    setNotifOpen(false);
    navigate(`/project/${projectId}`);
  };

  const handleWelcomeOpen = () => {
    setNotifOpen(false);
    setShowWelcome(true);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      const inDesktop = notifRef.current && notifRef.current.contains(e.target);
      const inMobile = mobileNotifRef.current && mobileNotifRef.current.contains(e.target);
      if (!inDesktop && !inMobile) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => { await logOut(); navigate("/"); };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <nav className="hg-navbar">
        {/* Left: hamburger (mobile) + logo + dashboard */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="hg-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <Link to="/home" className="hg-navbar-logo">
            <FaGraduationCap className="hg-logo-icon" />
            <span className="hg-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
          {isAdmin && (
            <Link to="/dashboard" className={`hg-dashboard-btn${location.pathname === "/dashboard" ? " hg-dashboard-btn-active" : ""}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Center: desktop nav links */}
        <div className="hg-navbar-links">
          <Link to="/projects" className={`hg-nav-link${location.pathname === "/projects" ? " hg-nav-link-active" : ""}`}>
            <FaFolderOpen className="hg-nav-icon" /> My Projects
          </Link>
          <Link to="/bookmarks" className={`hg-nav-link${location.pathname === "/bookmarks" ? " hg-nav-link-active" : ""}`}>
            <FaBookmark className="hg-nav-icon" /> Bookmarks
          </Link>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button className={`hg-nav-link${notifOpen ? " hg-nav-link-active" : ""}`} onClick={handleBellClick}>
              <span className="hg-notif-wrapper">
                <FaBell className="hg-nav-icon" />
                {hasUnseen && <span className="hg-notif-dot" />}
              </span>
              Notifications
            </button>
            {notifOpen && (
              <div className="hg-notif-dropdown">
                <div className="hg-notif-dropdown-header">Notifications</div>
                {notifs.length === 0 ? (
                  <div className="hg-notif-empty">
                    <FaBell className="hg-notif-empty-icon" />
                    <p className="hg-notif-empty-text">No notifications yet</p>
                    <p className="hg-notif-empty-sub">When someone interacts with<br />your projects, you'll see it here.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 380, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgb(164,132,109) rgb(223,205,192)" }}>
                    {notifs.map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        uid={user.uid}
                        onProjectOpen={handleProjectOpen}
                        onWelcomeOpen={handleWelcomeOpen}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: mobile bell + upload + avatar */}
        <div className="hg-navbar-right">
          {/* Bell icon — only visible on mobile */}
          <div ref={mobileNotifRef} className="hg-mobile-bell-wrapper">
            <button className={`hg-mobile-bell${notifOpen ? " hg-mobile-bell-active" : ""}`} onClick={handleBellClick} aria-label="Notifications">
              <span className="hg-notif-wrapper">
                <FaBell />
                {hasUnseen && <span className="hg-notif-dot" />}
              </span>
            </button>
            {notifOpen && (
              <div className="hg-notif-dropdown">
                <div className="hg-notif-dropdown-header">Notifications</div>
                {notifs.length === 0 ? (
                  <div className="hg-notif-empty">
                    <FaBell className="hg-notif-empty-icon" />
                    <p className="hg-notif-empty-text">No notifications yet</p>
                    <p className="hg-notif-empty-sub">When someone interacts with<br />your projects, you'll see it here.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 380, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgb(164,132,109) rgb(223,205,192)" }}>
                    {notifs.map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        uid={user.uid}
                        onProjectOpen={handleProjectOpen}
                        onWelcomeOpen={handleWelcomeOpen}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="hg-upload-btn" onClick={() => setShowUpload(true)}>Upload Project</button>
          <div className="hg-avatar-wrapper" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="User avatar" className="hg-user-avatar" />
              : <div className="hg-user-avatar-placeholder"><FaUser className="hg-user-avatar-icon" /></div>
            }
            <FaChevronDown className={`hg-dropdown-arrow ${dropdownOpen ? "hg-arrow-up" : ""}`} />
            {dropdownOpen && (
              <div className="hg-dropdown-menu">
                <Link to="/profile" className="hg-dropdown-item"><FaUser className="hg-dropdown-icon" /> My Profile</Link>
                <div className="hg-dropdown-divider" />
                <button className="hg-dropdown-item hg-dropdown-logout" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* =====================
          MOBILE SIDEBAR
      ===================== */}
      {sidebarOpen && (
        <div className="hg-sidebar-overlay" onClick={closeSidebar} />
      )}
      <div className={`hg-admin-sidebar${sidebarOpen ? " hg-sidebar-open" : ""}`}>
        {/* Sidebar header */}
        <div className="hg-sidebar-header">
          <Link to="/home" className="hg-sidebar-title" onClick={closeSidebar}>
            Graduation Gallery
          </Link>
          <button
            onClick={closeSidebar}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              fontSize: 18,
              color: "rgb(104, 68, 42)",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 8,
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Sidebar nav links */}
        <ul className="hg-sidebar-links">
          <li
            className={`hg-sidebar-item${location.pathname === "/projects" ? " hg-sidebar-item-active" : ""}`}
            onClick={() => { closeSidebar(); navigate("/projects"); }}
          >
            <FaFolderOpen style={{ marginRight: 10 }} /> My Projects
          </li>
          <li
            className={`hg-sidebar-item${location.pathname === "/bookmarks" ? " hg-sidebar-item-active" : ""}`}
            onClick={() => { closeSidebar(); navigate("/bookmarks"); }}
          >
            <FaBookmark style={{ marginRight: 10 }} /> Bookmarks
          </li>
          {/* Divider */}
          <li style={{ height: 1, background: "rgb(185, 174, 167)", margin: "8px 0", listStyle: "none" }} />

          <li
            className="hg-sidebar-item"
            onClick={() => { closeSidebar(); setShowUpload(true); }}
          >
            <span style={{ marginRight: 10, fontSize: 15 }}>＋</span> Upload Project
          </li>
          <li
            className={`hg-sidebar-item${location.pathname === "/all-projects" ? " hg-sidebar-item-active" : ""}`}
            onClick={() => { closeSidebar(); navigate("/all-projects"); }}
          >
            <FaFolderOpen style={{ marginRight: 10 }} /> All Projects
          </li>
          <li
            className={`hg-sidebar-item${location.pathname === "/profile" ? " hg-sidebar-item-active" : ""}`}
            onClick={() => { closeSidebar(); navigate("/profile"); }}
          >
            <FaUser style={{ marginRight: 10 }} /> My Profile
          </li>

          {isAdmin && (
            <li
              className={`hg-sidebar-item${location.pathname === "/dashboard" ? " hg-sidebar-item-active" : ""}`}
              onClick={() => { closeSidebar(); navigate("/dashboard"); }}
            >
              Dashboard
            </li>
          )}

          {/* Divider */}
          <li style={{ height: 1, background: "rgb(185, 174, 167)", margin: "8px 0", listStyle: "none" }} />

          <li
            className="hg-sidebar-item"
            style={{ color: "rgb(180, 60, 60)" }}
            onClick={async () => { closeSidebar(); await logOut(); navigate("/"); }}
          >
            Log Out
          </li>
        </ul>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </>
  );
}

function SearchBar({ search, setSearch, filtersOpen, setFiltersOpen, hasActiveFilters }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAllProjects = location.pathname === "/all-projects";

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
        <button
          className="hg-filter-btn"
          onClick={() => setFiltersOpen((o) => !o)}
          style={{
            color: filtersOpen || hasActiveFilters ? "rgb(104, 68, 42)" : undefined,
            fontWeight: hasActiveFilters || filtersOpen ? 700 : undefined,
            background: filtersOpen ? "rgb(223, 205, 192)" : undefined,
            padding: "6px 14px",
            borderRadius: 50,
            border: `1.5px solid ${filtersOpen ? "rgb(164, 132, 109)" : "transparent"}`,
            transition: "all 0.2s",
          }}
        >
          <FaFilter className="hg-filter-icon" />
          Filters{hasActiveFilters ? " ●" : ""}
        </button>
      </div>
      <div className="hg-buttons-row">
        <button
          className={`hg-btn-outline${isAllProjects ? " hg-btn-outline-active" : ""}`}
          onClick={() => navigate("/all-projects")}
        >
          All Projects
        </button>
      </div>
    </div>
  );
}

function RecentProjects() {
  return (
    <section className="hg-section">
      <h2 className="hg-section-title">Recommended Projects</h2>
      <p className="hg-no-results">Recommendations coming soon.</p>
    </section>
  );
}

function ExploreTags({ selectedTag, onSelectTag }) {
  return (
    <section className="hg-section">
      <h2 className="hg-section-title">Explore by Tags</h2>
      <div className="hg-tags-grid">
        {exploreTags.map((tag) => (
          <div
            key={tag.label}
            className={`hg-tag-card${selectedTag === tag.label ? " hg-tag-card-active" : ""}`}
            onClick={() => onSelectTag(selectedTag === tag.label ? null : tag.label)}
          >
            <span className="hg-tag-icon">{tag.icon}</span>
            <span className="hg-tag-label">{tag.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TagProjects({ tag, bookmarkedIds, onToggleBookmark }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    getApproved().then((data) => {
      if (Array.isArray(data)) setProjects(data.filter((p) => {
        const t = p.tag || (p.tags && p.tags[0]) || "";
        return t.toLowerCase() === tag.toLowerCase();
      }));
      setLoading(false);
    });
  }, [tag]);

  return (
    <section className="hg-section">
      <h2 className="hg-section-title">{tag} Projects</h2>
      {loading
        ? <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
        : projects.length === 0
          ? <p className="hg-no-results">No projects found for "{tag}"</p>
          : (
            <div className="hg-projects-grid">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={setSelectedProject}
                  bookmarked={bookmarkedIds.includes(p.id)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          )
      }
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={bookmarkedIds.includes(selectedProject.id)}
          onToggleBookmark={() => onToggleBookmark(selectedProject.id)}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => setProjects((prev) => prev.filter(p => p.id !== id))}
        />
      )}
    </section>
  );
}

function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [user] = useAuthState(auth);

  const {
    search, setSearch, filters, updateFilter, toggleArrayFilter,
    clearFilters, hasActiveFilters, isSearchOrFilter, allStacks, filtered,
  } = useFilters(allProjects);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === "admin"));
      getBookmarks(user.uid).then((ids) => { if (Array.isArray(ids)) setBookmarkedIds(ids); });
    }
  }, [user]);

  useEffect(() => {
    getApproved().then((data) => {
      if (Array.isArray(data)) setAllProjects(data);
      setLoadingProjects(false);
    });
  }, []);

  const toggleBookmark = async (id) => {
    if (!user) return;
    if (bookmarkedIds.includes(id)) {
      await removeBookmark(user.uid, id);
      setBookmarkedIds((prev) => prev.filter(b => b !== id));
    } else {
      await addBookmark(user.uid, id);
      setBookmarkedIds((prev) => [...prev, id]);
      await notifyBookmark(id, user.uid);
    }
  };

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <SearchBar
          search={search}
          setSearch={setSearch}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          hasActiveFilters={hasActiveFilters}
        />
        <FilterPanel
          open={filtersOpen}
          filters={filters}
          updateFilter={updateFilter}
          toggleArrayFilter={toggleArrayFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          allStacks={allStacks}
        />

        {isSearchOrFilter ? (
          <section className="hg-section">
            <h2 className="hg-section-title">
              {search.trim() ? `Results for "${search}"` : "Filtered Projects"}
            </h2>
            {loadingProjects ? (
              <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
            ) : filtered.length > 0 ? (
              <div className="hg-projects-grid">
                {filtered.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onOpen={setSelectedProject}
                    bookmarked={bookmarkedIds.includes(p.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <p className="hg-no-results">
                No projects found{search.trim() ? ` for "${search}"` : ""}
              </p>
            )}
          </section>
        ) : (
          <>
            <RecentProjects />
            <ExploreTags selectedTag={selectedTag} onSelectTag={setSelectedTag} />
            {selectedTag && (
              <TagProjects
                tag={selectedTag}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
              />
            )}
          </>
        )}
      </main>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={bookmarkedIds.includes(selectedProject.id)}
          onToggleBookmark={() => toggleBookmark(selectedProject.id)}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => {
            setAllProjects((prev) => prev.filter(p => p.id !== id));
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

export default Home;