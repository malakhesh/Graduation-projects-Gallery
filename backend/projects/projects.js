import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db } from "../firebase.js"
import { sendNotif } from "../notifications/notifications.js"
import { getUser } from "../auth/user.js"



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
  addProj, getProj, setStatus, 
  getUserProjs, addRate, removeRate, delProj, updProj,notifyBookmark
}
