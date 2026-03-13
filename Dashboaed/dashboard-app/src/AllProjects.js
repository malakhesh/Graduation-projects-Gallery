import React, { useState, useEffect } from "react";
import { getApproved, getPending } from "./projects.js";
import "./AllProjects.css";

function Projects({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    const fetchAll = async () => {
      // الـ backend عنده getApproved و getPending بس — بنجمعهم
      const [approved, pending] = await Promise.all([getApproved(), getPending()]);
      const approvedArr = Array.isArray(approved) ? approved : [];
      const pendingArr  = Array.isArray(pending)  ? pending  : [];
      setProjects([...approvedArr, ...pendingArr]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const pendingCount  = projects.filter((p) => p.status === "pending").length;
  const approvedCount = projects.filter((p) => p.status === "approved").length;
  const rejectedCount = projects.filter((p) => p.status === "rejected").length;

  const displayed = filter === "all"
    ? projects
    : projects.filter((p) => p.status === filter);

  return (
    <div className="pr-page">

      {/* Header */}
      <div className="pr-header">
        <button className="pr-back-btn" onClick={onBack}>← Back</button>
        <h1 className="pr-title">All Projects</h1>
        <div className="pr-stats">
          <span className="pr-stat pr-stat-total">📁 Total: {projects.length}</span>
          <span className="pr-stat pr-stat-pending">⏳ Pending: {pendingCount}</span>
          <span className="pr-stat pr-stat-approved">✅ Approved: {approvedCount}</span>
          <span className="pr-stat pr-stat-rejected">❌ Rejected: {rejectedCount}</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="pr-filter-row">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            className={`pr-filter-btn ${filter === f ? "pr-filter-active pr-filter-active-" + f : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all"      && "All"}
            {f === "pending"  && "⏳ Pending"}
            {f === "approved" && "✅ Approved"}
            {f === "rejected" && "❌ Rejected"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="pr-loading">
          <div className="pr-spinner" />
          <p>Loading projects...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="pr-empty">
          <p>No projects found.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && displayed.length > 0 && (
        <div className="pr-grid">
          {displayed.map((project) => {
            const status = project.status || "pending";
            return (
              <div key={project.id} className={`pr-card pr-card-${status}`}>

                <div className={`pr-badge pr-badge-${status}`}>
                  {status === "pending"  && "⏳ Pending"}
                  {status === "approved" && "✅ Approved"}
                  {status === "rejected" && "❌ Rejected"}
                </div>

                {(project.imgUrl || project.imageURL || project.image) && (
                  <div className="pr-img-wrapper">
                    <img
                      src={project.imgUrl || project.imageURL || project.image}
                      alt={project.title}
                      className="pr-img"
                    />
                  </div>
                )}

                <div className="pr-info">
                  <h3 className="pr-project-title">{project.title || "Untitled"}</h3>
                  <div className="pr-author-row">
                    <p className="pr-author-name">
                      👤 {project.author || project.authorName || project.userId || "Unknown"}
                    </p>
                    {project.createdAt && (
                      <p className="pr-author-date">
                        🗓 {project.createdAt?.toDate
                          ? project.createdAt.toDate().toLocaleDateString()
                          : project.createdAt}
                      </p>
                    )}
                  </div>
                  {project.desc && (
                    <p className="pr-description">{project.desc}</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;