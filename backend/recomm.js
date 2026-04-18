import express from "express"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  getDocs
} from "firebase/firestore"

import { db } from "./firebase.js"

const app = express()
app.use(express.json())

app.post("/api/view/:uid/:projectId", async (req, res) => {
  const { uid, projectId } = req.params

  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        viewedProjects: [projectId]
      })
    } else {
      await updateDoc(userRef, {
        viewedProjects: arrayUnion(projectId)
      })
    }

    res.json({ success: true })

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
})

app.post("/api/search/:uid/:tag", async (req, res) => {
  const { uid, tag } = req.params

  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        viewedProjects: [],
        searchedTags: [tag]
      })
    } else {
      await updateDoc(userRef, {
        searchedTags: arrayUnion(tag)
      })
    }

    res.json({ success: true })

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    })
  }
})

app.get("/api/recommendations/:uid", async (req, res) => {
  const { uid } = req.params

  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    const projectsSnap = await getDocs(
      collection(db, "projects")
    )

    const allProjects = projectsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))

    const popularProjects = allProjects
      .sort((a,b)=>(b.views || 0)-(a.views || 0))
      .slice(0,10)

    if (!userSnap.exists()) {
      return res.json({
        success: true,
        type: "popular",
        projects: popularProjects
      })
    }

    const {
      searchedTags = [],
      viewedProjects = []
    } = userSnap.data()

    const recommended = allProjects.filter(project => {

      if (viewedProjects.includes(project.id)) {
        return false
      }

      if (project.tags && searchedTags.length > 0) {
        return project.tags.some(tag =>
          searchedTags.includes(tag)
        )
      }

      return false
    })

    if (recommended.length === 0) {
      return res.json({
        success: true,
        type: "fallback_popular",
        projects: popularProjects
      })
    }

    res.json({
      success: true,
      type: "personalized",
      projects: recommended.slice(0,10)
    })

  } catch(error) {

    res.json({
      success: false,
      error: error.message,
      projects: []
    })

  }
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})