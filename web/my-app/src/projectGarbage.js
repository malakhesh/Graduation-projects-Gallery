import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole, getBookmarks, addBookmark, removeBookmark } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar, ProjectCard, ProjectModal } from './home.js';
import { getApproved } from './projects.js';
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

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

function AllProjects() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === "admin"));
      getBookmarks(user.uid).then((ids) => {
        if (Array.isArray(ids)) setBookmarkedIds(ids);
      });
    }
  }, [user]);

  useEffect(() => {
    getApproved().then((data) => {
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter((p) => {
    const tag = p.tag || (p.tags && p.tags[0]) || "";
    const author = p.author || p.userId || "";
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      author.toLowerCase().includes(search.toLowerCase()) ||
      tag.toLowerCase().includes(search.toLowerCase())
    );
  });

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
        <section className="hg-section">
          <h2 className="hg-section-title">All Projects</h2>
          {loading ? (
            <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
          ) : (
            <div className="hg-projects-grid">
              {filtered.length > 0
                ? filtered.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={setSelectedProject}
                      bookmarked={bookmarkedIds.includes(p.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))
                : <p className="hg-no-results">No projects found{search ? ` for "${search}"` : ""}</p>
              }
            </div>
          )}
        </section>
      </main>
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={bookmarkedIds.includes(selectedProject.id)}
          onToggleBookmark={() => toggleBookmark(selectedProject.id)}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => setProjects((prev) => prev.filter(p => p.id !== id))}
        />
      )}
    </div>
  );
}

export default AllProjects;