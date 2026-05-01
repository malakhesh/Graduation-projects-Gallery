import express from "express"
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebase.js"
import { getQwenRecommendations } from "../recommendationService.js"

const router = express.Router()

// Helper: calculate average rating from ratings array or userRatings map
const getAverageRating = (project) => {
  // Try userRatings map first (e.g. { userId: ratingValue })
  if (project.userRatings && Object.keys(project.userRatings).length > 0) {
    const values = Object.values(project.userRatings)
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }
  // Fall back to ratings array
  if (project.ratings && project.ratings.length > 0) {
    return project.ratings.reduce((sum, v) => sum + v, 0) / project.ratings.length
  }
  return 0
}

// Helper: return top N projects sorted by average rating (descending)
const getTopRatedProjects = (projects, n = 10) => {
  return [...projects]
    .sort((a, b) => getAverageRating(b) - getAverageRating(a))
    .slice(0, n)
}

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

    const projectsQuery = query(collection(db, "projects"), where("status", "==", "approved"))
    const projectsSnap = await getDocs(projectsQuery)
    const allProjects = projectsSnap.docs.map(d => ({ 
      id: d.id, 
      title: d.data().title,
      description: d.data().description,
      desc: d.data().desc,
      tags: d.data().tags || [],
      category: d.data().category || "",
      imgUrl: d.data().imgUrl || "",
      image: d.data().image || "",
      ratings: d.data().ratings || [],
      userRatings: d.data().userRatings || {},
      comments: d.data().comments || [],
      gitLink: d.data().gitLink || "",
      github: d.data().github || "",
      stack: d.data().stack || [],
      status: d.data().status || "approved",
      userId: d.data().userId || "",
      authorId: d.data().authorId || "",
      avatar: d.data().avatar || "",
      date: d.data().date || "",
      createdAt: d.data().createdAt || null,
      views: d.data().views || 0,
      year: d.data().year || "",
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

    console.log("allProjects count:", allProjects.length)
    console.log("viewedProjects:", viewedProjects)
    console.log("unseenProjects count:", unseenProjects.length)

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

      console.log("aiRecommendations:", aiRecommendations)

      if (aiRecommendations && aiRecommendations.length > 0) {
        return res.json({ 
          success: true, 
          type: "qwen_ai",
          projects: aiRecommendations
        })
      }
    } catch (aiError) {
      console.error("⚠️ AI failed, falling back to top-rated projects:", aiError.message)
    }

    // AI failed or returned nothing → show top 10 highest-rated projects
    const topRated = getTopRatedProjects(allProjects, 10)

    res.json({ 
      success: true, 
      type: "top_rated",
      projects: topRated
    })

  } catch (error) {
    res.json({ success: false, error: error.message })
  }
})

export default router