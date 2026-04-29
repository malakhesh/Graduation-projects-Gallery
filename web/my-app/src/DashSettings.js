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

export { getSettings, listenSettings, updateSettings, DEFAULTS }