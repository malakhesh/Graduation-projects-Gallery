import { auth, db } from "../firebase.js"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from "firebase/auth"

import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore"

import { createWelcomeNotif } from "../notifications.js"

async function regUser(email, pass, name, role, year, techStack) {
  try {
    const u = await createUserWithEmailAndPassword(auth, email, pass)

    await setDoc(doc(db, "users", u.user.uid), {
      email,
      name,
      role,
      year,
      techStack,
      bookmarks: [],
      status: "active",
      violations: 0,
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
    if (
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential"
    ) return "wrong-password"

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
      email: u.email,
      name: u.displayName,
      role: "client",
      status: "active",
      violations: 0,
      suspendReasons: [],
    }, { merge: true })

    if (isNew) await createWelcomeNotif(u.uid)

    return u
  } catch {
    return "google-fail"
  }
}

async function logWithGithub() {
  try {
    const p = new GithubAuthProvider()

    const r = await signInWithPopup(auth, p)

    const u = r.user

    const existing = await getDoc(doc(db, "users", u.uid))

    const isNew = !existing.exists()

    await setDoc(doc(db, "users", u.uid), {
      email: u.email,
      name: u.displayName,
      role: "client",
      status: "active",
      violations: 0,
      suspendReasons: [],
    }, { merge: true })

    if (isNew) await createWelcomeNotif(u.uid)

    return u
  } catch {
    return "github-fail"
  }
}

async function resetPass(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return "reset-sent"
  } catch {
    return "reset-fail"
  }
}

async function logOut() {
  try {
    await signOut(auth)
    return "logout"
  } catch {
    return "logout-fail"
  }
}

function watchUser() {
  onAuthStateChanged(auth, (u) => {
    if (u) console.log("in:", u.email)
    else console.log("no-user")
  })
}

export {
  regUser,
  logUser,
  logWithGoogle,
  logWithGithub,
  resetPass,
  logOut,
  watchUser
}