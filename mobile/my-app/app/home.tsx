import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  TextInput, Image, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { auth } from "../backend/firebase";
import { getUser, logOut } from "../backend/auth";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const CATEGORIES = ["All Projects", "AI / ML", "Web Dev", "Mobile", "Design"];

const RECOMMENDED = [
  { id: "1", title: "AI Robotics Research System", author: "Emily Johnson", year: "2024", tags: ["Technology", "Engineering", "AI / ML"], rating: 4.9, comments: 12, badge: "🔥 Top Rated", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80" },
  { id: "2", title: "Art Installation Project", author: "David Miller", year: "2024", tags: ["Art", "Design"], rating: 4.6, comments: 8, badge: "✨ New", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80" },
  { id: "3", title: "Smart City Dashboard", author: "Ahmed Hassan", year: "2024", tags: ["Web Dev", "AI"], rating: 4.8, comments: 15, badge: "🔥 Top Rated", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80" },
  { id: "4", title: "Mobile Health Tracker", author: "Sara Ahmed", year: "2024", tags: ["Mobile", "Healthcare"], rating: 4.7, comments: 6, badge: "✨ New", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80" },
  { id: "5", title: "E-Commerce Platform", author: "Nour Khalid", year: "2024", tags: ["Web Dev", "Business"], rating: 4.5, comments: 10, badge: "🔥 Top Rated", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80" },
];

const TAGS = [
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
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.replace("/login"); return; }
      const data = await getUser(user.uid);
      setUserData(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredProjects = RECOMMENDED.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch = q === "" || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
    const matchCategory = activeCategory === "All Projects" || p.tags.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase()));
    return matchSearch && matchCategory;
  });

  const handleLogout = async () => { setMenuVisible(false); await logOut(); router.replace("/login"); };
  const handleGoToProfile = () => { setMenuVisible(false); router.push("/profile"); };
  const handleGoToSettings = () => { setMenuVisible(false); router.push("/settings"); };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.button} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuCard, { backgroundColor: C.white }]}>
            <View style={styles.menuHeader}>
              <Image source={require("../assets/avatar.jpg")} style={styles.menuAvatar} />
              <View>
                <Text style={[styles.menuName, { color: C.black }]}>{userData?.name || "User"}</Text>
                <Text style={[styles.menuEmail, { color: C.link }]}>{userData?.email || auth.currentUser?.email || ""}</Text>
              </View>
            </View>
            <View style={[styles.menuDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleGoToProfile}>
              <Ionicons name="person-outline" size={20} color={C.button} />
              <Text style={[styles.menuItemText, { color: C.black }]}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleGoToSettings}>
              <Ionicons name="settings-outline" size={20} color={C.button} />
              <Text style={[styles.menuItemText, { color: C.black }]}>Settings</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: C.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={C.error} />
              <Text style={[styles.menuItemText, { color: C.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoIcon}>🎓</Text>
          <View>
            <Text style={[styles.logoTextBold, { color: C.black }]}>Graduation</Text>
            <Text style={[styles.logoTextLight, { color: C.button }]}>Gallery</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Image source={require("../assets/avatar.jpg")} style={[styles.avatarSmall, { borderColor: C.button }]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Links */}
        <View style={styles.quickLinks}>
          {[
            { icon: "📁", label: "My Projects", route: "/my-projects" },
            { icon: "🔖", label: "Bookmarks", route: "/bookmarks" },
            { icon: "🖼️", label: "Gallery", route: "/Gallery" },
            { icon: "🔔", label: "Notifications", route: "/notifications" },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.quickLink} onPress={() => router.push(item.route as any)}>
              <Text style={styles.quickLinkIcon}>{item.icon}</Text>
              <Text style={[styles.quickLinkText, { color: C.black }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: C.white, borderColor: C.input }]}>
            <Ionicons name="search-outline" size={18} color={C.link} />
            <TextInput
              style={[styles.searchInput, { color: C.black }]}
              placeholder="Search projects, authors, tags..."
              placeholderTextColor={C.link}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={C.link} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.allProjectsBtn, { backgroundColor: C.button }]} onPress={() => router.push("/Gallery")}>
            <Text style={styles.allProjectsBtnText}>All Projects</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, { backgroundColor: C.white, borderColor: C.input }, activeCategory === cat && { backgroundColor: C.button, borderColor: C.button }]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryChipText, { color: C.button }, activeCategory === cat && { color: C.white }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended */}
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: C.black }]}>Recommended Projects</Text>
          {(search.length > 0 || activeCategory !== "All Projects") && (
            <Text style={[styles.resultsCount, { color: C.button }]}>{filteredProjects.length} results</Text>
          )}
        </View>

        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={C.input} />
            <Text style={[styles.emptyText, { color: C.link }]}>No projects found</Text>
            <TouchableOpacity onPress={() => { setSearch(""); setActiveCategory("All Projects"); }}>
              <Text style={[styles.emptyReset, { color: C.button }]}>Clear search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {filteredProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectCard, { backgroundColor: C.white }]}
                activeOpacity={0.92}
                onPress={() => router.push({ pathname: "/project-details", params: { title: project.title, year: project.year, image: project.image, description: `${project.title} by ${project.author}`, tags: project.tags.join(",") } })}
              >
                <View style={styles.projectImgWrapper}>
                  <Image source={{ uri: project.image }} style={styles.projectImg} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={styles.projectGradient} />
                  <View style={styles.projectBadge}>
                    <Text style={styles.projectBadgeText}>{project.badge}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookmarkBtn}>
                    <Ionicons name="bookmark-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.projectOverlayInfo}>
                    <View style={styles.projectRatingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.projectRatingText}>{project.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.projectCardBody}>
                  <Text style={[styles.projectTitle, { color: C.black }]} numberOfLines={2}>{project.title}</Text>
                  <View style={styles.projectMeta}>
                    <View style={[styles.projectAuthorDot, { backgroundColor: C.button }]}>
                      <Text style={styles.projectAuthorInitial}>{project.author.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.projectAuthor, { color: C.link }]} numberOfLines={1}>{project.author}</Text>
                    <Text style={[styles.projectYear, { color: C.link }]}>{project.year}</Text>
                  </View>
                  <View style={styles.projectTags}>
                    {project.tags.slice(0, 2).map((tag) => (
                      <View key={tag} style={[styles.projectTag, { backgroundColor: C.chip }]}>
                        <Text style={[styles.projectTagText, { color: C.button }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.projectStats, { borderTopColor: C.border }]}>
                    <View style={styles.statItem}>
                      <Ionicons name="star" size={13} color="#f59e0b" />
                      <Text style={[styles.statText, { color: C.link }]}>{project.rating}</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: C.input }]} />
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble-outline" size={13} color={C.link} />
                      <Text style={[styles.statText, { color: C.link }]}>{project.comments} comments</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tags */}
        <Text style={[styles.sectionTitle, { marginTop: 20, color: C.black }]}>Explore by Tags</Text>
        <View style={styles.tagsGrid}>
          {TAGS.map((tag) => (
            <TouchableOpacity key={tag.label} style={[styles.tagChip, { backgroundColor: C.white, borderColor: C.input }]} onPress={() => setSearch(tag.label)}>
              <Ionicons name={tag.icon as any} size={18} color={C.button} />
              <Text style={[styles.tagChipText, { color: C.black }]}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  logoWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 28 },
  logoTextBold: { fontSize: 18, fontWeight: "800", lineHeight: 20 },
  logoTextLight: { fontSize: 14, fontWeight: "400", lineHeight: 16 },
  avatarSmall: { width: 38, height: 38, borderRadius: 19, borderWidth: 2 },
  quickLinks: { flexDirection: "row", paddingHorizontal: 16, gap: 16, marginBottom: 14, flexWrap: "wrap" },
  quickLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  quickLinkIcon: { fontSize: 16 },
  quickLinkText: { fontSize: 13, fontWeight: "600" },
  searchRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 13 },
  allProjectsBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  allProjectsBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  categoriesScroll: { marginBottom: 18 },
  categoriesContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontWeight: "600" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "800", paddingHorizontal: 16, marginBottom: 14 },
  resultsCount: { fontSize: 13, fontWeight: "600", paddingRight: 16 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptyReset: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  cardsScroll: { paddingHorizontal: 16, gap: 16, paddingBottom: 8 },
  projectCard: { width: 230, borderRadius: 20, overflow: "hidden", elevation: 5, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  projectImgWrapper: { width: "100%", height: 160, position: "relative" },
  projectImg: { width: "100%", height: "100%", resizeMode: "cover" },
  projectGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  projectBadge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  projectBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  bookmarkBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.4)", padding: 7, borderRadius: 10 },
  projectOverlayInfo: { position: "absolute", bottom: 10, right: 12 },
  projectRatingBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  projectRatingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  projectCardBody: { padding: 14 },
  projectTitle: { fontSize: 15, fontWeight: "800", marginBottom: 8, lineHeight: 20 },
  projectMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  projectAuthorDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  projectAuthorInitial: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  projectAuthor: { fontSize: 12, flex: 1, fontWeight: "500" },
  projectYear: { fontSize: 12, fontWeight: "600" },
  projectTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  projectTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  projectTagText: { fontSize: 11, fontWeight: "600" },
  projectStats: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: 1 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontWeight: "600" },
  statDivider: { width: 1, height: 14 },
  tagsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  tagChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 25, borderWidth: 1, width: "47%" },
  tagChipText: { fontSize: 14, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 70, paddingRight: 16 },
  menuCard: { borderRadius: 18, width: 270, elevation: 12, overflow: "hidden" },
  menuHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuAvatar: { width: 46, height: 46, borderRadius: 23 },
  menuName: { fontSize: 16, fontWeight: "700" },
  menuEmail: { fontSize: 12, marginTop: 2 },
  menuDivider: { height: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuItemText: { fontSize: 15, fontWeight: "500" },
});
