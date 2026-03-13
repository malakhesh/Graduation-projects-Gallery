import { auth, db } from "./firebase.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore"

async function regUser(email, pass, name, role, year, techStack) {
  try {
    const u = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", u.user.uid), {
      email,
      name,
      role,
      year,
      techStack
    })
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
    await setDoc(doc(db, "users", u.uid), {
      email: u.email,
      name: u.displayName,
      role: "client"
    }, { merge: true })
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
    await setDoc(doc(db, "users", u.uid), {
      email: u.email,
      name: u.displayName,
      role: "client"
    }, { merge: true })
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

async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) return d.data()
    else return "no-data"
  } catch {
    return "get-fail"
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
    const q = query(collection(db, "users"), where("year", "==", year))
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
    const q = query(collection(db, "users"), where("techStack", "==", stack))
    const s = await getDocs(q)
    let arr = []
    s.forEach((d) => arr.push(d.data()))
    return arr
  } catch {
    return "stack-fail"
  }
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
  } catch {
    return "role-fail"
  }
}

export { regUser, logUser, logWithGoogle, logWithGithub, resetPass, logOut, getUser, checkRole, watchUser, getUsersByYear, getUsersByTechStack, updateRole }
