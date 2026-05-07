import { db } from "../firebase.js"

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore"

import { sendNotif } from "../notifications.js"

import { suspendUser } from "./suspension.js"

async function addViolation(targetUid, reason, adminRole) {
  try {

    if (adminRole !== "admin")
      return "unauth"

    const userRef =
      doc(db, "users", targetUid)

    const userSnap =
      await getDoc(userRef)

    if (!userSnap.exists())
      return "no-user"

    const data = userSnap.data()

    const violations =
      (data.violations || 0) + 1

    const suspendReasons = [
      ...(data.suspendReasons || []),
      reason
    ]

    const status =
      violations >= 3
        ? "suspended"
        : (data.status || "active")

    await updateDoc(
      userRef,
      {
        violations,
        suspendReasons,
        status
      }
    )

    if (violations >= 3) {
      await suspendUser(targetUid)
    }

    if (violations === 1) {

      await sendNotif(targetUid, {
        type: "warning",
        message:
          `First warning: a violation has been recorded on your account for "${reason}". Please review our community guidelines to avoid further action.`,
        clickable: false,
      })

    } else if (violations === 2) {

      await sendNotif(targetUid, {
        type: "danger",
        message:
          `Final warning: your account is at risk due to "${reason}". One more violation will result in an immediate suspension.`,
        clickable: false,
      })

    } else if (violations >= 3) {

      await sendNotif(targetUid, {
        type: "suspended",
        message:
          `Your account has been suspended due to repeated violations. If you believe this is a mistake, please reach out to an admin.`,
        clickable: false,
      })
    }

    return {
      result: "violation-added",
      violations,
      status,
      suspendReasons
    }

  } catch {
    return "violation-fail"
  }
}

async function removeViolation(targetUid, violationIndex, adminRole) {
  try {

    if (adminRole !== "admin")
      return "unauth"

    const userRef =
      doc(db, "users", targetUid)

    const userSnap =
      await getDoc(userRef)

    if (!userSnap.exists())
      return "no-user"

    const data = userSnap.data()

    const suspendReasons = [
      ...(data.suspendReasons || [])
    ]

    suspendReasons.splice(violationIndex, 1)

    const violations =
      Math.max(0, suspendReasons.length)

    const status =
      data.status === "suspended" && violations < 3
        ? "active"
        : data.status

    await updateDoc(
      userRef,
      {
        violations,
        suspendReasons,
        status
      }
    )

    if (
      status === "active" &&
      data.status === "suspended"
    ) {

      await sendNotif(targetUid, {
        type: "info",
        message:
          `A violation has been removed from your account and your access has been restored. Welcome back to Graduation Gallery!`,
        clickable: false,
      })
    }

    return {
      violations,
      status,
      suspendReasons
    }

  } catch {
    return "violation-fail"
  }
}

export {
  addViolation,
  removeViolation
}