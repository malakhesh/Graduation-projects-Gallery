import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import recommendationsRouter from "./routes/recommendations.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

console.log("🔑 OPENROUTER_API_KEY loaded:", process.env.OPENROUTER_API_KEY ? "✅ Yes" : "❌ No")

const app = express()

app.use(cors({ origin: "https://graduation-projects-gallery.vercel.app" }))
app.use(express.json())

app.use("/api/recommendations", recommendationsRouter)

app.get("/", (req, res) => {
  res.json({ 
    status: "running",
    apiKeyLoaded: !!process.env.OPENROUTER_API_KEY,
    model: "qwen/qwen3.6-35b-a3b",
    endpoints: {
      recommendations: "GET /api/recommendations/:uid",
      view: "POST /api/recommendations/view/:uid/:projectId",
      search: "POST /api/recommendations/search/:uid/:tag"
    }
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})