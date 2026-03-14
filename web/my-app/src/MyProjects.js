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

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <section className="hg-section">
          <h2 className="hg-section-title">My Projects</h2>
          {loading ? (
            <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
          ) : projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <div className="hg-projects-grid">
              {projects.map((p) => (
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