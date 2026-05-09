import {
  collection, addDoc, getDocs, updateDoc, doc, query,
  orderBy, onSnapshot, serverTimestamp, writeBatch
} from "firebase/firestore";
import { db } from "./firebase.js";

export async function sendNotif(uid, { type, message, projectId, clickable }) {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      type,
      message,
      projectId: projectId || null,
      clickable: clickable ?? true,
      seen: false,
      read: false,
      createdAt: serverTimestamp(),
    });
    return "notif-ok";
  } catch {
    return "notif-fail";
  }
}

export async function createWelcomeNotif(uid) {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      type: "welcome",
      message: "Welcome to Graduation Gallery! Tap to learn how the platform works.",
      projectId: null,
      clickable: true,
      seen: false,
      read: false,
      createdAt: serverTimestamp(),
    });
    return "welcome-ok";
  } catch {
    return "welcome-fail";
  }
}

export async function markAllSeen(uid) {
  try {
    const q = query(collection(db, "users", uid, "notifications"));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach((d) => {
      if (!d.data().seen) {
        batch.update(doc(db, "users", uid, "notifications", d.id), { seen: true });
      }
    });
    await batch.commit();
    return "seen-ok";
  } catch {
    return "seen-fail";
  }
}

export async function markRead(uid, notifId) {
  try {
    await updateDoc(doc(db, "users", uid, "notifications", notifId), { read: true });
    return "read-ok";
  } catch {
    return "read-fail";
  }
}

export function listenNotifs(uid, callback) {
  const q = query(
    collection(db, "users", uid, "notifications"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notifs);
  });
}
