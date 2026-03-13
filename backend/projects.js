import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db, storage } from "./firebase.js"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

async function addProj(title, desc, userId, year, stack, gitLink, imgFile, tags) {
  try {
    let imgUrl = null
    if (imgFile) {
      const sRef = ref(storage, `projects/${userId}/${imgFile.name}`)
      await uploadBytes(sRef, imgFile)
      imgUrl = await getDownloadURL(sRef)
    }
    const r = await addDoc(collection(db, "projects"), {
      title,
      desc,
      userId,
      year,
      stack,
      gitLink,
      imgUrl,
      tags,
      createdAt: serverTimestamp(),
      comments: [],
      ratings: [],
      status: "pending"
    })
    return r.id
  } catch {
    return "add-fail"
  }
}

async function getProj(id) {
  try {
    const d = await getDoc(doc(db, "projects", id))
    if (d.exists()) return d.data()
    else return "no-proj"
  } catch {
    return "get-fail"
  }
}

async function getApproved() {
  try {
    const q = query(collection(db, "projects"), where("status", "==", "approved"))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "approved-fail"
  }
}

async function getPending() {
  try {
    const q = query(collection(db, "projects"), where("status", "==", "pending"))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "pending-fail"
  }
}

async function setStatus(id, status, role) {
  try {
    if (role !== "admin") return "unauth"
    await updateDoc(doc(db, "projects", id), {
      status,
      statusAt: serverTimestamp()
    })
    return "status-ok"
  } catch {
    return "status-fail"
  }
}

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

async function getByTag(tag) {
  try {
    const q = query(collection(db, "projects"), where("tags", "array-contains", tag))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "tag-fail"
  }
}

async function addComment(id, c) {
  try {
    await updateDoc(doc(db, "projects", id), { comments: arrayUnion(c) })
    return "comment-ok"
  } catch {
    return "comment-fail"
  }
}

async function addRate(id, r) {
  try {
    await updateDoc(doc(db, "projects", id), { ratings: arrayUnion(r) })
    return "rate-ok"
  } catch {
    return "rate-fail"
  }
}

async function delProj(id) {
  try {
    await deleteDoc(doc(db, "projects", id))
    return "del-ok"
  } catch {
    return "del-fail"
  }
}

async function updProj(id, data) {
  try {
    await updateDoc(doc(db, "projects", id), data)
    return "upd-ok"
  } catch {
    return "upd-fail"
  }
}

export { addProj, getProj, getApproved, getPending, setStatus, getUserProjs, getByTag, addComment, addRate, delProj, updProj }
