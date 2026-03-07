import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(223, 205, 192)",
        color: "rgb(47, 28, 15)",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>404</h1>
        <h2 style={{ marginBottom: "12px" }}>Page Not Found</h2>
        <p style={{ marginBottom: "20px" }}>
          Sorry, the page you are looking for does not exist.
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            border: "none",
            borderRadius: "10px",
            padding: "12px 20px",
            backgroundColor: "rgb(104, 68, 42)",
            color: "rgb(254, 251, 245)",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}