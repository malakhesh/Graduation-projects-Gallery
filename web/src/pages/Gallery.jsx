import React from "react";

export default function Gallery() {
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
        <h1 style={{ marginBottom: "12px" }}>Gallery Page</h1>
        <p style={{ margin: 0, fontSize: "18px" }}>
          This page will display graduation projects soon.
        </p>
      </div>
    </div>
  );
}