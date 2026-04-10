import React, { useState, useEffect, useCallback } from "react"
import { getReports, deleteReport, resolveReport, resolveCommentReport } from "./reports.js"

// ─────────────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return "—"
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function isCommentReport(projectId) {
  return typeof projectId === "string" && projectId.includes("_comment_")
}

function shortId(id = "") {
  return id.length > 14 ? id.slice(0, 7) + "…" + id.slice(-5) : id
}

const ADMIN_ROLE = "admin"

// ─────────────────────────────────────────────────────────────────────────────
// sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <>
      <style>{`
        @keyframes roast { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "18px", flex: 1, minHeight: "260px",
      }}>
        <div style={{
          width: "46px", height: "46px",
          border: "5px solid #d2b49c",
          borderTopColor: "#6F4E37",
          borderRadius: "50%",
          animation: "roast 0.75s linear infinite",
        }} />
        <span style={{
          fontFamily: "'Georgia', serif",
          fontSize: "15px", letterSpacing: "1.5px",
          color: "#8a6245", fontStyle: "italic",
        }}>
          Fetching reports…
        </span>
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "14px", flex: 1, minHeight: "300px",
      animation: "fadeUp 0.5s ease",
    }}>
      <div style={{ fontSize: "64px", lineHeight: 1 }}>📭</div>
      <p style={{
        fontFamily: "'Georgia', serif",
        fontSize: "24px", fontWeight: "bold",
        color: "#5a3825", margin: 0,
      }}>All clear!</p>
      <p style={{
        fontSize: "14px", color: "#a07850",
        margin: 0, maxWidth: "280px", textAlign: "center", lineHeight: 1.6,
      }}>
        No reports to review right now. Check back later.
      </p>
    </div>
  )
}

function TypePill({ isComment }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 11px", borderRadius: "20px",
      fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px",
      backgroundColor: isComment ? "#ecdfd0" : "#f5ede3",
      color: isComment ? "#5a3010" : "#7a4015",
      border: `1.5px solid ${isComment ? "#c9a47a" : "#d9b58a"}`,
    }}>
      {isComment ? "💬" : "📁"} {isComment ? "Comment" : "Project"}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null
  return (
    <>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div style={{
        position: "fixed", top: "22px", left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: toast.ok ? "#3B2F2F" : "#7a1800",
        color: "#fff",
        padding: "12px 26px",
        borderRadius: "14px",
        fontWeight: "700", fontSize: "13px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
        zIndex: 9999, letterSpacing: "0.4px",
        animation: "toastIn 0.28s ease",
        whiteSpace: "nowrap",
      }}>
        {toast.ok ? "✅" : "❌"} {toast.msg}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmModal({ modal, onCancel, onConfirm }) {
  if (!modal) return null
  const isDismiss = modal.type === "dismiss"
  const isComment = isCommentReport(modal.projectId)

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(40, 22, 8, 0.5)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 8000,
    }}>
      <div style={{
        backgroundColor: "#fdf6ee",
        borderRadius: "20px",
        padding: "40px 44px",
        maxWidth: "400px", width: "90%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        textAlign: "center",
        border: "1px solid rgba(200,168,130,0.4)",
        animation: "fadeUp 0.25s ease",
      }}>
        <div style={{ fontSize: "52px", marginBottom: "14px" }}>
          {isDismiss ? "🗂️" : isComment ? "💬" : "🗑️"}
        </div>
        <p style={{
          fontFamily: "'Georgia', serif",
          fontSize: "19px", fontWeight: "bold",
          color: "#3B1F0F", margin: "0 0 10px",
        }}>
          {isDismiss ? "Dismiss this report?" : isComment ? "Delete this comment?" : "Delete this project?"}
        </p>
        <p style={{
          color: "#8a6245", fontSize: "13px",
          margin: "0 0 30px", lineHeight: 1.6,
        }}>
          {isDismiss
            ? "The report will be removed. The content stays untouched."
            : isComment
              ? "The reported comment will be permanently removed from the project."
              : "The project and all associated data will be permanently deleted."}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={onCancel} style={{
            padding: "10px 26px", borderRadius: "10px",
            border: "1.5px solid #b89868",
            backgroundColor: "transparent", color: "#6F4E37",
            fontWeight: "700", fontSize: "13px", cursor: "pointer",
            transition: "all 0.2s",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "10px 26px", borderRadius: "10px", border: "none",
            backgroundColor: isDismiss ? "#6F4E37" : "#7a1800",
            color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
          }}>
            {isDismiss ? "Yes, Dismiss" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

function AdminReports({ onBack }) {
  const [reports, setReports]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [toast, setToast]             = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)
  const [hoveredRow, setHoveredRow]   = useState(null)
  const [hoveredBtn, setHoveredBtn]   = useState(null)

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const data = await getReports(ADMIN_ROLE) // fixed: pass ADMIN_ROLE
    setReports(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3200)
  }

  // ── confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!confirmModal) return
    const { reportId, type, projectId } = confirmModal
    setConfirmModal(null)
    setActionLoading((p) => ({ ...p, [reportId]: type }))

    let result
    if (type === "dismiss") {
      result = await deleteReport(reportId, ADMIN_ROLE) // fixed: pass ADMIN_ROLE
      showToast(
        result === "dismiss-ok" ? "Report dismissed successfully." : "Failed to dismiss report.",
        result === "dismiss-ok"
      )
    } else {
      if (isCommentReport(projectId)) {
        result = await resolveCommentReport(reportId, projectId, ADMIN_ROLE)
        showToast(
          result === "comment-removed" ? "Comment deleted & report closed." : "Failed to delete comment.",
          result === "comment-removed"
        )
      } else {
        result = await resolveReport(reportId, projectId, ADMIN_ROLE)
        showToast(
          result === "resolve-ok" ? "Project deleted & report closed." : "Failed to delete project.",
          result === "resolve-ok"
        )
      }
    }

    setActionLoading((p) => { const n = { ...p }; delete n[reportId]; return n })
    fetchAll()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // styles
  // ─────────────────────────────────────────────────────────────────────────

  const TH = {
    textAlign: "left",
    padding: "13px 18px",
    fontSize: "10.5px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    color: "#5a3825",
    borderBottom: "2px solid rgba(180,130,80,0.35)",
    whiteSpace: "nowrap",
    backgroundColor: "rgba(210,180,140,0.18)",
  }

  const TD = {
    padding: "14px 18px",
    fontSize: "13px",
    color: "#3B2F2F",
    verticalAlign: "middle",
    borderBottom: "1px solid rgba(200,168,130,0.25)",
  }

  const btnDismiss = (id) => ({
    padding: "7px 15px",
    borderRadius: "8px",
    border: "1.5px solid #b89868",
    backgroundColor: hoveredBtn === `d-${id}` ? "#eddcca" : "transparent",
    color: "#6F4E37",
    fontWeight: "700", fontSize: "11.5px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    transform: hoveredBtn === `d-${id}` ? "scale(1.05)" : "scale(1)",
    letterSpacing: "0.3px",
  })

  const btnRemove = (id, isComment) => ({
    padding: "7px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: hoveredBtn === `r-${id}` ? (isComment ? "#8a3300" : "#7a1800") : (isComment ? "#7a2d00" : "#6b1500"),
    color: "#fff",
    fontWeight: "700", fontSize: "11.5px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    transform: hoveredBtn === `r-${id}` ? "scale(1.05)" : "scale(1)",
    boxShadow: hoveredBtn === `r-${id}` ? "0 4px 12px rgba(100,20,0,0.3)" : "none",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  })

  // ─────────────────────────────────────────────────────────────────────────
  // render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a882; border-radius: 10px; }
      `}</style>

      <Toast toast={toast} />
      <ConfirmModal modal={confirmModal} onCancel={() => setConfirmModal(null)} onConfirm={handleConfirm} />

      {/* ── Root ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #f0e5d8 0%, #dcc4a8 50%, #c9a882 100%)",
      }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside style={{
          position: "fixed", left: 0, top: 0, bottom: 0,
          width: "200px",
          backgroundColor: "#f0e5d8",
          borderRight: "2px solid rgba(111,78,55,0.2)",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 20px",
          zIndex: 100,
          boxShadow: "4px 0 20px rgba(111,78,55,0.08)",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "15px", letterSpacing: "3px",
              color: "#3B2F2F", marginBottom: "32px",
              textTransform: "uppercase",
            }}>Dashboard</h2>

            {/* Back link */}
            <button
              onClick={onBack}
              onMouseEnter={() => setHoveredBtn("back")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: "100%", textAlign: "left",
                background: "none", border: "none",
                padding: "10px 12px", borderRadius: "10px",
                cursor: "pointer", color: "#6F4E37",
                fontWeight: hoveredBtn === "back" ? "700" : "600",
                fontSize: "13px", letterSpacing: "0.5px",
                backgroundColor: hoveredBtn === "back" ? "#e8d5bf" : "transparent",
                transform: hoveredBtn === "back" ? "translateX(5px)" : "translateX(0)",
                transition: "all 0.25s ease",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
              ← Back
            </button>

            {/* Active page indicator */}
            <div style={{
              marginTop: "16px",
              padding: "10px 12px", borderRadius: "10px",
              backgroundColor: "#6F4E37",
              color: "#fdf6ee",
              fontWeight: "700", fontSize: "13px",
              letterSpacing: "0.5px",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(111,78,55,0.3)",
            }}>
              📋 Reports
            </div>
          </div>

          {/* Stats pill at bottom of sidebar */}
          {!loading && (
            <div style={{
              backgroundColor: "rgba(111,78,55,0.1)",
              borderRadius: "12px",
              padding: "14px 16px",
              textAlign: "center",
              border: "1px solid rgba(111,78,55,0.15)",
            }}>
              <div style={{
                fontFamily: "'Georgia', serif",
                fontSize: "32px", fontWeight: "bold",
                color: "#3B1F0F", lineHeight: 1,
              }}>
                {reports.length}
              </div>
              <div style={{ fontSize: "11px", color: "#8a6245", marginTop: "4px", letterSpacing: "0.5px" }}>
                {reports.length === 1 ? "report" : "reports"} pending
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main style={{
          marginLeft: "200px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 48px",
          minHeight: "100vh",
          overflowY: "auto",
        }}>

          {/* Page header */}
          <div style={{
            marginBottom: "36px",
            animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: "'Georgia', serif",
                fontSize: "34px", fontWeight: "bold",
                color: "#3B1F0F", margin: 0,
                letterSpacing: "0.5px",
              }}>
                Reports
              </h1>
              {!loading && reports.length > 0 && (
                <span style={{
                  backgroundColor: "#6F4E37",
                  color: "#fdf6ee",
                  borderRadius: "20px",
                  padding: "4px 14px",
                  fontSize: "13px", fontWeight: "700",
                  letterSpacing: "0.4px",
                }}>
                  {reports.length} pending
                </span>
              )}
            </div>
            <p style={{
              color: "#8a6245", fontSize: "14px",
              margin: "8px 0 0", lineHeight: 1.5,
            }}>
              Review flagged content and take action — dismiss or remove.
            </p>

            {/* Decorative rule */}
            <div style={{
              marginTop: "20px",
              height: "3px",
              background: "linear-gradient(to right, #6F4E37, #c9a882, transparent)",
              borderRadius: "4px",
              width: "280px",
            }} />
          </div>

          {/* ── Content area ──────────────────────────────────────────────── */}
          {loading ? (
            <Spinner />
          ) : reports.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{
              backgroundColor: "rgba(253,246,238,0.72)",
              backdropFilter: "blur(14px)",
              borderRadius: "18px",
              border: "1px solid rgba(200,168,130,0.35)",
              boxShadow: "0 12px 40px rgba(111,78,55,0.12)",
              overflow: "hidden",
              animation: "fadeUp 0.45s ease",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: "44px" }}>#</th>
                      <th style={TH}>Type</th>
                      <th style={TH}>Project / Content ID</th>
                      <th style={TH}>Reason</th>
                      <th style={TH}>Reporter</th>
                      <th style={TH}>Date</th>
                      <th style={{ ...TH, textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((rep, idx) => {
                      const isComment = isCommentReport(rep.projectId)
                      const acting    = !!actionLoading[rep.id]
                      const rowHov    = hoveredRow === rep.id

                      return (
                        <tr
                          key={rep.id}
                          onMouseEnter={() => setHoveredRow(rep.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            backgroundColor: rowHov ? "rgba(220,196,168,0.28)" : "transparent",
                            transition: "background-color 0.18s ease",
                            opacity: acting ? 0.45 : 1,
                            animation: `rowIn 0.35s ease ${idx * 0.04}s both`,
                          }}
                        >
                          {/* # */}
                          <td style={{ ...TD, color: "#b09070", fontWeight: "700", fontSize: "12px", width: "44px" }}>
                            {idx + 1}
                          </td>

                          {/* Type */}
                          <td style={{ ...TD, width: "120px" }}>
                            <TypePill isComment={isComment} />
                          </td>

                          {/* ID */}
                          <td style={{ ...TD }}>
                            <span
                              title={rep.projectId}
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                                backgroundColor: "rgba(111,78,55,0.08)",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                color: "#5a3825",
                                letterSpacing: "0.3px",
                                cursor: "default",
                              }}
                            >
                              {shortId(rep.projectId || "—")}
                            </span>
                          </td>

                          {/* Reason */}
                          <td style={{ ...TD, maxWidth: "240px" }}>
                            <span style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: "1.5",
                              color: "#3B2F2F",
                              fontSize: "13px",
                            }}>
                              {rep.reason || <span style={{ color: "#b09070", fontStyle: "italic" }}>No reason given</span>}
                            </span>
                          </td>

                          {/* Reporter */}
                          <td style={{ ...TD }}>
                            <span
                              title={rep.reporterId}
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                                color: "#7a5030",
                                cursor: "default",
                              }}
                            >
                              {shortId(rep.reporterId || "—")}
                            </span>
                          </td>

                          {/* Date */}
                          <td style={{ ...TD, whiteSpace: "nowrap", color: "#9a7050", fontSize: "12px" }}>
                            {formatDate(rep.createdAt)}
                          </td>

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: "center", width: "210px" }}>
                            {acting ? (
                              <span style={{
                                fontSize: "12px", color: "#9a7050",
                                fontStyle: "italic", letterSpacing: "0.4px",
                              }}>
                                {actionLoading[rep.id] === "dismiss" ? "Dismissing…" : "Removing…"}
                              </span>
                            ) : (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                <button
                                  style={btnDismiss(rep.id)}
                                  onMouseEnter={() => setHoveredBtn(`d-${rep.id}`)}
                                  onMouseLeave={() => setHoveredBtn(null)}
                                  onClick={() => setConfirmModal({
                                    reportId: rep.id,
                                    type: "dismiss",
                                    projectId: rep.projectId,
                                  })}
                                >
                                  Dismiss
                                </button>
                                <button
                                  style={btnRemove(rep.id, isComment)}
                                  onMouseEnter={() => setHoveredBtn(`r-${rep.id}`)}
                                  onMouseLeave={() => setHoveredBtn(null)}
                                  onClick={() => setConfirmModal({
                                    reportId: rep.id,
                                    type: "remove",
                                    projectId: rep.projectId,
                                  })}
                                >
                                  {isComment ? "Del Comment" : "Del Project"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default AdminReports