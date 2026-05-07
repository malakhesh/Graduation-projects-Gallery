import { getProj } from "./projects.js"

import { getUser } from "../auth/user.js"

import { sendNotif } from "../notifications.js"

async function notifyBookmark(projectId, bookmarkerUid) {
  try {

    const project = await getProj(projectId)

    if (
      !project ||
      project === "no-proj" ||
      project === "get-fail"
    ) return

    const ownerUid = project.userId

    if (
      !ownerUid ||
      ownerUid === bookmarkerUid
    ) return

    const bookmarkerData =
      await getUser(bookmarkerUid)

    const bookmarkerName =
      bookmarkerData?.name || "Someone"

    const title =
      project.title || "your project"

    await sendNotif(ownerUid, {
      type: "bookmark",
      message:
        `${bookmarkerName} bookmarked "${title}"`,
      projectId: null,
      clickable: false,
    })

  } catch {}
}

export {
  notifyBookmark
}