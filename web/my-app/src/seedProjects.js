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
const randRatings = () => Array.from({ length: randInt(0, 18) }, () => randInt(1, 5))

const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/seed/proj1/800/450",
  "https://picsum.photos/seed/proj2/800/450",
  "https://picsum.photos/seed/proj3/800/450",
  "https://picsum.photos/seed/proj4/800/450",
  "https://picsum.photos/seed/proj5/800/450",
  "https://picsum.photos/seed/proj6/800/450",
  "https://picsum.photos/seed/proj7/800/450",
  "https://picsum.photos/seed/proj8/800/450",
  "https://picsum.photos/seed/proj9/800/450",
  "https://picsum.photos/seed/proj10/800/450",
  "https://picsum.photos/seed/proj11/800/450",
  "https://picsum.photos/seed/proj12/800/450",
  "https://picsum.photos/seed/proj13/800/450",
  "https://picsum.photos/seed/proj14/800/450",
  "https://picsum.photos/seed/proj15/800/450",
]

const PROJECTS = [
  // ── Business ───────────────────────────────────────────────
  {
    title: "Tashgheel",
    desc: "A job board built for the Egyptian market. Companies post vacancies and fresh graduates can apply, upload CVs, and track their application status. Built this because finding jobs here still happens mostly through connections and we wanted to change that.",
    tags: ["Business"],
    stack: ["React", "Node.js", "MongoDB", "Express"],
    category: "Full Stack",
  },
  {
    title: "Hisabat",
    desc: "Simple invoicing and expense tracking for freelancers. I made this for my uncle who runs a small contracting business and was doing everything in a notebook. Generates PDF invoices and tracks who's paid and who hasn't.",
    tags: ["Business"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Wakalety",
    desc: "A CRM tailored for small Egyptian real estate agencies. Agents log property listings, client inquiries, and follow-up calls. Nothing fancy — just replaces the WhatsApp groups and paper notes most agencies use.",
    tags: ["Business"],
    stack: ["React", "Supabase", "TypeScript"],
    category: "Web App",
  },
  {
    title: "Staffly",
    desc: "HR management tool for small businesses. Handles employee records, monthly attendance, and leave requests. The owner gets a dashboard showing who's in, who's off, and payroll summaries. Built for a family business as our real-world use case.",
    tags: ["Business"],
    stack: ["Angular", "Node.js", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Moshawar",
    desc: "Connects people with local consultants — lawyers, accountants, and business advisors — for paid 1-on-1 video sessions. Think a simple Calendly + payment link combo built specifically for the Arab market.",
    tags: ["Business"],
    stack: ["Next.js", "Stripe", "Prisma", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Aqari Dashboard",
    desc: "Analytics dashboard for property developers to track unit sales, reservation statuses, and payment installments across multiple projects. Replaces the spreadsheets our client's sales team was drowning in.",
    tags: ["Business"],
    stack: ["React", "Chart.js", "Node.js", "MySQL"],
    category: "Web App",
  },
  {
    title: "Otlob Offer",
    desc: "A deals aggregator for B2B procurement. Businesses post what they need to buy in bulk and suppliers compete by submitting offers. Cuts out the middleman and speeds up supplier discovery.",
    tags: ["Business"],
    stack: ["Vue", "Express", "MongoDB"],
    category: "Full Stack",
  },
  {
    title: "ContractMe",
    desc: "Digital contract builder with e-signature support. Designed for Egyptian freelancers who never used contracts before because it felt too complicated. We made templates for the most common cases — design, dev, and consulting.",
    tags: ["Business"],
    stack: ["React", "Node.js", "Firebase"],
    category: "Web App",
  },
  {
    title: "Makhzan",
    desc: "Inventory management system for small warehouses and retailers. Scan barcodes, log stock in/out, and get low-stock alerts. Built after our internship at a wholesale company that tracked everything manually.",
    tags: ["Business"],
    stack: ["React", "Express", "MySQL"],
    category: "Full Stack",
  },
  {
    title: "Brokerly",
    desc: "A simple platform for independent insurance brokers to manage clients, policies, and renewal reminders. Brokers in Egypt mostly work alone with no tools — this gives them a professional workflow without costing a lot.",
    tags: ["Business"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Web App",
  },

  // ── Education ──────────────────────────────────────────────
  {
    title: "Modhakra",
    desc: "Study group platform for university students. Create a group for your course, share notes, post questions, and do live quiz rounds together before exams. Built during finals week — we literally used it while building it.",
    tags: ["Education"],
    stack: ["React", "Firebase", "Socket.io"],
    category: "Full Stack",
  },
  {
    title: "Khatwa",
    desc: "Learning roadmap builder for self-taught developers. Pick a goal like 'become a frontend dev' and get a structured week-by-week plan with curated free resources. Track your progress as you go.",
    tags: ["Education"],
    stack: ["Vue", "Node.js", "MongoDB"],
    category: "Web App",
  },
  {
    title: "Dr. Recap",
    desc: "Upload your lecture PDF or slide deck and get a summarized study sheet with key points and likely exam questions. Uses the Anthropic API to generate summaries. Saved our team hours during revision.",
    tags: ["Education"],
    stack: ["React", "Python", "Flask", "Anthropic API"],
    category: "Full Stack",
  },
  {
    title: "Tadribo",
    desc: "Practice exam platform where teachers upload past papers and students can time themselves, submit answers, and see auto-graded results for MCQ sections. Built for a tutoring center in Maadi.",
    tags: ["Education"],
    stack: ["Next.js", "Supabase", "TypeScript"],
    category: "Full Stack",
  },
  {
    title: "Batal El Lugha",
    desc: "Arabic language learning app built for non-native speakers. Focuses on Egyptian dialect with audio clips, fill-in-the-blank exercises, and a daily streak system. Our team thought it was a gap Duolingo doesn't fill well.",
    tags: ["Education"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
  },
  {
    title: "Absent",
    desc: "Attendance tracking app for university professors. Students check in via a QR code generated each lecture, and the professor sees live attendance with automatic absence warnings sent to students who are close to the limit.",
    tags: ["Education"],
    stack: ["React", "Node.js", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Fehemtha",
    desc: "A peer tutoring marketplace where university students offer paid tutoring sessions in subjects they excel at. We noticed a lot of informal tutoring happening on Facebook groups and wanted to formalize it.",
    tags: ["Education"],
    stack: ["Vue", "Firebase", "Stripe"],
    category: "Full Stack",
  },
  {
    title: "Naqla",
    desc: "Educational content translator that takes English YouTube transcripts and rewrites them in simple Arabic. Built for students whose English isn't strong enough to follow technical lectures.",
    tags: ["Education"],
    stack: ["React", "Python", "FastAPI"],
    category: "Full Stack",
  },
  {
    title: "Grades+",
    desc: "GPA calculator and academic progress tracker for Egyptian university students. Supports the credit-hour system used in most private universities. Students log their grades each semester and see exactly where they stand.",
    tags: ["Education"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Mentor Match",
    desc: "Connects final-year students with recent graduates working in their target field for short mentorship sessions. We interviewed 40 students and found most of them had no idea what their first job would actually look like.",
    tags: ["Education"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Full Stack",
  },

  // ── E-commerce ─────────────────────────────────────────────
  {
    title: "Dakkany",
    desc: "Online storefront builder for Egyptian small sellers who currently only sell through Instagram DMs. They get a link they can share, a product catalog, and a simple orders inbox — no technical knowledge needed.",
    tags: ["E-commerce"],
    stack: ["Next.js", "Stripe", "MongoDB", "Tailwind"],
    category: "Full Stack",
  },
  {
    title: "Handmade Souk",
    desc: "Marketplace for handmade products in Egypt. Sellers apply, list their items, and handle orders. Built because platforms like Etsy don't support EGP and local shipping well.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "MySQL", "Paymob API"],
    category: "Full Stack",
  },
  {
    title: "StockSnap",
    desc: "Inventory and orders management for small online shops. Connects to their Instagram and Facebook shops to pull orders automatically and update stock levels. Built after watching a friend manage 3 spreadsheets at once.",
    tags: ["E-commerce"],
    stack: ["Vue", "Express", "MongoDB"],
    category: "Full Stack",
  },
  {
    title: "Tawsela",
    desc: "Last-mile delivery tracker for small e-commerce sellers. Sellers add their shipments and customers get an SMS with a tracking link. Integrates with the main Egyptian courier APIs.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Review Genie",
    desc: "Automatically follows up with customers after purchase and collects product reviews via WhatsApp. Sellers get a dashboard with ratings over time. Helped a test seller go from 3 reviews to 47 in a month.",
    tags: ["E-commerce"],
    stack: ["React", "Node.js", "MongoDB", "WhatsApp API"],
    category: "Full Stack",
  },
  {
    title: "Cart Rescue",
    desc: "Abandoned cart recovery tool that sends automated reminders via email and SMS with a discount code. We A/B tested two message styles with a real store — recovered about 12% of abandoned carts.",
    tags: ["E-commerce"],
    stack: ["Next.js", "Node.js", "Stripe", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Fashionista POS",
    desc: "Point-of-sale system designed for clothing boutiques. Handles sales, returns, size/color variants, and end-of-day reports. Built for a family boutique in Heliopolis who were using a cash register with no records.",
    tags: ["E-commerce"],
    stack: ["React", "Electron", "SQLite"],
    category: "Web App",
  },
  {
    title: "Bundles",
    desc: "Upsell and bundle recommendation widget for existing e-commerce stores. Sellers configure bundle deals and the widget shows relevant suggestions on the product page. Plug-and-play via a script tag.",
    tags: ["E-commerce"],
    stack: ["Vanilla JS", "Node.js", "MongoDB"],
    category: "Full Stack",
  },
  {
    title: "Pricewatch EG",
    desc: "Compares prices of electronics and appliances across major Egyptian online stores. Users search for a product and see who has the best price. Scrapes prices daily and sends alerts when something drops.",
    tags: ["E-commerce"],
    stack: ["React", "Python", "Scrapy", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Returnly",
    desc: "Simple return request portal for online stores. Customers submit what they want to return, upload a photo, and pick a reason. Store owners review and approve from a dashboard. Replaces the chaos of return requests via DMs.",
    tags: ["E-commerce"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
  },

  // ── Entertainment ──────────────────────────────────────────
  {
    title: "Filmak",
    desc: "Movie and series tracker for Arabic-speaking users. Log what you've watched, rate it, and get recommendations based on your history. Has a 'watch tonight' feature that picks something based on your mood.",
    tags: ["Entertainment"],
    stack: ["React", "Node.js", "MongoDB", "TMDB API"],
    category: "Full Stack",
  },
  {
    title: "Leila",
    desc: "Event discovery app for Cairo and Alexandria. Lists concerts, art exhibitions, comedy shows, and pop-ups happening this week. Pulls from Facebook events and Instagram pages and cleans the data into one feed.",
    tags: ["Entertainment"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
  },
  {
    title: "Mawgoud",
    desc: "Real-time multiplayer trivia game in Arabic. Create a room, share the code with friends, and compete in timed rounds. We built custom question sets for Egyptian geography, history, and pop culture.",
    tags: ["Entertainment"],
    stack: ["React", "Socket.io", "Node.js", "Redis"],
    category: "Full Stack",
  },
  {
    title: "Qissa",
    desc: "Collaborative storytelling app where users write one sentence at a time and the story grows. Each story has a genre and a word limit. The best-rated ones get featured on the home page.",
    tags: ["Entertainment"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Playlist Battle",
    desc: "Create a playlist of 5 songs and battle a friend. Their followers vote on which playlist wins. Integrates with Spotify to pull tracks and display previews. Built for a music elective final project.",
    tags: ["Entertainment"],
    stack: ["React", "Spotify API", "Firebase"],
    category: "Web App",
  },
  {
    title: "Rawi",
    desc: "Arabic podcast app with community-submitted chapters. Listeners mark their favorite moments and leave short notes that other users can see while listening. Focused on Egyptian and Levantine shows.",
    tags: ["Entertainment"],
    stack: ["React Native", "Firebase", "Expo"],
    category: "Mobile App",
  },
  {
    title: "Shoof",
    desc: "Watch party app that syncs a video for multiple users and adds a live chat alongside it. Built because we kept watching movies together on calls but the sync was always off. Works with direct video links.",
    tags: ["Entertainment"],
    stack: ["React", "Socket.io", "Node.js"],
    category: "Full Stack",
  },
  {
    title: "Canvas",
    desc: "Digital art portfolio builder for Egyptian illustrators and designers. Create a profile, upload your work in collections, and get a shareable link. Cleaner than Behance for client sharing.",
    tags: ["Entertainment"],
    stack: ["Next.js", "Supabase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Gamed Walla La",
    desc: "Board game recommendation and night planner. Tell it how many people, age range, and how long you want to play — it recommends the right game. Has a built-in timer and turn tracker for common games.",
    tags: ["Entertainment"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Mosalsalat",
    desc: "Arabic drama tracker that lets users follow ongoing series, get episode release reminders, and discuss episodes without spoilers. Spoiler-free mode blurs any comment posted within 24 hours of an episode dropping.",
    tags: ["Entertainment"],
    stack: ["Vue", "Node.js", "MongoDB"],
    category: "Full Stack",
  },

  // ── Blog ───────────────────────────────────────────────────
  {
    title: "Maqal",
    desc: "Arabic-first blogging platform with a clean distraction-free editor. Writers publish articles, build a following, and optionally monetize through a monthly subscription their readers pay. We wanted a Medium but in Arabic.",
    tags: ["Blog"],
    stack: ["Next.js", "Supabase", "MDX", "Tailwind"],
    category: "Full Stack",
  },
  {
    title: "Dev Diary",
    desc: "A blogging platform built specifically for developers to document their learning journey. Supports code blocks, embeds from GitHub Gists, and tags for topics. Posts are short — like dev journal entries, not full articles.",
    tags: ["Blog"],
    stack: ["Gatsby", "GraphQL", "Netlify CMS"],
    category: "Web App",
  },
  {
    title: "Rehlety",
    desc: "Travel blog platform for Egyptians who travel. Write trip reports, tag the countries and cities, attach a cost breakdown, and help others plan the same trip. We were tired of scattered Facebook posts being the main travel resource.",
    tags: ["Blog"],
    stack: ["React", "Sanity", "Next.js"],
    category: "Full Stack",
  },
  {
    title: "Akl W Hekayat",
    desc: "Food blog platform where each recipe comes with a personal story. The layout separates the story from the recipe so readers can go straight to the ingredients if they want, or read the full context. Built for home cooks who have something to say.",
    tags: ["Blog"],
    stack: ["Next.js", "Contentful", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Warqa",
    desc: "Book review blog with a reading journal built in. Log every book you finish, write a review, and see your reading stats by year and genre. Your public profile shows your full reading history and your followers can browse it.",
    tags: ["Blog"],
    stack: ["React", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "El Start",
    desc: "Startup founder blog where people document building their business in public — the wins, the pivots, and the failures. Readers follow founders they like and get notified on new updates. Think a public journal for Egyptian entrepreneurs.",
    tags: ["Blog"],
    stack: ["Next.js", "Supabase", "TypeScript"],
    category: "Full Stack",
  },
  {
    title: "Techara",
    desc: "Tech opinion blog aggregator for Arabic content. Writers submit posts from their existing blogs and the best ones get featured. Has a weekly digest newsletter. Trying to build the Arabic version of Hacker News but friendlier.",
    tags: ["Blog"],
    stack: ["Nuxt.js", "Strapi", "PostgreSQL"],
    category: "Full Stack",
  },
  {
    title: "Sabah El Kheir",
    desc: "A weekly newsletter platform with a morning digest format. Writers publish short reads — one story, one tip, one recommendation — designed to be read in under 5 minutes over coffee. Focused on consistency over length.",
    tags: ["Blog"],
    stack: ["React", "Node.js", "SendGrid", "MongoDB"],
    category: "Full Stack",
  },
  {
    title: "Midan",
    desc: "Community blog for neighborhood-level content. Residents write about local issues, events, and recommendations in their area. Moderated by volunteer editors. We piloted it in Maadi and got 60 signups in the first week.",
    tags: ["Blog"],
    stack: ["Vue", "Firebase", "Tailwind"],
    category: "Web App",
  },
  {
    title: "Bel 3arabi",
    desc: "A blog platform for translating and explaining technical concepts in plain Arabic. Writers pick an English tech topic and rewrite it for an Arabic-speaking audience with local examples. Filling a gap we personally struggled with as students.",
    tags: ["Blog"],
    stack: ["Next.js", "MDX", "Vercel", "Tailwind"],
    category: "Web App",
  },
]

async function seed() {
  let count = 0

  for (const p of PROJECTS) {
    const userId = rand(USER_IDS)
    const views = randInt(0, 400)
    const ratings = randRatings()
    const imgUrl = rand(PLACEHOLDER_IMAGES)
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
      imgUrl,
      tags: p.tags,
      status: "approved",
      views,
      ratings,
      comments: [],
      userRatings: {},
      createdAt: serverTimestamp(),
    })

    count++
    console.log(`✓ [${count}/50] ${p.title} (${p.tags[0]})`)
  }

  console.log(`\n✅ Done! ${count} projects seeded.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})