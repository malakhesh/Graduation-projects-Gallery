import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import "./home.css";
import { getUser, checkRole } from './auth.js';
import { auth } from './firebase.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addComment, addRate, removeRate, delProj, removeComment, getProj } from './projects.js';
import { addReport } from './reports.js';
import EditModal from './EditModal.js';
import {
  FaUser, FaBookmark, FaRegBookmark, FaGithub, FaStar, FaRegStar,
  FaTimes, FaArrowLeft, FaEnvelope, FaLinkedin, FaGlobe, FaGraduationCap,
  FaShare, FaFlag, FaTrash, FaEdit
} from "react-icons/fa";

const circleBtn = {
  background: "var(--bg-card)",
  border: "1.5px solid var(--border)",
  borderRadius: "50%",
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 13,
  color: "var(--text-secondary)",
  transition: "background 0.2s",
};

const smallCircleBtn = {
  ...circleBtn,
  width: 26,
  height: 26,
  fontSize: 11,
};

function StatusBadge({ status }) {
  const styles = {
    pending:  { background: "var(--warning-bg)",  color: "var(--warning-text)", border: "1px solid var(--border)" },
    approved: { background: "var(--success-bg)",  color: "var(--success-text)", border: "1px solid var(--border)" },
    rejected: { background: "var(--danger-bg)",   color: "var(--danger-text)",  border: "1px solid var(--danger-border)" },
  };
  const style = styles[status] || styles.pending;
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

function ReportModal({ target, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("");

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, background: "var(--overlay)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 20,
          padding: "clamp(18px, 5vw, 28px) clamp(16px, 5vw, 32px)",
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 style={{ margin: 0, fontFamily: "'Times New Roman', serif", fontSize: "clamp(16px, 4vw, 20px)", color: "var(--text-primary)" }}>
          Report {target === "project" ? "Project" : "Comment"}
        </h4>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", fontFamily: "Arial, sans-serif" }}>
          Describe the issue and an admin will review it.
        </p>
        <textarea
          rows={4}
          placeholder="What's wrong with this?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            padding: "10px 14px",
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
            color: "var(--text-primary)",
            background: "var(--bg-input)",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1.5px solid var(--border)",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={submitting || !reason.trim()}
            style={{
              background: "var(--danger)",
              border: "none",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-inverse)",
              cursor: reason.trim() && !submitting ? "pointer" : "default",
              fontFamily: "Arial, sans-serif",
              opacity: reason.trim() ? 1 : 0.5,
            }}
          >
            {submitting ? "Sending..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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
  const avatar = authorData?.photoURL || project.avatar || null;

  return (
    <div style={{ padding: "clamp(16px, 4vw, 24px)", display: "flex", flexDirection: "column", gap: "20px" }}>
      <button className="hg-author-back" onClick={onBack}><FaArrowLeft /> Back to project</button>
      {loadingAuthor ? (
        <div className="hg-spinner-wrapper"><div className="hg-spinner" /></div>
      ) : (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "clamp(20px, 5vw, 48px) clamp(16px, 5vw, 52px)",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "clamp(20px, 4vw, 52px)",
        }}>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "8px" }}>
            {avatar
              ? <img src={avatar} alt={name} style={{
                  width: "clamp(72px, 20vw, 120px)",
                  height: "clamp(72px, 20vw, 120px)",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid var(--border)",
                }} />
              : <div style={{
                  width: "clamp(72px, 20vw, 120px)",
                  height: "clamp(72px, 20vw, 120px)",
                  borderRadius: "50%",
                  background: "var(--accent-light)",
                  border: "4px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(28px, 8vw, 48px)",
                  color: "var(--text-secondary)",
                }}>
                  <FaUser />
                </div>
            }
          </div>

          <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "clamp(18px, 5vw, 26px)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}>{name}</h2>
            <div style={{ width: 40, height: 3, background: "var(--border)", borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {email && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 15, color: "var(--text-secondary)", fontFamily: "Arial, Helvetica, sans-serif", wordBreak: "break-word" }}>
                  <FaEnvelope style={{ color: "var(--text-muted)", fontSize: 14, flexShrink: 0 }} /> {email}
                </div>
              )}
              {year && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 15, color: "var(--text-secondary)", fontFamily: "Arial, Helvetica, sans-serif" }}>
                  <FaGraduationCap style={{ color: "var(--text-muted)", fontSize: 14, flexShrink: 0 }} /> Class of {year}
                </div>
              )}
            </div>
            {bio && (
              <div style={{ background: "var(--bg-hover)", borderLeft: "3px solid var(--border)", borderRadius: "8px", padding: "14px 18px" }}>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, fontFamily: "Arial, Helvetica, sans-serif", margin: 0 }}>{bio}</p>
              </div>
            )}
            {(github || linkedin || portfolio) && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {github && (
                  <a href={github} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 20,
                    fontSize: 14, fontWeight: 600, color: "var(--text-secondary)",
                    background: "var(--bg-card)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif",
                  }}>
                    <FaGithub /> GitHub
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 20,
                    fontSize: 14, fontWeight: 600, color: "var(--text-secondary)",
                    background: "var(--bg-card)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif",
                  }}>
                    <FaLinkedin /> LinkedIn
                  </a>
                )}
                {portfolio && (
                  <a href={portfolio} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: 20,
                    fontSize: 14, fontWeight: 600, color: "var(--text-secondary)",
                    background: "var(--bg-card)", textDecoration: "none", fontFamily: "Arial, Helvetica, sans-serif",
                  }}>
                    <FaGlobe /> Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectModal({ project, bookmarked, onToggleBookmark, onClose, onDelete }) {
  const [view, setView] = useState("project");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(project.comments || []);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);
  const [authorName, setAuthorName] = useState(null);
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [userRatings, setUserRatings] = useState(project.userRatings || {});
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const prevPath = location.pathname + location.search;
    window.history.replaceState(null, "", `/project/${project.id}`);
    return () => { window.history.replaceState(null, "", prevPath); };
  }, [project.id]);

  useEffect(() => {
    if (user) checkRole(user.uid).then(setUserRole);
  }, [user]);

  useEffect(() => {
    getProj(project.id).then((data) => {
      if (data && data !== "no-proj" && data !== "get-fail") {
        if (data.comments) setComments(data.comments);
        if (data.userRatings) {
          setUserRatings(data.userRatings);
          if (user && data.userRatings[user.uid]) setRating(data.userRatings[user.uid]);
        }
      }
    });
  }, [project.id, user]);

  const userHasRated = user && !!userRatings[user.uid];

  const handleShare = () => {
    const url = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRate = async () => {
    if (!user || rating === 0) return;
    setSubmittingRating(true);
    await addRate(project.id, rating, user.uid);
    setUserRatings(prev => ({ ...prev, [user.uid]: rating }));
    setSubmittingRating(false);
  };

  const handleRemoveRate = async () => {
    if (!user) return;
    setSubmittingRating(true);
    await removeRate(project.id, user.uid, userRatings[user.uid]);
    setUserRatings(prev => { const n = {...prev}; delete n[user.uid]; return n; });
    setRating(0);
    setSubmittingRating(false);
  };

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") {
          setAuthorName(data.name || null);
          setAuthorPhoto(data.photoURL || null);
        }
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
    const userData = user ? await getUser(user.uid) : null;
    const userName = userData?.name || user?.displayName || "Anonymous";
    const newComment = {
      text: comment,
      date: new Date().toLocaleDateString(),
      userId: user?.uid || "anonymous",
      userName,
    };
    await addComment(project.id, newComment, user?.uid);
    setComments([...comments, newComment]);
    setComment("");
    setSubmittingComment(false);
  };

  const handleReportSubmit = async (reason) => {
    if (!reason.trim() || !user) return;
    setSubmittingReport(true);
    const targetId = reportTarget?.type === "comment"
      ? `${project.id}_comment_${reportTarget.commentIndex}`
      : project.id;
    const commentText = reportTarget?.type === "comment"
      ? (comments[reportTarget.commentIndex]?.text || "")
      : null;
    await addReport(targetId, user.uid, reason, commentText);
    setSubmittingReport(false);
    setReportOpen(false);
    setReportTarget(null);
  };

  const title = project.title;
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const image = project.image || project.imgUrl;
  const avatar = authorPhoto || project.avatar || null;
  const author = authorName || project.author || "";
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const description = project.description || project.desc;
  const github = project.github || project.gitLink;
  const ratings = project.ratings || [];
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  return createPortal(
    <>
      <div className="hg-pm-overlay" onClick={onClose}>
        <div className="hg-pm" onClick={(e) => e.stopPropagation()}>

          <div style={{
            position: "absolute", top: 14, right: 14,
            display: "flex", gap: 8, zIndex: 10, flexWrap: "wrap", justifyContent: "flex-end",
          }}>
            {copied && (
              <div style={{
                background: "var(--text-primary)",
                color: "var(--text-inverse)",
                borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                fontFamily: "Arial, Helvetica, sans-serif",
                display: "flex", alignItems: "center", gap: 5,
                animation: "hg-dropdown-in 0.18s cubic-bezier(0.22,1,0.36,1)",
              }}>
                🔗 link copied!
              </div>
            )}
            <button onClick={handleShare} title="Share project" style={circleBtn}>
              <FaShare />
            </button>
            {isOwner && (
              <button onClick={() => setEditOpen(true)} title="Edit project" style={circleBtn}>
                <FaEdit />
              </button>
            )}
            {user && !isOwner && !isAdmin && (
              <button
                onClick={() => { setReportTarget({ type: "project" }); setReportOpen(true); }}
                title="Report project"
                style={{ ...circleBtn, color: "var(--danger)", borderColor: "var(--danger-border)" }}
              >
                <FaFlag />
              </button>
            )}
            <button className="hg-pm-close" style={{ position: "static" }} onClick={onClose}><FaTimes /></button>
          </div>

          {view === "author" ? (
            <AuthorCard project={{ ...project, author, avatar }} onBack={() => setView("project")} />
          ) : (
            <>
              <div className="hg-pm-image-wrap">
                <img src={image} alt={title} className="hg-pm-image" />
                <div className="hg-pm-image-overlay">
                  <h2 className="hg-pm-title">{title}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {tag && <span className="hg-pm-tag">{tag}</span>}
                    {project.category && <span className="hg-pm-tag hg-pm-tag-category">{project.category}</span>}
                    {avgRating && (
                      <span className="hg-pm-tag">
                        ⭐ {avgRating} ({ratings.length} {ratings.length === 1 ? "rating" : "ratings"})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hg-pm-body">
                <div className="hg-pm-author-row" onClick={() => setView("author")}>
                  {avatar
                    ? <img src={avatar} alt={author} className="hg-pm-author-avatar" />
                    : <div className="hg-user-avatar-placeholder"><FaUser className="hg-user-avatar-icon" /></div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="hg-pm-author-name">{author}</p>
                    <p className="hg-pm-author-date">{date}</p>
                  </div>
                  <span className="hg-pm-author-hint">View profile →</span>
                </div>

                <p className="hg-pm-description">{description}</p>

                {Array.isArray(project.stack) && project.stack.length > 0 && (
                  <div className="hg-pm-stack">
                    {project.stack.map((tech) => (
                      <span key={tech} className="hg-pm-stack-chip">{tech}</span>
                    ))}
                  </div>
                )}

                <div className="hg-pm-actions" style={{ flexWrap: "wrap", gap: 8 }}>
                  <a href={github} target="_blank" rel="noreferrer" className="hg-pm-github-btn">
                    <FaGithub /> View on GitHub
                  </a>
                  {(!project.status || project.status === "approved") && (
                    <button
                      className={`hg-pm-bookmark-btn${bookmarked ? " hg-pm-bookmark-active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onToggleBookmark(project.id); }}
                    >
                      {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  )}
                  {canDelete && (
                    <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          background: confirming ? "var(--danger)" : "none",
                          border: `1.5px solid ${confirming ? "var(--danger)" : "var(--border)"}`,
                          borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                          color: confirming ? "var(--text-inverse)" : "var(--danger)",
                          cursor: "pointer", transition: "all 0.2s", fontFamily: "Arial, Helvetica, sans-serif",
                        }}
                      >
                        {deleting ? "Deleting..." : confirming ? "Confirm delete?" : "Delete"}
                      </button>
                      {confirming && !deleting && (
                        <button
                          onClick={() => setConfirming(false)}
                          style={{
                            background: "none", border: "1.5px solid var(--border)",
                            borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                            color: "var(--text-secondary)", cursor: "pointer", fontFamily: "Arial, Helvetica, sans-serif",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {(!project.status || project.status === "approved") && (
                  <>
                    <div className="hg-pm-comment-section">
                      <h4 className="hg-pm-comment-title">Rate this project</h4>
                      {userHasRated ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <StarRating value={userRatings[user.uid]} onChange={() => {}} />
                          <button
                            onClick={handleRemoveRate}
                            disabled={submittingRating}
                            style={{
                              background: "none", border: "1.5px solid var(--border)",
                              borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                              color: "var(--danger)", cursor: "pointer", fontFamily: "Arial, Helvetica, sans-serif",
                            }}
                          >{submittingRating ? "..." : "Remove"}</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <StarRating value={rating} onChange={setRating} />
                          <button
                            onClick={handleRate}
                            disabled={submittingRating || rating === 0}
                            style={{
                              background: rating > 0 ? "var(--accent)" : "var(--accent-light)",
                              border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600,
                              color: rating > 0 ? "var(--text-inverse)" : "var(--text-muted)",
                              cursor: rating > 0 ? "pointer" : "default",
                              fontFamily: "Arial, Helvetica, sans-serif", transition: "all 0.2s",
                            }}
                          >{submittingRating ? "..." : "Submit"}</button>
                        </div>
                      )}

                      <div className="hg-pm-divider" />

                      <h4 className="hg-pm-comment-title">Comments</h4>
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
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                  {c.userName || "Anonymous"}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span className="hg-pm-comment-date">{c.date}</span>
                                {(isAdmin || (user && c.userId === user.uid)) && (
                                  <button
                                    onClick={async () => {
                                      await removeComment(project.id, c);
                                      setComments(prev => prev.filter((_, idx) => idx !== i));
                                    }}
                                    title="Delete comment"
                                    style={{ ...smallCircleBtn, color: "var(--danger)", borderColor: "var(--danger-border)" }}
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                                {user && c.userId !== user.uid && !isAdmin && (
                                  <button
                                    onClick={() => { setReportTarget({ type: "comment", commentIndex: i }); setReportOpen(true); }}
                                    title="Report comment"
                                    style={{ ...smallCircleBtn, color: "var(--text-muted)", borderColor: "var(--border)" }}
                                  >
                                    <FaFlag />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="hg-pm-comment-text">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {reportOpen && (
        <ReportModal
          target={reportTarget?.type}
          onClose={() => { setReportOpen(false); setReportTarget(null); }}
          onSubmit={handleReportSubmit}
          submitting={submittingReport}
        />
      )}

      {editOpen && isOwner && (
        <EditModal
          project={project}
          onClose={() => setEditOpen(false)}
          onUpdated={() => { setEditOpen(false); onClose(); }}
        />
      )}
    </>,
    document.body
  );
}

export function ProjectCard({ project, onOpen, bookmarked, onToggleBookmark, showStatus }) {
  const [authorName, setAuthorName] = useState("");
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [user] = useAuthState(auth);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const uid = project.userId || project.authorId;
    if (uid) {
      getUser(uid).then((data) => {
        if (data && data !== "no-data" && data !== "get-fail") {
          setAuthorName(data.name || "");
          setAuthorPhoto(data.photoURL || null);
        }
      });
    }
  }, [project]);

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (project.status && project.status !== "approved") return;
    onToggleBookmark(project.id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditOpen(true);
  };

  const isOwner = user && project.userId === user.uid;
  const image = project.image || project.imgUrl;
  const date = project.date || (project.createdAt?.toDate?.().toLocaleDateString()) || "";
  const tag = project.tag || (project.tags && project.tags[0]) || "";
  const github = project.github || project.gitLink;
  const cardRatings = project.ratings || [];
  const cardAvgRating = cardRatings.length > 0
    ? (cardRatings.reduce((a, b) => a + b, 0) / cardRatings.length).toFixed(1)
    : null;
  const avatar = authorPhoto || project.avatar || null;

  return (
    <>
      <div className="hg-project-card" onClick={() => onOpen(project)}>
        <div className="hg-card-header">
          <div className="hg-card-title-row">
            <h3 className="hg-card-title">{project.title}</h3>
            {showStatus && <StatusBadge status={project.status} />}
          </div>
          <div className="hg-card-author">
            {avatar
              ? <img src={avatar} alt={authorName} className="hg-author-avatar" />
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
          {isOwner && (
            <button
              onClick={handleEditClick}
              title="Edit project"
              className="hg-card-edit-btn"
              style={{ ...circleBtn, background: "var(--bg-card)" }}
            >
              <FaEdit />
            </button>
          )}
        </div>

        <div className="hg-card-footer" style={{ flexWrap: "wrap", gap: 6 }}>
          <span className="hg-tag hg-tag-brown">{tag}</span>
          {cardAvgRating && (
            <span className="hg-tag" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
              ⭐ {cardAvgRating}
            </span>
          )}
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center", flexWrap: "wrap" }}>
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
            {(!project.status || project.status === "approved") && (
              <button
                className={`hg-card-bookmark${bookmarked ? " hg-card-bookmark-active" : ""}`}
                onClick={handleBookmark}
              >
                {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            )}
          </div>
        </div>

        {showStatus && project.status === "rejected" && (
          <div style={{
            padding: "8px 14px",
            background: "var(--danger-bg)",
            borderTop: "1px solid var(--danger-border)",
            fontSize: 12,
          }} />
        )}
      </div>

      {editOpen && isOwner && (
        <EditModal
          project={project}
          onClose={() => setEditOpen(false)}
          onUpdated={() => setEditOpen(false)}
        />
      )}
    </>
  );
}