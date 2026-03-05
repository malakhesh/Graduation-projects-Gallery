import { auth, db } from '../config/firebase';  // Changed from "./firebase"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut 
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

export async function regUser(email, pass, name, role) {
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
      return "email-in-use"
    } else {
      return "register-fail"
    }
  }
}

export async function logUser(email, pass) {
  try {
    const u = await signInWithEmailAndPassword(auth, email, pass)
    return u.user
  } catch (err) {
    if (err.code === "auth/wrong-password") {
      return "wrong-password"
    } else if (err.code === "auth/user-not-found") {
      return "no-user"
    } else {
      return null
    }
  }
}

export async function resetPass(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export async function logOut() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export async function getUser(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid))
    if (d.exists()) {
      return d.data()
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}
