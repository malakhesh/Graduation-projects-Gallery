import { db } from "../firebase.js"

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore"

async function addBookmark(uid, projectId) {
  try {
    await updateDoc(
      doc(db, "users", uid),
      {
        bookmarks: arrayUnion(projectId)
      }
    )

    return "bookmark-added"
  } catch {
    return "bookmark-fail"
  }
}

async function removeBookmark(uid, projectId) {
  try {
    await updateDoc(
      doc(db, "users", uid),
      {
        bookmarks: arrayRemove(projectId)
      }
    )

    return "bookmark-removed"
  } catch {
    return "bookmark-fail"
  }
}

async function getBookmarks(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))

    if (d.exists()) return d.data().bookmarks || []

    return []
  } catch {
    return "bookmarks-fail"
  }
}

export {
  addBookmark,
  removeBookmark,
  getBookmarks
}