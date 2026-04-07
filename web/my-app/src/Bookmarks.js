import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole, getBookmarks, removeBookmark, addBookmark } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import { ProjectCard, ProjectModal } from './ProjectCard.js';
import EmptyBookmarks from "./EmptyBookmarks.js";
import { getProj } from './projects.js';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
      getBookmarks(user.uid).then(async (ids) => {
        if (!Array.isArray(ids)) { setLoading(false); return; }
        const projects = await Promise.all(ids.map((id) => getProj(id)));
        const valid = projects.filter((p) => p && p !== "no-proj" && p !== "get-fail");
        const withIds = valid.map((p, i) => ({ ...p, id: ids[i] }));
        setBookmarks(withIds);
        setLoading(false);
      });
    }
  }, [user]);

  const toggleBookmark = async (id) => {
    if (!user) return;
    if (bookmarks.find(b => b.id === id)) {
      await removeBookmark(user.uid, id);
      setBookmarks((prev) => prev.filter((p) => p.id !== id));
    } else {
      await addBookmark(user.uid, id);
    }
  };

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <main className="hg-main-content">
        <section className="hg-section">
          <h2 className="hg-section-title">Bookmarks</h2>
          {loading ? (
            <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
          ) : bookmarks.length === 0 ? (
            <EmptyBookmarks />
          ) : (
            <div className="hg-projects-grid">
              {bookmarks.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={setSelectedProject}
                  bookmarked={true}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={true}
          onToggleBookmark={() => toggleBookmark(selectedProject.id)}
          onClose={() => setSelectedProject(null)}
          onDelete={(id) => setBookmarks((prev) => prev.filter(p => p.id !== id))}
        />
      )}
    </div>
  );
}

export default Bookmarks;