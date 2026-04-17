import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db } from "./firebase.js"

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
    if (d.exists()) return { id: d.id, ...d.data() }
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

async function addComment(id, c) {
  try {
    await updateDoc(doc(db, "projects", id), { comments: arrayUnion(c) })
    return "comment-ok"
  } catch {
    return "comment-fail"
  }
}

async function addRate(id, r, uid) {
  try {
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return "rate-fail";

    const data = projectSnap.data();
    const userRatings = data.userRatings || {};
    const oldRating = userRatings[uid] || null;
    let ratings = Array.isArray(data.ratings) ? [...data.ratings] : [];

    if (oldRating !== null) {
      const idx = ratings.indexOf(oldRating);
      if (idx > -1) ratings.splice(idx, 1);
    }
    ratings.push(r);

    await updateDoc(projectRef, {
      ratings,
      [`userRatings.${uid}`]: r,
    });
    return "rate-ok";
  } catch {
    return "rate-fail";
  }
}

async function removeRate(id, uid, oldRating) {
  try {
    const projectRef = doc(db, "projects", id);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return "rate-fail";
    const data = projectSnap.data();
    let ratings = Array.isArray(data.ratings) ? [...data.ratings] : [];
    const idx = ratings.indexOf(oldRating);
    if (idx > -1) ratings.splice(idx, 1);
    const userRatings = { ...(data.userRatings || {}) };
    delete userRatings[uid];
    await updateDoc(projectRef, { ratings, userRatings });
    return "rate-removed";
  } catch {
    return "rate-fail";
  }
}

async function removeComment(id, comment) {
  try {
    await updateDoc(doc(db, "projects", id), { comments: arrayRemove(comment) })
    return "comment-removed"
  } catch {
    return "comment-remove-fail"
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


async function notifyBookmark(projectId, bookmarkerUid) {
  try {
    const project = await getProj(projectId)
    if (!project || project === "no-proj" || project === "get-fail") return
    const ownerUid = project.userId
    if (!ownerUid || ownerUid === bookmarkerUid) return
    const bookmarkerData = await getUser(bookmarkerUid)
    const bookmarkerName = bookmarkerData?.name || "Someone"
    const title = project.title || "your project"
    await sendNotif(ownerUid, {
      type: "bookmark",
      message: `${bookmarkerName} bookmarked "${title}"`,
      projectId: null,
      clickable: false,
    })
  } catch {}
}


export { 
  addProj, getProj, getApproved, getPending, setStatus, 
  getUserProjs, getByTag, getByCategory, getByStack,
  addComment, addRate, removeRate, delProj, updProj, removeComment,getRejected,notifyBookmark
}
