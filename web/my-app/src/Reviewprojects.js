import React, { useState, useEffect } from "react";
import { setStatus } from "./projects.js";
import { checkRole } from "./auth.js";
import { auth, db } from "./firebase.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import "./Reviewprojects.css";
import MagicBookEmpty from "./Magicbookempty.js" // ✅ fixed import position

function Reviewprojects({ onBack }) {
  const [allProjects, setAllProjects] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [userRole,    setUserRole]    = useState(null);
  const [filter,      setFilter]      = useState("pending");

  useEffect(() => {
    const init = async () => {
      const uid  = auth.currentUser?.uid;
      const role = uid ? await checkRole(uid) : null;
      setUserRole(role);

      const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
        getDocs(query(collection(db, "projects"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "projects"), where("status", "==", "approved"))),
        getDocs(query(collection(db, "projects"), where("status", "==", "rejected"))),
      ]);

      const arr = [];
      pendingSnap.forEach((d)  => arr.push({ id: d.id, ...d.data() }));
      approvedSnap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      rejectedSnap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setAllProjects(arr);
      setLoading(false);
    };
    init();
  }, []);

  const handleStatus = async (id, newStatus) => {
    const result = await setStatus(id, newStatus, userRole);
    if (result === "status-ok") {
      setAllProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    }
  };

  const pendingList  = allProjects.filter((p) => p.status === "pending");
  const approvedList = allProjects.filter((p) => p.status === "approved");
  const rejectedList = allProjects.filter((p) => p.status === "rejected");

  const displayed =
    filter === "pending"  ? pendingList  :
    filter === "approved" ? approvedList :
    rejectedList;

  return (
    <div className="rp-page">

      <div className="rp-header">
        <button className="rp-back-btn" onClick={onBack}>← Back</button>
        <h1 className="rp-title">Projects to Review</h1>
        <div className="rp-stats">
          <span className="rp-stat rp-stat-pending">⏳ Pending: {pendingList.length}</span>
          <span className="rp-stat rp-stat-approved">✅ Approved: {approvedList.length}</span>
          <span className="rp-stat rp-stat-rejected">❌ Rejected: {rejectedList.length}</span>
        </div>
      </div>

      <div className="rp-filter-row">
        <button
          className={`rp-filter-btn ${filter === "pending" ? "rp-filter-active rp-filter-active-pending" : ""}`}
          onClick={() => setFilter("pending")}
        >⏳ Pending</button>
        <button
          className={`rp-filter-btn ${filter === "approved" ? "rp-filter-active rp-filter-active-approved" : ""}`}
          onClick={() => setFilter("approved")}
        >✅ Approved</button>
        <button
          className={`rp-filter-btn ${filter === "rejected" ? "rp-filter-active rp-filter-active-rejected" : ""}`}
          onClick={() => setFilter("rejected")}
        >❌ Rejected</button>
      </div>

      {loading && (
        <div className="rp-loading">
          <div className="rp-spinner" />
          <p>Loading projects...</p>
        </div>
      )}

      {!loading && userRole !== "admin" && (
        <div className="rp-empty">
          <p>⛔ You don't have permission to review projects.</p>
        </div>
      )}

      {!loading && userRole === "admin" && displayed.length === 0 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "60vh",
        }}>
          {filter === "pending" && (
            <MagicBookEmpty
              leftText={"Pending Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nNo projects are\nawaiting review.\n\nThe queue stands\nquite empty.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              rightText={"Observations:\n\n\u201cNo pending work\nto be done.\n\nAll submissions\nhave been handled.\n\nThe admin may rest\nand take their tea.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              caption="— no pending projects —"
            />
          )}
          {filter === "approved" && (
            <MagicBookEmpty
              leftText={"Approved Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nNo projects have\nbeen approved yet.\n\nThe list remains\nquite bare.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              rightText={"Observations:\n\n\u201cNo approvals\nrecorded herein.\n\nAwaiting worthy\nsubmissions.\n\nThe admin shall\nreview in time.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              caption="— no approved projects —"
            />
          )}
          {filter === "rejected" && (
            <MagicBookEmpty
              leftText={"Rejected Log\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\n\nDate: Today\n\nNo projects have\nbeen rejected.\n\nAll stands well\nin the registry.\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              rightText={"Observations:\n\n\u201cNo rejections\nfound herein.\n\nAll submissions\nmet the standard.\n\nThe admin may rest\nand take their tea.\u201d\n\n\u2014 The Registry\n\n\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015\u2015"}
              caption="— no rejected projects —"
            />
          )}
        </div>
      )}

      {!loading && userRole === "admin" && displayed.length > 0 && (
        <div className="rp-grid">
          {displayed.map((project) => {
            const status = project.status || "pending";
            return (
              <div key={project.id} className={`rp-card rp-card-${status}`}>

                <div className={`rp-badge rp-badge-${status}`}>
                  {status === "pending"  && "⏳ Pending"}
                  {status === "approved" && "✅ Approved"}
                  {status === "rejected" && "❌ Rejected"}
                </div>

                {(project.imgUrl || project.imageURL || project.image) && (
                  <div className="rp-img-wrapper">
                    <img
                      src={project.imgUrl || project.imageURL || project.image}
                      alt={project.title}
                      className="rp-img"
                    />
                  </div>
                )}

                <div className="rp-info">
                  <h3 className="rp-project-title">{project.title || "Untitled"}</h3>
                  <div className="rp-author-row">
                    <div>
                      <p className="rp-author-name">
                        👤 {project.author || project.authorName || project.userId || "Unknown"}
                      </p>
                      {project.createdAt && (
                        <p className="rp-author-date">
                          🗓 {project.createdAt?.toDate
                            ? project.createdAt.toDate().toLocaleDateString()
                            : project.createdAt}
                        </p>
                      )}
                    </div>
                  </div>
                  {project.desc     && <p className="rp-description">{project.desc}</p>}
                  {project.stack    && <p className="rp-description">🛠 {project.stack}</p>}
                  {project.gitLink  && (
                    <a href={project.gitLink} target="_blank" rel="noreferrer"
                      style={{ fontSize: "12px", color: "#6F4E37", fontWeight: "600" }}>
                      🔗 GitHub
                    </a>
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

                {status === "approved" && (
                  <div className="rp-actions">
                    <button className="rp-btn-undo" onClick={() => handleStatus(project.id, "pending")}>
                      ↩ Undo
                    </button>
                    <button className="rp-btn-reject" onClick={() => handleStatus(project.id, "rejected")}>
                      ❌ Reject
                    </button>
                  </div>
                )}

                {status === "rejected" && (
                  <div className="rp-actions">
                    <button className="rp-btn-undo" onClick={() => handleStatus(project.id, "pending")}>
                      ↩ Undo
                    </button>
                    <button className="rp-btn-approve" onClick={() => handleStatus(project.id, "approved")}>
                      ✅ Approve
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