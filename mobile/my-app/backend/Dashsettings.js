// backend/routes/Dashsettings.js

import { auth, db } from "./firebase.js";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

export async function updateUserEmail(newEmail, password) {
  try {
    const user = auth.currentUser;
    if (!user) return "no-user";

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await updateEmail(user, newEmail);

    return "email-updated";
  } catch (error) {
    if (error.code === "auth/wrong-password") return "wrong-password";
    if (error.code === "auth/email-already-in-use") return "email-in-use";
    return "email-update-fail";
  }
}

export async function updateUserPassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) return "no-user";

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    return "password-updated";
  } catch (error) {
    if (error.code === "auth/wrong-password") return "wrong-password";
    if (error.code === "auth/weak-password") return "weak-password";
    return "password-update-fail";
  }
}

export async function deleteAccount(password) {
  try {
    const user = auth.currentUser;
    if (!user) return "no-user";

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);

    return "account-deleted";
  } catch (error) {
    if (error.code === "auth/wrong-password") return "wrong-password";
    return "account-delete-fail";
  }
}