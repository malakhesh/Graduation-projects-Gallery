import { db } from "./firebase.js"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"

async function getUploadOptions() {
  try {
    const d = await getDoc(doc(db, "config", "uploadOptions"))
    if (d.exists()) return d.data()
    else return { tags: [], categories: [], techStacks: [] }
  } catch {
    return "get-options-fail"
  }
}

async function addOption(listName, value, role) {
  try {
    if (role !== "admin") return "unauthorized"
    const ref = doc(db, "config", "uploadOptions")
    await updateDoc(ref, { [listName]: arrayUnion(value) })
    return "option-added"
  } catch {
    return "add-option-fail"
  }
}

async function removeOption(listName, value, role) {
  try {
    if (role !== "admin") return "unauthorized"
    const ref = doc(db, "config", "uploadOptions")
    await updateDoc(ref, { [listName]: arrayRemove(value) })
    return "option-removed"
  } catch {
    return "remove-option-fail"
  }
}

export { getUploadOptions, addOption, removeOption }