import React, { useState, useEffect } from "react"
import { db } from "./firebase.js"
import { doc, getDoc, setDoc } from "firebase/firestore"

const SETTINGS_REF = () => doc(db, "settings", "siteConfig")

async function loadSettings() {
  try {
    const snap = await getDoc(SETTINGS_REF())
    if (snap.exists()) return snap.data()
    return null
  } catch { return null }
}

async function saveSettings(data) {
  try {
    await setDoc(SETTINGS_REF(), data, { merge: true })
    return "ok"
  } catch { return "fail" }
}

const DEFAULTS = {
  siteName: "",
  maintenanceMode: false,
  registrationOpen: true,
  projectUploadOpen: true,
  autoApprove: false,
  maxProjectsPerUser: 3,
  categories: [],
  tags: [],
  notifyOnNewProject: true,
  notifyOnNewUser: true,
  notifyOnReport: true,
}

function SectionCard({ icon, title, children }) {
  return (
    <div style={{
      backgroundColor: "rgba(253,246,238,0.75)",
      backdropFilter: "blur(14px)",
      borderRadius: "16px",
      border: "1px solid rgba(200,168,130,0.3)",
      boxShadow: "0 6px 24px rgba(111,78,55,0.08)",
      padding: "28px 32px",
      marginBottom: "24px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "22px",
        paddingBottom: "14px",
        borderBottom: "2px solid rgba(180,130,80,0.2)",
      }}>
        <span style={{ fontSize: "22px" }}>{icon}</span>
        <h2 style={{
          margin: 0,
          fontFamily: "'Georgia', serif",
          fontSize: "18px", fontWeight: "bold",
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
    }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#3B2F2F" }}>{label}</div>
        {sublabel && <div style={{ fontSize: "12px", color: "#9a7050", marginTop: "2px" }}>{sublabel}</div>}
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

function TextInput({ label, sublabel, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block", fontSize: "13px",
        fontWeight: "700", color: "#5a3825",
        marginBottom: "4px", letterSpacing: "0.3px",
      }}>{label}</label>
      {sublabel && (
        <div style={{ fontSize: "11px", color: "#9a7050", marginBottom: "6px" }}>{sublabel}</div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px",
          borderRadius: "10px",
          border: "1.5px solid rgba(180,130,80,0.35)",
          backgroundColor: "rgba(255,255,255,0.6)",
          fontSize: "14px", color: "#3B2F2F",
          outline: "none", boxSizing: "border-box",
          fontFamily: "'Poppins', sans-serif",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#6F4E37"}
        onBlur={(e) => e.target.style.borderColor = "rgba(180,130,80,0.35)"}
      />
    </div>
  )
}

function TagManager({ label, sublabel, items, onChange }) {
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.trim()
    if (!val || items.includes(val)) return
    onChange([...items, val])
    setInput("")
  }

  const remove = (item) => onChange(items.filter((i) => i !== item))

  return (
    <div style={{ marginBottom: "18px" }}>
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
          }}>
            {item}
            <span
              onClick={() => remove(item)}
              style={{
                cursor: "pointer", color: "#9a5030",
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
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`Add ${label.toLowerCase()}…`}
          style={{
            flex: 1, padding: "8px 12px",
            borderRadius: "8px",
            border: "1.5px solid rgba(180,130,80,0.35)",
            backgroundColor: "rgba(255,255,255,0.6)",
            fontSize: "13px", color: "#3B2F2F",
            outline: "none",
            fontFamily: "'Poppins', sans-serif",
          }}
          onFocus={(e) => e.target.style.borderColor = "#6F4E37"}
          onBlur={(e) => e.target.style.borderColor = "rgba(180,130,80,0.35)"}
        />
        <button
          onClick={add}
          style={{
            padding: "8px 18px",
            borderRadius: "8px", border: "none",
            backgroundColor: "#6F4E37", color: "#fff",
            fontWeight: "700", fontSize: "13px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#8B6347"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#6F4E37"}
        >+ Add</button>
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
        position: "fixed", top: "22px", left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: toast.ok ? "#3B2F2F" : "#7a1800",
        color: "#fff", padding: "12px 26px",
        borderRadius: "14px", fontWeight: "700", fontSize: "13px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        zIndex: 9999, letterSpacing: "0.4px",
        animation: "toastIn 0.25s ease", whiteSpace: "nowrap",
      }}>
        {toast.ok ? "✅" : "❌"} {toast.msg}
      </div>
    </>
  )
}

function DashboardSettings({ onBack }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)

  useEffect(() => {
    loadSettings().then((data) => {
      if (data) setSettings({ ...DEFAULTS, ...data })
      setLoading(false)
    })
  }, [])

  const set = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }))

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettings(settings)
    setSaving(false)
    if (result === "ok") showToast("Settings saved successfully.")
    else showToast("Failed to save settings.", false)
  }

  const counterBtn = (action) => ({
    width: "34px", height: "34px", borderRadius: "50%",
    border: "1.5px solid rgba(111,78,55,0.3)",
    backgroundColor: hoveredBtn === action ? "#e8d5bf" : "rgba(255,255,255,0.6)",
    fontSize: "18px", cursor: "pointer",
    color: "#6F4E37", fontWeight: "bold",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  })

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
      `}</style>

      <Toast toast={toast} />

      <div style={{
        display: "flex", minHeight: "100vh", width: "100%",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #f0e5d8 0%, #dcc4a8 50%, #c9a882 100%)",
      }}>

        {/* Sidebar */}
        <aside style={{
          position: "fixed", left: 0, top: 0, bottom: 0, width: "200px",
          backgroundColor: "#f0e5d8",
          borderRight: "2px solid rgba(111,78,55,0.2)",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 20px", zIndex: 100,
          boxShadow: "4px 0 20px rgba(111,78,55,0.08)",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "15px", letterSpacing: "3px",
              color: "#3B2F2F", marginBottom: "32px",
              textTransform: "uppercase",
            }}>Dashboard</h2>

            <button
              onClick={onBack}
              onMouseEnter={() => setHoveredBtn("back")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: "100%", textAlign: "left",
                background: "none", border: "none",
                padding: "10px 12px", borderRadius: "10px",
                cursor: "pointer", color: "#6F4E37",
                fontWeight: hoveredBtn === "back" ? "700" : "600",
                fontSize: "13px", letterSpacing: "0.5px",
                backgroundColor: hoveredBtn === "back" ? "#e8d5bf" : "transparent",
                transform: hoveredBtn === "back" ? "translateX(5px)" : "translateX(0)",
                transition: "all 0.25s ease",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
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
            onMouseEnter={() => setHoveredBtn("save-side")}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              width: "100%", padding: "12px",
              borderRadius: "12px", border: "none",
              backgroundColor: saving ? "#a07850" : hoveredBtn === "save-side" ? "#8B6347" : "#6F4E37",
              color: "#fff", fontWeight: "700", fontSize: "13px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 14px rgba(111,78,55,0.3)",
              letterSpacing: "0.4px",
            }}>
            {saving ? "Saving…" : "💾 Save Changes"}
          </button>
        </aside>

        {/* Main */}
        <main style={{
          marginLeft: "200px", flex: 1,
          padding: "40px 48px",
          overflowY: "auto", minHeight: "100vh",
        }}>
          <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease" }}>
            <h1 style={{
              fontFamily: "'Georgia', serif",
              fontSize: "34px", fontWeight: "bold",
              color: "#3B1F0F", margin: "0 0 6px",
              letterSpacing: "0.5px",
            }}>Site Settings</h1>
            <p style={{ color: "#8a6245", fontSize: "14px", margin: 0 }}>
              Control everything about how the site behaves.
            </p>
            <div style={{
              marginTop: "18px", height: "3px",
              background: "linear-gradient(to right, #6F4E37, #c9a882, transparent)",
              borderRadius: "4px", width: "260px",
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
            <div style={{ maxWidth: "720px", animation: "fadeUp 0.45s ease" }}>

              {/* General */}
              <SectionCard icon="🏫" title="General">
                <TextInput
                  label="Site Name"
                  sublabel="Shown in the browser tab and header"
                  value={settings.siteName}
                  onChange={(v) => set("siteName", v)}
                  placeholder="e.g. Graduation Projects Catalog"
                />
              </SectionCard>

              {/* Access Control */}
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

                {/* Max Projects Counter */}
                <div style={{ marginTop: "16px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "700", color: "#5a3825",
                    marginBottom: "4px", letterSpacing: "0.3px",
                  }}>Max Projects Per User</label>
                  <div style={{ fontSize: "11px", color: "#9a7050", marginBottom: "10px" }}>
                    Maximum number of projects each user can submit
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => set("maxProjectsPerUser", Math.max(1, settings.maxProjectsPerUser - 1))}
                      onMouseEnter={() => setHoveredBtn("minus")}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={counterBtn("minus")}
                    >−</button>

                    <div style={{
                      width: "60px", height: "34px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(180,130,80,0.35)",
                      backgroundColor: "rgba(255,255,255,0.6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: "700", color: "#3B2F2F",
                    }}>
                      {settings.maxProjectsPerUser}
                    </div>

                    <button
                      onClick={() => set("maxProjectsPerUser", Math.min(20, settings.maxProjectsPerUser + 1))}
                      onMouseEnter={() => setHoveredBtn("plus")}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={counterBtn("plus")}
                    >+</button>

                    <span style={{ fontSize: "12px", color: "#9a7050" }}>
                      projects per user (max 20)
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* Categories & Tags */}
              <SectionCard icon="🏷️" title="Categories & Tags">
                <TagManager
                  label="Categories"
                  sublabel="Project categories users can choose from"
                  items={settings.categories}
                  onChange={(v) => set("categories", v)}
                />
                <TagManager
                  label="Tags"
                  sublabel="Tags users can apply to their projects"
                  items={settings.tags}
                  onChange={(v) => set("tags", v)}
                />
              </SectionCard>

              {/* Notifications */}
              <SectionCard icon="🔔" title="Admin Notifications">
                <Toggle
                  checked={settings.notifyOnNewProject}
                  onChange={(v) => set("notifyOnNewProject", v)}
                  label="New Project Submitted"
                  sublabel="Notify admin when a project is submitted for review"
                />
                <Toggle
                  checked={settings.notifyOnNewUser}
                  onChange={(v) => set("notifyOnNewUser", v)}
                  label="New User Registered"
                  sublabel="Notify admin when a new user signs up"
                />
                <Toggle
                  checked={settings.notifyOnReport}
                  onChange={(v) => set("notifyOnReport", v)}
                  label="New Report Filed"
                  sublabel="Notify admin when a user reports a project or comment"
                />
              </SectionCard>

              {/* Bottom Save */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "40px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  onMouseEnter={() => setHoveredBtn("save-bot")}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    padding: "13px 36px",
                    borderRadius: "12px", border: "none",
                    backgroundColor: saving ? "#a07850" : hoveredBtn === "save-bot" ? "#8B6347" : "#6F4E37",
                    color: "#fff", fontWeight: "700", fontSize: "14px",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 6px 20px rgba(111,78,55,0.3)",
                    letterSpacing: "0.5px",
                  }}>
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