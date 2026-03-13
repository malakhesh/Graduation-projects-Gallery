import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBsCt8yentOWp9u_OvnaUHZblOiwJ6_Hdk",
  authDomain: "graduation-gallery-project.firebaseapp.com",
  projectId: "graduation-gallery-project",
  storageBucket: "graduation-gallery-project.firebasestorage.app",
  messagingSenderId: "41647573698",
  appId: "1:41647573698:web:d646f5f5104a9e425f895b",
  measurementId: "G-VEP0LGWWD4"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }