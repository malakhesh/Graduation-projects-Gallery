import React, { useState, useEffect } from "react"
import { db, auth } from "./firebase.js"
import { doc, getDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getUploadOptions, addOption, removeOption } from "./configs.js"
import { getSettings, updateSettings } from "./DashSettings.js"

const DEFAULTS = {
  maintenanceMode: false,
  registrationOpen: true,
  projectUploadOpen: true,
  autoApprove: false,
  maxProjectsPerUserPerDay: 3,
  maxMessagesPerDay: 3,
  contactOpen: true,
  suspensionDuration: 7,
  suspensionUnit: "days",
}

function SectionCard({ icon, title, children }) {
  return (
    <div style={{
      backgroundColor: "rgba(253,246,238,0.75)",
      backdropFilter: "blur(14px)",
      borderRadius: "16px",
      border: "1px solid rgba(200,168,130,0.3)",
      boxShadow: "0 6px 24px rgba(111,78,55,0.08)",
      padding: "20px 20px",
      marginBottom: "20px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "18px",
        paddingBottom: "12px",
        borderBottom: "2px solid rgba(180,130,80,0.2)",
      }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <h2 style={{
          margin: 0,
          fontFamily: "'Georgia', serif",
          fontSize: "16px", fontWeight: "bold",
          color: "#3B1F0F", letterSpacing: "0.3px",
        }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid rgba(200,168,130,0.15)",
      gap: "12px",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#3B2F2F" }}>{label}</div>
        {sublabel && (
          <div style={{
            fontSize: "12px", color: "#9a7050", marginTop: "2px",
            whiteSpace: "normal", wordBreak: "break-word",
          }}>{sublabel}</div>
        )}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: "48px", height: "26px",
          borderRadius: "13px",
          backgroundColor: checked ? "#6F4E37" : "#d2b49c",
          position: "relative", cursor: "pointer",
          transition: "background-color 0.25s ease",
          flexShrink: 0,
          boxShadow: checked ? "0 2px 8px rgba(111,78,55,0.35)" : "none",
        }}>
        <div style={{
          width: "20px", height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          position: "absolute",
          top: "3px",
          left: checked ? "25px" : "3px",
          transition: "left 0.25s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  )
}

function Stepper({ label, sublabel, value, onChange, min = 1, max = 20, suffix = "" }) {
  const btnStyle = {
    width: "38px", height: "38px", borderRadius: "50%",
    border: "1.5px solid rgba(111,78,55,0.3)",
    backgroundColor: "rgba(255,255,255,0.6)",
    fontSize: "20px", cursor: "pointer",
    color: "#6F4E37", fontWeight: "bold",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s", flexShrink: 0,
    touchAction: "manipulation",
  }
  return (
    <div style={{ marginTop: "16px" }}>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: "700", color: "#5a3825",
        marginBottom: "4px", letterSpacing: "0.3px",
      }}>{label}</label>
      {sublabel && (
        <div style={{ fontSize: "11px", color: "#9a7050", marginBottom: "10px" }}>{sublabel}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={btnStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e8d5bf"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.6)"}
        >−</button>

        <div style={{
          width: "60px", height: "38px",
          borderRadius: "10px",
          border: "1.5px solid rgba(180,130,80,0.35)",
          backgroundColor: "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: "700", color: "#3B2F2F",
          flexShrink: 0,
        }}>
          {value}
        </div>

        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={btnStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e8d5bf"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.6)"}
        >+</button>

        {suffix && (
          <span style={{ fontSize: "12px", color: "#9a7050" }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

const UNIT_OPTIONS = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours",   label: "Hours"   },
  { value: "days",    label: "Days"    },
]

function SuspensionDurationPicker({ duration, unit, onDurationChange, onUnitChange }) {
  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid rgba(180,130,80,0.35)",
    backgroundColor: "rgba(255,255,255,0.6)",
    fontSize: "14px", color: "#3B2F2F",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.2s",
  }

  const previewLabel = () => {
    const n = Number(duration)
    if (!n || n <= 0) return null
    if (unit === "seconds") return n < 60 ? `${n}s` : `${(n/60).toFixed(1)} min`
    if (unit === "minutes") return n < 60 ? `${n} min` : `${(n/60).toFixed(1)} hr`
    if (unit === "hours")   return n < 24 ? `${n} hr` : `${(n/24).toFixed(1)} days`
    if (unit === "days")    return `${n} day${n !== 1 ? "s" : ""}`
    return null
  }

  const preview = previewLabel()

  return (
    <div>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: "700", color: "#5a3825",
        marginBottom: "4px", letterSpacing: "0.3px",
      }}>Default Suspension Duration</label>
      <div style={{ fontSize: "11px", color: "#9a7050", marginBottom: "10px" }}>
        Applied to <strong>new suspensions only</strong>. Existing suspensions keep their original end time.
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="number"
          min="1"
          max="9999"
          value={duration}
          onChange={(e) => {
            const val = Math.max(1, Math.min(9999, Number(e.target.value) || 1))
            onDurationChange(val)
          }}
          style={{ ...inputStyle, width: "100px" }}
          onFocus={(e) => e.target.style.borderColor = "#6F4E37"}
          onBlur={(e) => e.target.style.borderColor = "rgba(180,130,80,0.35)"}
        />

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUnitChange(opt.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: unit === opt.value
                  ? "1.5px solid #6F4E37"
                  : "1.5px solid rgba(180,130,80,0.35)",
                backgroundColor: unit === opt.value ? "#6F4E37" : "rgba(255,255,255,0.6)",
                color: unit === opt.value ? "#fff" : "#5a3825",
                fontWeight: "600", fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Poppins', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (unit !== opt.value) e.currentTarget.style.backgroundColor = "#e8d5bf"
              }}
              onMouseLeave={(e) => {
                if (unit !== opt.value) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.6)"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {preview && (
        <div style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "10px",
          backgroundColor: "rgba(111,78,55,0.07)",
          border: "1px solid rgba(111,78,55,0.18)",
          fontSize: "12px",
          color: "#5a3825",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "14px" }}>🕐</span>
          New suspensions will last <strong style={{ marginLeft: "4px" }}>{preview}</strong>.
        </div>
      )}
    </div>
  )
}

function UploadOptionManager({ label, sublabel, listName, items, role, onItemsChange, showToast }) {
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)

  const add = async () => {
    const val = input.trim()
    if (!val || items.includes(val)) return
    setBusy(true)
    const result = await addOption(listName, val, role)
    if (result === "option-added") {
      onItemsChange([...items, val])
      setInput("")
      showToast(`"${val}" added to ${label.toLowerCase()}`)
    } else {
      showToast(`Failed to add "${val}" (${result})`, false)
    }
    setBusy(false)
  }

  const remove = async (item) => {
    setBusy(true)
    const result = await removeOption(listName, item, role)
    if (result === "option-removed") {
      onItemsChange(items.filter((i) => i !== item))
      showToast(`"${item}" removed from ${label.toLowerCase()}`)
    } else {
      showToast(`Failed to remove "${item}" (${result})`, false)
    }
    setBusy(false)
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: "700", color: "#5a3825",
        marginBottom: "4px", letterSpacing: "0.3px",
      }}>{label}</label>
      {sublabel && (
        <div style={{ fontSize: "11px", color: "#9a7050", marginBottom: "8px" }}>{sublabel}</div>
      )}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "8px",
        marginBottom: "10px", minHeight: "32px",
      }}>
        {items.length === 0 && (
          <span style={{ fontSize: "12px", color: "#b09070", fontStyle: "italic" }}>None added yet</span>
        )}
        {items.map((item) => (
          <span key={item} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 12px",
            backgroundColor: "rgba(111,78,55,0.1)",
            border: "1px solid rgba(111,78,55,0.2)",
            borderRadius: "20px",
            fontSize: "12px", fontWeight: "600", color: "#5a3825",
            opacity: busy ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}>
            {item}
            <span
              onClick={() => !busy && remove(item)}
              style={{
                cursor: busy ? "not-allowed" : "pointer",
                color: "#9a5030",
                fontWeight: "bold", fontSize: "14px",
                lineHeight: 1,
              }}>×</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && add()}
          placeholder={`Add to ${label.toLowerCase()}…`}
          disabled={busy}
          style={{
            flex: 1, padding: "8px 12px",
            borderRadius: "8px",
            border: "1.5px solid rgba(180,130,80,0.35)",
            backgroundColor: "rgba(255,255,255,0.6)",
            fontSize: "13px", color: "#3B2F2F",
            outline: "none",
            fontFamily: "'Poppins', sans-serif",
            minWidth: 0,
            opacity: busy ? 0.6 : 1,
          }}
          onFocus={(e) => e.target.style.borderColor = "#6F4E37"}
          onBlur={(e) => e.target.style.borderColor = "rgba(180,130,80,0.35)"}
        />
        <button
          onClick={add}
          disabled={busy}
          style={{
            padding: "8px 16px",
            borderRadius: "8px", border: "none",
            backgroundColor: busy ? "#a07850" : "#6F4E37",
            color: "#fff",
            fontWeight: "700", fontSize: "13px",
            cursor: busy ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!busy) e.target.style.backgroundColor = "#8B6347" }}
          onMouseLeave={(e) => { if (!busy) e.target.style.backgroundColor = busy ? "#a07850" : "#6F4E37" }}
        >{busy ? "…" : "+ Add"}</button>
      </div>
    </div>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div style={{
        position: "fixed", top: "16px", left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: toast.ok ? "#3B2F2F" : "#7a1800",
        color: "#fff", padding: "12px 20px",
        borderRadius: "14px", fontWeight: "700", fontSize: "13px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        zIndex: 9999, letterSpacing: "0.4px",
        animation: "toastIn 0.25s ease", whiteSpace: "nowrap",
        maxWidth: "90vw",
      }}>
        {toast.ok ? "✅" : "❌"} {toast.msg}
      </div>
    </>
  )
}

function DashboardSettings({ onBack }) {
  const [user] = useAuthState(auth)
  const [role, setRole] = useState(null)

  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [uploadOptions, setUploadOptions] = useState({ tags: [], categories: [], techStacks: [] })

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setRole(snap.data()?.role ?? null)
    })
  }, [user])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    Promise.all([getSettings(), getUploadOptions()]).then(([siteData, optionsData]) => {
      if (siteData && siteData !== "settings-fail") {
        setSettings({ ...DEFAULTS, ...siteData })
      }
      if (optionsData && optionsData !== "get-options-fail") {
        setUploadOptions({
          tags: optionsData.tags || [],
          categories: optionsData.categories || [],
          techStacks: optionsData.techStacks || [],
        })
      }
      setLoading(false)
    })
  }, [])

  // ── أغلق الـ sidebar لما تضغط بره ──
  useEffect(() => {
    if (!sidebarOpen) return
    const handler = (e) => {
      if (!e.target.closest("#sidebar") && !e.target.closest(".ds-hamburger-btn")) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [sidebarOpen])

  const set = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }))

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await updateSettings(settings)
    setSaving(false)
    if (result === "settings-ok") showToast("Settings saved successfully.")
    else showToast("Failed to save settings.", false)
    if (isMobile) setSidebarOpen(false)
  }

  const SIDEBAR_WIDTH = "200px"

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a882; border-radius: 10px; }

        @media (max-width: 767px) {
          .ds-sidebar {
            width: 220px !important;
            transform: translateX(-100%);
            transition: transform 0.28s ease !important;
            box-shadow: 6px 0 28px rgba(0,0,0,0.18) !important;
          }
          .ds-sidebar.open {
            transform: translateX(0) !important;
          }
          .ds-main {
            margin-left: 0 !important;
            padding: 72px 16px 32px !important;
          }
          .ds-hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 768px) {
          .ds-sidebar {
            transform: translateX(0) !important;
          }
          .ds-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>

      <Toast toast={toast} />

      {/* ── Overlay: بس لما السيدبار مفتوح ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 99,
          }}
        />
      )}

      {/* ── Hamburger ── */}
      <button
        className="ds-hamburger-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        style={{
          display: "none",
          position: "fixed", top: "14px", left: "14px",
          zIndex: 200,
          width: "42px", height: "42px",
          borderRadius: "10px", border: "none",
          backgroundColor: "#6F4E37",
          flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "5px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(111,78,55,0.35)",
        }}
        aria-label="Open menu"
      >
        {[0,1,2].map((i) => (
          <div key={i} style={{
            width: "20px", height: "2px",
            backgroundColor: "#fff", borderRadius: "2px",
          }} />
        ))}
      </button>

      <div style={{
        display: "flex", minHeight: "100vh", width: "100%",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #f0e5d8 0%, #dcc4a8 50%, #c9a882 100%)",
      }}>

        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`ds-sidebar${sidebarOpen ? " open" : ""}`}
          style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            width: SIDEBAR_WIDTH,
            backgroundColor: "#f0e5d8",
            borderRight: "2px solid rgba(111,78,55,0.2)",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 20px", zIndex: 100,
            boxShadow: "4px 0 20px rgba(111,78,55,0.08)",
            transition: "transform 0.28s ease",
            overflowY: "auto",
          }}
        >
          <div>
            <h2 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "15px", letterSpacing: "3px",
              color: "#3B2F2F", marginBottom: "32px",
              textTransform: "uppercase",
            }}>Dashboard</h2>

            <button
              onClick={() => { onBack?.(); setSidebarOpen(false) }}
              style={{
                width: "100%", textAlign: "left",
                background: "none", border: "none",
                padding: "10px 12px", borderRadius: "10px",
                cursor: "pointer", color: "#6F4E37",
                fontWeight: "600",
                fontSize: "13px", letterSpacing: "0.5px",
                backgroundColor: "transparent",
                transition: "all 0.25s ease",
                display: "flex", alignItems: "center", gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e8d5bf"
                e.currentTarget.style.fontWeight = "700"
                e.currentTarget.style.transform = "translateX(5px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.fontWeight = "600"
                e.currentTarget.style.transform = "translateX(0)"
              }}
            >
              ← Back
            </button>

            <div style={{
              marginTop: "16px",
              padding: "10px 12px", borderRadius: "10px",
              backgroundColor: "#6F4E37", color: "#fdf6ee",
              fontWeight: "700", fontSize: "13px", letterSpacing: "0.5px",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(111,78,55,0.3)",
            }}>
              ⚙️ Settings
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              width: "100%", padding: "12px",
              borderRadius: "12px", border: "none",
              backgroundColor: saving ? "#a07850" : "#6F4E37",
              color: "#fff", fontWeight: "700", fontSize: "13px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 14px rgba(111,78,55,0.3)",
              letterSpacing: "0.4px",
              marginTop: "24px",
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#8B6347" }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#6F4E37" }}
          >
            {saving ? "Saving…" : "💾 Save Changes"}
          </button>
        </aside>

        {/* Main content */}
        <main
          className="ds-main"
          style={{
            marginLeft: SIDEBAR_WIDTH,
            flex: 1,
            padding: "40px 48px",
            overflowY: "auto", minHeight: "100vh",
          }}
        >
          <div style={{ marginBottom: "30px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(24px, 5vw, 34px)",
              fontWeight: "bold",
              color: "#3B1F0F", margin: "0 0 6px",
              letterSpacing: "0.5px",
            }}>Site Settings</h1>
            <p style={{ color: "#8a6245", fontSize: "14px", margin: 0 }}>
              Control everything about how the site behaves.
            </p>
            <div style={{
              marginTop: "16px", height: "3px",
              background: "linear-gradient(to right, #6F4E37, #c9a882, transparent)",
              borderRadius: "4px", width: "min(260px, 80%)",
            }} />
          </div>

          {loading ? (
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", minHeight: "300px", gap: "14px",
            }}>
              <div style={{
                width: "40px", height: "40px",
                border: "4px solid #d2b49c", borderTopColor: "#6F4E37",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: "#8a6245", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>
                Loading settings…
              </span>
            </div>
          ) : (
            <div style={{
              maxWidth: "720px", width: "100%",
              animation: "fadeUp 0.45s ease",
            }}>

              <SectionCard icon="🔐" title="Access Control">
                <Toggle
                  checked={settings.maintenanceMode}
                  onChange={(v) => set("maintenanceMode", v)}
                  label="Maintenance Mode"
                  sublabel="Closes the site for all users except admins"
                />
                <Toggle
                  checked={settings.registrationOpen}
                  onChange={(v) => set("registrationOpen", v)}
                  label="Allow Registration"
                  sublabel="Let new users sign up"
                />
                <Toggle
                  checked={settings.projectUploadOpen}
                  onChange={(v) => set("projectUploadOpen", v)}
                  label="Allow Project Uploads"
                  sublabel="Let users submit new projects"
                />
                <Toggle
                  checked={settings.autoApprove}
                  onChange={(v) => set("autoApprove", v)}
                  label="Auto-Approve Projects"
                  sublabel="Skip review — projects go live immediately"
                />

                <Stepper
                  label="Max Projects Per User Per Day"
                  sublabel="Maximum number of projects each user can submit in a single calendar day"
                  value={settings.maxProjectsPerUserPerDay}
                  onChange={(v) => set("maxProjectsPerUserPerDay", v)}
                  min={1}
                  max={20}
                  suffix="projects per user per day (max 20)"
                />
              </SectionCard>

              <SectionCard icon="🚫" title="User Suspension">
                <SuspensionDurationPicker
                  duration={settings.suspensionDuration}
                  unit={settings.suspensionUnit}
                  onDurationChange={(v) => set("suspensionDuration", v)}
                  onUnitChange={(v) => set("suspensionUnit", v)}
                />
              </SectionCard>

              <SectionCard icon="✉️" title="Contact & Messaging">
                <Toggle
                  checked={settings.contactOpen}
                  onChange={(v) => set("contactOpen", v)}
                  label="Allow Contact Messages"
                  sublabel="When disabled, users cannot send messages through the contact form"
                />

                <Stepper
                  label="Max Messages Per User Per Day"
                  sublabel="Maximum number of contact messages each email can send in a single day"
                  value={settings.maxMessagesPerDay}
                  onChange={(v) => set("maxMessagesPerDay", v)}
                  min={1}
                  max={20}
                  suffix={`messages per email per day (max 20)`}
                />

                <div style={{
                  marginTop: "16px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: settings.contactOpen
                    ? "rgba(39,174,96,0.08)"
                    : "rgba(192,57,43,0.08)",
                  border: `1px solid ${settings.contactOpen
                    ? "rgba(39,174,96,0.2)"
                    : "rgba(192,57,43,0.2)"}`,
                  fontSize: "12px",
                  color: settings.contactOpen ? "#1e6b3c" : "#7a1800",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{ fontSize: "14px" }}>
                    {settings.contactOpen ? "✅" : "🔒"}
                  </span>
                  {settings.contactOpen
                    ? `Contact form is currently open — users can send up to ${settings.maxMessagesPerDay} message${settings.maxMessagesPerDay !== 1 ? "s" : ""} per day.`
                    : "Contact form is currently closed — all messages will be blocked."}
                </div>
              </SectionCard>

              <SectionCard icon="🏷️" title="Upload Options">
                <p style={{ fontSize: "12px", color: "#9a7050", marginBottom: "18px", marginTop: "-8px" }}>
                  Changes here are saved instantly to Firestore and reflected in the upload modal immediately.
                </p>
                {role === null ? (
                  <p style={{ fontSize: "13px", color: "#9a7050", fontStyle: "italic" }}>Loading permissions…</p>
                ) : role !== "admin" ? (
                  <p style={{ fontSize: "13px", color: "#7a1800" }}>⛔ You don't have permission to edit these options.</p>
                ) : (
                  <>
                    <UploadOptionManager
                      label="Tags"
                      sublabel="Tags users can pick when uploading a project"
                      listName="tags"
                      items={uploadOptions.tags}
                      role={role}
                      onItemsChange={(v) => setUploadOptions((prev) => ({ ...prev, tags: v }))}
                      showToast={showToast}
                    />
                    <UploadOptionManager
                      label="Categories"
                      sublabel="Categories users can assign to their project"
                      listName="categories"
                      items={uploadOptions.categories}
                      role={role}
                      onItemsChange={(v) => setUploadOptions((prev) => ({ ...prev, categories: v }))}
                      showToast={showToast}
                    />
                    <UploadOptionManager
                      label="Tech Stacks"
                      sublabel="Technologies users can tag their project with"
                      listName="techStacks"
                      items={uploadOptions.techStacks}
                      role={role}
                      onItemsChange={(v) => setUploadOptions((prev) => ({ ...prev, techStacks: v }))}
                      showToast={showToast}
                    />
                  </>
                )}
              </SectionCard>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "40px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  style={{
                    padding: "13px 36px",
                    borderRadius: "12px", border: "none",
                    backgroundColor: saving ? "#a07850" : "#6F4E37",
                    color: "#fff", fontWeight: "700", fontSize: "14px",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 6px 20px rgba(111,78,55,0.3)",
                    letterSpacing: "0.5px",
                    width: "100%",
                    maxWidth: "280px",
                    touchAction: "manipulation",
                  }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#8B6347" }}
                  onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#6F4E37" }}
                >
                  {saving ? "Saving…" : "💾 Save Changes"}
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default DashboardSettings