import React, { useState, useEffect } from "react";
import { getAllUsers } from "./auth.js";
import "./Users.css";

function Users({ onBack }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all"); // "all" or "admin"

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const admins  = users.filter((u) => u.role === "admin").length;
  const clients = users.filter((u) => u.role !== "admin").length;

  const displayed = filter === "admin"
    ? users.filter((u) => u.role === "admin")
    : users;

  return (
    <div className="us-page">

      {/* Header */}
      <div className="us-header">
        <button className="us-back-btn" onClick={onBack}>← Back</button>
        <h1 className="us-title">Users</h1>
        <div className="us-stats">
          <span className="us-stat us-stat-total">👥 Total: {users.length}</span>
          <span className="us-stat us-stat-admin">⭐ Admins: {admins}</span>
          <span className="us-stat us-stat-client">👤 Clients: {clients}</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="us-filter-row">
        <button
          className={`us-filter-btn ${filter === "all" ? "us-filter-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Users
        </button>
        <button
          className={`us-filter-btn ${filter === "admin" ? "us-filter-active" : ""}`}
          onClick={() => setFilter("admin")}
        >
          ⭐ Admins Only
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="us-loading">
          <div className="us-spinner" />
          <p>Loading users...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="us-empty">
          <p>No users found.</p>
        </div>
      )}

      {/* Table */}
      {!loading && displayed.length > 0 && (
        <div className="us-table-wrapper">
          <table className="us-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((user, index) => (
                <tr key={user.id} className={user.role === "admin" ? "us-row-admin" : ""}>
                  <td>{index + 1}</td>
                  <td>{user.name || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>
                    <span className={`us-role-badge ${user.role === "admin" ? "us-role-admin" : "us-role-client"}`}>
                      {user.role === "admin" ? "⭐ Admin" : "👤 Client"}
                    </span>
                  </td>
                  <td>{user.year || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;