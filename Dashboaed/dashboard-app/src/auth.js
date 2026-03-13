import { auth, db } from "./firebase.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

async function regUser(email, pass, name, role, year, techStack) {
  try {
    const u = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", u.user.uid), {
      email: email,
      name: name,
      role: role,
      year: year,
      techStack: techStack
    })
    return u.user
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      return "email-in-use"
    } else {
      return "register-fail"
    }
  }
}

async function logUser(email, pass) {
  try {
    const u = await signInWithEmailAndPassword(auth, email, pass)
    return u.user
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      return "wrong-password"
    } else if (err.code === "auth/user-not-found") {
      return "no-user"
    } else {
      return "login-fail"
    }
  }
}

async function logWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      role: "client"
    }, { merge: true })
    return user
  } catch (err) {
    alert("google login fail")
  }
}

async function logWithGithub() {
  try {
    const provider = new GithubAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      role: "client"
    }, { merge: true })
    return user
  } catch (err) {
    alert("github login fail")
  }
}

async function resetPass(email) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (err) {
    throw err
  }
}

async function logOut() {
  try {
    await signOut(auth)
  } catch (err) {
    console.error("logout fail", err)
  }
}

async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) {
      return d.data()
    } else {
      return null
    }
  } catch (err) {
    console.error("get data fail", err)
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
    console.error("role fail", err)
  }
}

async function getUsersByYear(year) {
  try {
    const q = query(collection(db, "users"), where("year", "==", year))
    const snapshot = await getDocs(q)
    let users = []
    snapshot.forEach((doc) => {
      users.push(doc.data())
    })
    return users
  } catch (err) {
    console.error("get users by year fail", err)
  }
}

async function getUsersByTechStack(stack) {
  try {
    const q = query(collection(db, "users"), where("techStack", "==", stack))
    const snapshot = await getDocs(q)
    let users = []
    snapshot.forEach((doc) => {
      users.push(doc.data())
    })
    return users
  } catch (err) {
    console.error("get users by techStack fail", err)
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

async function getAllUsers() {
  try {
    const snapshot = await getDocs(collection(db, "users"))
    let users = []
    snapshot.forEach((d) => {
      users.push({ id: d.id, ...d.data() })
    })
    return users
  } catch (err) {
    console.error("get all users fail", err)
    return []
  }
}

export { regUser, logUser, resetPass, logOut, getUser, checkRole, watchUser, getUsersByYear, getUsersByTechStack, logWithGoogle, logWithGithub, getAllUsers }