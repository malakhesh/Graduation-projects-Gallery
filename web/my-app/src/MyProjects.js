import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole, getBookmarks, addBookmark, removeBookmark } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import { ProjectCard, ProjectModal } from './ProjectCard.js';
import EmptyProjects from './EmptyProjects';
import { getUserProjs } from './projects.js';

function MyProjects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
      getUserProjs(user.uid).then((data) => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      });
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

  const filtered = filter === "approved"
    ? projects.filter(p => p.status === "approved")
    : filter === "other"
    ? projects.filter(p => p.status !== "approved")
    : projects;

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <section className="hg-section">
          <h2 className="hg-section-title">My Projects</h2>

          {!loading && projects.length > 0 && (
            <div className="hg-tags-grid" style={{ marginBottom: 24 }}>
              {[
                { key: "all", label: "All" },
                { key: "approved", label: "Approved" },
                { key: "other", label: "Pending & Rejected" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`hg-tag-card${filter === key ? " hg-tag-card-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  <span className="hg-tag-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
          ) : projects.length === 0 ? (
            <EmptyProjects />
          ) : filtered.length === 0 ? (
            <p className="hg-no-results">No projects found for this filter.</p>
          ) : (
            <div className="hg-projects-grid">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={setSelectedProject}
                  bookmarked={bookmarkedIds.includes(p.id)}
                  onToggleBookmark={toggleBookmark}
                  showStatus={true}
                />
              ))}
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
          onDelete={(id) => {
            setProjects((prev) => prev.filter(p => p.id !== id));
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

export default MyProjects;