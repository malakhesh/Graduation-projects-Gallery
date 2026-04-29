import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

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

const USER_IDS = [
  "4IIsKZ3ahCQChkbRvf3cb84S8ai1"
]

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randRatings = () => Array.from({ length: randInt(2, 18) }, () => randInt(1, 5))

// Unsplash images matched to each project topic
// Format: https://images.unsplash.com/photo-{id}?w=800&h=450&fit=crop
const PROJECTS = [

  // ── Business ───────────────────────────────────────────────
  {
    title: "Tashgheel",
    desc: "A job board built for the Egyptian market. Companies post vacancies and fresh graduates can apply, upload CVs, and track their application status. Built this because finding jobs here still happens mostly through connections and we wanted to change that.",
    tags: ["Business"],
    stack: ["React", "Node.js", "MongoDB", "Express"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop", // job/resume desk
  },
  {
    title: "Hisabat",
    desc: "Simple invoicing and expense tracking for freelancers. Made this for a small contracting business that was doing everything in a notebook. Generates PDF invoices and tracks who's paid and who hasn't.",
    tags: ["Business"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop", // accounting/invoices
  },
  {
    title: "Wakalety",
    desc: "A CRM tailored for small Egyptian real estate agencies. Agents log property listings, client inquiries, and follow-up calls. Replaces the WhatsApp groups and paper notes most agencies rely on.",
    tags: ["Business"],
    stack: ["React", "Supabase", "TypeScript"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop", // real estate keys
  },
  {
    title: "Staffly",
    desc: "HR management tool for small businesses. Handles employee records, monthly attendance, and leave requests. The owner gets a dashboard showing who's in, who's off, and payroll summaries.",
    tags: ["Business"],
    stack: ["Angular", "Node.js", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop", // team/office
  },
  {
    title: "Moshawar",
    desc: "Connects people with local consultants — lawyers, accountants, and business advisors — for paid 1-on-1 video sessions. A simple Calendly + payment combo built for the Arab market.",
    tags: ["Business"],
    stack: ["Next.js", "Stripe", "Prisma", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop", // video call consultation
  },
  {
    title: "Aqari Dashboard",
    desc: "Analytics dashboard for property developers to track unit sales, reservation statuses, and payment installments across multiple projects. Replaces the spreadsheets their sales team was drowning in.",
    tags: ["Business"],
    stack: ["React", "Chart.js", "Node.js", "MySQL"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop", // real estate buildings
  },
  {
    title: "Otlob Offer",
    desc: "A deals aggregator for B2B procurement. Businesses post what they need to buy in bulk and suppliers compete by submitting offers. Cuts out the middleman and speeds up supplier discovery.",
    tags: ["Business"],
    stack: ["Vue", "Express", "MongoDB"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?w=800&h=450&fit=crop", // warehouse/supply
  },
  {
    title: "ContractMe",
    desc: "Digital contract builder with e-signature support. Designed for Egyptian freelancers who never used contracts because it felt complicated. Templates cover design, dev, and consulting work.",
    tags: ["Business"],
    stack: ["React", "Node.js", "Firebase"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop", // signing contract
  },
  {
    title: "Makhzan",
    desc: "Inventory management system for small warehouses and retailers. Scan barcodes, log stock in/out, and get low-stock alerts. Built after an internship at a wholesale company that tracked everything manually.",
    tags: ["Business"],
    stack: ["React", "Express", "MySQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop", // warehouse shelves
  },
  {
    title: "Brokerly",
    desc: "A simple platform for independent insurance brokers to manage clients, policies, and renewal reminders. Gives solo brokers a professional workflow without costing much.",
    tags: ["Business"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=450&fit=crop", // insurance/handshake
  },

  // ── Education ──────────────────────────────────────────────
  {
    title: "Modhakra",
    desc: "Study group platform for university students. Create a group for your course, share notes, post questions, and do live quiz rounds together before exams. We literally used it while building it during finals.",
    tags: ["Education"],
    stack: ["React", "Firebase", "Socket.io"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=450&fit=crop", // students studying together
  },
  {
    title: "Khatwa",
    desc: "Learning roadmap builder for self-taught developers. Pick a goal like 'become a frontend dev' and get a structured week-by-week plan with curated free resources. Track your progress as you go.",
    tags: ["Education"],
    stack: ["Vue", "Node.js", "MongoDB"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop", // learning/laptop
  },
  {
    title: "Dr. Recap",
    desc: "Upload your lecture PDF or slide deck and get a summarized study sheet with key points and likely exam questions. Uses the Anthropic API to generate summaries. Saved our team hours during revision.",
    tags: ["Education"],
    stack: ["React", "Python", "Flask", "Anthropic API"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop", // notes/studying
  },
  {
    title: "Tadribo",
    desc: "Practice exam platform where teachers upload past papers and students can time themselves, submit answers, and see auto-graded MCQ results. Built for a tutoring center in Maadi.",
    tags: ["Education"],
    stack: ["Next.js", "Supabase", "TypeScript"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop", // exam/writing
  },
  {
    title: "Batal El Lugha",
    desc: "Arabic language learning app for non-native speakers. Focuses on Egyptian dialect with audio clips, fill-in-the-blank exercises, and a daily streak system. Filling a gap Duolingo doesn't address well.",
    tags: ["Education"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
    imgUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=450&fit=crop", // language/letters
  },
  {
    title: "Absent",
    desc: "Attendance tracking app for university professors. Students check in via a QR code each lecture, and the professor sees live attendance with automatic absence warnings sent to at-risk students.",
    tags: ["Education"],
    stack: ["React", "Node.js", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=450&fit=crop", // classroom/lecture
  },
  {
    title: "Fehemtha",
    desc: "A peer tutoring marketplace where university students offer paid tutoring in subjects they excel at. We noticed a lot of informal tutoring happening on Facebook groups and wanted to formalize it.",
    tags: ["Education"],
    stack: ["Vue", "Firebase", "Stripe"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=450&fit=crop", // tutoring/teaching
  },
  {
    title: "Naqla",
    desc: "Educational content translator that rewrites English YouTube transcripts in simple Arabic. Built for students whose English isn't strong enough to follow technical lectures.",
    tags: ["Education"],
    stack: ["React", "Python", "FastAPI"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=450&fit=crop", // translation/language
  },
  {
    title: "Grades+",
    desc: "GPA calculator and academic progress tracker for Egyptian university students on the credit-hour system. Log your grades each semester and see exactly where you stand.",
    tags: ["Education"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop", // academic/grades chart
  },
  {
    title: "Mentor Match",
    desc: "Connects final-year students with recent graduates working in their target field for short mentorship sessions. Most students had no idea what their first job would actually look like — this bridges that gap.",
    tags: ["Education"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=450&fit=crop", // mentorship/meeting
  },

  // ── E-commerce ─────────────────────────────────────────────
  {
    title: "Dakkany",
    desc: "Online storefront builder for Egyptian small sellers who currently only sell through Instagram DMs. They get a shareable link, a product catalog, and a simple orders inbox — no technical knowledge needed.",
    tags: ["E-commerce"],
    stack: ["Next.js", "Stripe", "MongoDB", "Tailwind"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=450&fit=crop", // small shop/store
  },
  {
    title: "Handmade Souk",
    desc: "Marketplace for handmade products in Egypt. Sellers apply, list their items, and handle orders. Built because Etsy doesn't support EGP and local shipping properly.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "MySQL", "Paymob API"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=450&fit=crop", // handmade crafts
  },
  {
    title: "StockSnap",
    desc: "Inventory and orders management for small online shops. Connects to Instagram and Facebook shops to pull orders automatically and update stock levels in real time.",
    tags: ["E-commerce"],
    stack: ["Vue", "Express", "MongoDB"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop", // retail inventory
  },
  {
    title: "Tawsela",
    desc: "Last-mile delivery tracker for small e-commerce sellers. Sellers add shipments and customers get an SMS with a live tracking link. Integrates with the main Egyptian courier APIs.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=450&fit=crop", // delivery/package
  },
  {
    title: "Review Genie",
    desc: "Automatically follows up with customers after purchase and collects reviews via WhatsApp. Sellers get a dashboard with ratings over time. One test seller went from 3 reviews to 47 in a month.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "MongoDB", "WhatsApp API"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop", // reviews/stars
  },
  {
    title: "Cart Rescue",
    desc: "Abandoned cart recovery tool that sends automated reminders via email and SMS with a discount code. A/B tested two message styles with a real store — recovered about 12% of abandoned carts.",
    tags: ["E-commerce"],
    stack: ["Next.js", "Node.js", "Stripe", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=450&fit=crop", // shopping cart
  },
  {
    title: "Fashionista POS",
    desc: "Point-of-sale system for clothing boutiques. Handles sales, returns, size/color variants, and end-of-day reports. Built for a family boutique in Heliopolis who were using a cash register with no records.",
    tags: ["E-commerce"],
    stack: ["React", "Electron", "SQLite"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=450&fit=crop", // fashion boutique
  },
  {
    title: "Bundles",
    desc: "Upsell and bundle recommendation widget for existing e-commerce stores. Sellers configure bundle deals and the widget shows suggestions on the product page. Plug-and-play via a script tag.",
    tags: ["E-commerce"],
    stack: ["Vanilla JS", "Node.js", "MongoDB"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=450&fit=crop", // product bundles
  },
  {
    title: "Pricewatch EG",
    desc: "Compares prices of electronics across major Egyptian online stores. Scrapes prices daily and sends alerts when something drops. Users search for a product and see who has the best price.",
    tags: ["E-commerce"],
    stack: ["React", "Python", "Scrapy", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=450&fit=crop", // electronics
  },
  {
    title: "Returnly",
    desc: "Simple return request portal for online stores. Customers submit what they want to return, upload a photo, and pick a reason. Store owners review and approve from a dashboard.",
    tags: ["E-commerce"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?w=800&h=450&fit=crop", // return/package
  },

  // ── Entertainment ──────────────────────────────────────────
  {
    title: "Filmak",
    desc: "Movie and series tracker for Arabic-speaking users. Log what you've watched, rate it, and get recommendations based on your history. Has a 'watch tonight' feature that picks something based on your mood.",
    tags: ["Entertainment"],
    stack: ["React", "Node.js", "MongoDB", "TMDB API"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop", // cinema/movies
  },
  {
    title: "Leila",
    desc: "Event discovery app for Cairo and Alexandria. Lists concerts, art exhibitions, comedy shows, and pop-ups this week. Pulls from Facebook events and Instagram pages into one clean feed.",
    tags: ["Entertainment"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
    imgUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=450&fit=crop", // concert/event
  },
  {
    title: "Mawgoud",
    desc: "Real-time multiplayer trivia game in Arabic. Create a room, share the code with friends, and compete in timed rounds. Custom question sets for Egyptian geography, history, and pop culture.",
    tags: ["Entertainment"],
    stack: ["React", "Socket.io", "Node.js", "Redis"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=450&fit=crop", // trivia/game night
  },
  {
    title: "Qissa",
    desc: "Collaborative storytelling app where users write one sentence at a time and the story grows. Each story has a genre and word limit. The best-rated ones get featured on the home page.",
    tags: ["Entertainment"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop", // writing/storytelling
  },
  {
    title: "Playlist Battle",
    desc: "Create a playlist of 5 songs and battle a friend. Their followers vote on which playlist wins. Integrates with Spotify to pull tracks and display previews.",
    tags: ["Entertainment"],
    stack: ["React", "Spotify API", "Firebase"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop", // music/headphones
  },
  {
    title: "Rawi",
    desc: "Arabic podcast app with community-submitted chapters. Listeners mark their favorite moments and leave short notes that others can see while listening. Focused on Egyptian and Levantine shows.",
    tags: ["Entertainment"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
    imgUrl: "https://images.unsplash.com/photo-1478737270197-bc1e9dc4a35a?w=800&h=450&fit=crop", // podcast/microphone
  },
  {
    title: "Shoof",
    desc: "Watch party app that syncs a video for multiple users with live chat alongside it. Built because we kept watching movies together on calls but the sync was always off.",
    tags: ["Entertainment"],
    stack: ["React", "Socket.io", "Node.js"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=450&fit=crop", // watching together
  },
  {
    title: "Canvas",
    desc: "Digital art portfolio builder for Egyptian illustrators and designers. Create a profile, upload work in collections, and get a shareable link. Cleaner than Behance for client sharing.",
    tags: ["Entertainment"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop", // art/illustration
  },
  {
    title: "Gamed Walla La",
    desc: "Board game recommendation and night planner. Tell it how many people, age range, and play time — it recommends the right game. Built-in timer and turn tracker for common games.",
    tags: ["Entertainment"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=450&fit=crop", // board games
  },
  {
    title: "Mosalsalat",
    desc: "Arabic drama tracker for ongoing series with episode release reminders and spoiler-free discussion. Spoiler-free mode blurs comments posted within 24 hours of an episode dropping.",
    tags: ["Entertainment"],
    stack: ["Vue", "Node.js", "MongoDB"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f4d309?w=800&h=450&fit=crop", // TV/streaming
  },

  // ── Blog ───────────────────────────────────────────────────
  {
    title: "Maqal",
    desc: "Arabic-first blogging platform with a clean distraction-free editor. Writers publish articles, build a following, and optionally monetize through a monthly subscription. A Medium but in Arabic.",
    tags: ["Blog"],
    stack: ["Next.js", "Supabase", "MDX", "Tailwind"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop", // writing/blogging
  },
  {
    title: "Dev Diary",
    desc: "A blogging platform for developers to document their learning journey. Supports code blocks, GitHub Gist embeds, and topic tags. Posts are short — dev journal entries, not full articles.",
    tags: ["Blog"],
    stack: ["Gatsby", "GraphQL", "Netlify CMS"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&h=450&fit=crop", // code/developer
  },
  {
    title: "Rehlety",
    desc: "Travel blog platform for Egyptians who travel. Write trip reports, tag countries and cities, attach a cost breakdown, and help others plan the same trip. Replacing scattered Facebook posts.",
    tags: ["Blog"],
    stack: ["React", "Sanity", "Next.js"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=450&fit=crop", // travel/map
  },
  {
    title: "Akl W Hekayat",
    desc: "Food blog platform where each recipe comes with a personal story. The layout separates the story from the recipe so readers can go straight to ingredients or read the full context.",
    tags: ["Blog"],
    stack: ["Next.js", "Contentful", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop", // cooking/food
  },
  {
    title: "Warqa",
    desc: "Book review blog with a reading journal built in. Log every book you finish, write a review, and see your reading stats by year and genre. Your public profile shows your full reading history.",
    tags: ["Blog"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop", // books/reading
  },
  {
    title: "El Start",
    desc: "Startup founder blog where people document building their business in public — the wins, the pivots, and the failures. A public journal for Egyptian entrepreneurs.",
    tags: ["Blog"],
    stack: ["Next.js", "Supabase", "TypeScript"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop", // startup/whiteboard
  },
  {
    title: "Techara",
    desc: "Tech opinion blog aggregator for Arabic content. Writers submit posts and the best ones get featured. Has a weekly digest newsletter. The Arabic version of Hacker News but friendlier.",
    tags: ["Blog"],
    stack: ["Nuxt.js", "Strapi", "PostgreSQL"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop", // tech/news
  },
  {
    title: "Sabah El Kheir",
    desc: "A weekly newsletter platform with a morning digest format. Writers publish short reads — one story, one tip, one recommendation — designed to be read in under 5 minutes over coffee.",
    tags: ["Blog"],
    stack: ["React", "Node.js", "SendGrid", "MongoDB"],
    category: "Full Stack",
    imgUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=450&fit=crop", // coffee/morning
  },
  {
    title: "Midan",
    desc: "Community blog for neighborhood-level content. Residents write about local issues, events, and recommendations in their area. Moderated by volunteer editors. Piloted in Maadi with 60 signups in week one.",
    tags: ["Blog"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop", // city/neighborhood
  },
  {
    title: "Bel 3arabi",
    desc: "A blog platform for translating technical concepts into plain Arabic. Writers pick an English tech topic and rewrite it for an Arabic-speaking audience with local examples.",
    tags: ["Blog"],
    stack: ["Next.js", "MDX", "Vercel", "Tailwind"],
    category: "Web App",
    imgUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop", // writing/arabic
  },
]

async function seed() {
  let count = 0

  for (const p of PROJECTS) {
    const userId = rand(USER_IDS)
    const views = randInt(10, 400)
    const ratings = randRatings()
    const year = String(randInt(2021, 2024))
    const gitLink = `https://github.com/graduation-gallery/${p.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`

    await addDoc(collection(db, "projects"), {
      title: p.title,
      desc: p.desc,
      userId,
      year,
      stack: p.stack,
      category: p.category,
      gitLink,
      imgUrl: p.imgUrl,
      tags: p.tags,
      status: "approved",
      views,
      ratings,
      comments: [],
      userRatings: {},
      createdAt: serverTimestamp(),
    })

    count++
    console.log(`✓ [${count}/${PROJECTS.length}] ${p.title} (${p.tags[0]}) — ${p.category}`)
  }

  console.log(`\n✅ Done! ${count} projects seeded.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})