// ============================================================
//  Dashboard.js
//  El component el assa7y bta3 el admin dashboard — bygeblo
//  el stats, el charts, w bywarri el sub-views
// ============================================================

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

// el CSS bta3 el component - kol el styles fel Dashboard.css
import "./dashboard.css";


// ── Pie Chart Helpers ─────────────────────────────────────────────────────────
// el functions dol byt3amalo el pie chart — bithaswelo el angels w el paths

// da bya7awel el angle we el radius le coordinates x,y 3al circle
const SLICE_COLORS = [
  "#6F4E37", "#a0714f", "#d2a679", "#8B5E3C",
  "#c49a6c", "#5a3825", "#b07d50", "#e8c49a",
];

// da bya7awel angle (degree) le noo2ta 3ala el circle
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// da beybni el SVG path bta3 kol 2elsha f el pie chart
function buildSlicePath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} Z`;
}

// da bya5od el categories w b3den bybni el slices kollaha ma3 colors we percentages
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


// ── GoldenWreath Component ────────────────────────────────────────────────────
// da el wreath el za7raf elly byet3amel f nos el dashboard fo2 el cards

function GoldenWreath({ isMobile }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "flex-start", width: "100%",
      flexShrink: 0, position: "relative",
    }}>
      <div style={{
        position: "relative",
        // el 7agm byetghayar 3ala 7asab el screen (mobile aw desktop)
        width: isMobile ? "280px" : "460px",
        height: isMobile ? "130px" : "220px",
      }}>
        {/* el sora bta3et el wreath */}
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

        {/* el nas "Welcome" gowa el wreath */}
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


// ── useIsMobile Hook ──────────────────────────────────────────────────────────
// custom hook bycheck eza el screen mobile aw la (ta7t el breakpoint)
// byestad3i re-render lama el screen size yetghayar

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    // cleanup: mesh nesnazel el event listener lama el component yetsha7
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}


// ── ContactMessages Component ─────────────────────────────────────────────────
// da el sub-view el kamla bta3et el messages — bygebli el messages men
// firebase we bywarri kalenda filter we search we detail panel

function ContactMessages({ onBack }) {
  // el state: el messages kollaha, el loading, el selected message, el filters
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [filter, setFilter]           = useState("all");        // all / read / unread
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter]   = useState("all");        // all / today / week / month
  const [sidebarOpen, setSidebarOpen] = useState(false);        // mobile sidebar toggle
  const isMobile = useIsMobile();

  // da bygebli el messages kollaha men firebase مرتبين من الأحدث للأقدم
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

  // byenadi fetchMessages lama el component yetzahar el awwel marra
  useEffect(() => { fetchMessages(); }, []);

  // da bya3mel el message read (byghayar el status f firebase)
  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, "contactMessages", id), { status: "read" });
      // byghayar el state locally men gher ma yrga3 yegib men firebase
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
      if (selected?.id === id) setSelected((s) => ({ ...s, status: "read" }));
    } catch (err) { console.error(err); }
  };

  // da byim7i el message men firebase w men el state
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "contactMessages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      // lama temsa7 el message el maftoha, bte2fel el detail panel
      if (selected?.id === id) setSelected(null);
    } catch (err) { console.error(err); }
  };

  // lama el user yefta7 message — bysetlek el selected w bymark read lw kant unread
  const openMessage = (msg) => {
    setSelected(msg);
    if (msg.status !== "read") markRead(msg.id);
  };

  // da byformat el timestamp men firebase le nas mafhooma
  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  // da bycheck eza el message fet3addi el time filter wala la
  const passesTimeFilter = (msg) => {
    if (timeFilter === "all") return true;
    if (!msg.createdAt) return false;
    const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
    const now = new Date();
    if (timeFilter === "today")     return d.toDateString() === now.toDateString();
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

  // ── Filter Logic ─────────────────────────────────────────────────────────
  // Step 1: el search bitshtaghal 3ala el name w el email bas
  const searchResults = searchQuery.trim()
    ? messages.filter((m) => {
        const q = searchQuery.toLowerCase();
        return (
          (m.name  || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        );
      })
    : messages;

  // Step 2: ba3d el search, benna77i el messages elly mesh matching el read/time filter
  const filtered = searchResults.filter((m) => {
    if (filter === "unread" && m.status === "read")  return false;
    if (filter === "read"   && m.status !== "read")  return false;
    if (!passesTimeFilter(m)) return false;
    return true;
  });
  // ─────────────────────────────────────────────────────────────────────────

  // counts bensthomhom f el sidebar stats
  const unreadCount = messages.filter((m) => m.status !== "read").length;
  const readCount   = messages.filter((m) => m.status === "read").length;


  // ── Mobile Detail Panel ─────────────────────────────────────────────────
  // da el full screen panel elly byet3amel f el mobile lama tefta7 message
  const MobileDetailPanel = () => {
    if (!selected) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 300,
        backgroundColor: "#fdf6ee",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s ease",
        overflowY: "auto",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* el header bta3 el panel (back button + delete) */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(180,130,80,0.2)",
          backgroundColor: "#fdf6ee",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: "none", border: "none", fontSize: "22px",
              cursor: "pointer", color: "#6F4E37", lineHeight: 1,
              padding: "4px 8px",
            }}
          >←</button>
          <span style={{
            fontFamily: "'Georgia', serif", fontSize: "17px",
            fontWeight: "bold", color: "#3B1F0F", flex: 1,
          }}>Message Details</span>
          <button
            onClick={() => handleDelete(selected.id)}
            style={{
              background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.25)",
              color: "#c0392b", borderRadius: "8px",
              padding: "6px 12px", cursor: "pointer",
              fontSize: "13px", fontWeight: "700",
            }}
          >🗑 Delete</button>
        </div>

        {/* content el message (name, email, date, message body) */}
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Name</label>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#3B2F2F" }}>{selected.name}</div>
          </div>

          {/* Email — link byeftah el mail client */}
          <div>
            <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Email</label>
            <a href={`mailto:${selected.email}`} style={{ fontSize: "15px", color: "#6F4E37", fontWeight: "600", textDecoration: "none" }}>{selected.email}</a>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>Date</label>
            <div style={{ fontSize: "14px", color: "#5a4030" }}>{formatDate(selected.createdAt)}</div>
          </div>

          {/* Message body */}
          <div>
            <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>Message</label>
            <div style={{
              fontSize: "15px", color: "#3B2F2F", lineHeight: "1.8",
              backgroundColor: "rgba(111,78,55,0.04)", borderRadius: "12px",
              padding: "16px", border: "1px solid rgba(180,130,80,0.18)",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {selected.message}
            </div>
          </div>

          {/* Reply button — byfta7 el mail client ma3 el subject w el body جاهزين */}
          <a
            href={`mailto:${selected.email}?subject=Re%3A%20Your%20Message&body=Hi%20${encodeURIComponent(selected.name)}%2C%0A%0A`}
            style={{
              display: "block", padding: "14px", borderRadius: "12px",
              backgroundColor: "#6F4E37", color: "#fff",
              fontWeight: "700", fontSize: "15px",
              textDecoration: "none", textAlign: "center",
              boxShadow: "0 4px 14px rgba(111,78,55,0.3)",
            }}
          >✉️ Reply via Email</a>
        </div>
      </div>
    );
  };


  return (
    <>
      {/* el styles el global bta3et el messages page */}
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
      `}</style>

      {/* lama el screen mobile, bywarri el detail panel fo2 kol 7aga */}
      {isMobile && <MobileDetailPanel />}

      <div style={{
        display: "flex", minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to top, #dfc9aa, #f7f0e8)",
      }}>

        {/* ── Hamburger Button (Mobile Only) ──────────────────────── */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: "fixed", top: "14px", left: "14px", zIndex: 200,
              width: "42px", height: "42px",
              background: "#fdf6ee",
              border: "1px solid rgba(111,78,55,0.25)",
              borderRadius: "8px", cursor: "pointer",
              display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center", gap: "5px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {/* el 3 khotoot el btet3amel X lama el sidebar yefta7 */}
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: "20px", height: "2px",
                backgroundColor: "#6F4E37", borderRadius: "2px",
                transition: "all 0.3s",
                transform: sidebarOpen
                  ? i === 0 ? "translateY(7px) rotate(45deg)"
                  : i === 2 ? "translateY(-7px) rotate(-45deg)"
                  : "scaleX(0)"
                  : "none",
                opacity: sidebarOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        )}

        {/* el overlay el esswed wara el sidebar f el mobile */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 150,
            backgroundColor: "rgba(0,0,0,0.3)",
          }} />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        {/* byetnarrar f el mobile w fixed f el desktop */}
        <aside style={{
          position: "fixed",
          left: isMobile ? (sidebarOpen ? 0 : "-220px") : 0,
          top: 0, bottom: 0, width: "200px",
          background: "linear-gradient(to top, #dfc9aa, #f7f0e8)",
          borderRight: "2px solid rgba(111,78,55,0.15)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "24px 20px", zIndex: 160,
          boxShadow: isMobile && sidebarOpen ? "4px 0 20px rgba(111,78,55,0.12)" : "4px 0 20px rgba(111,78,55,0.06)",
          transition: isMobile ? "left 0.3s ease" : "none",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Georgia', serif", fontSize: "15px",
              letterSpacing: "3px", color: "#3B2F2F",
              marginBottom: "32px", textTransform: "uppercase",
            }}>Dashboard</h2>

            {/* back button byerga3 lel dashboard el assa7y */}
            <button
              onClick={() => { onBack(); setSidebarOpen(false); }}
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

            {/* el active nav item (messages) highlighted */}
            <div style={{
              marginTop: "16px", padding: "10px 12px",
              borderRadius: "10px", backgroundColor: "#6F4E37",
              color: "#fdf6ee", fontWeight: "700",
              fontSize: "13px", letterSpacing: "0.5px",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(111,78,55,0.3)",
            }}>
              ✉️ Messages
              {/* el badge el a7mar byet3amel lw fi messages unread */}
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: "auto", backgroundColor: "#e74c3c", color: "#fff",
                  borderRadius: "12px", padding: "1px 8px",
                  fontSize: "11px", fontWeight: "800",
                }}>{unreadCount}</span>
              )}
            </div>

            {/* el stats el so3'ayara: total, unread, read */}
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

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main style={{
          marginLeft: isMobile ? 0 : "200px", flex: 1,
          padding: isMobile ? "72px 14px 32px" : "40px 48px",
          overflowY: "auto", minHeight: "100vh",
        }}>
          {/* el header bta3 el page (el title + el line ta7to) */}
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: isMobile ? "22px" : "30px",
              fontWeight: "bold", color: "#3B1F0F", margin: "0 0 6px",
            }}>User Messages</h1>
            <div style={{
              marginTop: "10px", height: "3px",
              background: "linear-gradient(to right, #6F4E37, #c9a882, transparent)",
              borderRadius: "4px", width: isMobile ? "160px" : "220px",
            }} />
          </div>

          {/* ── Search Bar ──────────────────────────────────────────
              betsearch fe el name w el email bas (mesh f el message body)
          ─────────────────────────────────────────────────────────── */}
          <div style={{ position: "relative", marginBottom: "14px", animation: "fadeUp 0.4s ease" }}>
            <span style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none",
            }}>🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name or email…"
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
            {/* el X button temsa7 el search query */}
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#9a7050", fontSize: "16px",
              }}>✕</button>
            )}
          </div>

          {/* hint byet3amel lama el user bysearch — bywarrilu en el filters
              btetfela3 3ala el search results bas */}
          {searchQuery.trim() && (
            <div style={{
              fontSize: "12px", color: "#8a6a50", marginBottom: "10px",
              fontStyle: "italic", animation: "fadeUp 0.3s ease",
            }}>
              🔎 Filters are applied to messages from "{searchQuery}" only
            </div>
          )}

          {/* ── Status Filter Buttons (All / Unread / Read) ────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px", animation: "fadeUp 0.4s ease" }}>
            {[
              { key: "all",    label: `All (${searchResults.length})` },
              { key: "unread", label: `Unread (${searchResults.filter(m => m.status !== "read").length})` },
              { key: "read",   label: `Read (${searchResults.filter(m => m.status === "read").length})` },
            ].map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} style={{
                padding: "6px 16px", borderRadius: "20px",
                border: "1.5px solid rgba(111,78,55,0.3)",
                // el active button byetlawan bel 7etta el dakoona
                backgroundColor: filter === t.key ? "#6F4E37" : "rgba(255,255,255,0.5)",
                color: filter === t.key ? "#fff" : "#5a3825",
                fontWeight: "600", fontSize: "12px",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif",
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Time Filter Buttons (Today / Yesterday / Week / Month) ── */}
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

          {/* ── Messages List ──────────────────────────────────────── */}
          {/* 3 7alat: loading, empty, aw el lista */}
          {loading ? (
            // loading state — spinner + nas
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", border: "4px solid #d2b49c", borderTopColor: "#6F4E37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: "#8a6245", fontStyle: "italic" }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            // empty state — lama mesh fi messages btet3amel ma3 el filter
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a7050", fontSize: "15px", fontStyle: "italic" }}>No messages found</div>
          ) : (
            // el grid byta3 el message list + el detail panel
            <div style={{
              display: "grid",
              // lama fi message maftuha f el desktop — byebqa 2 columns
              gridTemplateColumns: (!isMobile && selected) ? "1fr 1fr" : "1fr",
              gap: "16px", animation: "fadeUp 0.4s ease",
            }}>
              {/* ── Message List Container ──────────────────────────── */}
              <div style={{
                backgroundColor: "rgba(253,246,238,0.8)", borderRadius: "16px",
                border: "1px solid rgba(200,168,130,0.25)", overflow: "hidden",
                boxShadow: "0 4px 16px rgba(111,78,55,0.06)",
              }}>
                {filtered.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className="msg-row"
                    onClick={() => openMessage(msg)}
                    style={{
                      padding: isMobile ? "12px 14px" : "14px 18px",
                      borderBottom: idx < filtered.length - 1 ? "1px solid rgba(200,168,130,0.18)" : "none",
                      cursor: "pointer",
                      // el selected byebyan highlighted
                      backgroundColor: (!isMobile && selected?.id === msg.id) ? "rgba(111,78,55,0.1)"
                        : msg.status !== "read" ? "rgba(111,78,55,0.03)" : "transparent",
                      transition: "background 0.2s",
                      display: "flex", alignItems: "flex-start", gap: "10px",
                    }}
                  >
                    {/* el dot el a7mar للمقروءة والغير مقروءة */}
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "6px",
                      backgroundColor: msg.status !== "read" ? "#e74c3c" : "transparent",
                    }} />

                    {/* el content bta3 el message row (name, email, preview) */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: msg.status !== "read" ? "700" : "600", fontSize: "14px", color: "#3B2F2F" }}>{msg.name}</span>
                        <span style={{ fontSize: "11px", color: "#9a7050", flexShrink: 0 }}>{formatDate(msg.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b5040", marginTop: "2px" }}>{msg.email}</div>
                      {/* preview bta3 el message — maqto3 lw taweel */}
                      <div style={{ fontSize: "12px", color: "#8a6a50", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.message}</div>
                    </div>

                    {/* el delete button lkol row — el stopPropagation beman2 el message mafetsh */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                      style={{
                        background: "none", border: "none", color: "#c0392b",
                        cursor: "pointer", fontSize: "16px", padding: "2px 6px",
                        borderRadius: "6px", flexShrink: 0, transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      title="Delete"
                    >🗑</button>
                  </div>
                ))}
              </div>

              {/* ── Desktop Detail Panel ────────────────────────────── */}
              {/* byet3amel bas f el desktop w lma fi message maftuha */}
              {!isMobile && selected && (
                <div style={{
                  backgroundColor: "rgba(253,246,238,0.92)", borderRadius: "16px",
                  border: "1px solid rgba(200,168,130,0.25)", padding: "24px",
                  boxShadow: "0 4px 16px rgba(111,78,55,0.06)", animation: "fadeUp 0.3s ease",
                  alignSelf: "flex-start", position: "sticky", top: "20px",
                }}>
                  {/* header el detail panel + close button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid rgba(180,130,80,0.18)" }}>
                    <h3 style={{ margin: 0, fontFamily: "'Georgia', serif", fontSize: "16px", color: "#3B1F0F" }}>Message Details</h3>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9a7050" }}>✕</button>
                  </div>

                  {/* el fields: name, email, date */}
                  {[
                    { label: "Name", content: <div style={{ fontSize: "15px", fontWeight: "700", color: "#3B2F2F" }}>{selected.name}</div> },
                    { label: "Email", content: <a href={`mailto:${selected.email}`} style={{ fontSize: "14px", color: "#6F4E37", fontWeight: "600", textDecoration: "none" }}>{selected.email}</a> },
                    { label: "Date", content: <div style={{ fontSize: "13px", color: "#5a4030" }}>{formatDate(selected.createdAt)}</div> },
                  ].map(({ label, content }) => (
                    <div key={label} style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>{label}</label>
                      {content}
                    </div>
                  ))}

                  {/* el message body kamo */}
                  <div>
                    <label style={{ fontSize: "11px", color: "#9a7050", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>Message</label>
                    <div style={{ fontSize: "14px", color: "#3B2F2F", lineHeight: "1.8", backgroundColor: "rgba(111,78,55,0.04)", borderRadius: "10px", padding: "14px 16px", border: "1px solid rgba(180,130,80,0.18)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {selected.message}
                    </div>
                  </div>

                  {/* action buttons: reply + delete */}
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a
                      href={`mailto:${selected.email}?subject=Re%3A%20Your%20Message&body=Hi%20${encodeURIComponent(selected.name)}%2C%0A%0A`}
                      style={{
                        flex: 1, minWidth: "120px", padding: "10px 16px", borderRadius: "10px",
                        backgroundColor: "#6F4E37", color: "#fff", fontWeight: "700", fontSize: "13px",
                        textDecoration: "none", textAlign: "center",
                        boxShadow: "0 4px 12px rgba(111,78,55,0.28)",
                        fontFamily: "'Poppins', sans-serif", display: "inline-block",
                      }}
                    >✉️ Reply</a>
                    <button onClick={() => handleDelete(selected.id)} style={{
                      padding: "10px 16px", borderRadius: "10px",
                      border: "1.5px solid rgba(192,57,43,0.3)",
                      backgroundColor: "rgba(192,57,43,0.07)", color: "#c0392b",
                      fontWeight: "700", fontSize: "13px", cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                    }}>🗑 Delete</button>
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


// ── Dashboard Component ───────────────────────────────────────────────────────
// da el component el assa7y elly byet3amel lma el admin yedkhol
// bygebli el stats kollaha men firebase w bywarri el sub-views

function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // el view el active (main aw ay sub-view zay review, users, etc.)
  const [view, setView]               = useState("main");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // hover states lel UI interactions
  const [hoveredBox, setHoveredBox]   = useState(null);
  const [hoveredNav, setHoveredNav]   = useState(null);
  const [hoveredSignIn, setHoveredSignIn] = useState(false);
  const [hoveredSlice, setHoveredSlice]   = useState(null);

  // el data bta3et el pie chart
  const [slices, setSlices]               = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loadingChart, setLoadingChart]   = useState(true);

  // el stats bta3et el dashboard cards
  const [pendingCount, setPendingCount]     = useState(0);
  const [reportsCount, setReportsCount]     = useState(0);
  const [reviewPct, setReviewPct]           = useState(0);
  const [reportPct, setReportPct]           = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // ref 3shan namsak el timeout bta3 el pie chart hover f el mobile
  const sliceTimeoutRef = React.useRef(null);

  // lama el screen yb2a desktop, el sidebar yetnashar tani
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // da bygebli el data kollaha men firebase:
  // approved projects, pending, rejected, reports, w unread messages
  useEffect(() => {
    const fetchData = async () => {
      const [approved, pending, rejected, reports] = await Promise.all([
        getApproved(), getPending(), getRejected(), getReports("admin"),
      ]);

      // el arrays bnen7asob menhom el stats
      const approvedArr = Array.isArray(approved) ? approved : [];
      const pendingArr  = Array.isArray(pending)  ? pending  : [];
      const rejectedArr = Array.isArray(rejected) ? rejected : [];
      const reportsArr  = Array.isArray(reports)  ? reports  : [];

      setPendingCount(pendingArr.length);
      setReportsCount(reportsArr.length);

      // el percentage bta3 el pending men el total (approved + pending)
      const totalReview = approvedArr.length + pendingArr.length;
      setReviewPct(totalReview > 0 ? Math.round((pendingArr.length / totalReview) * 100) : 0);

      // el percentage bta3 el reports men el total kolo
      const totalAll = approvedArr.length + pendingArr.length + rejectedArr.length;
      setReportPct(totalAll > 0 ? Math.round((reportsArr.length / totalAll) * 100) : 0);

      // bebn el categoryMap men el approved projects 3shan ner7alo lel pie chart
      const categoryMap = {};
      approvedArr.forEach((p) => {
        const cat = p.category?.trim() || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const total = approvedArr.length;
      setTotalProjects(total);
      setSlices(buildSlices(categoryMap, total, 70, 70, 60));
      setLoadingChart(false);
    };

    // da bygebli el unread messages count 3shan yetzahar f el nav badge
    const fetchUnreadMessages = async () => {
      try {
        const snap = await getDocs(query(collection(db, "contactMessages")));
        const unread = snap.docs.filter((d) => d.data().status !== "read").length;
        setUnreadMsgCount(unread);
      } catch { /* mesh mohemm lw fat3el */ }
    };

    fetchData();
    fetchUnreadMessages();
  }, []);

  // ── Sub-view Routing ──────────────────────────────────────────────────────
  // lama el view yetghayar, byrender el component el mnaaseb
  if (view === "review")   return <ReviewProjects onBack={() => setView("main")} />;
  if (view === "users")    return <Users onBack={() => setView("main")} />;
  if (view === "projects") return <Projects onBack={() => setView("main")} />;
  if (view === "reports")  return <AdminReports onBack={() => setView("main")} />;
  if (view === "settings") return <DashboardSettings onBack={() => setView("main")} />;
  if (view === "messages") return <ContactMessages onBack={() => setView("main")} />;

  // da byghayar el background color el kart lama el hover
  const lightenColor = (hex) => ({
    "#f2e8db": "#f8f0e5",
    "#ece0ce": "#f0e5d8",
    "#e5d4be": "#eadac8",
    "#eeddcc": "#f4e8d8",
  }[hex] || hex);

  // da bybni el style object el kamil bta3 kol kart (stat card)
  // byradd el hover state we el mobile state
  const getBoxStyle = (id, baseColor) => ({
    flex: isMobile ? "none" : 1,
    width: isMobile ? "100%" : undefined,
    minWidth: 0, maxWidth: "none",
    backgroundColor: hoveredBox === id ? lightenColor(baseColor) + "ee" : baseColor + "cc",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    borderRadius: "10px", border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: hoveredBox === id ? "0 12px 28px rgba(0,0,0,0.28)" : "0 4px 16px rgba(0,0,0,0.14)",
    height: isMobile ? "200px" : "270px",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    alignItems: "stretch", padding: isMobile ? "14px 16px" : "18px 20px",
    transform: hoveredBox === id ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
    transition: "all 0.3s ease", cursor: "pointer",
    boxSizing: "border-box", position: "relative", zIndex: 1,
  });

  // el navigation items bta3et el sidebar — label + action + badge (lw fi)
  const navItems = [
    { label: "WEBSITE VIEW", action: () => navigate("/home") },
    { label: "ALL PROJECTS", action: () => setView("projects") },
    { label: "USERS",        action: () => setView("users") },
    { label: "MESSAGES",     action: () => setView("messages"), badge: unreadMsgCount },
    { label: "SETTINGS",     action: () => setView("settings") },
  ];

  // da bysafer lel view w beysakkar el sidebar f el mobile
  const handleNavClick = (action) => { action(); setSidebarOpen(false); };

  // pie chart hover handlers — desktop (mouseEnter/Leave) w mobile (touch)
  const handleSliceEnter = (id) => {
    if (sliceTimeoutRef.current) clearTimeout(sliceTimeoutRef.current);
    setHoveredSlice(id);
  };

  const handleSliceLeave = () => {
    setHoveredSlice(null);
  };

  // el touch handler bymaskha el tooltip ba3d 1.5 second
  const handleSliceTouch = (e, id) => {
    e.preventDefault();
    if (sliceTimeoutRef.current) clearTimeout(sliceTimeoutRef.current);
    setHoveredSlice(id);
    sliceTimeoutRef.current = setTimeout(() => setHoveredSlice(null), 1500);
  };

  // ── Sidebar Content ───────────────────────────────────────────────────────
  // el content el gowa el sidebar (nav list + sign out)
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
              {/* el badge el a7mar byet3amel 3ala el messages item */}
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

      {/* sign out — bylogged out men firebase w bynawel lel home page */}
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


  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh",
      fontFamily: "'Poppins', sans-serif",
      position: "relative",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Hamburger Button (Mobile Only) ────────────────────────── */}
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

      {/* el overlay el esswed wara el sidebar f el mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.28)",
        }} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
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
        {/* close button byet3amel bas f el mobile */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{
            position: "absolute", top: "12px", right: "12px",
            background: "transparent", border: "none",
            fontSize: "20px", cursor: "pointer", color: "#6F4E37", lineHeight: 1,
          }}>✕</button>
        )}
        <SidebarContent />
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────── */}
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
        {/* el wreath btet3amel fo2 */}
        <GoldenWreath isMobile={isMobile} />

        {/* ── Stat Cards Container ──────────────────────────────── */}
        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          padding: isMobile ? "0 14px 24px" : "0 60px 30px",
          gap: isMobile ? "12px" : "30px",
          flex: 1, alignItems: isMobile ? "stretch" : "center",
        }}>

          {/* ── Card 1: Projects to Review ────────────────────────
              bywarri el 3adad el pending projects + progress bar
          ─────────────────────────────────────────────────────── */}
          <div style={getBoxStyle(1, "#f2e8db")}
            onMouseEnter={() => setHoveredBox(1)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("review")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0, marginTop: "2px" }}>📋</span>
              <span style={{
                fontSize: isMobile ? "14px" : "18px",
                fontWeight: "700", letterSpacing: "0.5px",
                color: "#3B1F0F", lineHeight: "1.3", wordBreak: "break-word",
              }}>PROJECTS TO REVIEW</span>
            </div>
            <div style={{ fontSize: isMobile ? "40px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{pendingCount}</div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#d4b896", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reviewPct}%`, backgroundColor: "#6F4E37", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reviewPct}% pending review</div>
            </div>
          </div>

          {/* ── Card 2: Projects with Reports ────────────────────
              bywarri el 3adad el reported projects + progress bar
          ─────────────────────────────────────────────────────── */}
          <div style={getBoxStyle(2, "#ece0ce")}
            onMouseEnter={() => setHoveredBox(2)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("reports")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0, marginTop: "2px" }}>📝</span>
              <span style={{
                fontSize: isMobile ? "14px" : "18px",
                fontWeight: "700", letterSpacing: "0.5px",
                color: "#3B1F0F", lineHeight: "1.3", wordBreak: "break-word",
              }}>PROJECTS TO REPORT</span>
            </div>
            <div style={{ fontSize: isMobile ? "40px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{reportsCount}</div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#c8a882", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reportPct}%`, backgroundColor: "#5C4033", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reportPct}% of projects reported</div>
            </div>
          </div>

          {/* ── Card 3: Unread Messages ───────────────────────────
              bywarri el unread messages count + badge lw fi messages gedida
          ─────────────────────────────────────────────────────── */}
          <div style={getBoxStyle(3, "#eeddcc")}
            onMouseEnter={() => setHoveredBox(3)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("messages")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>✉️</span>
                <span style={{ fontSize: isMobile ? "14px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F" }}>MESSAGES</span>
              </div>
              {unreadMsgCount > 0 && (
                <span style={{
                  backgroundColor: "#e74c3c", color: "#fff",
                  borderRadius: "14px", padding: "2px 10px",
                  fontSize: "12px", fontWeight: "800", flexShrink: 0,
                }}>{unreadMsgCount} New</span>
              )}
            </div>
            <div style={{ fontSize: isMobile ? "40px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>{unreadMsgCount}</div>
            <div style={{ fontSize: "13px", color: "#5C4033", textAlign: "center" }}>
              {unreadMsgCount === 0 ? "No new messages" : `${unreadMsgCount} unread message${unreadMsgCount > 1 ? "s" : ""}`}
            </div>
          </div>

          {/* ── Card 4: Projects Distribution (Pie Chart) ─────────
              bywarri el approved projects maqsomeen 3ala categories
          ─────────────────────────────────────────────────────── */}
          <div style={getBoxStyle(4, "#e5d4be")}
            onMouseEnter={() => setHoveredBox(4)} onMouseLeave={() => setHoveredBox(null)}>
            <p style={{ margin: "0", fontSize: isMobile ? "14px" : "22px", fontWeight: "bold", color: "#3B1F0F" }}>
              Projects Distribution
            </p>

            {loadingChart ? (
              // spinner lama el chart data betelod
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <div style={{ width: "32px", height: "32px", border: "4px solid #d4b896", borderTopColor: "#6F4E37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : slices.length === 0 ? (
              // mesh fi approved projects lessa
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, color: "#6F4E37", fontSize: "13px" }}>
                No approved projects yet
              </div>
            ) : (
              <>
                {/* ── SVG Pie Chart ──────────────────────────────── */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, position: "relative" }}>
                  <svg
                    width={isMobile ? "120" : "170"}
                    height={isMobile ? "120" : "170"}
                    viewBox="0 0 140 140"
                    style={{ touchAction: "none" }}
                  >
                    {slices.map((slice) => {
                      const isHovered = hoveredSlice === slice.id;
                      // lama el slice hovered byet7arrak barra shwaya
                      const midRad = ((slice.midAngle - 90) * Math.PI) / 180;
                      const offset = isHovered ? 6 : 0;
                      const tx = offset * Math.cos(midRad);
                      const ty = offset * Math.sin(midRad);
                      const pctNum = parseInt(slice.percent);
                      return (
                        <g
                          key={slice.id}
                          onMouseEnter={() => handleSliceEnter(slice.id)}
                          onMouseLeave={handleSliceLeave}
                          onTouchStart={(e) => handleSliceTouch(e, slice.id)}
                          onTouchEnd={(e) => e.preventDefault()}
                          style={{ cursor: "pointer" }}
                        >
                          {/* el slice path bta3 el pie chart */}
                          <path
                            d={slice.path}
                            fill={slice.color}
                            opacity={isHovered ? 1 : 0.85}
                            transform={`translate(${tx},${ty})`}
                            style={{ transition: "all 0.25s ease" }}
                          />
                          {/* el percentage label fo2 el slice (bas lw 8% aw aktar) */}
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

                    {/* el donut hole f nos el pie chart — bywarri el total */}
                    <circle cx="70" cy="70" r="25" fill="#f4ede3" />
                    <text x="70" y="67" textAnchor="middle" fill="#3B1F0F" fontSize="11" fontWeight="bold">{totalProjects}</text>
                    <text x="70" y="78" textAnchor="middle" fill="#6F4E37" fontSize="7">approved</text>
                  </svg>

                  {/* el tooltip byet3amel fo2 el hovered slice */}
                  {hoveredSlice && (() => {
                    const s = slices.find((sl) => sl.id === hoveredSlice);
                    return s ? (
                      <div style={{
                        position: "absolute",
                        top: isMobile ? "auto" : "0px",
                        bottom: isMobile ? "calc(100% - 10px)" : "auto",
                        right: isMobile ? "auto" : "-10px",
                        left: isMobile ? "50%" : "auto",
                        transform: isMobile ? "translateX(-50%)" : "none",
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

                {/* el legend el so3'ayar ta7t el chart (dots + category names) */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", maxHeight: "42px", overflowY: "auto" }}>
                  {slices.map((slice) => (
                    <span key={slice.id} style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      fontSize: isMobile ? "9px" : "10px", fontWeight: "bold",
                      opacity: hoveredSlice === slice.id ? 1 : 0.7,
                      transition: "opacity 0.25s ease", cursor: "default",
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: slice.color, display: "inline-block", flexShrink: 0 }} />
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