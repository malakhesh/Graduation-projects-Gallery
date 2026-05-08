import React, { useState, useEffect } from "react";
import { db } from "./firebase.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import "./AllProjects.css";

function Projects({ onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
        getDocs(query(collection(db, "projects"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "projects"), where("status", "==", "approved"))),
        getDocs(query(collection(db, "projects"), where("status", "==", "rejected"))),
      ]);

      const arr = [];
      pendingSnap.forEach((d)  => arr.push({ id: d.id, ...d.data() }));
      approvedSnap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      rejectedSnap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setProjects(arr);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const pendingCount  = projects.filter((p) => p.status === "pending").length;
  const approvedCount = projects.filter((p) => p.status === "approved").length;
  const rejectedCount = projects.filter((p) => p.status === "rejected").length;

  const displayed = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.title       || "").toLowerCase().includes(q) ||
        (p.desc        || "").toLowerCase().includes(q) ||
        (p.author      || "").toLowerCase().includes(q) ||
        (p.authorName  || "").toLowerCase().includes(q) ||
        (p.userId      || "").toLowerCase().includes(q) ||
        (p.category    || "").toLowerCase().includes(q) ||
        (Array.isArray(p.tags)  && p.tags.some((t)  => t.toLowerCase().includes(q))) ||
        (Array.isArray(p.stack) && p.stack.some((s) => s.toLowerCase().includes(q)))
      );
    });

  return React.createElement("div", { className: "pr-page" },

    // Header
    React.createElement("div", { className: "pr-header" },
      React.createElement("button", { className: "pr-back-btn", onClick: onBack }, "← Back"),
      React.createElement("h1", { className: "pr-title" }, "All Projects"),
      React.createElement("div", { className: "pr-stats" },
        React.createElement("span", { className: "pr-stat pr-stat-total" },    "📁 Total: ",    projects.length),
        React.createElement("span", { className: "pr-stat pr-stat-pending" },  "⏳ Pending: ",  pendingCount),
        React.createElement("span", { className: "pr-stat pr-stat-approved" }, "✅ Approved: ", approvedCount),
        React.createElement("span", { className: "pr-stat pr-stat-rejected" }, "❌ Rejected: ", rejectedCount)
      )
    ),

    // Search Bar
    React.createElement("div", { className: "pr-search-wrapper" },
      React.createElement("span", { className: "pr-search-icon" }, "🔍"),
      React.createElement("input", {
        className: "pr-search-input",
        type: "text",
        placeholder: "Search by title, author, category, tag, or stack…",
        value: search,
        onChange: (e) => setSearch(e.target.value),
      }),
      search && React.createElement("button", { className: "pr-search-clear", onClick: () => setSearch("") }, "✕")
    ),

    // Filter Buttons
    React.createElement("div", { className: "pr-filter-row" },
      ["all", "pending", "approved", "rejected"].map((f) =>
        React.createElement("button", {
          key: f,
          className: "pr-filter-btn " + (filter === f ? "pr-filter-active pr-filter-active-" + f : ""),
          onClick: () => setFilter(f),
        },
          f === "all"      ? "All"         :
          f === "pending"  ? "⏳ Pending"  :
          f === "approved" ? "✅ Approved" :
                             "❌ Rejected"
        )
      )
    ),

    // Loading
    loading && React.createElement("div", { className: "pr-loading" },
      React.createElement("div", { className: "pr-spinner" }),
      React.createElement("p", null, "Loading projects...")
    ),

    // Empty
    !loading && displayed.length === 0 && React.createElement("div", { className: "pr-empty" },
      React.createElement("p", null, search ? `No results for "${search}"` : "No projects found.")
    ),

    // Cards
    !loading && displayed.length > 0 && React.createElement("div", { className: "pr-grid" },
      displayed.map((project) => {
        const status = project.status || "pending";
        return React.createElement("div", { key: project.id, className: "pr-card pr-card-" + status },

          React.createElement("div", { className: "pr-badge pr-badge-" + status },
            status === "pending"  ? "⏳ Pending"  :
            status === "approved" ? "✅ Approved" :
                                    "❌ Rejected"
          ),

          (project.imgUrl || project.imageURL || project.image) &&
            React.createElement("div", { className: "pr-img-wrapper" },
              React.createElement("img", {
                src: project.imgUrl || project.imageURL || project.image,
                alt: project.title,
                className: "pr-img",
              })
            ),

          React.createElement("div", { className: "pr-info" },
            React.createElement("h3", { className: "pr-project-title" }, project.title || "Untitled"),
            React.createElement("div", { className: "pr-author-row" },
              React.createElement("p", { className: "pr-author-name" },
                "👤 " + (project.author || project.authorName || project.userId || "Unknown")
              ),
              project.createdAt && React.createElement("p", { className: "pr-author-date" },
                "🗓 " + (project.createdAt?.toDate
                  ? project.createdAt.toDate().toLocaleDateString()
                  : project.createdAt)
              )
            ),
            project.desc && React.createElement("p", { className: "pr-description" }, project.desc)
          )
        );
      })
    )
  );
}

export default Projects;