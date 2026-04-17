import express from "express"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "./firebase.js"

const app = express()
app.use(express.json())

async function recommendProjects(uid) {
  try {
    const userDoc = await getDoc(doc(db, "userActivity", uid))
    if (!userDoc.exists()) {
      return { status: "error", message: "No activity found for this user", projects: [] }
    }

    const userData = userDoc.data()
    const tags = userData.searchedTags || []

    const projectsSnap = await getDocs(collection(db, "projects"))
    const projects = projectsSnap.docs.map(d => d.data())

    const recommended = projects.filter(p =>
      p.tags && p.tags.some(tag => tags.includes(tag))
    )

    return { status: "success", projects: recommended }
  } catch (err) {
    console.error("Error in recommendProjects:", err)
    return { status: "error", message: err.message, projects: [] }
  }
}

app.get("/api/recommendations/:uid", async (req, res) => {
  const uid = req.params.uid
  const result = await recommendProjects(uid)
  res.json(result)
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})
