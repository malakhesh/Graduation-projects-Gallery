import { collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore"
import { db } from "./firebase.js"

async function addProject(title, description, ownerId, year, techStack) {
  try {
    const ref = await addDoc(collection(db, "projects"), {
      title,
      description,
      ownerId,
      year,
      techStack,
      createdAt: new Date(),
      comments: [],
      ratings: []
    })
    return ref.id
  } catch {
    return "add fail"
  }
}

async function getProject(id) {
  try {
    const d = await getDoc(doc(db, "projects", id))
    if (d.exists()) {
      return d.data()
    } else {
      return "no project"
    }
  } catch {
    return "get fail"
  }
}

async function getAllProjects() {
  try {
    const snap = await getDocs(collection(db, "projects"))
    let list = []
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() })
    })
    return list
  } catch {
    return "get all fail"
  }
}

async function Comment(id, c) {
  try {
    await updateDoc(doc(db, "projects", id), {
      comments: arrayUnion(c)
    })
    return "comment added"
  } catch {
    return "comment fail"
  }
}

async function Rating(id, r) {
  try {
    await updateDoc(doc(db, "projects", id), {
      ratings: arrayUnion(r)
    })
    return "rating added"
  } catch {
    return "rating fail"
  }
}

async function deleteProj(id) {
  try {
    await deleteDoc(doc(db, "projects", id))
    return "project deleted"
  } catch {
    return "delete fail"
  }
}

async function updateProj(id, newData) {
  try {
    const ref = doc(db, "projects", id)
    await updateDoc(ref, newData)
    return "project updated"
  } catch {
    return "update fail"
  }
}

async function updateProjectStatus(id, status) {
  try {
    await updateDoc(doc(db, "projects", id), { status: status })
    return "status updated"
  } catch {
    return "update status fail"
  }
}

export { addProject, getProject, getAllProjects, Comment, Rating, deleteProj, updateProj, updateProjectStatus }