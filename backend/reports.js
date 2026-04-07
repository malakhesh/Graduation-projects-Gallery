async function addReport(projectId, reporterId, reason) {
  try {
    await addDoc(collection(db, "reports"), {
      projectId,
      reporterId,
      reason,
      createdAt: new Date()
    })
    return "report-added"
  } catch {
    return "report-fail"
  }
}

async function getReports(currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized"
    const snap = await getDocs(collection(db, "reports"))
    let arr = []
    snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
    return arr
  } catch {
    return "get-reports-fail"
  }
}

async function deleteReport(reportId, currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized"
    await deleteDoc(doc(db, "reports", reportId))
    return "report-deleted"
  } catch {
    return "delete-report-fail"
  }
}

async function resolveReport(reportId, projectId, currentRole) {
  try {
    if (currentRole !== "admin") return "unauthorized"
    await deleteDoc(doc(db, "reports", reportId))
    await deleteDoc(doc(db, "projects", projectId))
    return "report-resolved"
  } catch {
    return "resolve-fail"
  }
}
