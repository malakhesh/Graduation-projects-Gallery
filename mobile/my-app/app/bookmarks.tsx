import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Image, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const BOOKMARKS = [
  {
    id: "1",
    projectId: "1",
    projectTitle: "AI Robotics Research System",
    author: "Emily Johnson",
    year: "2024",
    tags: ["Technology", "Engineering"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    savedDate: "2 days ago",
  },
  {
    id: "2",
    projectId: "2",
    projectTitle: "Smart City Dashboard",
    author: "Ahmed Hassan",
    year: "2024",
    tags: ["Web Dev", "AI"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
    savedDate: "1 week ago",
  },
  {
    id: "3",
    projectId: "3",
    projectTitle: "E-Commerce Platform",
    author: "Nour Khalid",
    year: "2024",
    tags: ["Web Dev", "Business"],
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    savedDate: "2 weeks ago",
  },
];

export default function BookmarksScreen() {
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(BOOKMARKS);

  const filtered = bookmarks.filter((p) =>
    p.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="rgb(47, 28, 15)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookmarks.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="rgb(164, 132, 109)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookmarks..."
          placeholderTextColor="rgb(164, 132, 109)"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="rgb(164, 132, 109)" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color="rgb(185, 174, 167)" />
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySubtitle}>Save projects you like to find them here</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push("/Gallery")}>
              <Text style={styles.exploreBtnText}>Explore Projects</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((project) => (
            <TouchableOpacity key={project.id} style={styles.card} activeOpacity={0.92}
              onPress={() => router.push({ pathname: "/project-details", params: { title: project.projectTitle, year: project.year, image: project.image, description: `${project.projectTitle} by ${project.author}`, tags: project.tags.join(",") } })}
            >
              <View style={styles.cardImgWrapper}>
                <Image source={{ uri: project.image }} style={styles.cardImg} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.cardGradient} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeBookmark(project.id)}>
                  <Ionicons name="bookmark" size={18} color="rgb(104, 68, 42)" />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={styles.ratingText}>{project.rating}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{project.projectTitle}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.authorDot}>
                    <Text style={styles.authorInitial}>{project.author.charAt(0)}</Text>
                  </View>
                  <Text style={styles.authorName}>{project.author}</Text>
                  <Text style={styles.cardYear}>{project.year}</Text>
                </View>
                <View style={styles.tagsRow}>
                  {project.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.savedInfo}>
                    <Ionicons name="time-outline" size={14} color="rgb(164, 132, 109)" />
                    <Text style={styles.savedDate}>Saved {project.savedDate}</Text>
                  </View>
                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(240, 234, 228)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(254, 251, 245)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "rgb(47, 28, 15)" },
  countBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(104, 68, 42)", justifyContent: "center", alignItems: "center" },
  countText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgb(254, 251, 245)", borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: "rgb(185, 174, 167)", marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: "rgb(47, 28, 15)" },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 30 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgb(92, 64, 51)" },
  emptySubtitle: { fontSize: 14, color: "rgb(164, 132, 109)", textAlign: "center" },
  exploreBtn: { backgroundColor: "rgb(104, 68, 42)", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, marginTop: 8 },
  exploreBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", elevation: 4 },
  cardImgWrapper: { width: "100%", height: 180, position: "relative" },
  cardImg: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  removeBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "rgb(254, 251, 245)", padding: 8, borderRadius: 12 },
  ratingBadge: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "rgb(47, 28, 15)", marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  authorDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgb(104, 68, 42)", justifyContent: "center", alignItems: "center" },
  authorInitial: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  authorName: { fontSize: 13, color: "rgb(92, 64, 51)", flex: 1, fontWeight: "500" },
  cardYear: { fontSize: 13, color: "rgb(164, 132, 109)", fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  tag: { backgroundColor: "rgb(240, 234, 228)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontSize: 12, color: "rgb(92, 64, 51)", fontWeight: "600" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  savedInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  savedDate: { fontSize: 12, color: "rgb(164, 132, 109)" },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgb(104, 68, 42)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
 
