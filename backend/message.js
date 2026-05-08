import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const MESSAGES_COL = "contactMessages";
const SETTINGS_REF = () => doc(db, "settings", "siteConfig");

export async function sendContactMessage({ name, email, message }) {
  try {
    const settingsSnap = await getDoc(SETTINGS_REF());
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.contactOpen === false) {
        return { ok: false, reason: "disabled" };
      }
    }

    const dailyLimit = settingsSnap.exists()
      ? (settingsSnap.data().maxMessagesPerDay ?? 3)
      : 3;

    const q = query(
      collection(db, MESSAGES_COL),
      where("email", "==", email.trim().toLowerCase())
    );

    const snap = await getDocs(q);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let todayCount = 0;

    snap.forEach((doc) => {
      const data = doc.data();
      if (!data.createdAt) return;
      const msgDate = data.createdAt.toDate();
      if (msgDate >= startOfDay) {
        todayCount++;
      }
    });

    if (todayCount >= dailyLimit) {
      return { ok: false, reason: "limit", limit: dailyLimit };
    }

    await addDoc(collection(db, MESSAGES_COL), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    return { ok: true };
  } catch (err) {
    console.error("sendContactMessage error:", err);
    return { ok: false, reason: "error" };
  }
}

export async function getAllMessages() {
  try {
    const q = query(
      collection(db, MESSAGES_COL),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getAllMessages error:", err);
    return [];
  }
}

export async function markMessageRead(id) {
  try {
    await updateDoc(doc(db, MESSAGES_COL, id), { read: true });
    return true;
  } catch (err) {
    console.error("markMessageRead error:", err);
    return false;
  }
}

export async function deleteMessage(id) {
  try {
    await deleteDoc(doc(db, MESSAGES_COL, id));
    return true;
  } catch (err) {
    console.error("deleteMessage error:", err);
    return false;
  }
}

export async function getUnreadCount() {
  try {
    const q = query(
      collection(db, MESSAGES_COL),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.error("getUnreadCount error:", err);
    return 0;
  }
}