import { db } from './firebase';
import { addDoc, collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { addViolation } from './auth.js';

async function addReport(projectId, reporterId, reason) {
  try {
    await addDoc(collection(db, "reports"), {
      projectId,
      reporterId,
      reason,
      createdAt: new Date()
    });
    return "report-added";
  } catch {
    return "report-fail";
  }
}

async function getReports(currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized";
    const snap = await getDocs(collection(db, "reports"));
    let arr = [];
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
    return arr;
  } catch {
    return "get-reports-fail";
  }
}

async function deleteReport(reportId, currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized";
    await deleteDoc(doc(db, "reports", reportId));
    return "dismiss-ok"; // fixed: was "report-deleted"
  } catch {
    return "delete-report-fail";
  }
}

async function resolveReport(reportId, projectId, currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized";

    const projectSnap = await getDoc(doc(db, "projects", projectId));
    if (projectSnap.exists()) {
      const ownerUid = projectSnap.data().userId;
      const reason   = "Project removed due to a confirmed report";
      if (ownerUid) await addViolation(ownerUid, reason, currentRole);
    }

    await deleteDoc(doc(db, "projects", projectId));
    await deleteDoc(doc(db, "reports", reportId));
    return "resolve-ok"; // fixed: was "report-resolved"
  } catch {
    return "resolve-fail";
  }
}

async function resolveCommentReport(reportId, encodedProjectId, currentRole) {
  try {
    if (currentRole !== "admin") return "unauth";

    const marker     = "_comment_";
    const markerIdx  = encodedProjectId.indexOf(marker);
    if (markerIdx === -1) return "bad-format";

    const realProjectId = encodedProjectId.slice(0, markerIdx);
    const commentIndex  = parseInt(encodedProjectId.slice(markerIdx + marker.length), 10);
    if (isNaN(commentIndex)) return "bad-index";

    const projectRef  = doc(db, "projects", realProjectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return "no-proj";

    const data     = projectSnap.data();
    const comments = Array.isArray(data.comments) ? [...data.comments] : [];
    if (commentIndex < 0 || commentIndex >= comments.length) return "bad-index";

    const comment      = comments[commentIndex];
    const commenterUid = comment?.userId || comment?.uid || null;
    if (commenterUid) {
      const reason = "Comment removed due to a confirmed report";
      await addViolation(commenterUid, reason, currentRole);
    }

    comments.splice(commentIndex, 1);
    await updateDoc(projectRef, { comments });
    await deleteDoc(doc(db, "reports", reportId));

    return "comment-removed";
  } catch {
    return "comment-resolve-fail";
  }
}

export { addReport, getReports, deleteReport, resolveReport, resolveCommentReport };