import { auth, db } from "./firebase.js"
import { 
  updateEmail, updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider, deleteUser 
} from "firebase/auth"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"

async function reAuth(password) {
  const user = auth.currentUser
  const cred = EmailAuthProvider.credential(user.email, password)
  return await reauthenticateWithCredential(user, cred)
}

async function updateUserEmail(newEmail, password) {
  try {
    await reAuth(password)
    await updateEmail(auth.currentUser, newEmail)
    await updateDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail })
    return "email-updated"
  } catch { return "email-fail" }
}

async function updateUserPassword(oldPassword, newPassword) {
  try {
    await reAuth(oldPassword)
    await updatePassword(auth.currentUser, newPassword)
    return "password-updated"
  } catch { return "password-fail" }
}

async function updateUserName(uid, name) {
  try {
    await updateProfile(auth.currentUser, { displayName: name })
    await updateDoc(doc(db, "users", uid), { name })
    return "name-updated"
  } catch { return "name-fail" }
}

async function deleteAccount(password) {
  try {
    await reAuth(password)
    const uid = auth.currentUser.uid
    await deleteDoc(doc(db, "users", uid))
    await deleteUser(auth.currentUser)
    return "account-deleted"
  } catch { return "delete-fail" }
}

export { reAuth, updateUserEmail, updateUserPassword, updateUserName, deleteAccount }