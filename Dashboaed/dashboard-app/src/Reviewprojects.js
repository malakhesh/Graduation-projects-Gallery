import React, { useState, useEffect } from "react";
import { getAllProjects, updateProjectStatus } from "./projects.js";
import "./Reviewprojects.css";

function Reviewprojects({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllProjects();
      setProjects(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleStatus = async (id, newStatus) => {
    await updateProjectStatus(id, newStatus);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const pending  = projects.filter((p) => !p.status || p.status === "pending").length;
  const approved = projects.filter((p) => p.status === "approved").length;
  const rejected = projects.filter((p) => p.status === "rejected").length;

  return (
    <div className="rp-page">

      <div className="rp-header">
        <button className="rp-back-btn" onClick={onBack}>← Back</button>
        <h1 className="rp-title">Projects to Review</h1>
        <div className="rp-stats">
          <span className="rp-stat rp-stat-pending">⏳ Pending: {pending}</span>
          <span className="rp-stat rp-stat-approved">✅ Approved: {approved}</span>
          <span className="rp-stat rp-stat-rejected">❌ Rejected: {rejected}</span>
        </div>
      </div>

      {loading && (
        <div className="rp-loading">
          <div className="rp-spinner" />
          <p>Loading projects...</p>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rp-empty">
          <p>No projects found.</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="rp-grid">
          {projects.map((project) => {
            const status = project.status || "pending";
            return (
              <div key={project.id} className={`rp-card rp-card-${status}`}>

                <div className={`rp-badge rp-badge-${status}`}>
                  {status === "pending"  && "⏳ Pending"}
                  {status === "approved" && "✅ Approved"}
                  {status === "rejected" && "❌ Rejected"}
                </div>

                {(project.imageURL || project.image) && (
                  <div className="rp-img-wrapper">
                    <img
                      src={project.imageURL || project.image}
                      alt={project.title}
                      className="rp-img"
                    />
                  </div>
                )}

                <div className="rp-info">
                  <h3 className="rp-project-title">{project.title || "Untitled"}</h3>
                  <div className="rp-author-row">
                    {project.authorAvatar && (
                      <img src={project.authorAvatar} alt="avatar" className="rp-avatar" />
                    )}
                    <div>
                      <p className="rp-author-name">
                        {project.author || project.authorName || "Unknown"}
                      </p>
                      {project.createdAt && (
                        <p className="rp-author-date">
                          {project.createdAt?.toDate
                            ? project.createdAt.toDate().toLocaleDateString()
                            : project.createdAt}
                        </p>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="rp-description">{project.description}</p>
                  )}
                </div>

                {status === "pending" && (
                  <div className="rp-actions">
                    <button className="rp-btn-approve" onClick={() => handleStatus(project.id, "approved")}>
                      ✅ Approve
                    </button>
                    <button className="rp-btn-reject" onClick={() => handleStatus(project.id, "rejected")}>
                      ❌ Reject
                    </button>
                  </div>
                )}

                {status !== "pending" && (
                  <div className="rp-actions">
                    <button className="rp-btn-undo" onClick={() => handleStatus(project.id, "pending")}>
                      ↩ Undo
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reviewprojects;