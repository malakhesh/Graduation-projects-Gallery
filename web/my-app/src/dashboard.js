import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "./auth.js";
import wreathImg from "./wreath.png";
import ReviewProjects from "./Reviewprojects.js";
import Users from "./Users.js";
import Projects from "./AllProjects.js";
import AdminReports from "./Adminreports.js";
import DashboardSettings from "./Dashboardsettings.js";
import { getApproved, getPending, getRejected } from "./projects.js";
import { getReports } from "./reports.js";
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// ── Pie helpers ──────────────────────────────────────────────────────────────

const SLICE_COLORS = [
  "#6F4E37", "#a0714f", "#d2a679", "#8B5E3C",
  "#c49a6c", "#5a3825", "#b07d50", "#e8c49a",
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSlicePath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} Z`;
}

function buildSlices(categoryMap, total, cx, cy, r) {
  const slices = [];
  let startAngle = 0;
  const entries = Object.entries(categoryMap);

  entries.forEach(([label, count], i) => {
    const pct = total > 0 ? count / total : 0;
    const sweep = pct * 360;
    const endAngle = startAngle + sweep;
    const midAngle = startAngle + sweep / 2;
    const midPoint = polarToCartesian(cx, cy, r * 0.68, midAngle);

    slices.push({
      id: label,
      label,
      count,
      percent: Math.round(pct * 100) + "%",
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      path: buildSlicePath(cx, cy, r, startAngle, endAngle),
      midAngle,
      labelX: midPoint.x,
      labelY: midPoint.y,
      startAngle,
      endAngle,
    });

    startAngle = endAngle;
  });

  return slices;
}

// ── GoldenWreath ─────────────────────────────────────────────────────────────

function GoldenWreath({ isMobile }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "flex-start", width: "100%",
      flexShrink: 0, position: "relative",
    }}>
      <div style={{
        position: "relative",
        width: isMobile ? "280px" : "460px",
        height: isMobile ? "130px" : "220px",
      }}>
        <img src={wreathImg} alt="wreath" style={{
          width: isMobile ? "280px" : "460px",
          height: isMobile ? "280px" : "460px",
          objectFit: "contain",
          transform: "scaleX(1.4)",
          position: "absolute",
          top: isMobile ? "-80px" : "-140px",
          left: "0",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: isMobile ? "10px" : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}>
          <span style={{
            fontFamily: "'Georgia', serif",
            fontSize: isMobile ? "28px" : "48px",
            fontWeight: "bold",
            color: "#3d1f00",
            letterSpacing: isMobile ? "4px" : "8px",
            textTransform: "uppercase",
            textShadow: "0 0 14px rgba(255,215,0,0.6), 0 1px 3px rgba(100,60,0,0.4)",
          }}>Welcome</span>
        </div>
      </div>
    </div>
  );
}

// ── useIsMobile hook ──────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

// ── ContactMessages sub-view ──────────────────────────────────────────────────

function ContactMessages({ onBack }) {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [filter, setFilter]         = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const isMobile = useIsMobile();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, "contactMessages", id), { status: "read" });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
      if (selected?.id === id) setSelected((s) => ({ ...s, status: "read" }));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "contactMessages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) { console.error(err); }
  };

  const openMessage = (msg) => {
    setSelected(msg);
    if (msg.status !== "read") markRead(msg.id);
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  const passesTimeFilter = (msg) => {
    if (timeFilter === "all") return true;
    if (!msg.createdAt) return false;
    const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
    const now = new Date();
    if (timeFilter === "today") return d.toDateString() === now.toDateString();
    if (timeFilter === "yesterday") {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      return d.toDateString() === yest.toDateString();
    }
    if (timeFilter === "week") {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (timeFilter === "month") {
      const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.status === "read")   return false;
    if (filter === "read"   && m.status !== "read")   return false;
    if (!passesTimeFilter(m)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName    = (m.name    || "").toLowerCase().includes(q);
      const inEmail   = (m.email   || "").toLowerCase().includes(q);
      const inMessage = (m.message || "").toLowerCase().includes(q);
      if (!inName && !inEmail && !inMessage) return false;
    }
    return true;
  });

  const unreadCount = messages.filter((m) => m.status !== "read").length;
  const readCount   = messages.filter((m) => m.status === "read").length;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a882; border-radius: 10px; }
        .msg-row:hover { background: rgba(111,78,55,0.08) !important; }
        .search-input::placeholder { color: #b09070; }
        .search-input:focus { outline: none; border-color: #6F4E37 !important; box-shadow: 0 0 0 3px rgba(111,78,55,0.12); }
        .filter-btn:hover { background: rgba(111,78,55,0.08) !important; }
      `}</style>

      <div style={{
        display: "flex", minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #f7f0e8 0%, #ede0cf 50%, #dfc9aa 100%)",
      }}>
        <aside style={{
          position: "fixed", left: 0, top: 0, bottom: 0, width: "200px",
          background: "linear-gradient(180deg, #f7f0e8 0%, #ede0cf 60%, #dfc9aa 100%)",
          borderRight: "2px solid rgba(111,78,55,0.15)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "24px 20px", zIndex: 100,
          boxShadow: "4px 0 20px rgba(111,78,55,0.06)",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Georgia', serif", fontSize: "15px",
              letterSpacing: "3px", color: "#3B2F2F",
              marginBottom: "32px", textTransform: "uppercase",
            }}>Dashboard</h2>
            <button
              onClick={onBack}
              style={{
                width: "100%", textAlign: "left",
                background: "none", border: "none",
                padding: "10px 12px", borderRadius: "10px",
                cursor: "pointer", color: "#6F4E37",
                fontWeight: "600", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "8px",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(111,78,55,0.12)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >← Back</button>
            <div style={{
              marginTop: "16px", padding: "10px 12px",
              borderRadius: "10px", backgroundColor: "#6F4E37",
              color: "#fdf6ee", fontWeight: "700",
              fontSize: "13px", letterSpacing: "0.5px",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(111,78,55,0.3)",
            }}>
              ✉️ Messages
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: "auto", backgroundColor: "#e74c3c", color: "#fff",
                  borderRadius: "12px", padding: "1px 8px",
                  fontSize: "11px", fontWeight: "800",
                }}>{unreadCount}</span>
              )}
            </div>
            <div style={{ marginTop: "20px", padding: "0 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#7a5c42", marginBottom: "6px" }}>
                <span>Total</span><span style={{ fontWeight: "700", color: "#3B2F2F" }}>{messages.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#7a5c42", marginBottom: "6px" }}>
                <span>Unread</span><span style={{ fontWeight: "700", color: "#e74c3c" }}>{unreadCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#7a5c42" }}>
                <span>Read</span><span style={{ fontWeight: "700", color: "#27ae60" }}>{readCount}</span>
              </div>
            </div>
          </div>
        </aside>

        <main style={{
          marginLeft: "200px", flex: 1,
          padding: isMobile ? "32px 16px" : "40px 48px",
          overflowY: "auto", minHeight: "100vh",
        }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: "bold", color: "#3B1F0F", margin: "0 0 6px",
            }}>User Messages</h1>
            <div style={{
              marginTop: "10px", height: "3px",
              background: "linear-gradient(to right, #6F4E37, #c9a882, transparent)",
              borderRadius: "4px", width: "220px",
            }} />
          </div>

          <div style={{ position: "relative", marginBottom: "14px", animation: "fadeUp 0.4s ease" }}>
            <span style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none",
            }}>🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name, email or message…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 40px",
                borderRadius: "12px", border: "1.5px solid rgba(111,78,55,0.25)",
                backgroundColor: "rgba(255,255,255,0.6)", color: "#3B2F2F",
                fontSize: "13px", fontFamily: "'Poppins', sans-serif",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#9a7050", fontSize: "16px", lineHeight: 1,
              }}>✕</button>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px", animation: "fadeUp 0.4s ease" }}>
            {[
              { key: "all",    label: `All (${messages.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "read",   label: `Read (${readCount})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} style={{
                padding: "6px 16px", borderRadius: "20px",
                border: "1.5px solid rgba(111,78,55,0.3)",
                backgroundColor: filter === t.key ? "#6F4E37" : "rgba(255,255,255,0.5)",
                color: filter === t.key ? "#fff" : "#5a3825",
                fontWeight: "600", fontSize: "12px",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif",
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px", animation: "fadeUp 0.4s ease" }}>
            {[
              { key: "all",       label: "All time" },
              { key: "today",     label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "week",      label: "This week" },
              { key: "month",     label: "This month" },
            ].map((t) => (
              <button key={t.key} onClick={() => setTimeFilter(t.key)} style={{
                padding: "5px 13px", borderRadius: "16px",
                border: "1.5px solid rgba(111,78,55,0.2)",
                backgroundColor: timeFilter === t.key ? "rgba(111,78,55,0.15)" : "rgba(255,255,255,0.4)",
                color: timeFilter === t.key ? "#5a3825" : "#8a6a50",
                fontWeight: timeFilter === t.key ? "700" : "500",
                fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif",
              }}>{t.label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", border: "4px solid #d2b49c", borderTopColor: "#6F4E37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#8a6245", fontStyle: "italic" }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a7050", fontSize: "15px", fontStyle: "italic" }}>No messages found</div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: selected ? (isMobile ? "1fr" : "1fr 1fr") : "1fr",
              gap: "16px", animation: "fadeUp 0.4s ease",
            }}>
              <div style={{
                backgroundColor: "rgba(253,246,238,0.8)", borderRadius: "16px",
                border: "1px solid rgba(200,168,130,0.25)", overflow: "hidden",
                boxShadow: "0 4px 16px rgba(111,78,55,0.06)",
              }}>
                {filtered.map((msg, idx) => (
                  <div key={msg.id} className="msg-row" onClick={() => openMessage(msg)} style={{
                    padding: "14px 18px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid rgba(200,168,130,0.18)" : "none",
                    cursor: "pointer",
                    backgroundColor: selected?.id === msg.id ? "rgba(111,78,55,0.1)" : msg.status !== "read" ? "rgba(111,78,55,0.03)" : "transparent",
                    transition: "background 0.2s",
                    display: "flex", alignItems: "flex-start", gap: "12px",
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: msg.status !== "read" ? "#e74c3c" : "transparent",
                      flexShrink: 0, marginTop: "6px",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: msg.status !== "read" ? "700" : "600", fontSize: "14px", color: "#3B2F2F" }}>{msg.name}</span>
                        <span style={{ fontSize: "11px", color: "#9a7050" }}>{formatDate(msg.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b5040", marginTop: "2px" }}>{msg.email}</div>
                      <div style={{ fontSize: "12px", color: "#8a6a50", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} style={{
                      background: "none", border: "none", color: "#c0392b", cursor: "pointer",
                      fontSize: "16px", padding: "2px 6px", borderRadius: "6px", flexShrink: 0, transition: "background 0.2s",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      title="Delete"
                    >🗑</button>
                  </div>
                ))}
              </div>

              {selected && (
                <div style={{
                  backgroundColor: "rgba(253,246,238,0.92)", borderRadius: "16px",
                  border: "1px solid rgba(200,168,130,0.25)", padding: "24px",
                  boxShadow: "0 4px 16px rgba(111,78,55,0.06)", animation: "fadeUp 0.3s ease",
                  alignSelf: "flex-start", position: "sticky", top: "20px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid rgba(180,130,80,0.18)" }}>
                    <h3 style={{ margin: 0, fontFamily: "'Georgia', serif", fontSize: "16px", color: "#3B1F0F" }}>Message Details</h3>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9a7050" }}>✕</button>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Name</label>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#3B2F2F" }}>{selected.name}</div>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Email</label>
                    <a href={`mailto:${selected.email}`} style={{ fontSize: "14px", color: "#6F4E37", fontWeight: "600", textDecoration: "none" }}>{selected.email}</a>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Date</label>
                    <div style={{ fontSize: "13px", color: "#5a4030" }}>{formatDate(selected.createdAt)}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>Message</label>
                    <div style={{ fontSize: "14px", color: "#3B2F2F", lineHeight: "1.8", backgroundColor: "rgba(111,78,55,0.04)", borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(180,130,80,0.18)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {selected.message}
                    </div>
                  </div>
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a
                      href={`mailto:${selected.email}?subject=Re%3A%20Your%20Message&body=Hi%20${encodeURIComponent(selected.name)}%2C%0A%0A`}
                      style={{
                        flex: 1, minWidth: "120px", padding: "10px 16px", borderRadius: "10px",
                        backgroundColor: "#6F4E37", color: "#fff", fontWeight: "700", fontSize: "13px",
                        textDecoration: "none", textAlign: "center",
                        boxShadow: "0 4px 12px rgba(111,78,55,0.28)",
                        fontFamily: "'Poppins', sans-serif", display: "inline-block", transition: "background 0.2s, transform 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#5a3825"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#6F4E37"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >✉️ Reply</a>
                    <button onClick={() => handleDelete(selected.id)} style={{
                      padding: "10px 16px", borderRadius: "10px",
                      border: "1.5px solid rgba(192,57,43,0.3)",
                      backgroundColor: "rgba(192,57,43,0.07)", color: "#c0392b",
                      fontWeight: "700", fontSize: "13px", cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.07)"}
                    >🗑 Delete</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [view, setView]               = useState("main");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredBox, setHoveredBox]   = useState(null);
  const [hoveredNav, setHoveredNav]   = useState(null);
  const [hoveredSignIn, setHoveredSignIn] = useState(false);
  const [hoveredSlice, setHoveredSlice]   = useState(null);

  const [slices, setSlices]           = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loadingChart, setLoadingChart]   = useState(true);

  const [pendingCount, setPendingCount]   = useState(0);
  const [reportsCount, setReportsCount]   = useState(0);
  const [reviewPct, setReviewPct]         = useState(0);
  const [reportPct, setReportPct]         = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const fetchData = async () => {
      const [approved, pending, rejected, reports] = await Promise.all([
        getApproved(), getPending(), getRejected(), getReports("admin"),
      ]);

      const approvedArr = Array.isArray(approved) ? approved : [];
      const pendingArr  = Array.isArray(pending)  ? pending  : [];
      const rejectedArr = Array.isArray(rejected) ? rejected : [];
      const reportsArr  = Array.isArray(reports)  ? reports  : [];

      setPendingCount(pendingArr.length);
      setReportsCount(reportsArr.length);

      const totalReview = approvedArr.length + pendingArr.length;
      setReviewPct(totalReview > 0 ? Math.round((pendingArr.length / totalReview) * 100) : 0);

      const totalAll = approvedArr.length + pendingArr.length + rejectedArr.length;
      setReportPct(totalAll > 0 ? Math.round((reportsArr.length / totalAll) * 100) : 0);

      // ── Pie chart: approved projects ONLY ──────────────────────────────────
      const categoryMap = {};
      approvedArr.forEach((p) => {
        // ✅ FIX: Projects without a category go into "Other" instead of being skipped.
        // This ensures totalProjects always equals approvedArr.length.
        const cat = p.category?.trim() || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      // ✅ FIX: Use approvedArr.length as the true total, not the sum from categoryMap.
      // Previously, projects missing a category were excluded, causing the count
      // shown in the pie center to be lower than the actual number of approved projects.
      const total = approvedArr.length;
      setTotalProjects(total);
      setSlices(buildSlices(categoryMap, total, 70, 70, 60));
      setLoadingChart(false);
    };

    const fetchUnreadMessages = async () => {
      try {
        const snap = await getDocs(query(collection(db, "contactMessages")));
        const unread = snap.docs.filter((d) => d.data().status !== "read").length;
        setUnreadMsgCount(unread);
      } catch { /* ignore */ }
    };

    fetchData();
    fetchUnreadMessages();
  }, []);

  if (view === "review")   return <ReviewProjects onBack={() => setView("main")} />;
  if (view === "users")    return <Users onBack={() => setView("main")} />;
  if (view === "projects") return <Projects onBack={() => setView("main")} />;
  if (view === "reports")  return <AdminReports onBack={() => setView("main")} />;
  if (view === "settings") return <DashboardSettings onBack={() => setView("main")} />;
  if (view === "messages") return <ContactMessages onBack={() => setView("main")} />;

  const lightenColor = (hex) => ({
    "#f2e8db": "#f8f0e5",
    "#ece0ce": "#f0e5d8",
    "#e5d4be": "#eadac8",
    "#eeddcc": "#f4e8d8",
  }[hex] || hex);

  const getBoxStyle = (id, baseColor) => ({
    flex: isMobile ? "none" : 1,
    width: isMobile ? "100%" : undefined,
    minWidth: 0, maxWidth: "none",
    backgroundColor: hoveredBox === id ? lightenColor(baseColor) + "ee" : baseColor + "cc",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: hoveredBox === id ? "0 12px 28px rgba(0,0,0,0.28)" : "0 4px 16px rgba(0,0,0,0.14)",
    height: isMobile ? "220px" : "270px",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    alignItems: "stretch", padding: isMobile ? "14px 16px" : "18px 20px",
    transform: hoveredBox === id ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
    transition: "all 0.3s ease", cursor: "pointer",
    boxSizing: "border-box", position: "relative", zIndex: 1,
  });

  const navItems = [
    { label: "WEBSITE VIEW", action: () => navigate("/home") },
    { label: "ALL PROJECTS", action: () => setView("projects") },
    { label: "USERS",        action: () => setView("users") },
    { label: "MESSAGES",     action: () => setView("messages"), badge: unreadMsgCount },
    { label: "SETTINGS",     action: () => setView("settings") },
  ];

  const handleNavClick = (action) => { action(); setSidebarOpen(false); };

  const SidebarContent = () => (
    <>
      <div>
        <h2 style={{ marginBottom: "20px", color: "#3B2F2F" }}>DASHBOARD</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "40px" }}>
          {navItems.map(({ label, action, badge }) => (
            <li key={label}
              onMouseEnter={() => setHoveredNav(label)}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={() => handleNavClick(action)}
              style={{
                padding: "8px 10px", borderBottom: "1px solid rgba(111,78,55,0.15)",
                cursor: "pointer", color: "#6F4E37", borderRadius: "8px",
                backgroundColor: hoveredNav === label ? "rgba(111,78,55,0.1)" : "transparent",
                transform: hoveredNav === label ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
                boxShadow: hoveredNav === label ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.3s ease",
                fontWeight: hoveredNav === label ? "bold" : "normal",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>{label}</span>
              {badge > 0 && (
                <span style={{
                  backgroundColor: "#e74c3c", color: "#fff",
                  borderRadius: "12px", padding: "1px 7px",
                  fontSize: "11px", fontWeight: "800",
                }}>{badge}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center", color: "#5C4033" }}>
        <span
          onClick={async () => { await logOut(); navigate("/"); }}
          onMouseEnter={() => setHoveredSignIn(true)}
          onMouseLeave={() => setHoveredSignIn(false)}
          style={{
            cursor: "pointer", padding: "8px 16px", borderRadius: "8px",
            display: "inline-block",
            backgroundColor: hoveredSignIn ? "rgba(111,78,55,0.1)" : "transparent",
            transform: hoveredSignIn ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
            boxShadow: hoveredSignIn ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
            fontWeight: hoveredSignIn ? "bold" : "normal",
            color: "#5C4033", transition: "all 0.3s ease",
          }}
        >SIGN OUT</span>
      </div>
    </>
  );

  return (
    <div style={{
      display: "flex", height: "100vh",
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
    }}>

      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed", top: "14px", left: "14px", zIndex: 100,
            width: "42px", height: "42px",
            background: "linear-gradient(160deg, #f7f0e8 0%, #ede0cf 100%)",
            border: "1px solid rgba(111,78,55,0.25)",
            borderRadius: "8px", cursor: "pointer",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: "5px",
            padding: "0", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block", width: "20px", height: "2px",
              backgroundColor: "#6F4E37", borderRadius: "2px",
              transition: "all 0.3s ease",
              transform: sidebarOpen
                ? i === 0 ? "translateY(7px) rotate(45deg)"
                : i === 1 ? "opacity 0"
                : "translateY(-7px) rotate(-45deg)"
                : "none",
              opacity: sidebarOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.28)",
        }} />
      )}

      <aside style={{
        position: "fixed",
        left: isMobile ? (sidebarOpen ? 0 : "-220px") : 0,
        top: 0, bottom: 0, width: "200px",
        background: "linear-gradient(to bottom, #f7f0e8 0%, #ede0cf 60%, #dfc9aa 100%)",
        padding: "20px", borderRight: "2px solid rgba(111,78,55,0.18)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        zIndex: 30, transition: isMobile ? "left 0.3s ease" : "none",
        boxShadow: isMobile && sidebarOpen ? "4px 0 20px rgba(0,0,0,0.15)" : "none",
      }}>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{
            position: "absolute", top: "12px", right: "12px",
            background: "transparent", border: "none",
            fontSize: "20px", cursor: "pointer", color: "#6F4E37", lineHeight: 1,
          }}>✕</button>
        )}
        <SidebarContent />
      </aside>

      <main style={{
        display: "flex", flexDirection: "column",
        marginLeft: isMobile ? 0 : "200px",
        background: "linear-gradient(to top, #dfc9aa, #f7f0e8)",
        height: "100vh",
        width: isMobile ? "100vw" : "calc(100vw - 200px)",
        boxSizing: "border-box",
        overflow: isMobile ? "auto" : "hidden",
        paddingTop: isMobile ? "60px" : 0,
      }}>
        <GoldenWreath isMobile={isMobile} />

        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          padding: isMobile ? "0 16px 24px" : "0 60px 30px",
          gap: isMobile ? "16px" : "30px",
          flex: 1, alignItems: isMobile ? "stretch" : "center",
        }}>

          {/* Box 1 — Review */}
          <div style={getBoxStyle(1, "#f2e8db")}
            onMouseEnter={() => setHoveredBox(1)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("review")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>📋</span>
              <span style={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>PROJECTS TO REVIEW</span>
            </div>
            <div style={{ fontSize: isMobile ? "44px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{pendingCount}</div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#d4b896", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reviewPct}%`, backgroundColor: "#6F4E37", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reviewPct}% pending review</div>
            </div>
          </div>

          {/* Box 2 — Reports */}
          <div style={getBoxStyle(2, "#ece0ce")}
            onMouseEnter={() => setHoveredBox(2)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("reports")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>📝</span>
              <span style={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>PROJECTS TO REPORT</span>
            </div>
            <div style={{ fontSize: isMobile ? "44px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{reportsCount}</div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#c8a882", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reportPct}%`, backgroundColor: "#5C4033", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reportPct}% of projects reported</div>
            </div>
          </div>

          {/* Box 3 — Messages */}
          <div style={getBoxStyle(3, "#eeddcc")}
            onMouseEnter={() => setHoveredBox(3)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("messages")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>✉️</span>
                <span style={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F" }}>MESSAGES</span>
              </div>
              {unreadMsgCount > 0 && (
                <span style={{
                  backgroundColor: "#e74c3c", color: "#fff",
                  borderRadius: "14px", padding: "2px 10px",
                  fontSize: "12px", fontWeight: "800", flexShrink: 0,
                }}>{unreadMsgCount} New</span>
              )}
            </div>
            <div style={{ fontSize: isMobile ? "44px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{unreadMsgCount}</div>
            <div style={{ fontSize: "13px", color: "#5C4033", textAlign: "center" }}>
              {unreadMsgCount === 0 ? "No new messages" : `${unreadMsgCount} unread message${unreadMsgCount > 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Box 4 — Distribution (approved only) */}
          <div style={getBoxStyle(4, "#e5d4be")}
            onMouseEnter={() => setHoveredBox(4)} onMouseLeave={() => setHoveredBox(null)}>
            <p style={{ margin: "0", fontSize: isMobile ? "16px" : "22px", fontWeight: "bold", color: "#3B1F0F" }}>
              Projects Distribution
            </p>

            {loadingChart ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <div style={{ width: "32px", height: "32px", border: "4px solid #d4b896", borderTopColor: "#6F4E37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : slices.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, color: "#6F4E37", fontSize: "13px" }}>
                No approved projects yet
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, position: "relative" }}>
                  <svg width={isMobile ? "140" : "170"} height={isMobile ? "140" : "170"} viewBox="0 0 140 140">
                    {slices.map((slice) => {
                      const isHovered = hoveredSlice === slice.id;
                      const midRad = ((slice.midAngle - 90) * Math.PI) / 180;
                      const offset = isHovered ? 6 : 0;
                      const tx = offset * Math.cos(midRad);
                      const ty = offset * Math.sin(midRad);
                      const pctNum = parseInt(slice.percent);
                      return (
                        <g key={slice.id}
                          onMouseEnter={() => setHoveredSlice(slice.id)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          style={{ cursor: "pointer" }}>
                          <path
                            d={slice.path} fill={slice.color}
                            opacity={isHovered ? 1 : 0.85}
                            transform={`translate(${tx},${ty})`}
                            style={{ transition: "all 0.25s ease" }}
                          />
                          {pctNum >= 8 && (
                            <text
                              x={slice.labelX + tx} y={slice.labelY + ty}
                              textAnchor="middle" fill="white"
                              fontSize="8" fontWeight="bold"
                              style={{ pointerEvents: "none" }}
                            >{slice.percent}</text>
                          )}
                        </g>
                      );
                    })}
                    <circle cx="70" cy="70" r="25" fill="#f4ede3" />
                    <text x="70" y="67" textAnchor="middle" fill="#3B1F0F" fontSize="11" fontWeight="bold">{totalProjects}</text>
                    <text x="70" y="78" textAnchor="middle" fill="#6F4E37" fontSize="7">approved</text>
                  </svg>

                  {hoveredSlice && (() => {
                    const s = slices.find((sl) => sl.id === hoveredSlice);
                    return s ? (
                      <div style={{
                        position: "absolute", top: "0px", right: "-10px",
                        backgroundColor: "#3B2F2F", color: "white",
                        padding: "6px 10px", borderRadius: "8px",
                        fontSize: "12px", fontWeight: "bold",
                        pointerEvents: "none", whiteSpace: "nowrap",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)", zIndex: 10,
                      }}>
                        {s.label}: {s.count} projects ({s.percent})
                      </div>
                    ) : null;
                  })()}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxHeight: "52px", overflowY: "auto" }}>
                  {slices.map((slice) => (
                    <span key={slice.id} style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      fontSize: "10px", fontWeight: "bold",
                      opacity: hoveredSlice === slice.id ? 1 : 0.7,
                      transition: "opacity 0.25s ease", cursor: "default",
                    }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: slice.color, display: "inline-block", flexShrink: 0 }} />
                      {slice.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;