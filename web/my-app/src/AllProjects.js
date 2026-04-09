import React, { useState, useEffect } from "react";
import { getApproved, getPending, getRejected } from "./projects.js";
import "./AllProjects.css";

function Projects({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      const [approved, pending, rejected] = await Promise.all([
        getApproved(),
        getPending(),
        getRejected(),
      ]);
      const approvedArr = Array.isArray(approved) ? approved : [];
      const pendingArr  = Array.isArray(pending)  ? pending  : [];
      const rejectedArr = Array.isArray(rejected) ? rejected : [];
      setProjects([...approvedArr, ...pendingArr, ...rejectedArr]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const pendingCount  = projects.filter((p) => p.status === "pending").length;
  const approvedCount = projects.filter((p) => p.status === "approved").length;
  const rejectedCount = projects.filter((p) => p.status === "rejected").length;

  const displayed = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.title       || "").toLowerCase().includes(q) ||
        (p.desc        || "").toLowerCase().includes(q) ||
        (p.author      || "").toLowerCase().includes(q) ||
        (p.authorName  || "").toLowerCase().includes(q) ||
        (p.userId      || "").toLowerCase().includes(q) ||
        (p.category    || "").toLowerCase().includes(q) ||
        (Array.isArray(p.tags)  && p.tags.some((t)  => t.toLowerCase().includes(q))) ||
        (Array.isArray(p.stack) && p.stack.some((s) => s.toLowerCase().includes(q)))
      );
    });

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

      {/* Search Bar */}
      <div className="pr-search-wrapper">
        <span className="pr-search-icon">🔍</span>
        <input
          className="pr-search-input"
          type="text"
          placeholder="Search by title, author, category, tag, or stack…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="pr-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
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
          <p>{search ? `No results for "${search}"` : "No projects found."}</p>
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