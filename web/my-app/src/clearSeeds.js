import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBsCt8yentOWp9u_OvnaUHZblOiwJ6_Hdk",
  authDomain: "graduation-gallery-project.firebaseapp.com",
  projectId: "graduation-gallery-project",
  storageBucket: "graduation-gallery-project.appspot.com",
  messagingSenderId: "41647573698",
  appId: "1:41647573698:web:d646f5f5104a9e425f895b",
  measurementId: "G-VEP0LGWWD4"
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const SEED_USER_ID = "4IIsKZ3ahCQChkbRvf3cb84S8ai1"

async function clearSeeds() {
  const q = query(collection(db, "projects"), where("userId", "==", SEED_USER_ID))
  const s = await getDocs(q)
  await Promise.all(s.docs.map((d) => deleteDoc(doc(db, "projects", d.id))))
  console.log(`✅ Deleted ${s.docs.length} seed projects`)
  process.exit(0)
}

clearSeeds()