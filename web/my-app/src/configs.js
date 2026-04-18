import { db } from "./firebase.js"
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore"

async function getUploadOptions() {
  try {
    const d = await getDoc(doc(db, "config", "uploadOptions"))
    if (d.exists()) return d.data()
    else return { tags: [], categories: [], techStacks: [] }
  } catch (err) {
    console.error("getUploadOptions failed:", err)
    return "get-options-fail"
  }
}

async function addOption(listName, value, role) {
  console.log("addOption called:", listName, value, role)
  try {
    if (role !== "admin") return "unauthorized"
    const ref = doc(db, "config", "uploadOptions")
    await setDoc(ref, { [listName]: arrayUnion(value) }, { merge: true })
    return "option-added"
  } catch (err) {
    console.error("addOption failed:", err)
    return "add-option-fail"
  }
}

async function removeOption(listName, value, role) {
  try {
    if (role !== "admin") return "unauthorized"
    const ref = doc(db, "config", "uploadOptions")
    await setDoc(ref, { [listName]: arrayRemove(value) }, { merge: true })
    return "option-removed"
  } catch (err) {
    console.error("removeOption failed:", err)
    return "remove-option-fail"
  }
}

export { getUploadOptions, addOption, removeOption }