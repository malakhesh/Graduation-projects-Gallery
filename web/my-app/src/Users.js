import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { checkRole, updateRole, addViolation, unsuspendUser, removeViolation } from "./auth.js";
import { auth } from "./firebase.js";
import "./Users.css";

const VIOLATION_REASONS = [
  "Inappropriate or offensive content",
  "Copyright / intellectual property violation",
  "Plagiarized project",
  "Misleading or false project information",
  "Harassment or abusive behavior",
  "Platform policy violation",
];

function ViolationModal({ user, currentRole, onClose, onAddDone, onRemoveDone }) {
  const [reason,   setReason]   = useState("");
  const [details,  setDetails]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error,    setError]    = useState("");

  const existingViolations = user.suspendReasons || [];

  const handleSubmit = async () => {
    if (!reason) { setError("Please select a reason first."); return; }
    setLoading(true);
    const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
    const result     = await addViolation(user.id, fullReason, currentRole);
    setLoading(false);
    if (!result || result === "violation-fail" || result === "unauth" || result === "no-user") {
      setError("Something went wrong. Please try again.");
      return;
    }
    onAddDone(user.id, result.violations, result.status, result.suspendReasons);
    setReason("");
    setDetails("");
    setError("");
  };

  const handleRemove = async (index) => {
    setRemoving(index);
    const result = await removeViolation(user.id, index, currentRole);
    setRemoving(null);
    if (!result || result === "violation-fail" || result === "unauth") {
      setError("Could not remove violation. Please try again.");
      return;
    }
    onRemoveDone(user.id, result.violations, result.status, result.suspendReasons);
  };

  return (
    <div
      className="us-modal-overlay"
      onClick={(e) => e.target.classList.contains("us-modal-overlay") && onClose()}
    >
      <div className="us-modal">
        <h3 className="us-modal-title">Manage Violations</h3>
        <p className="us-modal-user">
          User: <strong>{user.name || user.email}</strong>
          &nbsp;—&nbsp;
          <span style={{ color: "rgb(130,30,30)", fontWeight: 700 }}>
            {user.violations || 0} / 3
          </span>
        </p>

        {existingViolations.length > 0 && (
          <>
            <label className="us-modal-label">Recorded Violations</label>
            <div className="us-existing-violations">
              {existingViolations.map((v, i) => (
                <div key={i} className="us-existing-row">
                  <span className="us-existing-index">{i + 1}</span>
                  <span className="us-existing-text">{v}</span>
                  <button
                    className="us-remove-violation-btn"
                    onClick={() => handleRemove(i)}
                    disabled={removing === i}
                    title="Remove this violation"
                  >
                    {removing === i ? "..." : "🗑️"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {(user.violations || 0) < 3 && (
          <>
            <label className="us-modal-label">Add New Violation</label>
            <div className="us-modal-reasons">
              {VIOLATION_REASONS.map((r) => (
                <button
                  key={r}
                  className={`us-reason-btn ${reason === r ? "us-reason-active" : ""}`}
                  onClick={() => { setReason(r); setError(""); }}
                >{r}</button>
              ))}
            </div>

            <label className="us-modal-label">Additional details (optional)</label>
            <textarea
              className="us-modal-textarea"
              placeholder="Add any extra context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </>
        )}

        {error && <p className="us-modal-error">{error}</p>}

        <div className="us-modal-footer">
          <button className="us-modal-cancel" onClick={onClose}>Close</button>
          {(user.violations || 0) < 3 && (
            <button
              className="us-modal-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Record Violation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── */

function UserCard({ user, index, currentUid, updating, onToggleRole, onUnsuspend, onOpenModal }) {
  const isSelf      = user.id === currentUid;
  const isSuspended = user.status === "suspended";
  const violations  = user.violations || 0;

  return (
    <div className={`us-card ${user.role === "admin" ? "us-card-admin" : ""} ${isSuspended ? "us-card-suspended" : ""}`}>
      <div className="us-card-header">
        <span className="us-card-index">{index + 1}</span>
        <div className="us-card-name-wrap">
          <span className="us-card-name">{user.name || "—"}</span>
          {isSelf      && <span className="us-you-badge">You</span>}
          {isSuspended && <span className="us-suspended-badge">🔒 Suspended</span>}
        </div>
        <span className={`us-role-badge ${user.role === "admin" ? "us-role-admin" : "us-role-client"}`}>
          {user.role === "admin" ? "⭐ Admin" : "👤 Client"}
        </span>
      </div>

      <div className="us-card-body">
        <div className="us-card-row">
          <span className="us-card-label">Email</span>
          <span className="us-card-value">{user.email || "—"}</span>
        </div>
        <div className="us-card-row">
          <span className="us-card-label">Year</span>
          <span className="us-card-value">{user.year || "—"}</span>
        </div>
        <div className="us-card-row">
          <span className="us-card-label">Violations</span>
          <span className={`us-violations-count ${
            violations === 0 ? "" :
            violations === 1 ? "us-v-warning" :
            violations === 2 ? "us-v-danger"  :
            "us-v-suspended"
          }`}>
            {violations} / 3
          </span>
        </div>
      </div>

      {!isSelf && (
        <div className="us-card-actions">
          <button
            className={`us-role-toggle-btn ${user.role === "admin" ? "us-demote-btn" : "us-promote-btn"}`}
            onClick={() => onToggleRole(user)}
            disabled={updating === user.id + "_role"}
          >
            {updating === user.id + "_role" ? "..." : user.role === "admin" ? "Remove Admin" : "Make Admin"}
          </button>

          {(!isSuspended || violations > 0) && (
            <button className="us-violation-btn" onClick={() => onOpenModal(user)}>
              ⚠️ {violations > 0 ? `Violations (${violations})` : "Violation"}
            </button>
          )}

          {isSuspended && (
            <button
              className="us-unsuspend-btn"
              onClick={() => onUnsuspend(user)}
              disabled={updating === user.id + "_unsuspend"}
            >
              {updating === user.id + "_unsuspend" ? "..." : "✅ Unsuspend"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */

function Users({ onBack }) {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [allowed,     setAllowed]     = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [updating,    setUpdating]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [modalUser,   setModalUser]   = useState(null);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const init = async () => {
      const uid  = auth.currentUser?.uid;
      const role = uid ? await checkRole(uid) : null;

      if (role !== "admin") {
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);
      setCurrentRole(role);

      const snapshot = await getDocs(collection(db, "users"));
      const arr = [];
      snapshot.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setUsers(arr);
      setLoading(false);
    };
    init();
  }, []);

  const handleToggleRole = async (targetUser) => {
    if (targetUser.id === auth.currentUser?.uid) return;
    const newRole = targetUser.role === "admin" ? "client" : "admin";
    setUpdating(targetUser.id + "_role");
    const result = await updateRole(targetUser.id, newRole, currentRole);
    if (result === "role-updated") {
      setUsers((prev) =>
        prev.map((u) => u.id === targetUser.id ? { ...u, role: newRole } : u)
      );
    }
    setUpdating(null);
  };

  const handleUnsuspend = async (targetUser) => {
    setUpdating(targetUser.id + "_unsuspend");
    const result = await unsuspendUser(targetUser.id, currentRole);
    if (result === "unsuspend-ok") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, status: "active", violations: 0, suspendReasons: [] }
            : u
        )
      );
    }
    setUpdating(null);
  };

  const handleAddDone = (uid, newViolations, newStatus, newReasons) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === uid
          ? { ...u, violations: newViolations, status: newStatus, suspendReasons: newReasons }
          : u
      )
    );
    setModalUser((prev) =>
      prev?.id === uid
        ? { ...prev, violations: newViolations, status: newStatus, suspendReasons: newReasons }
        : prev
    );
  };

  const handleRemoveDone = (uid, newViolations, newStatus, newReasons) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === uid
          ? { ...u, violations: newViolations, status: newStatus, suspendReasons: newReasons }
          : u
      )
    );
    setModalUser((prev) =>
      prev?.id === uid
        ? { ...prev, violations: newViolations, status: newStatus, suspendReasons: newReasons }
        : prev
    );
  };

  const currentUid = auth.currentUser?.uid;
  const admins     = users.filter((u) => u.role === "admin").length;
  const clients    = users.filter((u) => u.role !== "admin").length;
  const suspended  = users.filter((u) => u.status === "suspended").length;

  const displayed = users
    .filter((u) => {
      if (filter === "admin")     return u.role === "admin";
      if (filter === "suspended") return u.status === "suspended";
      return true;
    })
    .filter((u) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (u.name  || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="us-page">

      {modalUser && (
        <ViolationModal
          user={modalUser}
          currentRole={currentRole}
          onClose={() => setModalUser(null)}
          onAddDone={handleAddDone}
          onRemoveDone={handleRemoveDone}
        />
      )}

      {/* Header */}
      <div className="us-header">
        <button className="us-back-btn" onClick={onBack}>← Back</button>
        <h1 className="us-title">Users</h1>
        <div className="us-stats">
          <span className="us-stat us-stat-total">👥 Total: {users.length}</span>
          <span className="us-stat us-stat-admin">⭐ Admins: {admins}</span>
          <span className="us-stat us-stat-client">👤 Clients: {clients}</span>
          <span className="us-stat us-stat-suspended">🔒 Suspended: {suspended}</span>
        </div>
      </div>

      {loading && (
        <div className="us-loading">
          <div className="us-spinner" />
          <p>Loading users...</p>
        </div>
      )}

      {!loading && !allowed && (
        <div className="us-empty">
          <p>⛔ You don't have permission to view users.</p>
        </div>
      )}

      {!loading && allowed && (
        <div className="us-toolbar">
          <div className="us-search-wrapper">
            <span className="us-search-icon">🔍</span>
            <input
              className="us-search-input"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="us-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="us-filter-row">
            {[
              { key: "all",       label: "All Users" },
              { key: "admin",     label: "⭐ Admins Only" },
              { key: "suspended", label: "🔒 Suspended" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`us-filter-btn ${filter === key ? "us-filter-active" : ""}`}
                onClick={() => setFilter(key)}
              >{label}</button>
            ))}
          </div>
        </div>
      )}

      {!loading && allowed && displayed.length === 0 && (
        <div className="us-empty">
          <p>{search ? `No results for "${search}"` : "No users found."}</p>
        </div>
      )}

      {/* Desktop: Table — Mobile: Cards */}
      {!loading && allowed && displayed.length > 0 && (
        isMobile ? (
          <div className="us-cards-list">
            {displayed.map((user, index) => (
              <UserCard
                key={user.id}
                user={user}
                index={index}
                currentUid={currentUid}
                updating={updating}
                onToggleRole={handleToggleRole}
                onUnsuspend={handleUnsuspend}
                onOpenModal={setModalUser}
              />
            ))}
          </div>
        ) : (
          <div className="us-table-wrapper">
            <table className="us-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Year</th>
                  <th>Violations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((user, index) => {
                  const isSelf      = user.id === currentUid;
                  const isSuspended = user.status === "suspended";
                  const violations  = user.violations || 0;

                  return (
                    <tr
                      key={user.id}
                      className={`
                        ${user.role === "admin" ? "us-row-admin" : ""}
                        ${isSuspended ? "us-row-suspended" : ""}
                      `.trim()}
                    >
                      <td>{index + 1}</td>
                      <td>
                        {user.name || "—"}
                        {isSelf      && <span className="us-you-badge">You</span>}
                        {isSuspended && <span className="us-suspended-badge">🔒 Suspended</span>}
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <span className={`us-role-badge ${user.role === "admin" ? "us-role-admin" : "us-role-client"}`}>
                          {user.role === "admin" ? "⭐ Admin" : "👤 Client"}
                        </span>
                      </td>
                      <td>{user.year || "—"}</td>
                      <td>
                        <span className={`us-violations-count ${
                          violations === 0 ? "" :
                          violations === 1 ? "us-v-warning" :
                          violations === 2 ? "us-v-danger"  :
                          "us-v-suspended"
                        }`}>
                          {violations} / 3
                        </span>
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="us-self-note">—</span>
                        ) : (
                          <div className="us-actions">
                            <button
                              className={`us-role-toggle-btn ${user.role === "admin" ? "us-demote-btn" : "us-promote-btn"}`}
                              onClick={() => handleToggleRole(user)}
                              disabled={updating === user.id + "_role"}
                            >
                              {updating === user.id + "_role"
                                ? "..."
                                : user.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </button>

                            {(!isSuspended || violations > 0) && (
                              <button
                                className="us-violation-btn"
                                onClick={() => setModalUser(user)}
                              >
                                ⚠️ {violations > 0 ? `Violations (${violations})` : "Violation"}
                              </button>
                            )}

                            {isSuspended && (
                              <button
                                className="us-unsuspend-btn"
                                onClick={() => handleUnsuspend(user)}
                                disabled={updating === user.id + "_unsuspend"}
                              >
                                {updating === user.id + "_unsuspend" ? "..." : "✅ Unsuspend"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default Users;