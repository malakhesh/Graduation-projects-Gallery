import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./home.css";
import { getUser, checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addComment, addRate, delProj } from './projects.js';
import {
  FaUser, FaBookmark, FaRegBookmark, FaGithub, FaStar, FaRegStar,
  FaTimes, FaArrowLeft, FaEnvelope, FaLinkedin, FaGlobe, FaGraduationCap
} from "react-icons/fa";

// ===========================
// STATUS BADGE
// ===========================
const STATUS_STYLES = {
  pending:  { background: "rgb(255, 243, 205)", color: "rgb(133, 100, 4)",  border: "1px solid rgb(255, 224, 102)" },
  approved: { background: "rgb(212, 237, 218)", color: "rgb(21, 87, 36)",   border: "1px solid rgb(195, 230, 203)" },
  rejected: { background: "rgb(248, 215, 218)", color: "rgb(114, 28, 36)",  border: "1px solid rgb(245, 198, 203)" },
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

// ===========================
// STAR RATING
// ===========================
export function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="hg-stars">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className="hg-star"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          {s <= (hovered || value) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
}

// ===========================
// AUTHOR CARD (inside modal)
// ===========================
export function AuthorCard({ project, onBack }) {
  const [authorData, setAuthorData] = useState(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") setAuthorData(data);
        setLoadingAuthor(false);
      });
    } else {
      setLoadingAuthor(false);
    }
  }, [project]);

  const name = authorData?.name || project.author || "Unknown";
  const bio = authorData?.bio || project.authorBio || "";
  const year = authorData?.year || project.authorYear || "";
  const email = authorData?.email || project.authorEmail || "";
  const github = authorData?.socialLinks?.github || "";
  const linkedin = authorData?.socialLinks?.linkedin || "";
  const portfolio = authorData?.socialLinks?.portfolio || "";
  const avatar = project.avatar || null;

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <button className="hg-author-back" onClick={onBack}><FaArrowLeft /> Back to project</button>
      {loadingAuthor ? (
        <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
      ) : (
        <div style={{
          background: "rgb(254, 251, 245)",
          border: "1px solid rgb(185, 174, 167)",
          borderRadius: "20px",
          padding: "32px 36px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "36px",
        }}>
          {/* Left: Avatar */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "8px" }}>
            {avatar
              ? <img src={avatar} alt={name} style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "4px solid rgb(185, 174, 167)" }} />
              : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgb(223, 205, 192)", border: "4px solid rgb(185, 174, 167)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "rgb(104, 68, 42)" }}><FaUser /></div>
            }
          </div>

          {/* Right: Info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2 style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "22px", fontWeight: 700, color: "rgb(47, 28, 15)", margin: 0 }}>{name}</h2>
            <div style={{ width: 40, height: 3, background: "rgb(185, 174, 167)", borderRadius: 2 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 14, color: "rgb(104, 68, 42)", fontFamily: "Arial, Helvetica, sans-serif" }}>
                  <FaEnvelope style={{ color: "rgb(164, 132, 109)", fontSize: 13 }} /> {email}
                </div>
              )}
              {year && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 14, color: "rgb(104, 68, 42)", fontFamily: "Arial, Helvetica, sans-serif" }}>
                  <FaGraduationCap style={{ color: "rgb(164, 132, 109)", fontSize: 13 }} /> Class of {year}
                </div>
              )}
            </div>

            {bio && (
              <div style={{ background: "rgb(243, 236, 229)", borderLeft: "3px solid rgb(185, 174, 167)", borderRadius: "8px", padding: "10px 14px" }}>
                <p style={{ fontSize: 14, color: "rgb(104, 68, 42)", lineHeight: 1.6, fontFamily: "Arial, Helvetica, sans-serif", margin: 0 }}>{bio}</p>
              </div>
            )}

            {(github || linkedin || portfolio) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {github && <a href={github} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid rgb(185, 174, 167)", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "rgb(104, 68, 42)", background: "rgb(254, 251, 245)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif" }}><FaGithub /> GitHub</a>}
                {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid rgb(185, 174, 167)", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "rgb(104, 68, 42)", background: "rgb(254, 251, 245)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif" }}><FaLinkedin /> LinkedIn</a>}
                {portfolio && <a href={portfolio} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid rgb(185, 174, 167)", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "rgb(104, 68, 42)", background: "rgb(254, 251, 245)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif" }}><FaGlobe /> Portfolio</a>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================
// PROJECT MODAL
// ===========================
export function ProjectModal({ project, bookmarked, onToggleBookmark, onClose, onDelete }) {
  const [view, setView] = useState("project");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(project.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [authorName, setAuthorName] = useState(null);

  useEffect(() => {
    if (user) checkRole(user.uid).then(setUserRole);
  }, [user]);

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") setAuthorName(data.name || null);
      });
    }
  }, [project]);

  const isOwner = user && project.userId === user.uid;
  const isAdmin = userRole === "admin";
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await delProj(project.id);
    onClose();
    if (onDelete) onDelete(project.id);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    const newComment = {
      text: comment,
      rating,
      date: new Date().toLocaleDateString(),
      userId: user?.uid || "anonymous",
    };
    if (rating > 0) await addRate(project.id, rating);
    await addComment(project.id, newComment);
    setComments([...comments, newComment]);
    setComment("");
    setRating(0);
    setSubmittingComment(false);
  };

  const title = project.title;
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const image = project.image || project.imgUrl;
  const avatar = project.avatar || null;
  const author = authorName || project.author || "";
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const description = project.description || project.desc;
  const github = project.github || project.gitLink;

  return createPortal(
    <div className="hg-pm-overlay" onClick={onClose}>
      <div className="hg-pm" onClick={(e) => e.stopPropagation()}>
        <button className="hg-pm-close" onClick={onClose}><FaTimes /></button>
        {view === "author" ? (
          <AuthorCard project={{ ...project, author, avatar }} onBack={() => setView("project")} />
        ) : (
          <>
            <div className="hg-pm-image-wrap">
              <img src={image} alt={title} className="hg-pm-image" />
              <div className="hg-pm-image-overlay">
                <h2 className="hg-pm-title">{title}</h2>
                <span className="hg-pm-tag">{tag}</span>
              </div>
            </div>
            <div className="hg-pm-body">
              <div className="hg-pm-author-row" onClick={() => setView("author")}>
                {avatar
                  ? <img src={avatar} alt={author} className="hg-pm-author-avatar" />
                  : <div className="hg-user-avatar-placeholder"><FaUser className="hg-user-avatar-icon" /></div>
                }
                <div>
                  <p className="hg-pm-author-name">{author}</p>
                  <p className="hg-pm-author-date">{date}</p>
                </div>
                <span className="hg-pm-author-hint">View profile →</span>
              </div>

              <p className="hg-pm-description">{description}</p>

              <div className="hg-pm-actions">
                <a href={github} target="_blank" rel="noreferrer" className="hg-pm-github-btn">
                  <FaGithub /> View on GitHub
                </a>
                <button
                  className={`hg-pm-bookmark-btn${bookmarked ? " hg-pm-bookmark-active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                >
                  {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </button>
                {canDelete && (
                  <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        background: confirming ? "rgb(180, 60, 40)" : "none",
                        border: `1.5px solid ${confirming ? "rgb(180, 60, 40)" : "rgb(185, 174, 167)"}`,
                        borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                        color: confirming ? "white" : "rgb(180, 60, 40)",
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      {deleting ? "Deleting..." : confirming ? "Confirm delete?" : "Delete"}
                    </button>
                    {confirming && !deleting && (
                      <button
                        onClick={() => setConfirming(false)}
                        style={{
                          background: "none", border: "1.5px solid rgb(185, 174, 167)",
                          borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                          color: "rgb(104, 68, 42)", cursor: "pointer", fontFamily: "Arial, Helvetica, sans-serif",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="hg-pm-divider" />

              <div className="hg-pm-comment-section">
                <h4 className="hg-pm-comment-title">Rate & Comment</h4>
                <StarRating value={rating} onChange={setRating} />
                <textarea
                  className="hg-pm-textarea"
                  placeholder="Share your thoughts on this project..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <button className="hg-pm-submit-btn" onClick={handleComment} disabled={submittingComment}>
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>

              {comments.length > 0 && (
                <div className="hg-pm-comments-list">
                  {comments.map((c, i) => (
                    <div key={i} className="hg-pm-comment">
                      <div className="hg-pm-comment-header">
                        <div className="hg-pm-comment-stars">
                          {[1,2,3,4,5].map(s => s <= c.rating
                            ? <FaStar key={s} className="hg-comment-star" />
                            : <FaRegStar key={s} className="hg-comment-star" />
                          )}
                        </div>
                        <span className="hg-pm-comment-date">{c.date}</span>
                      </div>
                      <p className="hg-pm-comment-text">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  , document.body);
}

// ===========================
// PROJECT CARD
// ===========================
export function ProjectCard({ project, onOpen, bookmarked, onToggleBookmark, showStatus }) {
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") setAuthorName(data.name || "");
      });
    }
  }, [project]);

  const handleBookmark = (e) => {
    e.stopPropagation();
    onToggleBookmark(project.id);
  };

  const image = project.image || project.imgUrl;
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const github = project.github || project.gitLink;

  return (
    <div className="hg-project-card" onClick={() => onOpen(project)}>
      <div className="hg-card-header">
        <div className="hg-card-title-row">
          <h3 className="hg-card-title">{project.title}</h3>
          {showStatus && <StatusBadge status={project.status} />}
        </div>
        <div className="hg-card-author">
          {project.avatar
            ? <img src={project.avatar} alt={authorName} className="hg-author-avatar" />
            : <div className="hg-user-avatar-placeholder" style={{ width: 30, height: 30 }}><FaUser style={{ fontSize: 13 }} /></div>
          }
          <div>
            <p className="hg-author-name">{authorName || "..."}</p>
            <p className="hg-author-date">{date}</p>
          </div>
        </div>
      </div>
      <div className="hg-card-image-wrapper">
        <img src={image} alt={project.title} className="hg-card-image" />
      </div>
      <div className="hg-card-footer">
        <span className="hg-tag hg-tag-brown">{tag}</span>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="hg-tag hg-tag-github"
              onClick={e => e.stopPropagation()}
            >
              <FaGithub style={{ marginRight: 4 }} /> GitHub
            </a>
          )}
          <button
            className={`hg-card-bookmark${bookmarked ? " hg-card-bookmark-active" : ""}`}
            onClick={handleBookmark}
          >
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
      </div>
      {showStatus && project.status === "rejected" && (
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