// messages.js — Firebase backend for contact messages
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

// ── Send a message (max 3 per day per sender email) ─────────────────────────
export async function sendContactMessage({ name, email, message }) {
  try {
    // 1. Check if contact is enabled
    const settingsSnap = await getDoc(SETTINGS_REF());
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.contactOpen === false) {
        return { ok: false, reason: "disabled" };
      }
    }

    // 2. Get all messages for this email (ONLY equality → no index needed)
    const q = query(
      collection(db, MESSAGES_COL),
      where("email", "==", email.trim().toLowerCase())
    );

    const snap = await getDocs(q);

    // 3. Filter today's messages in JS
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

    if (todayCount >= 3) {
      return { ok: false, reason: "limit" };
    }

    // 4. Save message
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

// ── Admin: get all messages ──────────────────────────────────────────────────
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

// ── Admin: mark message as read ──────────────────────────────────────────────
export async function markMessageRead(id) {
  try {
    await updateDoc(doc(db, MESSAGES_COL, id), { read: true });
    return true;
  } catch (err) {
    console.error("markMessageRead error:", err);
    return false;
  }
}

// ── Admin: delete message ────────────────────────────────────────────────────
export async function deleteMessage(id) {
  try {
    await deleteDoc(doc(db, MESSAGES_COL, id));
    return true;
  } catch (err) {
    console.error("deleteMessage error:", err);
    return false;
  }
}

// ── Admin: count unread messages ─────────────────────────────────────────────
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