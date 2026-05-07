import { db } from "../firebase.js"

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore"

async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))

    if (d.exists()) return d.data()

    else return "no-data"

  } catch {
    return "get-fail"
  }
}

async function updateUser(uid, data) {
  try {

    await updateDoc(
      doc(db, "users", uid),
      data
    )

    return "update-ok"

  } catch {
    return "update-fail"
  }
}

async function checkRole(uid) {
  try {

    const data = await getUser(uid)

    return data.role

  } catch {
    return "role-fail"
  }
}

async function getUsersByYear(year) {
  try {

    const q = query(
      collection(db, "users"),
      where("year", "==", year)
    )

    const s = await getDocs(q)

    let arr = []

    s.forEach((d) => arr.push(d.data()))

    return arr

  } catch {
    return "year-fail"
  }
}

async function getUsersByTechStack(stack) {
  try {

    const q = query(
      collection(db, "users"),
      where("techStack", "==", stack)
    )

    const s = await getDocs(q)

    let arr = []

    s.forEach((d) => arr.push(d.data()))

    return arr

  } catch {
    return "stack-fail"
  }
}

async function updateRole(uid, role, currentRole) {
  try {

    if (currentRole !== "admin")
      return "unauthorized"

    await updateDoc(
      doc(db, "users", uid),
      { role }
    )

    return "role-updated"

  } catch {
    return "role-fail"
  }
}

export {
  getUser,
  updateUser,
  checkRole,
  getUsersByTechStack,
  updateRole,
  getUsersByYear
}