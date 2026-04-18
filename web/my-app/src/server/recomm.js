import express from "express"
import cors from "cors"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs
} from "firebase/firestore"
import { db } from "./Firebase.js"

const app = express()
app.use(cors())
app.use(express.json())

app.post("/api/view/:uid/:projectId", async (req, res) => {
  const { uid, projectId } = req.params
  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, { viewedProjects: [projectId], searchedTags: [] })
    } else {
      await updateDoc(userRef, { viewedProjects: arrayUnion(projectId) })
    }
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

app.post("/api/search/:uid/:tag", async (req, res) => {
  const { uid, tag } = req.params
  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, { viewedProjects: [], searchedTags: [tag] })
    } else {
      await updateDoc(userRef, { searchedTags: arrayUnion(tag) })
    }
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

// Build a tag interest map from both explicit searches AND viewed project tags
function buildTagScores(searchedTags, viewedProjects, allProjects) {
  const scores = {}

  // Explicit tag searches carry more weight (x3)
  for (const tag of searchedTags) {
    const normalized = tag.toLowerCase()
    scores[normalized] = (scores[normalized] || 0) + 3
  }

  // Infer tags from viewed projects (x1)
  const viewedSet = new Set(viewedProjects)
  for (const project of allProjects) {
    if (!viewedSet.has(project.id)) continue
    const tags = project.tags || (project.tag ? [project.tag] : [])
    for (const tag of tags) {
      const normalized = tag.toLowerCase()
      scores[normalized] = (scores[normalized] || 0) + 1
    }
  }

  return scores
}

app.get("/api/recommendations/:uid", async (req, res) => {
  const { uid } = req.params
  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    const projectsSnap = await getDocs(collection(db, "projects"))
    const allProjects = projectsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.status === "approved")

    const popularProjects = [...allProjects]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 6)

    if (!userSnap.exists()) {
      return res.json({ success: true, type: "popular", projects: popularProjects })
    }

    const { searchedTags = [], viewedProjects = [] } = userSnap.data()

    // No activity at all → popular
    if (searchedTags.length === 0 && viewedProjects.length === 0) {
      return res.json({ success: true, type: "popular", projects: popularProjects })
    }

    const tagScores = buildTagScores(searchedTags, viewedProjects, allProjects)
    const viewedSet = new Set(viewedProjects)

    // Score every unviewed project by how well it matches the user's tag interests
    const scored = allProjects
      .filter(p => !viewedSet.has(p.id))
      .map(project => {
        const tags = project.tags || (project.tag ? [project.tag] : [])
        let relevance = 0
        for (const tag of tags) {
          relevance += tagScores[tag.toLowerCase()] || 0
        }
        // Blend relevance with popularity so cold projects with 0 score don't float up
        const popularity = Math.log1p(project.views || 0)
        return { ...project, _score: relevance * 10 + popularity }
      })
      .sort((a, b) => b._score - a._score)

    const hasPersonalized = scored.some(p => p._score > 0)

    if (!hasPersonalized) {
      return res.json({ success: true, type: "fallback_popular", projects: popularProjects })
    }

    const recommendations = scored.slice(0, 6).map(({ _score, ...p }) => p)

    res.json({ success: true, type: "personalized", projects: recommendations })

  } catch (error) {
    res.json({ success: false, error: error.message, projects: [] })
  }
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})