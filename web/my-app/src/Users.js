import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { checkRole } from "./auth.js";
import { auth } from "./firebase.js";
import "./Users.css";

function Users({ onBack }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const init = async () => {
      // تأكد إن اللي فاتح الصفحة admin
      const uid  = auth.currentUser?.uid;
      const role = uid ? await checkRole(uid) : null;

      if (role !== "admin") {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);

      // الـ backend ما عندوش getAllUsers —
      // بنقرأ من Firestore مباشرة (نفس الـ db اللي بيستخدمه الـ backend)
      const snapshot = await getDocs(collection(db, "users"));
      const arr = [];
      snapshot.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setUsers(arr);
      setLoading(false);
    };
    init();
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

      {/* Loading */}
      {loading && (
        <div className="us-loading">
          <div className="us-spinner" />
          <p>Loading users...</p>
        </div>
      )}

      {/* No Permission */}
      {!loading && !allowed && (
        <div className="us-empty">
          <p>⛔ You don't have permission to view users.</p>
        </div>
      )}

      {/* Filter Buttons */}
      {!loading && allowed && (
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
      )}

      {/* Empty */}
      {!loading && allowed && displayed.length === 0 && (
        <div className="us-empty">
          <p>No users found.</p>
        </div>
      )}

      {/* Table */}
      {!loading && allowed && displayed.length > 0 && (
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