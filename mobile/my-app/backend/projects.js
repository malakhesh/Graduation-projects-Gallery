import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db } from "./firebase.js"

// 🔥 ADD PROJECT
async function addProj(title, desc, userId, year, stack, category, gitLink, imgUrl, tags) {
  try {
    const r = await addDoc(collection(db, "projects"), {
      title,
      desc,
      userId,
      year,
      stack,
      category,
      gitLink,
      imgUrl,
      tags,
      createdAt: serverTimestamp(),
      comments: [],
      ratings: [],
      status: "pending",
      hidden: false
    })
    return r.id
  } catch {
    return "add-fail"
  }
}

// 🔥 TOGGLE HIDE (محدثة)
async function toggleHideProject(id, value) {
  try {
    const projectRef = doc(db, "projects", id)
    await updateDoc(projectRef, {
      hidden: value,
      updatedAt: serverTimestamp()
    })
    
    // إرجاع المشروع المحدث
    const updatedDoc = await getDoc(projectRef)
    if (updatedDoc.exists()) {
      return { id: updatedDoc.id, ...updatedDoc.data() }
    }
    return "hide-ok"
  } catch (error) {
    console.error("Error in toggleHideProject:", error)
    return "hide-fail"
  }
}

// 🔥 GET SINGLE PROJECT
async function getProj(id) {
  try {
    const d = await getDoc(doc(db, "projects", id))
    if (d.exists()) return { id: d.id, ...d.data() }
    else return "no-proj"
  } catch {
    return "get-fail"
  }
}

// 🔥 GET USER PROJECTS
async function getUserProjs(uid) {
  try {
    const q = query(collection(db, "projects"), where("userId", "==", uid))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "user-fail"
  }
}

// 🔥 DELETE PROJECT
async function delProj(id) {
  try {
    await deleteDoc(doc(db, "projects", id))
    return "del-ok"
  } catch {
    return "del-fail"
  }
}

// 🔥 UPDATE PROJECT
async function updProj(id, data) {
  try {
    await updateDoc(doc(db, "projects", id), data)
    return "upd-ok"
  } catch {
    return "upd-fail"
  }
}

export { 
  addProj,
  getProj,
  getUserProjs,
  delProj,
  updProj,
  toggleHideProject
}