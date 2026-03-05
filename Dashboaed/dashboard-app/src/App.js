import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./login";
import wreathImg from "./wreath.png";

function GoldenWreath() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      width: "100%",
      flexShrink: 0,
      position: "relative",
    }}>
      <div style={{ position: "relative", width: "460px", height: "220px" }}>
        <img
          src={wreathImg}
          alt="wreath"
          style={{
            width: "460px",
            height: "460px",
            objectFit: "contain",
            transform: "scaleX(1.4)",
            position: "absolute",
            top: "-140px",
            left: "0",
            pointerEvents: "none",
          }}
        />
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}>
          <span style={{
            fontFamily: "'Georgia', serif",
            fontSize: "48px",
            fontWeight: "bold",
            color: "#3d1f00",
            letterSpacing: "8px",
            textTransform: "uppercase",
            textShadow: "0 0 14px rgba(255,215,0,0.6), 0 1px 3px rgba(100,60,0,0.4)",
          }}>
            Welcome
          </span>
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const [hoveredBox,    setHoveredBox]    = useState(null);
  const [hoveredNav,    setHoveredNav]    = useState(null);
  const [hoveredSignIn, setHoveredSignIn] = useState(false);
  const [hoveredSlice,  setHoveredSlice]  = useState(null);

  const lightenColor = (hex) => ({
    "#eddcc8": "#f5ece0",
    "#e5ceb5": "#e8caa8",
    "#dcc4a8": "#dbbfa0",
  }[hex] || hex);

  const getBoxStyle = (id, baseColor) => ({
    flex: 1, minWidth: 0, maxWidth: "none",
    backgroundColor: hoveredBox === id ? lightenColor(baseColor) : baseColor,
    borderRadius: "10px",
    boxShadow: hoveredBox === id ? "0 12px 28px rgba(0,0,0,0.25)" : "0 4px 8px rgba(0,0,0,0.1)",
    height: "270px",
    display: "flex", flexDirection: "column",
    justifyContent: "space-between", alignItems: "stretch",
    padding: "18px 20px",
    transform: hoveredBox === id ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
    transition: "all 0.3s ease",
    cursor: "pointer", boxSizing: "border-box", position: "relative", zIndex: 1,
  });

  const slices = [
    { id:"web", label:"Web Dev", percent:"50%", count:10, color:"#6F4E37", path:"M70,70 L70,10 A60,60 0 0,1 122,100 Z", labelX:92, labelY:42, countX:107, countY:54 },
    { id:"ai",  label:"AI",      percent:"30%", count:6,  color:"#a0714f", path:"M70,70 L122,100 A60,60 0 0,1 18,100 Z",  labelX:70, labelY:112, countX:70, countY:124 },
    { id:"mob", label:"Mobile",  percent:"20%", count:4,  color:"#d2a679", path:"M70,70 L18,100 A60,60 0 0,1 70,10 Z",   labelX:32, labelY:42, countX:32, countY:54 },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Poppins', sans-serif" }}>
      <aside style={{
        position:"fixed", left:0, top:0, bottom:0, width:"200px",
        backgroundColor:"#f0e5d8", padding:"20px",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
      }}>
        <div>
          <h2 style={{ marginBottom:"20px", color:"#3B2F2F" }}>DASHBOARD</h2>
          <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:"55px" }}>
            {["HOME","PROFILE","TEAM","SETTINGS"].map((item) => (
          <h2 style={{ marginBottom: "20px", color: "#3B2F2F" }}>DASHBOARD</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "55px" }}>
            {["HOME", "PROFILE", "TEAM", "SETTINGS"].map((item) => (
              <li key={item}
                onMouseEnter={() => setHoveredNav(item)}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => { if (item==="Dashboard") navigate("/"); }}
                style={{
                  padding:"8px 10px", borderBottom:"1px solid #ccc",
                  cursor:"pointer", color:"#6F4E37", borderRadius:"8px",
                  backgroundColor: hoveredNav===item ? "#e8d5bf" : "transparent",
                  transform: hoveredNav===item ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
                  boxShadow: hoveredNav===item ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  transition:"all 0.3s ease",
                  fontWeight: hoveredNav===item ? "bold" : "normal",
                }}
              onClick={() => { if (item === "HOME") navigate("/"); }}
              >{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ marginTop:"20px", textAlign:"center", color:"#5C4033" }}>
            <span onClick={() => navigate("/login")}
              onMouseEnter={() => setHoveredSignIn(true)}
              onMouseLeave={() => setHoveredSignIn(false)}
              style={{
                cursor:"pointer", padding:"8px 16px", borderRadius:"8px", display:"inline-block",
                backgroundColor: hoveredSignIn ? "#e8d5bf" : "transparent",
                transform: hoveredSignIn ? "translateX(6px) scale(1.02)" : "translateX(0) scale(1)",
                boxShadow: hoveredSignIn ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                fontWeight: hoveredSignIn ? "bold" : "normal",
                color:"#5C4033", transition:"all 0.3s ease",
              }}
            >SIGN OUT</span>
          </div>
        </div>
      </aside>

      <main style={{
        display:"flex", flexDirection:"column",
        marginLeft:"200px", backgroundColor:"transparent",
        height:"100vh", width:"calc(100vw - 200px)",
        boxSizing:"border-box", overflow:"hidden",
      }}>
        <GoldenWreath />

        <div style={{
          display:"flex", flexDirection:"row",
          padding:"0 60px 30px", gap:"30px",
          flex:1, alignItems:"center",
        }}>
          <div style={getBoxStyle(1,"#eddcc8")}
            onMouseEnter={()=>setHoveredBox(1)} onMouseLeave={()=>setHoveredBox(null)}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", overflow:"hidden" }}>
              <span style={{ fontSize:"22px", flexShrink:0 }}>📋</span>
              <span style={{ fontSize:"22px", fontWeight:"700", letterSpacing:"0.5px", color:"#3B1F0F", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>PROJECTS TO REVIEW</span>
            </div>
            <div style={{ fontSize:"56px", fontWeight:"800", color:"#3B2F2F", lineHeight:1, textAlign:"center" }}>12</div>
            <div>
              <div style={{ width:"100%", backgroundColor:"#c8a882", borderRadius:"10px", height:"8px", overflow:"hidden" }}>
                <div style={{ width:"60%", backgroundColor:"#6F4E37", height:"100%", borderRadius:"10px", transition:"width 0.5s ease" }}/>
              </div>
              <div style={{ fontSize:"12px", color:"#5C4033", marginTop:"4px" }}>60% reviewed</div>
            </div>
          </div>

          <div style={getBoxStyle(2,"#e5ceb5")}
            onMouseEnter={()=>setHoveredBox(2)} onMouseLeave={()=>setHoveredBox(null)}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", overflow:"hidden" }}>
              <span style={{ fontSize:"22px", flexShrink:0 }}>📝</span>
              <span style={{ fontSize:"22px", fontWeight:"700", letterSpacing:"0.5px", color:"#3B1F0F", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>PROJECTS TO REPORT</span>
            </div>
            <div style={{ fontSize:"56px", fontWeight:"800", color:"#3B2F2F", lineHeight:1, textAlign:"center" }}>7</div>
            <div>
              <div style={{ width:"100%", backgroundColor:"#b89868", borderRadius:"10px", height:"8px", overflow:"hidden" }}>
                <div style={{ width:"10%", backgroundColor:"#5C4033", height:"100%", borderRadius:"10px", transition:"width 0.5s ease" }}/>
              </div>
              <div style={{ fontSize:"12px", color:"#5C4033", marginTop:"4px" }}>10% reported</div>
            </div>
          </div>

          <div style={getBoxStyle(3,"#dcc4a8")}
            onMouseEnter={()=>setHoveredBox(3)} onMouseLeave={()=>setHoveredBox(null)}>
            <p style={{ margin:"0", fontSize:"22px", fontWeight:"bold", color:"#3B1F0F" }}>Projects Distribution</p>
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", flex:1, position:"relative" }}>
              <svg width="170" height="170" viewBox="0 0 140 140">
                {slices.map((slice) => (
                  <g key={slice.id}
                    onMouseEnter={()=>setHoveredSlice(slice.id)}
                    onMouseLeave={()=>setHoveredSlice(null)}
                    style={{ cursor:"pointer" }}>
                    <path d={slice.path} fill={slice.color}
                      opacity={hoveredSlice===slice.id ? 1 : 0.85}
                      transform={hoveredSlice===slice.id ? `translate(${slice.id==="web"?4:slice.id==="ai"?0:-4},${slice.id==="web"?-4:slice.id==="ai"?4:-4})` : "translate(0,0)"}
                      style={{ transition:"all 0.25s ease" }}/>
                    <text x={slice.labelX} y={slice.labelY} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" style={{pointerEvents:"none"}}>{slice.percent}</text>
                    <text x={slice.countX} y={slice.countY} textAnchor="middle" fill="white" fontSize="8" style={{pointerEvents:"none"}}>{slice.count} projects</text>
                  </g>
                ))}
                <circle cx="70" cy="70" r="25" fill="#f0e5d8"/>
              </svg>
              {hoveredSlice && (() => {
                const s = slices.find(sl=>sl.id===hoveredSlice);
                return (
                  <div style={{
                    position:"absolute", top:"0px", right:"-10px",
                    backgroundColor:"#3B2F2F", color:"white",
                    padding:"6px 10px", borderRadius:"8px",
                    fontSize:"12px", fontWeight:"bold",
                    pointerEvents:"none", whiteSpace:"nowrap",
                    boxShadow:"0 4px 12px rgba(0,0,0,0.3)", zIndex:10,
                  }}>
                    {s.label}: {s.count} projects ({s.percent})
                  </div>
                );
              })()}
            </div>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
              {slices.map((slice) => (
                <span key={slice.id} style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", fontWeight:"bold",
                  opacity: hoveredSlice===slice.id ? 1 : 0.7, transition:"opacity 0.25s ease" }}>
                  <span style={{ width:"10px", height:"10px", borderRadius:"50%", backgroundColor:slice.color, display:"inline-block" }}/>
                  {slice.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}