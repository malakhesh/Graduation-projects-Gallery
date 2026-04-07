import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProj } from "./projects.js";
import { ProjectModal } from "./ProjectCard.js";
import { auth } from "./firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { addBookmark, removeBookmark, getBookmarks } from "./auth.js";
import { Navbar } from "./home.js";
import { checkRole } from "./auth.js";

function ProjectShare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    getProj(id).then((data) => {
      if (!data || data === "no-proj" || data === "get-fail") {
        setNotFound(true);
      } else {
        setProject(data);
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === "admin"));
      getBookmarks(user.uid).then((ids) => {
        if (Array.isArray(ids)) setBookmarkedIds(ids);
      });
    }
  }, [user]);

  const toggleBookmark = async (pid) => {
    if (!user) return;
    if (bookmarkedIds.includes(pid)) {
      await removeBookmark(user.uid, pid);
      setBookmarkedIds((prev) => prev.filter((b) => b !== pid));
    } else {
      await addBookmark(user.uid, pid);
      setBookmarkedIds((prev) => [...prev, pid]);
    }
  };

  if (loading) {
    return (
      <div className="hg-page">
        <Navbar isAdmin={isAdmin} />
        <div className="hg-spinner-wrapper" style={{ paddingTop: 100 }}>
          <div className="hg-spinner" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="hg-page">
        <Navbar isAdmin={isAdmin} />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 28, color: "rgb(47,28,15)", marginBottom: 12 }}>
            Project not found
          </h2>
          <p style={{ color: "rgb(104,68,42)", marginBottom: 24 }}>
            This project may have been deleted or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/home")}
            style={{
              background: "rgb(164,132,109)",
              color: "rgb(254,251,245)",
              border: "none",
              borderRadius: 20,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hg-page">
      <Navbar isAdmin={isAdmin} />
      <ProjectModal
        project={project}
        bookmarked={bookmarkedIds.includes(project.id)}
        onToggleBookmark={() => toggleBookmark(project.id)}
        onClose={() => navigate("/home")}
        onDelete={() => navigate("/home")}
      />
    </div>
  );
}

export default ProjectShare;