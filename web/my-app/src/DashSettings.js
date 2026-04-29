import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase.js"

const DEFAULTS = {
  siteName: "Graduation Gallery",
  maintenanceMode: false,
  registrationOpen: true,
  projectUploadOpen: true,
  autoApprove: false,
  maxProjectsPerUser: 3,
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
    return { ...DEFAULTS, ...snap.data() }
  } catch {
    return "settings-fail"
  }
}

function listenSettings(callback) {
  return onSnapshot(
    doc(db, "settings", "siteConfig"),
    (snap) => {
      if (snap.exists()) callback({ ...DEFAULTS, ...snap.data() })
      else callback(DEFAULTS)
    },
    () => callback(DEFAULTS)
  )
}

async function updateSettings(settings) {
  try {
    await setDoc(doc(db, "settings", "siteConfig"), settings, { merge: true })
    return "settings-ok"
  } catch {
    return "settings-fail"
  }
}

/**
 * Converts a duration + unit into milliseconds.
 * Use this when suspending a user to calculate their suspendedUntil timestamp.
 * 
 * Example usage when suspending a user:
 *   const settings = await getSettings()
 *   const ms = getSuspensionMs(settings.suspensionDuration, settings.suspensionUnit)
 *   const suspendedUntil = new Date(Date.now() + ms)
 *   // Save suspendedUntil to the user's Firestore doc
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

export { getSettings, listenSettings, updateSettings, getSuspensionMs, DEFAULTS }