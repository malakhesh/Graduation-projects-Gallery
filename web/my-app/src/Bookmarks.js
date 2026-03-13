import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole, getBookmarks, addBookmark, removeBookmark } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar } from './home.js';
import EmptyBookmarks from "./EmptyBookmarks.js";
import { getProj } from './projects.js';
import { FaUser, FaBookmark, FaRegBookmark } from "react-icons/fa";

function BookmarkCard({ project, onRemove }) {
  const image = project.image || project.imgUrl;
  const author = project.author || project.userId;
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const tag = project.tag || (project.tags && project.tags[0]) || "";

  return (
    <div className="hg-project-card">
      <div className="hg-card-header">
        <div className="hg-card-title-row">
          <h3 className="hg-card-title">{project.title}</h3>
          <button
            className="hg-card-bookmark hg-card-bookmark-active"
            onClick={() => onRemove(project.id)}
            title="Remove bookmark"
          >
            <FaBookmark />
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

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));

      // Fetch bookmark IDs then fetch each project
      getBookmarks(user.uid).then(async (ids) => {
        if (!Array.isArray(ids)) { setLoading(false); return; }
        const projects = await Promise.all(ids.map((id) => getProj(id)));
        const valid = projects.filter((p) => p && p !== "no-proj" && p !== "get-fail");
        // getProj returns data without id, so attach id
        const withIds = valid.map((p, i) => ({ ...p, id: ids[i] }));
        setBookmarks(withIds);
        setLoading(false);
      });
    }
  }, [user]);

  const handleRemove = async (projectId) => {
    await removeBookmark(user.uid, projectId);
    setBookmarks((prev) => prev.filter((p) => p.id !== projectId));
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
                <BookmarkCard key={project.id} project={project} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Bookmarks;