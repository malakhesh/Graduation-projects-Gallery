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
  suspensionUnit: "days", 
}

async function getSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "siteConfig"))
    if (!snap.exists()) return DEFAULTS
    const data = snap.data()

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

async function getDailyProjCount(uid) {
  try {
    const today = new Date().toISOString().slice(0, 10) 
    const snap = await getDoc(doc(db, "users", uid, "uploadActivity", "daily"))
    if (!snap.exists()) return 0
    const data = snap.data()
    if (data.date !== today) return 0
    return data.count ?? 0
  } catch {
    return 0
  }
}

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
    console.warn("Failed to increment daily upload count for", uid)
  }
}

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
    return "ok" 
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