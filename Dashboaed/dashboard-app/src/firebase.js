import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBsCt8yentOWp9u_OvnaUHZblOiwJ6_Hdk",
  authDomain: "graduation-gallery-project.firebaseapp.com",
  projectId: "graduation-gallery-project",
  storageBucket: "graduation-gallery-project.appspot.com",
  messagingSenderId: "41647573698",
  appId: "1:41647573698:web:d646f5f5104a9e425f895b",
  measurementId: "G-VEP0LGWWD4"
}

<<<<<<< HEAD:web/my-app/src/firebase.js
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
=======
const app     = initializeApp(firebaseConfig)
const auth    = getAuth(app)
const db      = getFirestore(app)
>>>>>>> b557a96a2a06c3a456d3dc5eadf24ad13165192c:Dashboaed/dashboard-app/src/firebase.js
const storage = getStorage(app)

export { auth, db, storage }