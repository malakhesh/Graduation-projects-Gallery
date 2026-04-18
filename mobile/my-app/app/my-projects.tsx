import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Image, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const MY_PROJECTS = [
  {
    id: "1",
    title: "Smart Home System",
    year: "2024",
    status: "Published",
    tags: ["IoT", "Mobile"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    views: 234,
  },
  {
    id: "2",
    title: "AI Study Assistant",
    year: "2024",
    status: "In Progress",
    tags: ["AI", "Web Dev"],
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    views: 128,
  },
  {
    id: "3",
    title: "Fitness Tracking App",
    year: "2023",
    status: "Published",
    tags: ["Mobile", "Healthcare"],
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    views: 89,
  },
];

const STATUS_COLORS: any = {
  "Published": { bg: "#d1fae5", text: "#065f46" },
  "In Progress": { bg: "#fef3c7", text: "#92400e" },
  "Draft": { bg: "#f3f4f6", text: "#374151" },
};

export default function MyProjectsScreen() {
  const [search, setSearch] = useState("");

  const filtered = MY_PROJECTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="rgb(47, 28, 15)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MY_PROJECTS.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MY_PROJECTS.filter(p => p.status === "Published").length}</Text>
          <Text style={styles.statLabel}>Published</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MY_PROJECTS.reduce((a, b) => a + b.views, 0)}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="rgb(164, 132, 109)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your projects..."
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
            <Ionicons name="folder-open-outline" size={64} color="rgb(185, 174, 167)" />
            <Text style={styles.emptyTitle}>No projects found</Text>
            <Text style={styles.emptySubtitle}>Try a different search</Text>
          </View>
        ) : (
          filtered.map((project) => (
            <TouchableOpacity key={project.id} style={styles.card} activeOpacity={0.92}>
              <View style={styles.cardImgWrapper}>
                <Image source={{ uri: project.image }} style={styles.cardImg} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.cardGradient} />
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[project.status]?.bg }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[project.status]?.text }]}>
                    {project.status}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={styles.ratingText}>{project.rating}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{project.title}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="calendar-outline" size={14} color="rgb(164, 132, 109)" />
                  <Text style={styles.cardYear}>{project.year}</Text>
                  <Ionicons name="eye-outline" size={14} color="rgb(164, 132, 109)" style={{ marginLeft: 12 }} />
                  <Text style={styles.cardYear}>{project.views} views</Text>
                </View>
                <View style={styles.tagsRow}>
                  {project.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil-outline" size={16} color="rgb(104, 68, 42)" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewBtn}>
                    <Ionicons name="eye-outline" size={16} color="#fff" />
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(104, 68, 42)", justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "rgb(254, 251, 245)", borderRadius: 16, padding: 14, alignItems: "center", elevation: 2 },
  statNumber: { fontSize: 24, fontWeight: "800", color: "rgb(104, 68, 42)" },
  statLabel: { fontSize: 12, color: "rgb(164, 132, 109)", fontWeight: "600", marginTop: 2 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgb(254, 251, 245)", borderRadius: 14, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: "rgb(185, 174, 167)", marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 14, color: "rgb(47, 28, 15)" },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 30 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgb(92, 64, 51)" },
  emptySubtitle: { fontSize: 14, color: "rgb(164, 132, 109)" },
  card: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  cardImgWrapper: { width: "100%", height: 180, position: "relative" },
  cardImg: { width: "100%", height: "100%", resizeMode: "cover" },
  cardGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 },
  statusBadge: { position: "absolute", top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "700" },
  ratingBadge: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  ratingText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "rgb(47, 28, 15)", marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  cardYear: { fontSize: 13, color: "rgb(164, 132, 109)", fontWeight: "500" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  tag: { backgroundColor: "rgb(240, 234, 228)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontSize: 12, color: "rgb(92, 64, 51)", fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: 10 },
  editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: "rgb(104, 68, 42)" },
  editBtnText: { color: "rgb(104, 68, 42)", fontSize: 14, fontWeight: "700" },
  viewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgb(104, 68, 42)" },
  viewBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
 
