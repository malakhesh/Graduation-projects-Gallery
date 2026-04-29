import express from "express"
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs } from "firebase/firestore"
import { db } from "../firebase.js"
import { getQwenRecommendations } from "../recommendationService.js"

const router = express.Router()

router.post("/view/:uid/:projectId", async (req, res) => {
  const { uid, projectId } = req.params

  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, { viewedProjects: [projectId] })
    } else {
      await updateDoc(userRef, { viewedProjects: arrayUnion(projectId) })
    }

    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

router.post("/search/:uid/:tag", async (req, res) => {
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

router.get("/:uid", async (req, res) => {
  const { uid } = req.params

  try {
    const userRef = doc(db, "userActivity", uid)
    const userSnap = await getDoc(userRef)

    const projectsSnap = await getDocs(collection(db, "projects"))
    const allProjects = projectsSnap.docs.map(d => ({ 
      id: d.id, 
      title: d.data().title,
      description: d.data().description,
      tags: d.data().tags || [],
      category: d.data().category || ""
    }))

    if (!userSnap.exists()) {
      return res.json({ 
        success: true, 
        type: "popular",
        projects: allProjects.slice(0, 10) 
      })
    }

    const { searchedTags = [], viewedProjects = [] } = userSnap.data()

    const viewedProjectsData = allProjects.filter(p => viewedProjects.includes(p.id))
    const unseenProjects = allProjects.filter(p => !viewedProjects.includes(p.id))

    if (unseenProjects.length === 0) {
      return res.json({ 
        success: true, 
        type: "all_viewed",
        projects: [] 
      })
    }

    try {
      const aiRecommendations = await getQwenRecommendations(
        searchedTags,
        viewedProjectsData,
        unseenProjects
      )

      if (aiRecommendations && aiRecommendations.length > 0) {
        return res.json({ 
          success: true, 
          type: "qwen_ai",
          projects: aiRecommendations
        })
      }
    } catch (aiError) {
      console.error("⚠️ AI failed, falling back to simple recommendation:", aiError.message)
    }

    const fallback = unseenProjects
      .filter(p => p.tags?.some(t => searchedTags.includes(t)))
      .slice(0, 10)

    res.json({ 
      success: true, 
      type: "fallback",
      projects: fallback.length > 0 ? fallback : unseenProjects.slice(0, 10)
    })

  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

export default router