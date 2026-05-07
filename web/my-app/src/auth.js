import { auth, db } from "./firebase.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { createWelcomeNotif, sendNotif } from "./notifications.js"
import { getSettings, getSuspensionMs } from "./DashSettings.js"

async function regUser(email, pass, name, role, year, techStack) {
  try {
    const u = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", u.user.uid), {
      email,
      name,
      role,
      year,
      techStack,
      bookmarks:      [],
      status:         "active",
      violations:     0,
      suspendReasons: [],
    })
    await createWelcomeNotif(u.user.uid)
    return u.user
  } catch (err) {
    if (err.code === "auth/email-already-in-use") return "email-in-use"
    else return "register-fail"
  }
}

async function logUser(email, pass) {
  try {
    const u = await signInWithEmailAndPassword(auth, email, pass)
    return u.user
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") return "wrong-password"
    else if (err.code === "auth/user-not-found") return "no-user"
    else return "login-fail"
  }
}

async function logWithGoogle() {
  try {
    const p = new GoogleAuthProvider()
    const r = await signInWithPopup(auth, p)
    const u = r.user
    const existing = await getDoc(doc(db, "users", u.uid))
    const isNew = !existing.exists()
    await setDoc(doc(db, "users", u.uid), {
      email:          u.email,
      name:           u.displayName,
      role:           "client",
      status:         "active",
      violations:     0,
      suspendReasons: [],
    }, { merge: true })
    if (isNew) await createWelcomeNotif(u.uid)
    return u
  } catch { return "google-fail" }
}

async function logWithGithub() {
  try {
    const p = new GithubAuthProvider()
    const r = await signInWithPopup(auth, p)
    const u = r.user
    const existing = await getDoc(doc(db, "users", u.uid))
    const isNew = !existing.exists()
    await setDoc(doc(db, "users", u.uid), {
      email:          u.email,
      name:           u.displayName,
      role:           "client",
      status:         "active",
      violations:     0,
      suspendReasons: [],
    }, { merge: true })
    if (isNew) await createWelcomeNotif(u.uid)
    return u
  } catch { return "github-fail" }
}

async function resetPass(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return "reset-sent"
  } catch (err) {
    console.error("RESET ERROR CODE:", err.code)
    console.error("RESET ERROR MSG:", err.message)
    if (err.code === "auth/user-not-found")   return "no-user"
    if (err.code === "auth/invalid-email")     return "invalid-email"
    if (err.code === "auth/too-many-requests") return "too-many-requests"
    return "reset-fail"
  }
}

async function logOut() {
  try {
    await signOut(auth)
    return "logout"
  } catch { return "logout-fail" }
}

async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) return d.data()
    else return "no-data"
  } catch { return "get-fail" }
}

async function updateUser(uid, data) {
  try {
    await updateDoc(doc(db, "users", uid), data)
    return "update-ok"
  } catch { return "update-fail" }
}

async function checkRole(uid) {
  try {
    const data = await getUser(uid)
    return data.role
  } catch { return "role-fail" }
}

async function getUsersByYear(year) {
  try {
    const q = query(collection(db, "users"), where("year", "==", year))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push(d.data()))
    return arr
  } catch { return "year-fail" }
}

async function getUsersByTechStack(stack) {
  try {
    const q = query(collection(db, "users"), where("techStack", "==", stack))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push(d.data()))
    return arr
  } catch { return "stack-fail" }
}

function watchUser() {
  onAuthStateChanged(auth, (u) => {
    if (u) console.log("in:", u.email)
    else console.log("no-user")
  })
}

async function updateRole(uid, role, currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized"
    await updateDoc(doc(db, "users", uid), { role })
    return "role-updated"
  } catch { return "role-fail" }
}

async function addBookmark(uid, projectId) {
  try {
    await updateDoc(doc(db, "users", uid), { bookmarks: arrayUnion(projectId) })
    return "bookmark-added"
  } catch { return "bookmark-fail" }
}

async function removeBookmark(uid, projectId) {
  try {
    await updateDoc(doc(db, "users", uid), { bookmarks: arrayRemove(projectId) })
    return "bookmark-removed"
  } catch { return "bookmark-fail" }
}

async function getBookmarks(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) return d.data().bookmarks || []
    return []
  } catch { return "bookmarks-fail" }
}

// ── Timed Suspension ──────────────────────────────────────────────────────────

// Reads suspensionDuration + suspensionUnit from site settings and applies them
// ONLY to the new suspension. Existing suspendedUntil on other users is never touched.
async function suspendUser(uid) {
  try {
    const settings       = await getSettings()
    const duration       = settings?.suspensionDuration ?? 7
    const unit           = settings?.suspensionUnit     ?? "days"
    const ms             = getSuspensionMs(duration, unit)

    const suspendedAt    = new Date()
    const suspendedUntil = new Date(suspendedAt.getTime() + ms)

    await updateDoc(doc(db, "users", uid), { suspendedAt, suspendedUntil })
    return "suspend-ok"
  } catch { return "suspend-fail" }
}

// ── Violations & Status ───────────────────────────────────────────────────────

async function checkStatus(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (!d.exists()) return "no-user"
    const data = d.data()

    if (data.status === "suspended") {

      // suspended but no suspendedUntil — set it now using current settings
      if (!data.suspendedUntil) {
        await suspendUser(uid)
        // re-fetch to get the freshly written suspendedUntil
        const fresh = await getDoc(doc(db, "users", uid))
        const freshData = fresh.data()
        return {
          status:         "suspended",
          violations:     freshData.violations     || 0,
          suspendReasons: freshData.suspendReasons || [],
          suspendedUntil: freshData.suspendedUntil || null,
        }
      }

      // auto-unsuspend if time is up
      const now   = new Date()
      const until = data.suspendedUntil?.toDate
        ? data.suspendedUntil.toDate()
        : new Date(data.suspendedUntil)

      if (now >= until) {
        await updateDoc(doc(db, "users", uid), {
          status:         "active",
          violations:     0,
          suspendReasons: [],
          suspendedAt:    null,
          suspendedUntil: null,
        })
        return { status: "active", violations: 0, suspendReasons: [], suspendedUntil: null }
      }
    }

    return {
      status:         data.status         || "active",
      violations:     data.violations     || 0,
      suspendReasons: data.suspendReasons || [],
      suspendedUntil: data.suspendedUntil || null,
    }
  } catch { return "status-fail" }
}

async function addViolation(targetUid, reason, adminRole) {
  try {
    if (adminRole !== "admin") return "unauth"

    const userRef  = doc(db, "users", targetUid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return "no-user"

    const data           = userSnap.data()
    const violations     = (data.violations || 0) + 1
    const suspendReasons = [...(data.suspendReasons || []), reason]
    const status         = violations >= 3 ? "suspended" : (data.status || "active")

    await updateDoc(userRef, { violations, suspendReasons, status })

    // suspendUser reads duration from settings — old suspensions are unaffected
    if (violations >= 3) {
      await suspendUser(targetUid)
    }

    if (violations === 1) {
      await sendNotif(targetUid, {
        type: "warning",
        message: `⚠️ First warning: a violation has been recorded on your account for "${reason}". Please review our community guidelines to avoid further action.`,
        clickable: false,
      })
    } else if (violations === 2) {
      await sendNotif(targetUid, {
        type: "danger",
        message: `🚨 Final warning: your account is at risk due to "${reason}". One more violation will result in an immediate suspension.`,
        clickable: false,
      })
    } else if (violations >= 3) {
      await sendNotif(targetUid, {
        type: "suspended",
        message: `🔒 Your account has been suspended due to repeated violations. If you believe this is a mistake, please reach out to an admin.`,
        clickable: false,
      })
    }

    return { result: "violation-added", violations, status, suspendReasons }
  } catch { return "violation-fail" }
}

async function removeViolation(targetUid, violationIndex, adminRole) {
  try {
    if (adminRole !== "admin") return "unauth"

    const userRef  = doc(db, "users", targetUid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return "no-user"

    const data           = userSnap.data()
    const suspendReasons = [...(data.suspendReasons || [])]
    suspendReasons.splice(violationIndex, 1)

    const violations = Math.max(0, suspendReasons.length)
    const status     = data.status === "suspended" && violations < 3 ? "active" : data.status

    await updateDoc(userRef, { violations, suspendReasons, status })

    if (status === "active" && data.status === "suspended") {
      await sendNotif(targetUid, {
        type: "info",
        message: `✅ A violation has been removed from your account and your access has been restored. Welcome back to Graduation Gallery!`,
        clickable: false,
      })
    }

    return { violations, status, suspendReasons }
  } catch { return "violation-fail" }
}

async function unsuspendUser(targetUid, adminRole) {
  try {
    if (adminRole !== "admin") return "unauth"
    await updateDoc(doc(db, "users", targetUid), {
      status:         "active",
      violations:     0,
      suspendReasons: [],
      suspendedAt:    null,
      suspendedUntil: null,
    })
    await sendNotif(targetUid, {
      type: "info",
      message: `✅ Your suspension has been lifted and your account is now fully active. Welcome back to Graduation Gallery!`,
      clickable: false,
    })
    return "unsuspend-ok"
  } catch { return "unsuspend-fail" }
}

export {
  regUser, logUser, logWithGoogle, logWithGithub, resetPass, logOut,
  getUser, updateUser, checkRole, watchUser, getUsersByYear, getUsersByTechStack,
  updateRole, addBookmark, removeBookmark, getBookmarks,
  checkStatus, addViolation, removeViolation, unsuspendUser, suspendUser
}