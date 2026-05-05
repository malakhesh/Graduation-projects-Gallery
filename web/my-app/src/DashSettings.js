import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase.js"

const DEFAULTS = {
  siteName: "Graduation Gallery",
  maintenanceMode: false,
  registrationOpen: true,
  projectUploadOpen: true,
  autoApprove: false,
  maxProjectsPerUserPerDay: 3,
  notifyOnNewProject: true,
  notifyOnNewUser: true,
  notifyOnReport: true,
  contactOpen: true,
  suspensionDuration: 7,
  suspensionUnit: "days", // "seconds" | "minutes" | "hours" | "days"
}

async function getSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "siteConfig"))
    if (!snap.exists()) return DEFAULTS
    const data = snap.data()

    // Migrate old key → new key for existing Firestore docs
    if (data.maxProjectsPerUser !== undefined && data.maxProjectsPerUserPerDay === undefined) {
      data.maxProjectsPerUserPerDay = data.maxProjectsPerUser
      delete data.maxProjectsPerUser
    }

    return { ...DEFAULTS, ...data }
  } catch {
    return "settings-fail"
  }
}

function listenSettings(callback) {
  return onSnapshot(
    doc(db, "settings", "siteConfig"),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        // Migrate old key on live updates too
        if (data.maxProjectsPerUser !== undefined && data.maxProjectsPerUserPerDay === undefined) {
          data.maxProjectsPerUserPerDay = data.maxProjectsPerUser
          delete data.maxProjectsPerUser
        }
        callback({ ...DEFAULTS, ...data })
      } else {
        callback(DEFAULTS)
      }
    },
    () => callback(DEFAULTS)
  )
}

async function updateSettings(settings) {
  try {
    // Always persist under the new key; drop the old one if it's somehow still present
    const cleaned = { ...settings }
    if ("maxProjectsPerUser" in cleaned) {
      cleaned.maxProjectsPerUserPerDay = cleaned.maxProjectsPerUserPerDay ?? cleaned.maxProjectsPerUser
      delete cleaned.maxProjectsPerUser
    }
    await setDoc(doc(db, "settings", "siteConfig"), cleaned, { merge: true })
    return "settings-ok"
  } catch {
    return "settings-fail"
  }
}

/**
 * Returns how many projects the given user has uploaded today (UTC date).
 * Reads from: users/{uid}/uploadActivity/daily  →  { count, date }
 *
 * Returns 0 if no record exists or the stored date is not today.
 */
async function getDailyProjCount(uid) {
  try {
    const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
    const snap = await getDoc(doc(db, "users", uid, "uploadActivity", "daily"))
    if (!snap.exists()) return 0
    const data = snap.data()
    if (data.date !== today) return 0
    return data.count ?? 0
  } catch {
    return 0
  }
}

/**
 * Increments the user's daily upload counter.
 * Call this AFTER a project has been successfully added to Firestore.
 */
async function incrementDailyProjCount(uid) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const ref = doc(db, "users", uid, "uploadActivity", "daily")
    const snap = await getDoc(ref)

    if (!snap.exists() || snap.data().date !== today) {
      await setDoc(ref, { count: 1, date: today })
    } else {
      await setDoc(ref, { count: (snap.data().count ?? 0) + 1, date: today }, { merge: true })
    }
  } catch {
    // Non-fatal — the project was already saved; just log silently
    console.warn("Failed to increment daily upload count for", uid)
  }
}

/**
 * Converts a duration + unit into milliseconds.
 * Use this when suspending a user to calculate their suspendedUntil timestamp.
 *
 * Example:
 *   const settings = await getSettings()
 *   const ms = getSuspensionMs(settings.suspensionDuration, settings.suspensionUnit)
 *   const suspendedUntil = new Date(Date.now() + ms)
 */
function getSuspensionMs(duration, unit) {
  const n = Number(duration) || 0
  switch (unit) {
    case "seconds": return n * 1000
    case "minutes": return n * 60 * 1000
    case "hours":   return n * 3600 * 1000
    case "days":    return n * 86400 * 1000
    default:        return n * 86400 * 1000
  }
}

/**
 * Pre-checks whether a user is allowed to open the upload modal.
 * Call this BEFORE showing the modal to give instant feedback.
 *
 * Returns one of:
 *   "ok"                    — user can upload
 *   "uploads-closed"        — admin disabled uploads globally
 *   "daily-limit-reached"   — user has hit their daily cap
 */
async function checkUploadEligibility(uid) {
  try {
    const [settings, dailyCount] = await Promise.all([
      getSettings(),
      getDailyProjCount(uid),
    ])
    if (settings?.projectUploadOpen === false) return "uploads-closed"
    const limit = settings?.maxProjectsPerUserPerDay ?? 3
    if (dailyCount >= limit) return "daily-limit-reached"
    return "ok"
  } catch {
    return "ok" // fail open — don't block the user on a transient error
  }
}

export {
  getSettings,
  listenSettings,
  updateSettings,
  getDailyProjCount,
  incrementDailyProjCount,
  getSuspensionMs,
  checkUploadEligibility,
  DEFAULTS,
}