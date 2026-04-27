import { 
  collection, addDoc, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where, serverTimestamp 
} from "firebase/firestore"
import { db } from "./firebase.js"
import { sendNotif } from "./notifications.js"
import { getUser } from "./auth.js"

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
      hidden: false,
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
    // Filter hidden in JS — avoids excluding docs where the field doesn't exist yet
    s.forEach((d) => {
      const data = d.data()
      if (data.hidden !== true) arr.push({ id: d.id, ...data })
    })
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

async function setStatus(id, status, role) {
  try {
    if (role !== "admin") return "unauth"
    await updateDoc(doc(db, "projects", id), {
      status,
      statusAt: serverTimestamp()
    })

    const project = await getProj(id)
    if (project && project !== "no-proj" && project !== "get-fail") {
      const ownerUid = project.userId
      const title = project.title || "your project"
      if (ownerUid) {
        if (status === "approved") {
          await sendNotif(ownerUid, {
            type: "approved",
            message: `Your project "${title}" has been approved and is now live.`,
            projectId: id,
            clickable: true,
          })
        } else if (status === "rejected") {
          await sendNotif(ownerUid, {
            type: "rejected",
            message: `Your project "${title}" was not approved. Please review and resubmit.`,
            projectId: id,
            clickable: true,
          })
        }
      }
    }

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

async function addComment(id, c, commenterUid) {
  try {
    await updateDoc(doc(db, "projects", id), { comments: arrayUnion(c) })

    const project = await getProj(id)
    if (project && project !== "no-proj" && project !== "get-fail") {
      const ownerUid = project.userId
      if (ownerUid && ownerUid !== commenterUid) {
        const commenterData = commenterUid ? await getUser(commenterUid) : null
        const commenterName = commenterData?.name || "Someone"
        const preview = c.text?.length > 40 ? c.text.slice(0, 40) + "..." : c.text
        await sendNotif(ownerUid, {
          type: "comment",
          message: `${commenterName} commented: "${preview}"`,
          projectId: id,
          clickable: true,
        })
      }
    }

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

    const ownerUid = data.userId
    if (ownerUid && ownerUid !== uid) {
      const raterData = await getUser(uid)
      const raterName = raterData?.name || "Someone"
      await sendNotif(ownerUid, {
        type: "rating",
        message: `${raterName} rated your project ${r}/5`,
        projectId: id,
        clickable: true,
      })
    }

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

async function setHidden(id, hidden) {
  try {
    await updateDoc(doc(db, "projects", id), { hidden })
    return "hidden-ok"
  } catch {
    return "hidden-fail"
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
  addProj, getProj, getApproved, getPending, getRejected, setStatus, 
  getUserProjs, getByTag, getByCategory, getByStack,
  addComment, addRate, removeRate, delProj, updProj, removeComment,
  notifyBookmark, setHidden
}