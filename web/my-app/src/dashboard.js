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

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [view, setView] = useState("main");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredBox, setHoveredBox] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredSignIn, setHoveredSignIn] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const [slices, setSlices] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loadingChart, setLoadingChart] = useState(true);

  // ── Dynamic counts ────────────────────────────────────────────────────────
  const [pendingCount, setPendingCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [reviewPct, setReviewPct] = useState(0);
  const [reportPct, setReportPct] = useState(0);

  // Close sidebar when switching to desktop
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

      // Dynamic counts
      setPendingCount(pendingArr.length);
      setReportsCount(reportsArr.length);

      // Review bar: نسبة الـ pending من (approved + pending)
      const totalReview = approvedArr.length + pendingArr.length;
      setReviewPct(totalReview > 0 ? Math.round((pendingArr.length / totalReview) * 100) : 0);

      // Report bar: نسبة الـ reports من إجمالي الـ projects
      const totalAll = approvedArr.length + pendingArr.length + rejectedArr.length;
      setReportPct(totalAll > 0 ? Math.round((reportsArr.length / totalAll) * 100) : 0);

      // Chart
      const all = [...approvedArr, ...pendingArr, ...rejectedArr];
      const categoryMap = {};
      all.forEach((p) => {
        const cat = p.category?.trim();
        if (!cat) return;
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const total = Object.values(categoryMap).reduce((s, n) => s + n, 0);
      setTotalProjects(total);
      setSlices(buildSlices(categoryMap, total, 70, 70, 60));
      setLoadingChart(false);
    };
    fetchData();
  }, []);

  // ── view routing ──────────────────────────────────────────────────────────
  if (view === "review")   return <ReviewProjects onBack={() => setView("main")} />;
  if (view === "users")    return <Users onBack={() => setView("main")} />;
  if (view === "projects") return <Projects onBack={() => setView("main")} />;
  if (view === "reports")  return <AdminReports onBack={() => setView("main")} />;
  if (view === "settings") return <DashboardSettings onBack={() => setView("main")} />;

  const lightenColor = (hex) => ({
    "#eddcc8": "#f5ece0",
    "#e5ceb5": "#e8caa8",
    "#dcc4a8": "#dbbfa0",
  }[hex] || hex);

  const getBoxStyle = (id, baseColor) => ({
    flex: isMobile ? "none" : 1,
    width: isMobile ? "100%" : undefined,
    minWidth: 0,
    maxWidth: "none",
    backgroundColor: hoveredBox === id ? lightenColor(baseColor) + "ee" : baseColor + "cc",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: hoveredBox === id ? "0 12px 28px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.2)",
    height: isMobile ? "220px" : "270px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    padding: isMobile ? "14px 16px" : "18px 20px",
    transform: hoveredBox === id ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
  });

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { label: "WEBSITE VIEW", action: () => navigate("/home") },
    { label: "ALL PROJECTS", action: () => setView("projects") },
    { label: "USERS",        action: () => setView("users") },
    { label: "SETTINGS",     action: () => setView("settings") },
  ];

  const handleNavClick = (action) => {
    action();
    setSidebarOpen(false);
  };

  // ── Sidebar shared content ────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <div>
        <h2 style={{ marginBottom: "20px", color: "#3B2F2F" }}>DASHBOARD</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "40px" }}>
          {navItems.map(({ label, action }) => (
            <li key={label}
              onMouseEnter={() => setHoveredNav(label)}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={() => handleNavClick(action)}
              style={{
                padding: "8px 10px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                color: "#6F4E37",
                borderRadius: "8px",
                backgroundColor: hoveredNav === label ? "#e8d5bf" : "transparent",
                transform: hoveredNav === label ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
                boxShadow: hoveredNav === label ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.3s ease",
                fontWeight: hoveredNav === label ? "bold" : "normal",
              }}
            >{label}</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: "20px", textAlign: "center", color: "#5C4033" }}>
        <span
          onClick={async () => { await logOut(); navigate("/"); }}
          onMouseEnter={() => setHoveredSignIn(true)}
          onMouseLeave={() => setHoveredSignIn(false)}
          style={{
            cursor: "pointer", padding: "8px 16px", borderRadius: "8px", display: "inline-block",
            backgroundColor: hoveredSignIn ? "#e8d5bf" : "transparent",
            transform: hoveredSignIn ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
            boxShadow: hoveredSignIn ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
            fontWeight: hoveredSignIn ? "bold" : "normal",
            color: "#5C4033", transition: "all 0.3s ease",
          }}
        >SIGN OUT</span>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Poppins', sans-serif", position: "relative" }}>

      {/* ── MOBILE: Hamburger button ── */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed", top: "14px", left: "14px", zIndex: 100,
            width: "42px", height: "42px",
            backgroundColor: "#f0e5d8",
            border: "1px solid rgba(111,78,55,0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: "5px",
            padding: "0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block",
              width: "20px", height: "2px",
              backgroundColor: "#6F4E37",
              borderRadius: "2px",
              transition: "all 0.3s ease",
              transform: sidebarOpen
                ? i === 0 ? "translateY(7px) rotate(45deg)"
                : i === 1 ? "opacity 0" : "translateY(-7px) rotate(-45deg)"
                : "none",
              opacity: sidebarOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      )}

      {/* ── MOBILE: Overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 20,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed",
        left: isMobile ? (sidebarOpen ? 0 : "-220px") : 0,
        top: 0, bottom: 0,
        width: "200px",
        backgroundColor: "#f0e5d8",
        padding: "20px",
        borderRight: "2px solid rgba(111,78,55,0.25)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        zIndex: 30,
        transition: isMobile ? "left 0.3s ease" : "none",
        boxShadow: isMobile && sidebarOpen ? "4px 0 20px rgba(0,0,0,0.2)" : "none",
      }}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute", top: "12px", right: "12px",
              background: "transparent", border: "none",
              fontSize: "20px", cursor: "pointer",
              color: "#6F4E37", lineHeight: 1,
            }}
          >✕</button>
        )}
        <SidebarContent />
      </aside>

      {/* ── Main ── */}
      <main style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: isMobile ? 0 : "200px",
        background: "linear-gradient(to top, #c9a882, #f0e5d8)",
        height: "100vh",
        width: isMobile ? "100vw" : "calc(100vw - 200px)",
        boxSizing: "border-box",
        overflow: isMobile ? "auto" : "hidden",
        paddingTop: isMobile ? "60px" : 0,
      }}>
        <GoldenWreath isMobile={isMobile} />

        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          padding: isMobile ? "0 16px 24px" : "0 60px 30px",
          gap: isMobile ? "16px" : "30px",
          flex: 1,
          alignItems: isMobile ? "stretch" : "center",
        }}>

          {/* Box 1 — Review */}
          <div style={getBoxStyle(1, "#eddcc8")}
            onMouseEnter={() => setHoveredBox(1)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("review")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>📋</span>
              <span style={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>PROJECTS TO REVIEW</span>
            </div>
            <div style={{ fontSize: isMobile ? "44px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>
              {pendingCount}
            </div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#c8a882", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reviewPct}%`, backgroundColor: "#6F4E37", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reviewPct}% pending review</div>
            </div>
          </div>

          {/* Box 2 — Reports */}
          <div style={getBoxStyle(2, "#e5ceb5")}
            onMouseEnter={() => setHoveredBox(2)} onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setView("reports")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              <span style={{ fontSize: isMobile ? "18px" : "22px", flexShrink: 0 }}>📝</span>
              <span style={{ fontSize: isMobile ? "16px" : "22px", fontWeight: "700", letterSpacing: "0.5px", color: "#3B1F0F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>PROJECTS TO REPORT</span>
            </div>
            <div style={{ fontSize: isMobile ? "44px" : "56px", fontWeight: "800", color: "#3B2F2F", lineHeight: 1, textAlign: "center" }}>
              {reportsCount}
            </div>
            <div>
              <div style={{ width: "100%", backgroundColor: "#b89868", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${reportPct}%`, backgroundColor: "#5C4033", height: "100%", borderRadius: "10px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "12px", color: "#5C4033", marginTop: "4px" }}>{reportPct}% of projects reported</div>
            </div>
          </div>

          {/* Box 3 — Distribution */}
          <div style={getBoxStyle(3, "#dcc4a8")}
            onMouseEnter={() => setHoveredBox(3)} onMouseLeave={() => setHoveredBox(null)}>
            <p style={{ margin: "0", fontSize: isMobile ? "16px" : "22px", fontWeight: "bold", color: "#3B1F0F" }}>
              Projects Distribution
            </p>

            {loadingChart ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "32px", height: "32px",
                  border: "4px solid #c8a882",
                  borderTopColor: "#6F4E37",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : slices.length === 0 ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, color: "#6F4E37", fontSize: "13px" }}>
                No data yet
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
                            d={slice.path}
                            fill={slice.color}
                            opacity={isHovered ? 1 : 0.85}
                            transform={`translate(${tx},${ty})`}
                            style={{ transition: "all 0.25s ease" }}
                          />
                          {pctNum >= 8 && (
                            <text
                              x={slice.labelX + tx}
                              y={slice.labelY + ty}
                              textAnchor="middle"
                              fill="white"
                              fontSize="8"
                              fontWeight="bold"
                              style={{ pointerEvents: "none" }}
                            >
                              {slice.percent}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    <circle cx="70" cy="70" r="25" fill="#f0e5d8" />
                    <text x="70" y="67" textAnchor="middle" fill="#3B1F0F" fontSize="11" fontWeight="bold">{totalProjects}</text>
                    <text x="70" y="78" textAnchor="middle" fill="#6F4E37" fontSize="7">projects</text>
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
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 10,
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
                      transition: "opacity 0.25s ease",
                      cursor: "default",
                    }}>
                      <span style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        backgroundColor: slice.color, display: "inline-block", flexShrink: 0,
                      }} />
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