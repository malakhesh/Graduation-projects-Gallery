import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole, getBookmarks, addBookmark, removeBookmark } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import { ProjectCard, ProjectModal } from './ProjectCard.js';
import { FilterPanel } from './FilterPanel.js';
import { useFilters } from './useFilters.js';
import { getApproved, notifyBookmark } from './projects.js';
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

function SearchBar({ search, setSearch, filtersOpen, setFiltersOpen, hasActiveFilters }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAllProjects = location.pathname === "/all-projects";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
              color: filtersOpen ? "rgb(104, 68, 42)" : hasActiveFilters ? "rgb(104, 68, 42)" : undefined,
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
          >All Projects</button>
        </div>
      </div>
    </div>
  );
}

function AllProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [user] = useAuthState(auth);

  const { search, setSearch, filters, updateFilter, toggleArrayFilter, clearFilters, hasActiveFilters, isSearchOrFilter, allStacks, filtered } = useFilters(projects);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === "admin"));
      getBookmarks(user.uid).then((ids) => { if (Array.isArray(ids)) setBookmarkedIds(ids); });
    }
  }, [user]);

  useEffect(() => {
    getApproved().then((data) => {
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
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
        <section className="hg-section">
          <h2 className="hg-section-title">
            {search.trim() ? `Results for "${search}"` : hasActiveFilters ? "Filtered Projects" : "All Projects"}
          </h2>
          {loading ? (
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
            <p className="hg-no-results">No projects found{search.trim() ? ` for "${search}"` : ""}</p>
          )}
        </section>
      </main>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={bookmarkedIds.includes(selectedProject.id)}
          onToggleBookmark={() => toggleBookmark(selectedProject.id)}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => {
            setProjects((prev) => prev.filter(p => p.id !== id));
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

export default AllProjects;