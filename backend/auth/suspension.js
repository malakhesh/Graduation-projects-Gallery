import { db } from "../firebase.js"

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore"

import { sendNotif } from "../notifications/notifications.js"

async function suspendUser(uid) {
  try {
    const suspendedAt = new Date()

    const suspendedUntil =
      new Date(suspendedAt.getTime() + 2 * 60 * 1000)

    await updateDoc(
      doc(db, "users", uid),
      {
        suspendedAt,
        suspendedUntil
      }
    )

    return "suspend-ok"
  } catch {
    return "suspend-fail"
  }
}

async function checkStatus(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))

    if (!d.exists()) return "no-user"

    const data = d.data()

    if (data.status === "suspended") {

      if (!data.suspendedUntil) {

        await suspendUser(uid)

        const suspendedUntil =
          new Date(Date.now() + 2 * 60 * 1000)

        return {
          status: "suspended",
          violations: data.violations || 0,
          suspendReasons: data.suspendReasons || [],
          suspendedUntil,
        }
      }

      const now = new Date()

      const until = data.suspendedUntil.toDate
        ? data.suspendedUntil.toDate()
        : new Date(data.suspendedUntil)

      if (now >= until) {

        await updateDoc(
          doc(db, "users", uid),
          {
            status: "active",
            violations: 0,
            suspendReasons: [],
            suspendedAt: null,
            suspendedUntil: null,
          }
        )

        return {
          status: "active",
          violations: 0,
          suspendReasons: [],
          suspendedUntil: null
        }
      }
    }

    return {
      status: data.status || "active",
      violations: data.violations || 0,
      suspendReasons: data.suspendReasons || [],
      suspendedUntil: data.suspendedUntil || null,
    }

  } catch {
    return "status-fail"
  }
}

async function unsuspendUser(targetUid, adminRole) {
  try {

    if (adminRole !== "admin")
      return "unauth"

    await updateDoc(
      doc(db, "users", targetUid),
      {
        status: "active",
        violations: 0,
        suspendReasons: [],
        suspendedAt: null,
        suspendedUntil: null,
      }
    )

    await sendNotif(targetUid, {
      type: "info",
      message:
        `Your suspension has been lifted and your account is now fully active. Welcome back to Graduation Gallery!`,
      clickable: false,
    })

    return "unsuspend-ok"

  } catch {
    return "unsuspend-fail"
  }
}

export {
  checkStatus,
  unsuspendUser,
  suspendUser
}