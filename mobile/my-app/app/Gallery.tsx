import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import UploadProjectModal from "../components/modals/UploadProjectModal";
import { getProj } from "../backend/projects";
import { auth, db } from "../backend/firebase";
import { addBookmark, removeBookmark, getBookmarks } from "../backend/auth";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const CATEGORIES = ["All", "Mobile", "Web", "AI", "Security", "Data Science"];

const TECH_STACK_OPTIONS = [
  "Tech Stack",
  "React",
  "React Native",
  "Flutter",
  "Firebase",
  "Node.js",
  "Python",
  "MongoDB",
  "Express",
  "Laravel",
];

const FILTER_KEYWORDS: Record<string, string[]> = {
  All: [],
  Mobile: [
    "mobile",
    "react native",
    "flutter",
    "android",
    "ios",
    "swift",
    "kotlin",
    "dart",
  ],
  Web: [
    "web",
    "web dev",
    "frontend",
    "backend",
    "full stack",
    "react",
    "vue",
    "angular",
    "node",
    "express",
    "next",
    "laravel",
    "django",
    "fastapi",
    "html",
    "css",
    "javascript",
    "typescript",
  ],
  AI: [
    "ai",
    "ai / ml",
    "ml",
    "machine learning",
    "deep learning",
    "data mining",
    "neural",
    "tensorflow",
    "pytorch",
    "opencv",
  ],
  Security: [
    "security",
    "cybersecurity",
    "cyber",
    "network security",
    "encryption",
    "malware",
    "penetration",
    "auth",
  ],
  "Data Science": [
    "data science",
    "data",
    "analytics",
    "analysis",
    "python",
    "pandas",
    "numpy",
    "sql",
    "mysql",
    "database",
    "firebase",
    "mongodb",
  ],
};

type ProjectCardProps = {
  item: any;
  onPress: () => void;
  colors: any;
  styles: ReturnType<typeof createStyles>;
  saved: boolean;
  saving: boolean;
  openingGithub: boolean;
  onToggleSave: () => void;
  onOpenGithub: () => void;
};

async function getApprovedProjects() {
  try {
    const projectsRef = collection(db, "projects");

    const approvedQuery = query(projectsRef, where("status", "==", "approved"));
    const publishedQuery = query(projectsRef, where("status", "==", "published"));

    const [approvedSnap, publishedSnap] = await Promise.all([
      getDocs(approvedQuery),
      getDocs(publishedQuery),
    ]);

    const approvedProjects = approvedSnap.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    const publishedProjects = publishedSnap.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    const mergedMap = new Map<string, any>();

    [...approvedProjects, ...publishedProjects].forEach((project: any) => {
      mergedMap.set(String(project.id), project);
    });

    return Array.from(mergedMap.values());
  } catch (error) {
    console.log("getApprovedProjects error:", error);
    return "get-fail";
  }
}

function getProjectId(item: any) {
  return String(item?.id || item?._id || item?.projectId || item?.title || "");
}

function getGithubLink(project: any) {
  return (
    project?.gitLink ||
    project?.githubUrl ||
    project?.githubURL ||
    project?.githubLink ||
    project?.github ||
    project?.gitHub ||
    project?.gitHubLink ||
    project?.repoUrl ||
    project?.repoURL ||
    project?.repoLink ||
    project?.repositoryUrl ||
    project?.repositoryURL ||
    project?.repositoryLink ||
    project?.sourceCode ||
    project?.sourceCodeUrl ||
    project?.sourceCodeURL ||
    project?.links?.github ||
    project?.links?.gitHub ||
    project?.urls?.github ||
    project?.urls?.gitHub ||
    ""
  );
}

function normalizeUrl(url: string) {
  const trimmed = String(url || "").trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getProjectRating(project: any) {
  const ratings = Array.isArray(project?.ratings) ? project.ratings : [];

  if (ratings.length > 0) {
    return (
      ratings.reduce((sum: number, rate: number) => sum + Number(rate || 0), 0) /
      ratings.length
    );
  }

  return Number(project?.rating || 0);
}

function getProjectDateValue(project: any) {
  const rawDate =
    project?.createdAt?.toDate?.() ||
    project?.createdAt ||
    project?.year ||
    project?.gradYear ||
    project?.date ||
    "";

  if (rawDate instanceof Date) {
    return rawDate.getTime();
  }

  const parsed = new Date(String(rawDate)).getTime();

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return Number(rawDate || 0);
}

function ProjectCard({
  item,
  onPress,
  colors,
  styles,
  saved,
  saving,
  openingGithub,
  onToggleSave,
  onOpenGithub,
}: ProjectCardProps) {
  const ratings = Array.isArray(item.ratings) ? item.ratings : [];

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce(
            (sum: number, rate: number) => sum + Number(rate || 0),
            0
          ) / ratings.length
        ).toFixed(1)
      : item.rating
      ? Number(item.rating).toFixed(1)
      : "0.0";

  const projectTitle = item.title || item.name || "Untitled";

  const ownerName =
    item.author ||
    item.authorName ||
    item.userName ||
    item.ownerName ||
    item.createdBy ||
    item.user?.name ||
    "Unknown";

  const rawDate =
    item.createdAt?.toDate?.() ||
    item.createdAt ||
    item.year ||
    item.gradYear ||
    item.date ||
    "";

  const projectDate =
    rawDate instanceof Date
      ? rawDate.toLocaleDateString()
      : String(rawDate || "2025");

  const imageUrl =
    item.imgUrl ||
    item.imageURL ||
    item.imageUrl ||
    item.image ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

  const category =
    item.category ||
    (Array.isArray(item.tags) && item.tags.length > 0
      ? item.tags[0]
      : "General");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.white, shadowColor: colors.black },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Text
        style={[styles.cardTitle, { color: colors.black }]}
        numberOfLines={1}
      >
        {projectTitle}
      </Text>

      <View style={styles.authorRow}>
        <View style={[styles.authorIcon, { borderColor: colors.border }]}>
          <Ionicons name="person" size={10} color={colors.button} />
        </View>

        <View style={styles.authorInfo}>
          <Text
            style={[styles.authorName, { color: colors.black }]}
            numberOfLines={1}
          >
            {ownerName}
          </Text>

          <Text style={[styles.authorDate, { color: colors.link }]}>
            {projectDate}
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: imageUrl }}
        style={[styles.cardImage, { backgroundColor: colors.input }]}
      />

      {!!item.desc && (
        <Text
          style={[styles.description, { color: colors.link }]}
          numberOfLines={1}
        >
          {item.desc}
        </Text>
      )}

      <View style={styles.cardActions}>
        <View style={styles.categoryRatingRow}>
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.categoryText, { color: colors.black }]}
              numberOfLines={1}
            >
              {category}
            </Text>
          </View>

          <View
            style={[
              styles.ratingPill,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="star" size={10} color="#f5b301" />
            <Text style={[styles.ratingText, { color: colors.black }]}>
              {averageRating}
            </Text>
          </View>
        </View>

        <View style={styles.githubBookmarkRow}>
          <TouchableOpacity
            style={[styles.githubButton, { backgroundColor: colors.black }]}
            activeOpacity={0.85}
            onPress={onOpenGithub}
            disabled={openingGithub}
          >
            {openingGithub ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="logo-github" size={11} color="#fff" />
                <Text style={styles.githubText}>GitHub</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              {
                borderColor: saved ? colors.button : colors.border,
                backgroundColor: saved ? colors.button : colors.white,
                opacity: saving ? 0.7 : 1,
              },
            ]}
            activeOpacity={0.85}
            onPress={onToggleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={saved ? colors.white : colors.button}
              />
            ) : (
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={13}
                color={saved ? colors.white : colors.button}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GalleryScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const params = useLocalSearchParams();

  const [search, setSearch] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTechStack, setActiveTechStack] = useState("Tech Stack");
  const [sortOption, setSortOption] = useState("");
  const [yearSort, setYearSort] = useState("");
  const [minimumRating, setMinimumRating] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedProjects, setSavedProjects] = useState<Record<string, boolean>>(
    {}
  );
  const [savingBookmarkId, setSavingBookmarkId] = useState<string | null>(null);
  const [openingGithubId, setOpeningGithubId] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(C), [C]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    activeFilter !== "All" ||
    activeTechStack !== "Tech Stack" ||
    sortOption !== "" ||
    yearSort !== "" ||
    minimumRating > 0;

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("All");
    setActiveTechStack("Tech Stack");
    setSortOption("");
    setYearSort("");
    setMinimumRating(0);
    setFiltersVisible(false);
  };

  const syncBookmarks = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSavedProjects({});
      return;
    }

    try {
      const ids = await getBookmarks(currentUser.uid);
      const map: Record<string, boolean> = {};

      if (Array.isArray(ids)) {
        ids.forEach((projectId: string) => {
          map[String(projectId)] = true;
        });
      }

      setSavedProjects(map);
    } catch (error) {
      console.log("Sync bookmarks error:", error);
      setSavedProjects({});
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getApprovedProjects();

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        Toast.show({
          type: "error",
          text1: "Failed to load projects",
          text2: "Please try again.",
        });
      }
    } catch (error) {
      console.log("Load projects error:", error);

      setProjects([]);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Could not load projects.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    syncBookmarks();
  }, [loadProjects, syncBookmarks]);

  useFocusEffect(
    useCallback(() => {
      syncBookmarks();
    }, [syncBookmarks])
  );

  useEffect(() => {
    const openUploadParam = Array.isArray(params.openUpload)
      ? params.openUpload[0]
      : params.openUpload;

    if (openUploadParam === "true") {
      setModalVisible(true);
    }
  }, [params.openUpload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return [...projects]
      .filter((p) => {
        const stack = Array.isArray(p.stack) ? p.stack : [];
        const tags = Array.isArray(p.tags) ? p.tags : [];

        const searchableText = [
          String(p.title || ""),
          String(p.name || ""),
          String(p.desc || ""),
          String(p.author || ""),
          String(p.authorName || ""),
          String(p.userName || ""),
          String(p.userId || ""),
          String(p.category || ""),
          String(p.year || ""),
          ...stack,
          ...tags,
        ]
          .join(" ")
          .toLowerCase();

        const matchSearch = !q || searchableText.includes(q);

        const keywords = FILTER_KEYWORDS[activeFilter] || [];
        const matchCategory =
          activeFilter === "All" ||
          keywords.some((keyword) =>
            searchableText.includes(keyword.toLowerCase())
          );

        const matchTechStack =
          activeTechStack === "Tech Stack" ||
          searchableText.includes(activeTechStack.toLowerCase());

        const matchRating = getProjectRating(p) >= minimumRating;

        return matchSearch && matchCategory && matchTechStack && matchRating;
      })
      .sort((a, b) => {
        if (sortOption === "Highest Rated") {
          return getProjectRating(b) - getProjectRating(a);
        }

        if (yearSort === "Latest") {
          return getProjectDateValue(b) - getProjectDateValue(a);
        }

        if (yearSort === "Oldest") {
          return getProjectDateValue(a) - getProjectDateValue(b);
        }

        return 0;
      });
  }, [
    search,
    activeFilter,
    activeTechStack,
    sortOption,
    yearSort,
    minimumRating,
    projects,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    await syncBookmarks();
    setRefreshing(false);

    Toast.show({
      type: "success",
      text1: "Updated",
      text2: "Projects refreshed",
    });
  }, [loadProjects, syncBookmarks]);

  const handleToggleSave = async (projectId: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: "Please login first to save this project.",
      });
      return;
    }

    try {
      setSavingBookmarkId(projectId);

      const alreadySaved = !!savedProjects[projectId];

      if (alreadySaved) {
        await removeBookmark(currentUser.uid, projectId);

        setSavedProjects((prev) => {
          const updated = { ...prev };
          delete updated[projectId];
          return updated;
        });

        Toast.show({
          type: "info",
          text1: "Removed",
          text2: "Project removed from bookmarks.",
        });
      } else {
        await addBookmark(currentUser.uid, projectId);

        setSavedProjects((prev) => ({
          ...prev,
          [projectId]: true,
        }));

        Toast.show({
          type: "success",
          text1: "Saved",
          text2: "Project added to bookmarks.",
        });
      }
    } catch (error) {
      console.log("Bookmark error:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update bookmark.",
      });
    } finally {
      setSavingBookmarkId(null);
    }
  };

  const handleOpenGithub = async (project: any) => {
    const projectId = getProjectId(project);

    try {
      setOpeningGithubId(projectId);

      let githubUrl = getGithubLink(project);

      if (!githubUrl && projectId) {
        const fullProject = await getProj(projectId);
        githubUrl = getGithubLink(fullProject);
      }

      const finalUrl = normalizeUrl(githubUrl);

      if (!finalUrl) {
        Toast.show({
          type: "info",
          text1: "No GitHub link",
          text2: "This project has no GitHub link yet.",
        });
        return;
      }

      await Linking.openURL(finalUrl);
    } catch (error) {
      console.log("Open GitHub error:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not open GitHub link.",
      });
    } finally {
      setOpeningGithubId(null);
    }
  };

  const handleUploadSuccess = async (result?: any) => {
    setModalVisible(false);

    if (result === "daily-limit-reached") {
      Toast.show({
        type: "error",
        text1: "Daily limit reached",
        text2: "You cannot upload more projects today.",
      });
      return;
    }

    if (result && typeof result === "object") {
      if (result.status === "approved") {
        Toast.show({
          type: "success",
          text1: "Project uploaded",
          text2: "Your project is approved and live now.",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Project uploaded",
          text2: "Waiting for admin approval.",
        });
      }
    } else {
      Toast.show({
        type: "success",
        text1: "Project uploaded",
        text2: "Waiting for admin approval.",
      });
    }

    await loadProjects();
  };

  return (
    <SafeAreaView key={theme} style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>All Projects</Text>
          <Text style={styles.subtitle}>
            {filtered.length} of {projects.length} approved projects
          </Text>
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchAndFiltersWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color={C.link} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={C.link}
            value={search}
            onChangeText={setSearch}
          />

          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={17} color={C.link} />
            </TouchableOpacity>
          ) : null}

          <View style={[styles.searchDivider, { backgroundColor: C.border }]} />

          <TouchableOpacity
            style={[styles.filtersButton, { backgroundColor: C.chip }]}
            activeOpacity={0.85}
            onPress={() => setFiltersVisible(!filtersVisible)}
          >
            <Ionicons name="filter" size={14} color={C.button} />
            <Text style={[styles.filtersButtonText, { color: C.button }]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {filtersVisible && (
          <View
            style={[
              styles.filtersPanel,
              { backgroundColor: C.white, borderColor: C.border },
            ]}
          >
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: C.black }]}>
                CATEGORY
              </Text>

              <View style={styles.filterChipsWrap}>
                {CATEGORIES.map((cat) => {
                  const selected = activeFilter === cat;
                  const label = cat === "All" ? "All Projects" : cat;

                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterChip,
                        { backgroundColor: C.white, borderColor: C.border },
                        selected && {
                          backgroundColor: C.button,
                          borderColor: C.button,
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setActiveFilter(cat)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: C.black },
                          selected && { color: C.white },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.filtersGrid}>
              <View style={styles.smallFilterBlock}>
                <Text style={[styles.filterTitle, { color: C.black }]}>
                  TECH STACK
                </Text>

                <TouchableOpacity
                  style={[
                    styles.dropdownChip,
                    { backgroundColor: C.white, borderColor: C.border },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    const currentIndex =
                      TECH_STACK_OPTIONS.indexOf(activeTechStack);
                    const nextIndex =
                      currentIndex === TECH_STACK_OPTIONS.length - 1
                        ? 0
                        : currentIndex + 1;

                    setActiveTechStack(TECH_STACK_OPTIONS[nextIndex]);
                  }}
                >
                  <Text style={[styles.filterChipText, { color: C.black }]}>
                    {activeTechStack}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color={C.button} />
                </TouchableOpacity>
              </View>

              <View style={styles.smallFilterBlock}>
                <Text style={[styles.filterTitle, { color: C.black }]}>
                  YEAR
                </Text>

                <View style={styles.filterChipsWrap}>
                  {["Latest", "Oldest"].map((item) => {
                    const selected = yearSort === item;

                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.filterChip,
                          { backgroundColor: C.white, borderColor: C.border },
                          selected && {
                            backgroundColor: C.button,
                            borderColor: C.button,
                          },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setYearSort(selected ? "" : item)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            { color: C.black },
                            selected && { color: C.white },
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.smallFilterBlock}>
                <Text style={[styles.filterTitle, { color: C.black }]}>
                  SORT
                </Text>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { backgroundColor: C.white, borderColor: C.border },
                    sortOption === "Highest Rated" && {
                      backgroundColor: C.button,
                      borderColor: C.button,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() =>
                    setSortOption(
                      sortOption === "Highest Rated" ? "" : "Highest Rated"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: C.black },
                      sortOption === "Highest Rated" && { color: C.white },
                    ]}
                  >
                    Highest Rated
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.smallFilterBlock}>
                <Text style={[styles.filterTitle, { color: C.black }]}>
                  RATING
                </Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.8}
                      onPress={() =>
                        setMinimumRating(minimumRating === star ? 0 : star)
                      }
                    >
                      <Ionicons
                        name={minimumRating >= star ? "star" : "star-outline"}
                        size={18}
                        color={minimumRating >= star ? "#f5b301" : C.link}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {hasActiveFilters && (
              <View
                style={[
                  styles.clearFiltersWrapper,
                  { borderTopColor: C.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.clearFiltersButton,
                    { backgroundColor: C.white, borderColor: C.border },
                  ]}
                  activeOpacity={0.85}
                  onPress={resetFilters}
                >
                  <Ionicons name="close" size={14} color={C.button} />
                  <Text style={[styles.clearFiltersText, { color: C.button }]}>
                    Clear All Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.id || index)}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={[
            styles.listContent,
            filtered.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={
            filtered.length > 0 ? styles.columnWrapper : undefined
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const projectId = getProjectId(item);

            return (
              <ProjectCard
                item={item}
                colors={C}
                styles={styles}
                saved={!!savedProjects[projectId]}
                saving={savingBookmarkId === projectId}
                openingGithub={openingGithubId === projectId}
                onToggleSave={() => handleToggleSave(projectId)}
                onOpenGithub={() => handleOpenGithub(item)}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: { id: projectId },
                  })
                }
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="folder-open-outline" size={48} color={C.input} />
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyText}>
                Try changing the search keyword or filters.
              </Text>

              {hasActiveFilters && (
                <TouchableOpacity onPress={resetFilters} activeOpacity={0.85}>
                  <Text style={[styles.emptyResetText, { color: C.button }]}>
                    Clear all filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <UploadProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <Toast />
    </SafeAreaView>
  );
}

function createStyles(C: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },

    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 14,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },

    title: {
      fontSize: 22,
      fontWeight: "900",
      color: C.black,
    },

    subtitle: {
      fontSize: 12,
      color: C.link,
      fontWeight: "700",
      marginTop: 2,
    },

    uploadButton: {
      backgroundColor: C.button,
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 18,
    },

    uploadButtonText: {
      color: C.white,
      fontWeight: "900",
      fontSize: 12,
    },

    searchAndFiltersWrapper: {
      paddingHorizontal: 16,
      marginBottom: 10,
    },

    searchBox: {
      backgroundColor: C.white,
      borderRadius: 22,
      paddingHorizontal: 12,
      height: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: C.border,
    },

    searchInput: {
      flex: 1,
      color: C.black,
      fontSize: 12.5,
      paddingVertical: 0,
    },

    searchDivider: {
      width: 1,
      height: 22,
    },

    filtersButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 18,
    },

    filtersButtonText: {
      fontSize: 11.5,
      fontWeight: "900",
    },

    filtersPanel: {
      marginTop: 8,
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingTop: 9,
      paddingBottom: 8,
    },

    filterSection: {
      marginBottom: 10,
    },

    filterTitle: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.1,
      marginBottom: 6,
    },

    filterChipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },

    filterChip: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 15,
      borderWidth: 1,
      alignSelf: "flex-start",
    },

    filterChipText: {
      fontSize: 10.5,
      fontWeight: "900",
    },

    dropdownChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 15,
      borderWidth: 1,
      alignSelf: "flex-start",
    },

    filtersGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 8,
    },

    smallFilterBlock: {
      gap: 5,
    },

    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },

    clearFiltersWrapper: {
      borderTopWidth: 1,
      paddingTop: 7,
    },

    clearFiltersButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },

    clearFiltersText: {
      fontSize: 10.5,
      fontWeight: "900",
    },

    loadingBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 10,
      color: C.black,
      fontSize: 14,
      fontWeight: "700",
    },

    listContent: {
      paddingHorizontal: 9,
      paddingBottom: 24,
    },

    emptyListContent: {
      flexGrow: 1,
      justifyContent: "center",
    },

    columnWrapper: {
      justifyContent: "space-between",
    },

    card: {
      width: "48.5%",
      marginBottom: 13,
      borderRadius: 15,
      padding: 8,
      borderWidth: 1,
      borderColor: C.border,
      shadowOpacity: 0.07,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    cardTitle: {
      fontSize: 13,
      fontWeight: "900",
      marginBottom: 7,
      lineHeight: 17,
    },

    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },

    authorIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.white,
    },

    authorInfo: {
      flex: 1,
      minWidth: 0,
    },

    authorName: {
      fontSize: 9.5,
      fontWeight: "900",
      lineHeight: 12,
    },

    authorDate: {
      fontSize: 8.5,
      fontWeight: "700",
      marginTop: 1,
    },

    cardImage: {
      width: "100%",
      height: 112,
      borderRadius: 10,
      marginBottom: 7,
      resizeMode: "cover",
    },

    description: {
      fontSize: 9.5,
      lineHeight: 13,
      fontWeight: "600",
      marginBottom: 7,
    },

    cardActions: {
      gap: 6,
    },

    categoryRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    githubBookmarkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    categoryPill: {
      flex: 1,
      minWidth: 72,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    categoryText: {
      fontSize: 10.5,
      fontWeight: "900",
    },

    ratingPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 13,
      borderWidth: 1,
    },

    ratingText: {
      fontSize: 10,
      fontWeight: "900",
    },

    githubButton: {
      flex: 1,
      minHeight: 31,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 13,
    },

    githubText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "900",
    },

    bookmarkButton: {
      width: 31,
      height: 31,
      borderRadius: 11,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyBox: {
      alignItems: "center",
      paddingHorizontal: 30,
    },

    emptyTitle: {
      color: C.black,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 12,
      marginBottom: 8,
    },

    emptyText: {
      color: C.link,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
    },

    emptyResetText: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: "900",
      textDecorationLine: "underline",
    },
  });
}