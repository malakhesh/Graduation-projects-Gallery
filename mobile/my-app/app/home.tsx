import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { auth } from "../backend/firebase";
import { getUser, logOut } from "../backend/auth";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";
import {
  useAIRecommendations,
  trackProjectView,
  trackTagSearch,
} from "./AIRecommendations";

const FILTER_TAGS = [
  "Business",
  "Education",
  "E-commerce",
  "Entertainment",
  "Blog",
];

const FILTER_CATEGORIES = ["Web", "Mobile", "Desktop", "AI/ML", "Other"];

const TECH_STACK_OPTIONS = [
  "Tech Stack",
  "React",
  "React Native",
  "Flutter",
  "Firebase",
  "Node.js",
  "Python",
];

const EXPLORE_TAGS = [
  { label: "Business", icon: "briefcase-outline" },
  { label: "Education", icon: "book-outline" },
  { label: "E-commerce", icon: "cart-outline" },
  { label: "Entertainment", icon: "film-outline" },
  { label: "Healthcare", icon: "heart-outline" },
  { label: "Finance", icon: "cash-outline" },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [activeTag, setActiveTag] = useState("");
  const [activeProjectCategory, setActiveProjectCategory] = useState("");
  const [activeTechStack, setActiveTechStack] = useState("Tech Stack");
  const [gradYearSort, setGradYearSort] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [minimumRating, setMinimumRating] = useState(0);

  const { projects: aiProjects = [], loading: aiLoading } =
    useAIRecommendations();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const data = await getUser(user.uid);
        setUserData(data);
      } catch (error) {
        console.log("Get user error:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const normalize = (value: any) =>
    String(value ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();

  const getProjectTags = (project: any) =>
    Array.isArray(project?.tags) ? project.tags : [];

  const resetFilters = () => {
    setSearch("");
    setActiveTag("");
    setActiveProjectCategory("");
    setActiveTechStack("Tech Stack");
    setGradYearSort("");
    setSortOption("");
    setMinimumRating(0);
    setFiltersVisible(false);
  };

  const hasActiveFilters =
    search.trim().length > 0 ||
    activeTag !== "" ||
    activeProjectCategory !== "" ||
    activeTechStack !== "Tech Stack" ||
    gradYearSort !== "" ||
    sortOption !== "" ||
    minimumRating > 0;

  const filteredProjects = [...aiProjects]
    .filter((p: any) => {
      const q = search.toLowerCase().trim();

      const title = String(p?.title ?? "");
      const author = String(p?.author ?? "");
      const tags = getProjectTags(p);
      const rating = Number(p?.rating ?? 0);

      const tagsText = tags.join(" ").toLowerCase();

      const matchSearch =
        q === "" ||
        title.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q) ||
        tagsText.includes(q);

      const matchTag =
        activeTag === "" ||
        tags.some((tag: string) =>
          normalize(tag).includes(normalize(activeTag))
        );

      const matchCategory =
        activeProjectCategory === "" ||
        tags.some((tag: string) => {
          const cleanTag = normalize(tag);
          const cleanCategory = normalize(activeProjectCategory);

          if (cleanCategory === "web") {
            return cleanTag.includes("web");
          }

          if (cleanCategory === "aiml") {
            return (
              cleanTag.includes("ai") ||
              cleanTag.includes("ml") ||
              cleanTag.includes("machinelearning")
            );
          }

          return cleanTag.includes(cleanCategory);
        });

      const matchTechStack =
        activeTechStack === "Tech Stack" ||
        tags.some((tag: string) =>
          normalize(tag).includes(normalize(activeTechStack))
        );

      const matchRating = rating >= minimumRating;

      return (
        matchSearch &&
        matchTag &&
        matchCategory &&
        matchTechStack &&
        matchRating
      );
    })
    .sort((a: any, b: any) => {
      const ratingA = Number(a?.rating ?? 0);
      const ratingB = Number(b?.rating ?? 0);
      const yearA = Number(a?.year ?? 0);
      const yearB = Number(b?.year ?? 0);

      if (sortOption === "Highest Rated") {
        return ratingB - ratingA;
      }

      if (gradYearSort === "Latest") {
        return yearB - yearA;
      }

      if (gradYearSort === "Oldest") {
        return yearA - yearB;
      }

      return 0;
    });

  const handleLogout = async () => {
    setMenuVisible(false);
    await logOut();
    router.replace("/login");
  };

  const handleGoToProfile = () => {
    setMenuVisible(false);
    router.push("/profile");
  };

  const handleGoToSettings = () => {
    setMenuVisible(false);
    router.push("/settings");
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.button} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuCard, { backgroundColor: C.white }]}>
            <View style={styles.menuHeader}>
              <Image
                source={require("../assets/avatar.jpg")}
                style={styles.menuAvatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={[styles.menuName, { color: C.black }]}>
                  {userData?.name || "User"}
                </Text>

                <Text
                  style={[styles.menuEmail, { color: C.link }]}
                  numberOfLines={1}
                >
                  {userData?.email || auth.currentUser?.email || ""}
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: C.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleGoToProfile}>
              <Ionicons name="person-outline" size={20} color={C.button} />
              <Text style={[styles.menuItemText, { color: C.black }]}>
                My Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleGoToSettings}
            >
              <Ionicons name="settings-outline" size={20} color={C.button} />
              <Text style={[styles.menuItemText, { color: C.black }]}>
                Settings
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: C.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={C.error} />
              <Text style={[styles.menuItemText, { color: C.error }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoIcon}>🎓</Text>

          <View>
            <Text style={[styles.logoTextBold, { color: C.black }]}>
              Graduation
            </Text>
            <Text style={[styles.logoTextLight, { color: C.button }]}>
              Gallery
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Image
            source={require("../assets/avatar.jpg")}
            style={[styles.avatarSmall, { borderColor: C.button }]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.quickLinks}>
          {[
            { icon: "📁", label: "My Projects", route: "/my-projects" },
            { icon: "🔖", label: "Bookmarks", route: "/bookmarks" },
            { icon: "🖼️", label: "Gallery", route: "/Gallery" },
            { icon: "🔔", label: "Notifications", route: "/notifications" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickLink}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.quickLinkIcon}>{item.icon}</Text>
              <Text style={[styles.quickLinkText, { color: C.black }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchAndFilterWrapper}>
          <View
            style={[
              styles.searchBoxLarge,
              { backgroundColor: C.white, borderColor: C.input },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={C.link} />

            <TextInput
              style={[styles.searchInput, { color: C.black }]}
              placeholder="Search your projects..."
              placeholderTextColor={C.link}
              value={search}
              onChangeText={setSearch}
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={17} color={C.link} />
              </TouchableOpacity>
            )}

            <View style={[styles.searchDivider, { backgroundColor: C.border }]} />

            <TouchableOpacity
              style={[styles.filtersButton, { backgroundColor: C.chip }]}
              onPress={() => setFiltersVisible(!filtersVisible)}
            >
              <Ionicons name="filter" size={15} color={C.button} />
              <Text style={[styles.filtersButtonText, { color: C.button }]}>
                Filters
              </Text>
            </TouchableOpacity>
          </View>

          {filtersVisible && (
            <View
              style={[
                styles.filtersPanel,
                { backgroundColor: C.white, borderColor: C.input },
              ]}
            >
              <View style={styles.compactTopRow}>
                <View style={styles.compactSection}>
                  <Text style={[styles.filterTitle, { color: C.black }]}>
                    TAG
                  </Text>

                  <View style={styles.filterChipsWrap}>
                    {FILTER_TAGS.map((tag) => {
                      const selected = activeTag === tag;

                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.filterChip,
                            { backgroundColor: C.white, borderColor: C.input },
                            selected && {
                              backgroundColor: C.button,
                              borderColor: C.button,
                            },
                          ]}
                          onPress={() => {
                            setActiveTag(selected ? "" : tag);
                            setFiltersVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              { color: C.black },
                              selected && { color: C.white },
                            ]}
                          >
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.compactSection}>
                  <Text style={[styles.filterTitle, { color: C.black }]}>
                    CATEGORY
                  </Text>

                  <View style={styles.filterChipsWrap}>
                    {FILTER_CATEGORIES.map((category) => {
                      const selected = activeProjectCategory === category;

                      return (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.filterChip,
                            { backgroundColor: C.white, borderColor: C.input },
                            selected && {
                              backgroundColor: C.button,
                              borderColor: C.button,
                            },
                          ]}
                          onPress={() => {
                            setActiveProjectCategory(selected ? "" : category);
                            setFiltersVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              { color: C.black },
                              selected && { color: C.white },
                            ]}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.filtersSmallGrid}>
                <View style={styles.smallFilterBlock}>
                  <Text style={[styles.filterTitle, { color: C.black }]}>
                    TECH STACK
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.dropdownChip,
                      { backgroundColor: C.white, borderColor: C.input },
                    ]}
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
                      const selected = gradYearSort === item;

                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.filterChip,
                            { backgroundColor: C.white, borderColor: C.input },
                            selected && {
                              backgroundColor: C.button,
                              borderColor: C.button,
                            },
                          ]}
                          onPress={() => {
                            setGradYearSort(selected ? "" : item);
                            setFiltersVisible(false);
                          }}
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
                      { backgroundColor: C.white, borderColor: C.input },
                      sortOption === "Highest Rated" && {
                        backgroundColor: C.button,
                        borderColor: C.button,
                      },
                    ]}
                    onPress={() => {
                      setSortOption(
                        sortOption === "Highest Rated" ? "" : "Highest Rated"
                      );
                      setFiltersVisible(false);
                    }}
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
                        onPress={() => {
                          setMinimumRating(minimumRating === star ? 0 : star);
                          setFiltersVisible(false);
                        }}
                      >
                        <Ionicons
                          name={
                            minimumRating >= star ? "star" : "star-outline"
                          }
                          size={18}
                          color={minimumRating >= star ? "#f59e0b" : C.link}
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
                      { backgroundColor: C.white, borderColor: C.input },
                    ]}
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

        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: C.black }]}>
            {search.trim()
              ? `Results for "${search.trim()}"`
              : "Recommended Projects"}
          </Text>

          {hasActiveFilters && (
            <Text style={[styles.resultsCount, { color: C.button }]}>
              {filteredProjects.length} results
            </Text>
          )}
        </View>

        {aiLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={C.button} />
            <Text style={[styles.emptyText, { color: C.link }]}>
              Loading recommendations...
            </Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={46} color={C.input} />
            <Text style={[styles.emptyText, { color: C.link }]}>
              No projects found
            </Text>

            <TouchableOpacity onPress={resetFilters}>
              <Text style={[styles.emptyReset, { color: C.button }]}>
                Clear search
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {filteredProjects.map((project: any) => {
              const projectTags = getProjectTags(project);
              const projectTitle = String(project?.title ?? "Untitled Project");
              const projectAuthor = String(project?.author ?? "Unknown");
              const projectYear = String(project?.year ?? "");
              const projectRating = Number(project?.rating ?? 0);
              const projectImage = String(project?.image ?? "");
              const projectId = String(project?.id ?? projectTitle);

              return (
                <TouchableOpacity
                  key={projectId}
                  style={[styles.projectCard, { backgroundColor: C.white }]}
                  activeOpacity={0.92}
                  onPress={() => {
                    trackProjectView(projectId);

                    router.push({
                      pathname: "/project-details",
                      params: {
                        id: projectId,
                        title: projectTitle,
                        year: projectYear,
                        image: projectImage,
                        description: `${projectTitle} by ${projectAuthor}`,
                        tags: projectTags.join(","),
                      },
                    });
                  }}
                >
                  <View style={styles.projectImgWrapper}>
                    {projectImage ? (
                      <Image
                        source={{ uri: projectImage }}
                        style={styles.projectImg}
                      />
                    ) : (
                      <View
                        style={[
                          styles.projectImg,
                          styles.projectImageFallback,
                          { backgroundColor: C.chip },
                        ]}
                      >
                        <Ionicons name="image-outline" size={34} color={C.link} />
                      </View>
                    )}

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.75)"]}
                      style={styles.projectGradient}
                    />

                    {!!project?.badge && (
                      <View style={styles.projectBadge}>
                        <Text style={styles.projectBadgeText}>
                          {project.badge}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.bookmarkBtn}>
                      <Ionicons name="bookmark-outline" size={16} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.projectOverlayInfo}>
                      <View style={styles.projectRatingBadge}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.projectRatingText}>
                          {projectRating}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.projectCardBody}>
                    <Text
                      style={[styles.projectTitle, { color: C.black }]}
                      numberOfLines={2}
                    >
                      {projectTitle}
                    </Text>

                    <View style={styles.projectMeta}>
                      <View
                        style={[
                          styles.projectAuthorDot,
                          { backgroundColor: C.button },
                        ]}
                      >
                        <Text style={styles.projectAuthorInitial}>
                          {projectAuthor.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>

                      <Text
                        style={[styles.projectAuthor, { color: C.link }]}
                        numberOfLines={1}
                      >
                        {projectAuthor}
                      </Text>

                      <Text style={[styles.projectYear, { color: C.link }]}>
                        {projectYear}
                      </Text>
                    </View>

                    <View style={styles.projectTags}>
                      {projectTags.slice(0, 2).map((tag: string) => (
                        <View
                          key={tag}
                          style={[
                            styles.projectTag,
                            { backgroundColor: C.chip },
                          ]}
                        >
                          <Text
                            style={[styles.projectTagText, { color: C.button }]}
                          >
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View
                      style={[
                        styles.projectStats,
                        { borderTopColor: C.border },
                      ]}
                    >
                      <View style={styles.statItem}>
                        <Ionicons name="star" size={13} color="#f59e0b" />
                        <Text style={[styles.statText, { color: C.link }]}>
                          {projectRating}
                        </Text>
                      </View>

                      <View
                        style={[styles.statDivider, { backgroundColor: C.input }]}
                      />

                      <View style={styles.statItem}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={13}
                          color={C.link}
                        />
                        <Text style={[styles.statText, { color: C.link }]}>
                          {Number(project?.comments ?? 0)} comments
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20, color: C.black }]}>
          Explore by Tags
        </Text>

        <View style={styles.tagsGrid}>
          {EXPLORE_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.label}
              style={[
                styles.tagChip,
                { backgroundColor: C.white, borderColor: C.input },
              ]}
              onPress={() => {
                trackTagSearch(tag.label);
                setSearch(tag.label);
                setActiveTag(tag.label);
              }}
            >
              <Ionicons name={tag.icon as any} size={18} color={C.button} />
              <Text style={[styles.tagChipText, { color: C.black }]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoIcon: {
    fontSize: 25,
  },

  logoTextBold: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 19,
  },

  logoTextLight: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 15,
  },

  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },

  quickLinks: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  quickLinkIcon: {
    fontSize: 15,
  },

  quickLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },

  searchAndFilterWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  searchBoxLarge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 13,
    paddingVertical: 8,
    gap: 7,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "800",
  },

  filtersPanel: {
    marginTop: 7,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 8,
  },

  compactTopRow: {
    gap: 9,
    marginBottom: 9,
  },

  compactSection: {
    gap: 6,
  },

  filterTitle: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
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
    fontWeight: "800",
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

  filtersSmallGrid: {
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

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 16,
    marginBottom: 12,
    flex: 1,
  },

  resultsCount: {
    fontSize: 12,
    fontWeight: "800",
    paddingLeft: 8,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 38,
    gap: 10,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "600",
  },

  emptyReset: {
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  cardsScroll: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },

  projectCard: {
    width: 230,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  projectImgWrapper: {
    width: "100%",
    height: 160,
    position: "relative",
  },

  projectImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  projectImageFallback: {
    justifyContent: "center",
    alignItems: "center",
  },

  projectGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },

  projectBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  projectBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  bookmarkBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 7,
    borderRadius: 10,
  },

  projectOverlayInfo: {
    position: "absolute",
    bottom: 10,
    right: 12,
  },

  projectRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  projectRatingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  projectCardBody: {
    padding: 14,
  },

  projectTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 20,
  },

  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  projectAuthorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  projectAuthorInitial: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  projectAuthor: {
    fontSize: 12,
    flex: 1,
    fontWeight: "500",
  },

  projectYear: {
    fontSize: 12,
    fontWeight: "600",
  },

  projectTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },

  projectTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  projectTagText: {
    fontSize: 11,
    fontWeight: "600",
  },

  projectStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 12,
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    height: 14,
  },

  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },

  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 23,
    borderWidth: 1,
    width: "47%",
  },

  tagChipText: {
    fontSize: 13,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },

  menuCard: {
    borderRadius: 18,
    width: 270,
    elevation: 12,
    overflow: "hidden",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  menuAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  menuName: {
    fontSize: 16,
    fontWeight: "700",
  },

  menuEmail: {
    fontSize: 12,
    marginTop: 2,
  },

  menuDivider: {
    height: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
});