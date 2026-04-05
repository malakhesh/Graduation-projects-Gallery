import React, { useState, useRef, useEffect } from "react";
import { FaStar, FaRegStar, FaChevronDown, FaTimes } from "react-icons/fa";

const TAGS = ["Business", "Education", "E-commerce", "Entertainment", "Blog"];
const CATEGORIES = ["Web", "Mobile", "Desktop", "AI/ML", "Other"];

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 50,
        border: `1.5px solid ${active ? "rgb(104, 68, 42)" : "rgb(185, 174, 167)"}`,
        background: active ? "rgb(104, 68, 42)" : "rgb(254, 251, 245)",
        color: active ? "rgb(254, 251, 245)" : "rgb(47, 28, 15)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "Arial, Helvetica, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function StarFilter({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === s ? 0 : s)}
          style={{ fontSize: 20, cursor: "pointer", color: s <= (hovered || value) ? "rgb(200, 150, 50)" : "rgb(185, 174, 167)", transition: "color 0.15s" }}
        >
          {s <= (hovered || value) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
      {value > 0 && (
        <span style={{ fontSize: 12, color: "rgb(104, 68, 42)", fontWeight: 600, marginLeft: 4 }}>
          {value}+ stars
        </span>
      )}
    </div>
  );
}

function StackDropdown({ allStacks, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 50,
          border: `1.5px solid ${selected.length > 0 ? "rgb(104, 68, 42)" : "rgb(185, 174, 167)"}`,
          background: selected.length > 0 ? "rgb(104, 68, 42)" : "rgb(254, 251, 245)",
          color: selected.length > 0 ? "rgb(254, 251, 245)" : "rgb(47, 28, 15)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Arial, Helvetica, sans-serif",
          transition: "all 0.15s",
        }}
      >
        Tech Stack {selected.length > 0 ? `(${selected.length})` : ""}
        <FaChevronDown style={{ fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          background: "rgb(254, 251, 245)",
          border: "1px solid rgb(185, 174, 167)",
          borderRadius: 12,
          padding: "10px",
          boxShadow: "0 8px 24px rgba(47,28,15,0.12)",
          zIndex: 300,
          minWidth: 180,
          maxHeight: 220,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(164,132,109) rgb(223,205,192)",
        }}>
          {allStacks.length === 0 ? (
            <span style={{ fontSize: 12, color: "rgb(164,132,109)", padding: "4px 8px" }}>No stacks found</span>
          ) : allStacks.map((s) => (
            <button
              key={s}
              onClick={() => onToggle(s)}
              style={{
                background: selected.includes(s) ? "rgb(223, 205, 192)" : "none",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: selected.includes(s) ? 700 : 500,
                color: "rgb(47, 28, 15)",
                cursor: "pointer",
                fontFamily: "Arial, Helvetica, sans-serif",
                transition: "background 0.15s",
              }}
            >
              {selected.includes(s) ? "✓ " : ""}{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterPanel({ filters, updateFilter, toggleArrayFilter, clearFilters, hasActiveFilters, allStacks, open }) {
  if (!open) return null;

  return (
    <div style={{
      background: "rgb(254, 251, 245)",
      border: "1px solid rgb(185, 174, 167)",
      borderRadius: 16,
      padding: "18px 20px",
      marginTop: -20,
      marginBottom: 20,
      boxShadow: "0 4px 16px rgba(47,28,15,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      animation: "hg-dropdown-in 0.18s cubic-bezier(0.22,1,0.36,1)",
    }}>

      {/* Row 1: Tags + Category */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {/* Tags */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Tag</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS.map((t) => (
              <Chip key={t} label={t} active={filters.tags.includes(t)} onClick={() => toggleArrayFilter("tags", t)} />
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Category</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={filters.categories.includes(c)} onClick={() => toggleArrayFilter("categories", c)} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Tech Stack + Date Sort + Rating Sort */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        {/* Tech Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Tech Stack</span>
          <StackDropdown allStacks={allStacks} selected={filters.stack} onToggle={(s) => toggleArrayFilter("stack", s)} />
        </div>

        {/* Date Sort */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Grad Year</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Chip label="Latest" active={filters.dateSort === "latest"} onClick={() => updateFilter("dateSort", filters.dateSort === "latest" ? null : "latest")} />
            <Chip label="Oldest" active={filters.dateSort === "oldest"} onClick={() => updateFilter("dateSort", filters.dateSort === "oldest" ? null : "oldest")} />
          </div>
        </div>

        {/* Sort by Rating */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Sort</span>
          <Chip label="Highest Rated" active={filters.sortByRating} onClick={() => updateFilter("sortByRating", !filters.sortByRating)} />
        </div>
      </div>

      {/* Row 3: Min Rating */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(164,132,109)", textTransform: "uppercase", letterSpacing: 1 }}>Minimum Rating</span>
        <StarFilter value={filters.minRating} onChange={(v) => updateFilter("minRating", v)} />
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <div style={{ borderTop: "1px solid rgb(185,174,167)", paddingTop: 12 }}>
          <button
            onClick={clearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "1.5px solid rgb(180,60,40)",
              borderRadius: 50,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: "rgb(180,60,40)",
              cursor: "pointer",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            <FaTimes /> Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
