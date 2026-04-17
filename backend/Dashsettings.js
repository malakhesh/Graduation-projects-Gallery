import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase.js"

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
  contactOpen: true,
}

async function getSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "siteConfig"))
    if (!snap.exists()) return DEFAULTS
    return snap.data()
  } catch {
    return "settings-fail"
  }
}

async function updateSettings(settings) {
  try {
    await setDoc(doc(db, "settings", "siteConfig"), settings, { merge: true })
    return "settings-ok"
  } catch {
    return "settings-fail"
  }
}

export { getSettings, updateSettings }
