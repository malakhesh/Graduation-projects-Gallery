import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../backend/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const API_BASE =
  "https://graduation-projects-gallery-production.up.railway.app";

const TARGET_COUNT = 10;

async function fetchExtraFromFirebase(existingIds, needed) {
  try {
    const snap = await getDocs(collection(db, "projects"));
    const extra = [];

    for (const d of snap.docs) {
      if (existingIds.has(d.id)) continue;

      const data = d.data();

      const image = data.image || data.imgUrl || "";
      if (!image) continue;

      const ratings = data.ratings || [];
      const userRatings = data.userRatings || {};

      extra.push({
        id: d.id,
        title: data.title || "Untitled",
        author: data.authorName || data.userId || "Unknown",
        year: data.year || data.date?.split("-")[0] || "2024",
        tags: data.tags || (data.category ? [data.category] : []),
        rating:
          Object.keys(userRatings).length > 0
            ? parseFloat(
                (
                  Object.values(userRatings).reduce((s, v) => s + v, 0) /
                  Object.values(userRatings).length
                ).toFixed(1)
              )
            : ratings.length > 0
            ? parseFloat(
                (
                  ratings.reduce((s, v) => s + v, 0) / ratings.length
                ).toFixed(1)
              )
            : 0,
        comments: Array.isArray(data.comments) ? data.comments.length : 0,
        badge: "🔥 Top Rated",
        image,
        description: data.description || data.desc || "",
        gitLink: data.gitLink || data.github || "",
        stack: data.stack || [],
      });

      if (extra.length >= needed) break;
    }

    return extra;
  } catch (e) {
    console.warn("fetchExtraFromFirebase failed:", e.message);
    return [];
  }
}

export function useAIRecommendations() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;

      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/recommendations/${user.uid}`
      );

      const data = await response.json();

      if (data.success) {
        const seen = new Set();

        const rawProjects = (data.projects || []).filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        const normalized = await Promise.all(
          rawProjects.map(async (p) => {
            let image = p.image || p.imgUrl || "";

            if (!image) {
              try {
                const snap = await getDoc(doc(db, "projects", p.id));

                if (snap.exists()) {
                  const d = snap.data();
                  image = d.image || d.imgUrl || "";
                }
              } catch {}
            }

            const ratings = p.ratings || [];
            const userRatings = p.userRatings || {};

            return {
              id: p.id,
              title: p.title || "Untitled",
              author: p.authorName || p.userId || "Unknown",
              year: p.year || p.date?.split("-")[0] || "2024",
              tags: p.tags || (p.category ? [p.category] : []),
              rating:
                Object.keys(userRatings).length > 0
                  ? parseFloat(
                      (
                        Object.values(userRatings).reduce((s, v) => s + v, 0) /
                        Object.values(userRatings).length
                      ).toFixed(1)
                    )
                  : ratings.length > 0
                  ? parseFloat(
                      (
                        ratings.reduce((s, v) => s + v, 0) / ratings.length
                      ).toFixed(1)
                    )
                  : 0,
              comments: Array.isArray(p.comments) ? p.comments.length : 0,
              badge: data.type === "qwen_ai" ? "🤖 AI Pick" : "🔥 Top Rated",
              image,
              description: p.description || p.desc || "",
              gitLink: p.gitLink || p.github || "",
              stack: p.stack || [],
            };
          })
        );

        let finalProjects = normalized;

        if (normalized.length < TARGET_COUNT) {
          const needed = TARGET_COUNT - normalized.length;
          const existingIds = new Set(normalized.map((p) => p.id));
          const extra = await fetchExtraFromFirebase(existingIds, needed);

          finalProjects = [...normalized, ...extra];
        }

        setProjects(finalProjects);
        setType(data.type);
      } else {
        setError(data.error || "Failed to fetch recommendations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    projects,
    loading,
    error,
    type,
    refresh: fetchRecommendations,
  };
}

export async function trackProjectView(projectId) {
  try {
    const user = auth.currentUser;

    if (!user || !projectId) return;

    await fetch(
      `${API_BASE}/api/recommendations/view/${user.uid}/${projectId}`,
      {
        method: "POST",
      }
    );
  } catch (err) {
    console.warn("trackProjectView failed:", err.message);
  }
}

export async function trackTagSearch(tag) {
  try {
    const user = auth.currentUser;

    if (!user || !tag) return;

    await fetch(
      `${API_BASE}/api/recommendations/search/${user.uid}/${encodeURIComponent(
        tag
      )}`,
      {
        method: "POST",
      }
    );
  } catch (err) {
    console.warn("trackTagSearch failed:", err.message);
  }
}

export default function AIRecommendations() {
  return null;
}