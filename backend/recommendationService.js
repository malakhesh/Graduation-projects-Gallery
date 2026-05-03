import fetch from "node-fetch"
import dotenv from "dotenv"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function getQwenRecommendations(userTags, viewedProjects, unseenProjects) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing")
    }

    const prompt = `You are an AI recommendation system for graduation projects.

User searched for: ${userTags.join(", ") || "nothing"}
User previously viewed: ${viewedProjects.map(p => p.title).join(", ") || "none"}

Available projects (user has NOT seen):
${unseenProjects.map(p =>
  `ID: ${p.id} | Title: "${p.title}" | Tags: [${p.tags?.join(", ") || ""}]`
).join("\n")}

Task:
- Recommend exactly up to 10 BEST matching projects
- Prioritize relevance to user interests
- Return ONLY valid JSON

IMPORTANT FORMAT (STRICT):
{
  "recommendations": [
    { "id": "PROJECT_ID" },
    { "id": "PROJECT_ID" }
  ]
}
`

    console.log(" Sending request to Qwen AI...")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Graduation Projects Gallery",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-35b-a3b",
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    console.log("Qwen response received")
    console.log(" Response structure:", JSON.stringify(data, null, 2))

    const aiText = data.choices?.[0]?.message?.content

    if (!aiText) {
      console.error(" Empty content. Full response:", JSON.stringify(data, null, 2))
      throw new Error("Empty AI response")
    }

    console.log("📝 AI RAW content:", aiText)

    const cleanJson = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    console.log("🧹 Cleaned JSON:", cleanJson)

    const aiResponse = JSON.parse(cleanJson)

    if (!aiResponse.recommendations || !Array.isArray(aiResponse.recommendations)) {
      throw new Error("Invalid AI format: missing recommendations array")
    }

    const recommended = aiResponse.recommendations
      .map(rec => unseenProjects.find(p => p.id === rec.id))
      .filter(Boolean)
      .slice(0, 10)

    console.log("AI returned", recommended.length, "valid recommendations")

    return recommended

  } catch (error) {
    console.error("AI ERROR:", error.message)
    throw error
  }
}