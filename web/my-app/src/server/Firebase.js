import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBsCt8yentOWp9u_OvnaUHZblOiwJ6_Hdk",
  authDomain: "graduation-gallery-project.firebaseapp.com",
  projectId: "graduation-gallery-project",
  storageBucket: "graduation-gallery-project.appspot.com",
  messagingSenderId: "41647573698",
  appId: "1:41647573698:web:d646f5f5104a9e425f895b"
}

const app = initializeApp(firebaseConfig, "server")
export const db = getFirestore(app)