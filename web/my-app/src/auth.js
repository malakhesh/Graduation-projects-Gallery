import { auth, db } from "./firebase.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"


async function regUser(email, pass, name, role) {
  try {
    const u = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", u.user.uid), {
      email: email,
      name: name,
      role: role
    })
    return u.user
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      alert("email used")
      return {error: "email-used"}
    } else {
      alert("register fail")
      return {error: "register-fail"}
    }
  }
}

async function logUser(email, pass) {
  try {
    const u = await signInWithEmailAndPassword(auth, email, pass)
    return u.user
  } catch (err) {
    if (err.code === "auth/wrong-password") {
      alert("wrong pass")
      return {error: "wrong-password"}
    } else if (err.code === "auth/user-not-found") {
      alert("no user")
      return {error: "no user"}
    } else {
      alert("login fail")
      return null
    }
  }
}

async function resetPass(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    alert("reset sent")
  } catch (err) {
    alert("reset fail")
  }
}

async function logOut() {
  try {
    await signOut(auth)
    alert("logged out")
  } catch (err) {
    alert("logout fail")
  }
}

async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) {
      return d.data()
    } else {
      alert("no data")
    }
  } catch (err) {
    alert("get data fail")
  }
}

async function checkRole(uid) {
  try {
    const data = await getUser(uid)
    if (data.role === "admin") {
      return "admin"
    } else {
      return "client"
    }
  } catch (err) {
    alert("role fail")
  }
}

function watchUser() {
  onAuthStateChanged(auth, (u) => {
    if (u) {
      console.log("logged in:", u.email)
    } else {
      console.log("no user")
    }
  })
}

export { regUser, logUser, resetPass, logOut, getUser, checkRole, watchUser }
