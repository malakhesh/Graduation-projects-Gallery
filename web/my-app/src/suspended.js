import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "./firebase.js"
import { logOut } from "./auth.js"

function Suspended() {
  const [user] = useAuthState(auth)
  const [suspendedUntil, setSuspendedUntil] = useState(null)
  const [suspendReasons, setSuspendReasons] = useState([])
  const [timeLeft, setTimeLeft] = useState(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      setSuspendedUntil(data.suspendedUntil ?? null)
      setSuspendReasons(data.suspendReasons ?? [])
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!suspendedUntil) return

    const until = suspendedUntil?.toDate
      ? suspendedUntil.toDate()
      : new Date(suspendedUntil)

    const tick = () => {
      const diff = until - Date.now()
      if (diff <= 0) {
        setTimeLeft(null)
        setExpired(true)
        return
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [suspendedUntil])

  const pad = (n) => String(n).padStart(2, "0")

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(16px, 4vw, 40px) clamp(12px, 4vw, 20px)",
    }}>

      <div style={{
        background: "var(--bg-card)",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        maxWidth: "520px",
        width: "100%",
        padding: "clamp(24px, 5vw, 40px) clamp(16px, 5vw, 36px)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>

        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" style={{ width: "28px", height: "28px", fill: "var(--text-inverse)" }}>
            <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c2.395 0 4.6.832 6.33 2.205L5.205 18.33A8.948 8.948 0 0 1 3 12c0-4.963 4.037-9 9-9zm0 18c-2.395 0-4.6-.832-6.33-2.205L18.795 5.67A8.948 8.948 0 0 1 21 12c0 4.963-4.037 9-9 9z"/>
          </svg>
        </div>

        <div>
          <p style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "clamp(18px, 4vw, 22px)",
            fontWeight: "700",
            color: "var(--text-primary)",
            textAlign: "center",
            margin: "0 0 10px",
          }}>
            Account Suspended
          </p>
          <p style={{
            fontSize: "clamp(13px, 3vw, 14px)",
            color: "var(--text-secondary)",
            textAlign: "center",
            lineHeight: "1.6",
            margin: 0,
          }}>
            You are currently suspended from using our website for violating our terms three times.
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />

        <div>
          <p style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-muted)",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            margin: "0 0 10px",
          }}>
            {expired ? "Suspension ended" : "Suspension ends in"}
          </p>

          {expired ? (
            <div style={{
              textAlign: "center",
              fontSize: "clamp(13px, 3vw, 14px)",
              color: "var(--success-text)",
              background: "var(--success-bg)",
              border: "1px solid var(--success)",
              borderRadius: "10px",
              padding: "12px",
            }}>
              Your suspension has ended. You can now log back in.
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(6px, 2vw, 12px)" }}>
              {[
                { val: timeLeft ? pad(timeLeft.h) : "00", label: "Hours"   },
                { val: timeLeft ? pad(timeLeft.m) : "00", label: "Minutes" },
                { val: timeLeft ? pad(timeLeft.s) : "00", label: "Seconds" },
              ].map(({ val, label }) => (
                <div key={label} style={{
                  background: "var(--bg-tag)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "clamp(8px, 2vw, 12px) clamp(10px, 3vw, 18px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  flex: 1,
                  maxWidth: "100px",
                }}>
                  <span style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: "clamp(20px, 6vw, 28px)",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}>
                    {val}
                  </span>
                  <span style={{
                    fontSize: "clamp(9px, 2vw, 11px)",
                    color: "var(--text-muted)",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />

        {suspendReasons.length > 0 && (
          <div>
            <p style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-primary)",
              margin: "0 0 10px",
            }}>
              Recorded violations
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {suspendReasons.map((reason, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: "var(--bg-tag)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    minWidth: "20px",
                    borderRadius: "50%",
                    background: "var(--danger)",
                    color: "var(--text-inverse)",
                    fontSize: "11px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}>
                    {i + 1}
                  </div>
                  <span style={{
                    fontSize: "clamp(12px, 3vw, 13px)",
                    color: "var(--text-secondary)",
                    lineHeight: "1.5",
                    wordBreak: "break-word",
                  }}>
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />

        <button
          onClick={logOut}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--accent-darkest)",
            color: "var(--text-inverse)",
            border: "none",
            borderRadius: "12px",
            fontSize: "clamp(13px, 3vw, 14px)",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            transition: "background 0.2s",
            touchAction: "manipulation",
          }}
          onMouseEnter={e => e.target.style.background = "var(--accent-dark)"}
          onMouseLeave={e => e.target.style.background = "var(--accent-darkest)"}
        >
          Log out
        </button>

      </div>
    </div>
  )
}

export default Suspended