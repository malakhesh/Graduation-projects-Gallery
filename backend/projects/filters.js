import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db } from "../firebase.js"
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

async function getRejected() {
  try {
    const q = query(collection(db, "projects"), where("status", "==", "rejected"))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "rejected-fail"
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

async function getByCategory(category) {
  try {
    const q = query(
      collection(db, "projects"),
      where("status", "==", "approved"),
      where("category", "==", category)
    )
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "category-fail"
  }
}

async function getByStack(tech) {
  try {
    const q = query(
      collection(db, "projects"),
      where("status", "==", "approved"),
      where("stack", "array-contains", tech)
    )
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "stack-fail"
  }
}
async function searchProjects(keyword) {
  try {
    if (!keyword) return "no-keyword"

    const projectsRef = collection(db, "projects")
    const snapshot = await getDocs(projectsRef)

    let arr = []
    snapshot.forEach((d) => {
      const data = d.data()
      const inTitle = data.title?.toLowerCase().includes(keyword.toLowerCase())
      const inDesc = data.desc?.toLowerCase().includes(keyword.toLowerCase())
      const inTags = Array.isArray(data.tags) && data.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()))

      if (inTitle || inDesc || inTags) {
        arr.push({ id: d.id, ...data })
      }
    })

    return arr
  } catch {
    return "search-fail"
  }
}


export { 
   getApproved, getPending,getByTag, getByCategory, getByStack,
  getRejected, searchProjects
}

