import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UploadModal from './UploadModal';
import "./home.css";
import { logOut, checkRole, getUser, addBookmark, removeBookmark, getBookmarks } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getApproved, addComment, addRate, delProj } from './projects.js';
import { FaGraduationCap, FaUser, FaBell, FaSearch, FaFilter, FaChevronDown, FaBookOpen, FaBookmark, FaRegBookmark, FaFolderOpen, FaBriefcase, FaShoppingCart, FaFilm, FaNewspaper, FaBars, FaTimes, FaGithub, FaStar, FaRegStar, FaArrowLeft, FaEnvelope, FaProjectDiagram, FaLinkedin, FaGlobe } from "react-icons/fa";

const exploreTags = [
  { label: "Business", icon: <FaBriefcase /> },
  { label: "Education", icon: <FaBookOpen /> },
  { label: "E-commerce", icon: <FaShoppingCart /> },
  { label: "Entertainment", icon: <FaFilm /> },
  { label: "Blog", icon: <FaNewspaper /> },
];

function AdminSidebar({ open, onClose, onNavigate }) {
  return (
    <>
      {open && <div className="hg-sidebar-overlay" onClick={onClose} />}
      <aside className={`hg-admin-sidebar ${open ? "hg-sidebar-open" : ""}`}>
        <div className="hg-sidebar-header">
          <Link to="/dashboard" className="hg-sidebar-title">DASHBOARD</Link>
        </div>
        <ul className="hg-sidebar-links">
          {["WEBSITE VIEW", "ALL PROJECTS", "USERS", "SETTINGS"].map((item) => (
            <li key={item} className="hg-sidebar-item">{item}</li>
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => { await logOut(); navigate("/"); };

  return (
    <>
      <nav className="hg-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAdmin && <button className="hg-hamburger" onClick={() => setSidebarOpen(true)}><FaBars /></button>}
          <Link to="/home" className="hg-navbar-logo">
            <FaGraduationCap className="hg-logo-icon" />
            <span className="hg-logo-text"><strong>Graduation</strong> Gallery</span>
          </Link>
        </div>
        <div className="hg-navbar-links">
          <Link to="/projects" className={`hg-nav-link${location.pathname === "/projects" ? " hg-nav-link-active" : ""}`}>
            <FaFolderOpen className="hg-nav-icon" /> My Projects
          </Link>
          <Link to="/bookmarks" className={`hg-nav-link${location.pathname === "/bookmarks" ? " hg-nav-link-active" : ""}`}>
            <FaBookmark className="hg-nav-icon" /> Bookmarks
          </Link>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button className={`hg-nav-link${notifOpen ? " hg-nav-link-active" : ""}`} onClick={() => setNotifOpen(!notifOpen)}>
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
              <div className="hg-user-avatar-placeholder"><FaUser className="hg-user-avatar-icon" /></div>
            )}
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
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={(path) => { setSidebarOpen(false); navigate(path); }} />
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

export function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="hg-stars">
      {[1,2,3,4,5].map((s) => (
        <span key={s}
          className="hg-star"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          {s <= (hovered || value) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
}

export function AuthorCard({ project, onBack }) {
  const [authorData, setAuthorData] = useState(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") setAuthorData(data);
        setLoadingAuthor(false);
      });
    } else {
      setLoadingAuthor(false);
    }
  }, [project]);

  const name = authorData?.name || project.author || "Unknown";
  const bio = authorData?.bio || project.authorBio || "";
  const year = authorData?.year || project.authorYear || "";
  const email = authorData?.email || project.authorEmail || "";
  const github = authorData?.socialLinks?.github || "";
  const linkedin = authorData?.socialLinks?.linkedin || "";
  const portfolio = authorData?.socialLinks?.portfolio || "";
  const avatar = project.avatar || null;

  return (
    <div className="hg-author-card">
      <button className="hg-author-back" onClick={onBack}><FaArrowLeft /> Back to project</button>
      {loadingAuthor ? (
        <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
      ) : (
        <div className="hg-author-card-body">
          {avatar
            ? <img src={avatar} alt={name} className="hg-author-card-avatar" />
            : <div className="hg-user-avatar-placeholder" style={{ width: 90, height: 90 }}><FaUser style={{ fontSize: 36 }} /></div>
          }
          <h2 className="hg-author-card-name">{name}</h2>
          {year && <p className="hg-author-card-year">Class of {year}</p>}
          {bio && <div className="hg-author-card-bio"><p>{bio}</p></div>}
          <div className="hg-author-card-details">
            {email && <div className="hg-author-card-detail"><FaEnvelope /> {email}</div>}
            {github && <div className="hg-author-card-detail"><FaGithub /> <a href={github} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{github}</a></div>}
            {linkedin && <div className="hg-author-card-detail"><FaLinkedin /> <a href={linkedin} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{linkedin}</a></div>}
            {portfolio && <div className="hg-author-card-detail"><FaGlobe /> <a href={portfolio} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{portfolio}</a></div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectModal({ project, bookmarked, onToggleBookmark, onClose, onDelete }) {
  const [view, setView] = useState("project");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(project.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) checkRole(user.uid).then(setUserRole);
  }, [user]);

  const isOwner = user && project.userId === user.uid;
  const isAdmin = userRole === "admin";
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await delProj(project.id);
    onClose();
    if (onDelete) onDelete(project.id);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    const newComment = {
      text: comment,
      rating,
      date: new Date().toLocaleDateString(),
      userId: user?.uid || "anonymous",
    };
    if (rating > 0) await addRate(project.id, rating);
    await addComment(project.id, newComment);
    setComments([...comments, newComment]);
    setComment("");
    setRating(0);
    setSubmittingComment(false);
  };

  // Normalize fields from both mock and real Firestore data
  const title = project.title;
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const image = project.image || project.imgUrl;
  const avatar = project.avatar || null;
  const author = project.author || project.userId;
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const description = project.description || project.desc;
  const github = project.github || project.gitLink;

  return createPortal(
    <div className="hg-pm-overlay" onClick={onClose}>
      <div className="hg-pm" onClick={(e) => e.stopPropagation()}>
        <button className="hg-pm-close" onClick={onClose}><FaTimes /></button>

        {view === "author" ? (
          <AuthorCard project={{ ...project, author, avatar }} onBack={() => setView("project")} />
        ) : (
          <>
            <div className="hg-pm-image-wrap">
              <img src={image} alt={title} className="hg-pm-image" />
              <div className="hg-pm-image-overlay">
                <h2 className="hg-pm-title">{title}</h2>
                <span className="hg-pm-tag">{tag}</span>
              </div>
            </div>

            <div className="hg-pm-body">
              <div className="hg-pm-author-row" onClick={() => setView("author")}>
                {avatar
                  ? <img src={avatar} alt={author} className="hg-pm-author-avatar" />
                  : <div className="hg-user-avatar-placeholder"><FaUser className="hg-user-avatar-icon" /></div>
                }
                <div>
                  <p className="hg-pm-author-name">{author}</p>
                  <p className="hg-pm-author-date">{date}</p>
                </div>
                <span className="hg-pm-author-hint">View profile →</span>
              </div>

              <p className="hg-pm-description">{description}</p>

              <div className="hg-pm-actions">
                <a href={github} target="_blank" rel="noreferrer" className="hg-pm-github-btn">
                  <FaGithub /> View on GitHub
                </a>
                {canDelete && (
                  <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        background: confirming ? "rgb(180, 60, 40)" : "none",
                        border: `1.5px solid ${confirming ? "rgb(180, 60, 40)" : "rgb(185, 174, 167)"}`,
                        borderRadius: 20,
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        color: confirming ? "white" : "rgb(180, 60, 40)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      {deleting ? "Deleting..." : confirming ? "Confirm delete?" : "Delete"}
                    </button>
                    {confirming && !deleting && (
                      <button
                        onClick={() => setConfirming(false)}
                        style={{
                          background: "none",
                          border: "1.5px solid rgb(185, 174, 167)",
                          borderRadius: 20,
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "rgb(104, 68, 42)",
                          cursor: "pointer",
                          fontFamily: "Arial, Helvetica, sans-serif",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="hg-pm-divider" />

              <div className="hg-pm-comment-section">
                <h4 className="hg-pm-comment-title">Rate & Comment</h4>
                <StarRating value={rating} onChange={setRating} />
                <textarea
                  className="hg-pm-textarea"
                  placeholder="Share your thoughts on this project..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <button className="hg-pm-submit-btn" onClick={handleComment} disabled={submittingComment}>{submittingComment ? "Posting..." : "Post Comment"}</button>
              </div>

              {comments.length > 0 && (
                <div className="hg-pm-comments-list">
                  {comments.map((c, i) => (
                    <div key={i} className="hg-pm-comment">
                      <div className="hg-pm-comment-header">
                        <div className="hg-pm-comment-stars">
                          {[1,2,3,4,5].map(s => s <= c.rating
                            ? <FaStar key={s} className="hg-comment-star" />
                            : <FaRegStar key={s} className="hg-comment-star" />
                          )}
                        </div>
                        <span className="hg-pm-comment-date">{c.date}</span>
                      </div>
                      <p className="hg-pm-comment-text">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  , document.body);
}

export function ProjectCard({ project, onOpen, bookmarked, onToggleBookmark }) {
  const handleBookmark = (e) => {
    e.stopPropagation();
    onToggleBookmark(project.id);
  };

  const image = project.image || project.imgUrl;
  const author = project.author || project.userId;
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const tag = project.tag || (project.tags && project.tags[0]) || "";

  return (
    <div className="hg-project-card" onClick={() => onOpen(project)}>
      <div className="hg-card-header">
        <div className="hg-card-title-row">
          <h3 className="hg-card-title">{project.title}</h3>
          <button className={`hg-card-bookmark${bookmarked ? " hg-card-bookmark-active" : ""}`} onClick={handleBookmark}>
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
        <div className="hg-card-author">
          {project.avatar
            ? <img src={project.avatar} alt={author} className="hg-author-avatar" />
            : <div className="hg-user-avatar-placeholder" style={{ width: 30, height: 30 }}><FaUser style={{ fontSize: 13 }} /></div>
          }
          <div>
            <p className="hg-author-name">{author}</p>
            <p className="hg-author-date">{date}</p>
          </div>
        </div>
      </div>
      <div className="hg-card-image-wrapper">
        <img src={image} alt={project.title} className="hg-card-image" />
      </div>
      <div className="hg-card-footer">
        <span className="hg-tag hg-tag-brown">{tag}</span>
      </div>
    </div>
  );
}

function SearchBar({ search, setSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAllProjects = location.pathname === "/all-projects";

  return (
    <div className="hg-search-wrapper">
      <div className="hg-search-bar">
        <FaSearch className="hg-search-icon" />
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="hg-search-input" />
        <div className="hg-search-divider" />
        <button className="hg-filter-btn"><FaFilter className="hg-filter-icon" /> Filters</button>
      </div>
      <div className="hg-buttons-row">
        <button
          className={`hg-btn-outline${isAllProjects ? " hg-btn-outline-active" : ""}`}
          onClick={() => navigate("/all-projects")}
        >All Projects</button>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>;
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
      if (Array.isArray(data)) {
        const filtered = data.filter((p) => {
          const t = p.tag || (p.tags && p.tags[0]) || "";
          return t.toLowerCase() === tag.toLowerCase();
        });
        setProjects(filtered);
      }
      setLoading(false);
    });
  }, [tag]);

  return (
    <section className="hg-section">
      <h2 className="hg-section-title">{tag} Projects</h2>
      {loading ? (
        <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
      ) : projects.length === 0 ? (
        <p className="hg-no-results">No projects found for "{tag}"</p>
      ) : (
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
      )}
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
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === "admin"));
      getBookmarks(user.uid).then((ids) => {
        if (Array.isArray(ids)) setBookmarkedIds(ids);
      });
    }
  }, [user]);

  const toggleBookmark = async (id) => {
    if (!user) return;
    if (bookmarkedIds.includes(id)) {
      await removeBookmark(user.uid, id);
      setBookmarkedIds((prev) => prev.filter(b => b !== id));
    } else {
      await addBookmark(user.uid, id);
      setBookmarkedIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <SearchBar search={search} setSearch={setSearch} />
        <RecentProjects />
        <ExploreTags selectedTag={selectedTag} onSelectTag={setSelectedTag} />
        {selectedTag && (
          <TagProjects
            tag={selectedTag}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </main>
    </div>
  );
}

export default Home;