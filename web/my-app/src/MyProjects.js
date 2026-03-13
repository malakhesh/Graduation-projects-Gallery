import React, { useState, useEffect } from "react";
import "./home.css";
import { checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navbar, ProjectModal } from './home.js';
import EmptyProjects from './EmptyProjects';
import { getUserProjs } from './projects.js';
import { FaGithub } from "react-icons/fa";

const STATUS_STYLES = {
  pending:  { background: "rgb(255, 243, 205)", color: "rgb(133, 100, 4)",   border: "1px solid rgb(255, 224, 102)" },
  approved: { background: "rgb(212, 237, 218)", color: "rgb(21,  87,  36)",  border: "1px solid rgb(195, 230, 203)" },
  rejected: { background: "rgb(248, 215, 218)", color: "rgb(114, 28,  36)",  border: "1px solid rgb(245, 198, 203)" },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      ...style,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "capitalize",
      display: "inline-block",
    }}>
      {status}
    </span>
  );
}

function MyProjectCard({ project, onOpen }) {
  const image = project.image || project.imgUrl;
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const github = project.github || project.gitLink;

  return (
    <div className="hg-project-card" onClick={() => onOpen(project)}>
      <div className="hg-card-header">
        <div className="hg-card-title-row">
          <h3 className="hg-card-title">{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>
        <p className="hg-author-date" style={{ marginTop: 4 }}>{date}</p>
      </div>
      <div className="hg-card-image-wrapper">
        <img src={image} alt={project.title} className="hg-card-image" />
      </div>
      <div className="hg-card-footer" style={{ justifyContent: "space-between" }}>
        <span className="hg-tag hg-tag-brown">{tag}</span>
        {github && (
          <a href={github} target="_blank" rel="noreferrer"
            style={{ fontSize: 16, color: "rgb(104, 68, 42)" }}
            onClick={e => e.stopPropagation()}
          >
            <FaGithub />
          </a>
        )}
      </div>
      {project.status === "rejected" && (
        <div style={{
          padding: "8px 14px",
          background: "rgb(248, 215, 218)",
          borderTop: "1px solid rgb(245, 198, 203)",
          fontSize: 12,
          color: "rgb(114, 28, 36)",
        }}>
          Your project was rejected. Please review and resubmit.
        </div>
      )}
    </div>
  );
}

function MyProjects() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      checkRole(user.uid).then((role) => setIsAdmin(role === 'admin'));
      getUserProjs(user.uid).then((data) => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      });
    }
  }, [user]);

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
                <MyProjectCard key={p.id} project={p} onOpen={setSelectedProject} />
              ))}
            </div>
          )}
        </section>
      </main>
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          bookmarked={false}
          onToggleBookmark={() => {}}
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