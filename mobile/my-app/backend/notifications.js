async function createWelcomeNotif(uid) {
  try {
    console.log("Welcome notification created for:", uid);
    return "notif-created";
  } catch {
    return "notif-fail";
  }
}

async function sendNotif(uid, notification) {
  try {
    console.log("Notification sent to:", uid, notification);
    return "notif-sent";
  } catch {
    return "notif-fail";
  }
}

export { createWelcomeNotif, sendNotif };