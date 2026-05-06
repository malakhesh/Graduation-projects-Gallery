import {updateDoc, doc,arrayUnion,arrayRemove
} from "firebase/firestore"

import { db } from "../firebase.js"

async function addComment(id, c) {
  try {
    await updateDoc(
      doc(db, "projects", id),
      { comments: arrayUnion(c) }
    )

    return "comment-ok"

  } catch {
    return "comment-fail"
  }
}

async function removeComment(id, comment) {
  try {

    await updateDoc(
      doc(db, "projects", id),
      { comments: arrayRemove(comment) }
    )

    return "comment-removed"

  } catch {
    return "comment-remove-fail"
  }
}

export {
  addComment,
  removeComment
}