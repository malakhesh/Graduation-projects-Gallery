import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#f0e5d8",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "20px", color: "#3B2F2F" }}>
            Graduation Projects Catalog
          </h2>

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{
                marginBottom: "15px",
                padding: "5px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                color: "#6F4E37",
              }}
            >
              Projects
              <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>New Projects</li>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>Ongoing Projects</li>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>Completed Projects</li>
              </ul>
            </li>

            <li
              style={{
                marginBottom: "15px",
                padding: "5px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                color: "#6F4E37",
              }}
            >
              Users
              <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>Students</li>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>Doctors</li>
                <li style={{ cursor: "pointer", color: "#8B6B61" }}>General Users</li>
              </ul>
            </li>

            <li
              style={{
                marginBottom: "15px",
                padding: "5px",
                borderBottom: "1px solid #ccc",
                cursor: "pointer",
                color: "#6F4E37",
              }}
            >
              Admin Panel
            </li>
          </ul>
        </div>

        <div>
          <button
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
              backgroundColor: "#5C4033",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Manage Projects
          </button>

          <button
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              backgroundColor: "#5C4033",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Profile
          </button>

          <div style={{ marginTop: "20px", textAlign: "center", color: "#5C4033" }}>
            <span style={{ cursor: "pointer", padding: "5px" }} onClick={() => navigate("/login")}>
              Sign In
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p>Welcome to the Admin Dashboard.</p>
      </main>
    </div>
  );
}