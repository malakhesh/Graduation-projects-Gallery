import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../backend/firebase";
import { getBookmarks, removeBookmark } from "../backend/auth";
import { getProj } from "../backend/projects";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

export default function BookmarksScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) { setBookmarks([]); setLoading(false); return; }
    try {
      setLoading(true);
      const ids = await getBookmarks(currentUser.uid);
      if (!Array.isArray(ids) || ids.length === 0) { setBookmarks([]); return; }
      const projects = await Promise.all(
        ids.map(async (projectId: string) => {
          const project = await getProj(projectId);
          if (!project || project === "no-proj" || project === "get-fail" || typeof project === "string") return null;
          return { ...project, id: projectId };
        })
      );
      setBookmarks(projects.filter(Boolean));
    } catch {
      Alert.alert("Error", "Could not load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBookmarks(); }, []));

  const filteredBookmarks = bookmarks.filter((project) => {
    const keyword = search.toLowerCase();
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const stack = Array.isArray(project.stack) ? project.stack : [];
    return (
      (project.title || "").toLowerCase().includes(keyword) ||
      (project.desc || "").toLowerCase().includes(keyword) ||
      (project.category || "").toLowerCase().includes(keyword) ||
      tags.some((tag: string) => tag.toLowerCase().includes(keyword)) ||
      stack.some((tech: string) => tech.toLowerCase().includes(keyword))
    );
  });

  const handleRemoveBookmark = async (projectId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) { Alert.alert("Login Required", "Please login first."); return; }
    try {
      setRemovingId(projectId);
      const result = await removeBookmark(currentUser.uid, projectId);
      if (result === "bookmark-removed") {
        setBookmarks((prev) => prev.filter((p) => p.id !== projectId));
        return;
      }
      Alert.alert("Error", "Could not remove bookmark.");
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRemovingId(null);
    }
  };

  const getAverageRating = (project: any) => {
    const ratings = Array.isArray(project.ratings) ? project.ratings : [];
    if (ratings.length === 0) return "0.0";
    const total = ratings.reduce((sum: number, r: number) => sum + Number(r || 0), 0);
    return (total / ratings.length).toFixed(1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: C.white }]}>
          <Ionicons name="arrow-back" size={22} color={C.black} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.black }]}>Bookmarks</Text>
        <View style={[styles.countBadge, { backgroundColor: C.button }]}>
          <Text style={styles.countText}>{bookmarks.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: C.white, borderColor: C.input }]}>
        <Ionicons name="search-outline" size={18} color={C.link} />
        <TextInput
          style={[styles.searchInput, { color: C.black }]}
          placeholder="Search bookmarks..."
          placeholderTextColor={C.link}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={C.link} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={[styles.loadingText, { color: C.black }]}>Loading bookmarks...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filteredBookmarks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color={C.input} />
              <Text style={[styles.emptyTitle, { color: C.black }]}>
                {search ? "No matching bookmarks" : "No bookmarks yet"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: C.link }]}>
                {search ? "Try searching with another keyword" : "Save projects you like to find them here"}
              </Text>
              {!search ? (
                <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: C.button }]} onPress={() => router.push("/home")}>
                  <Text style={styles.exploreBtnText}>Explore Projects</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            filteredBookmarks.map((project) => {
              const stack = Array.isArray(project.stack) ? project.stack : [];
              return (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.card, { backgroundColor: C.white }]}
                  activeOpacity={0.92}
                  onPress={() => router.push({ pathname: "/project-details", params: { id: project.id } })}
                >
                  <View style={styles.cardImgWrapper}>
                    <Image
                      source={{ uri: project.imgUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80" }}
                      style={styles.cardImg}
                    />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.cardGradient} />
                    <TouchableOpacity
                      style={[styles.removeBtn, { backgroundColor: C.white }]}
                      onPress={() => handleRemoveBookmark(project.id)}
                      disabled={removingId === project.id}
                    >
                      {removingId === project.id
                        ? <ActivityIndicator size="small" color={C.button} />
                        : <Ionicons name="bookmark" size={18} color={C.button} />
                      }
                    </TouchableOpacity>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{getAverageRating(project)}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, { color: C.black }]} numberOfLines={1}>
                      {project.title || "Untitled Project"}
                    </Text>
                    <Text style={[styles.cardDesc, { color: C.link }]} numberOfLines={2}>
                      {project.desc || "No description added"}
                    </Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.authorDot, { backgroundColor: C.button }]}>
                        <Text style={styles.authorInitial}>
                          {(project.category || project.title || "P").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.authorName, { color: C.link }]} numberOfLines={1}>
                        {project.category || "Graduation Project"}
                      </Text>
                      {project.year ? <Text style={[styles.cardYear, { color: C.link }]}>{project.year}</Text> : null}
                    </View>
                    <View style={styles.tagsRow}>
                      {stack.slice(0, 4).map((tag: string, index: number) => (
                        <View key={index} style={[styles.tag, { backgroundColor: C.chip }]}>
                          <Text style={[styles.tagText, { color: C.button }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.cardFooter}>
                      <View style={styles.savedInfo}>
                        <Ionicons name="bookmark-outline" size={14} color={C.link} />
                        <Text style={[styles.savedDate, { color: C.link }]}>Saved</Text>
                      </View>
                      <View style={[styles.viewBtn, { backgroundColor: C.button }]}>
                        <Text style={styles.viewBtnText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={14} color="#fff" />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  countBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  countText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14 },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, fontSize: 14, fontWeight: "700" },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 30 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  exploreBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, marginTop: 8 },
  exploreBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: { borderRadius: 20, overflow: "hidden", elevation: 4 },
  cardImgWrapper: { width: "100%", height: 180, position: "relative" },
  cardImg: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  removeBtn: { position: "absolute", top: 12, right: 12, padding: 8, borderRadius: 12, minWidth: 34, minHeight: 34, alignItems: "center", justifyContent: "center" },
  ratingBadge: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  authorDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  authorInitial: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  authorName: { fontSize: 13, flex: 1, fontWeight: "500" },
  cardYear: { fontSize: 13, fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: "600" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  savedInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  savedDate: { fontSize: 12 },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
