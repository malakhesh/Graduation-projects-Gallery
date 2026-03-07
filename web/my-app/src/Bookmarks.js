import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import EmptyBookmarks from "./EmptyBookmarks.js";

const mockBookmarks = [];

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
      <img src={project.image} alt={project.title} className="hg-card-image" />
      <div className="hg-card-tags">
        {project.tags.map((tag, i) => (
          <span key={tag} className={`hg-tag ${project.tagClass[i]}`}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
    }
  }, [user]);

  useEffect(() => {
    setTimeout(() => {
      setBookmarks(mockBookmarks);
      setLoading(false);
    }, 400);
  }, []);

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
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Bookmarks;