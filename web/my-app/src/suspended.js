import { useEffect, useState } from "react"
import { logOut } from "./auth.js"

function Suspended({ suspendedUntil, suspendReasons = [] }) {
  const [timeLeft, setTimeLeft] = useState(null)
  const [expired,  setExpired]  = useState(false)

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
      background: "rgb(223, 205, 192)",
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>

      <div style={{
        background: "rgb(254, 251, 245)",
        borderRadius: "20px",
        border: "1px solid rgb(185, 174, 167)",
        maxWidth: "520px",
        width: "100%",
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>

        {/* Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgb(180, 60, 40)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
        }}>
          <svg viewBox="0 0 24 24" style={{ width: "28px", height: "28px", fill: "rgb(254, 251, 245)" }}>
            <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c2.395 0 4.6.832 6.33 2.205L5.205 18.33A8.948 8.948 0 0 1 3 12c0-4.963 4.037-9 9-9zm0 18c-2.395 0-4.6-.832-6.33-2.205L18.795 5.67A8.948 8.948 0 0 1 21 12c0 4.963-4.037 9-9 9z"/>
          </svg>
        </div>

        {/* Title */}
        <div>
          <p style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "22px",
            fontWeight: "700",
            color: "rgb(47, 28, 15)",
            textAlign: "center",
            margin: "0 0 10px",
          }}>
            Account Suspended
          </p>
          <p style={{
            fontSize: "14px",
            color: "rgb(104, 68, 42)",
            textAlign: "center",
            lineHeight: "1.6",
            margin: 0,
          }}>
            You are currently suspended from using our website for violating our terms three times.
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgb(185, 174, 167)", margin: 0 }} />

        {/* Timer */}
        <div>
          <p style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "rgb(164, 132, 109)",
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
              fontSize: "14px",
              color: "rgb(60, 120, 60)",
              background: "rgb(220, 240, 220)",
              border: "1px solid rgb(160, 200, 160)",
              borderRadius: "10px",
              padding: "12px",
            }}>
              Your suspension has ended. You can now log back in.
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {[
                { val: timeLeft ? pad(timeLeft.h) : "00", label: "Hours"   },
                { val: timeLeft ? pad(timeLeft.m) : "00", label: "Minutes" },
                { val: timeLeft ? pad(timeLeft.s) : "00", label: "Seconds" },
              ].map(({ val, label }) => (
                <div key={label} style={{
                  background: "rgb(243, 236, 229)",
                  border: "1px solid rgb(185, 174, 167)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  minWidth: "64px",
                }}>
                  <span style={{
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "rgb(47, 28, 15)",
                    lineHeight: 1,
                  }}>
                    {val}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "rgb(164, 132, 109)",
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

        <hr style={{ border: "none", borderTop: "1px solid rgb(185, 174, 167)", margin: 0 }} />

        {/* Violations */}
        {suspendReasons.length > 0 && (
          <div>
            <p style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "rgb(47, 28, 15)",
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
                  background: "rgb(243, 236, 229)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  border: "1px solid rgb(185, 174, 167)",
                }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgb(180, 60, 40)",
                    color: "rgb(254, 251, 245)",
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
                    fontSize: "13px",
                    color: "rgb(104, 68, 42)",
                    lineHeight: "1.5",
                  }}>
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid rgb(185, 174, 167)", margin: 0 }} />

        {/* Logout */}
        <button
          onClick={logOut}
          style={{
            width: "100%",
            padding: "12px",
            background: "rgb(47, 28, 15)",
            color: "rgb(254, 251, 245)",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.target.style.background = "rgb(104, 68, 42)"}
          onMouseLeave={e => e.target.style.background = "rgb(47, 28, 15)"}
        >
          Log out
        </button>

      </div>
    </div>
  )
}

export default Suspended