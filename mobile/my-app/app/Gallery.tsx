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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import UploadProjectModal from "../components/modals/UploadProjectModal";
import { getApproved } from "../backend/projects";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const CATEGORIES = ["All", "Mobile", "Web", "AI", "Security", "Data Science"];

const FILTER_KEYWORDS: Record<string, string[]> = {
  All: [],
  Mobile: ["mobile", "react native", "flutter", "android", "ios", "swift", "kotlin", "dart"],
  Web: ["web", "web dev", "frontend", "backend", "full stack", "react", "vue", "angular", "node", "express", "next", "laravel", "django", "fastapi", "html", "css", "javascript", "typescript"],
  AI: ["ai", "ai / ml", "ml", "machine learning", "deep learning", "data mining", "neural", "tensorflow", "pytorch", "opencv"],
  Security: ["security", "cybersecurity", "cyber", "network security", "encryption", "malware", "penetration", "auth"],
  "Data Science": ["data science", "data", "analytics", "analysis", "python", "pandas", "numpy", "sql", "mysql", "database", "firebase", "mongodb"],
};

function ProjectCard({ item, onPress, colors }: any) {
  const stack = Array.isArray(item.stack) ? item.stack : [];
  const ratings = Array.isArray(item.ratings) ? item.ratings : [];

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum: number, rate: number) => sum + Number(rate || 0), 0) / ratings.length).toFixed(1)
      : "0.0";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.black }]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.imgUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80" }}
        style={[styles.cardImage, { backgroundColor: colors.input }]}
      />
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.black }]} numberOfLines={1}>
          {item.title || "Untitled Project"}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.link }]} numberOfLines={2}>
          {item.desc || "No description added"}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.cardBadge, { backgroundColor: "rgba(185, 174, 167, 0.45)" }]}>
            <Text style={[styles.cardBadgeText, { color: colors.black }]}>{item.category || "General"}</Text>
          </View>
          <Text style={[styles.ratingText, { color: colors.link }]}>⭐ {averageRating}</Text>
        </View>
        {stack.length > 0 ? (
          <View style={styles.stackRow}>
            {stack.slice(0, 2).map((tech: string, index: number) => (
              <View key={index} style={[styles.stackChip, { backgroundColor: colors.bg }]}>
                <Text style={[styles.stackText, { color: colors.black }]}>{tech}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function GalleryScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const params = useLocalSearchParams();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getApproved();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        Toast.show({ type: "error", text1: "Failed to load projects", text2: "Please try again." });
      }
    } catch {
      setProjects([]);
      Toast.show({ type: "error", text1: "Something went wrong", text2: "Could not load projects." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    const openUploadParam = Array.isArray(params.openUpload) ? params.openUpload[0] : params.openUpload;
    if (openUploadParam === "true") setModalVisible(true);
  }, [params.openUpload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const stack = Array.isArray(p.stack) ? p.stack : [];
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const searchableText = [String(p.title || ""), String(p.desc || ""), String(p.userId || ""), String(p.category || ""), String(p.year || ""), ...stack, ...tags].join(" ").toLowerCase();
      const matchSearch = !q || searchableText.includes(q);
      const keywords = FILTER_KEYWORDS[activeFilter] || [];
      const matchFilter = activeFilter === "All" || keywords.some((keyword) => searchableText.includes(keyword.toLowerCase()));
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter, projects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
    Toast.show({ type: "success", text1: "Updated", text2: "Projects refreshed" });
  }, []);

  const handleUploadSuccess = async (result?: any) => {
    setModalVisible(false);
    if (result === "daily-limit-reached") {
      Toast.show({ type: "error", text1: "Daily limit reached", text2: "You cannot upload more projects today." });
      return;
    }
    if (result && typeof result === "object") {
      if (result.status === "approved") {
        Toast.show({ type: "success", text1: "Project uploaded", text2: "Your project is approved and live now." });
      } else {
        Toast.show({ type: "success", text1: "Project uploaded", text2: "Waiting for admin approval." });
      }
    } else {
      Toast.show({ type: "success", text1: "Project uploaded", text2: "Waiting for admin approval." });
    }
    await loadProjects();
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 18, paddingHorizontal: 16, paddingBottom: 12 },
    title: { fontSize: 21, fontWeight: "900", color: C.black },
    subtitle: { fontSize: 12.5, color: C.link, fontWeight: "700", marginTop: 3 },
    uploadButton: { backgroundColor: C.button, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
    uploadButtonText: { color: C.white, fontWeight: "900", fontSize: 13 },
    searchBox: { marginHorizontal: 16, backgroundColor: C.white, borderRadius: 16, paddingHorizontal: 14, height: 48, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.border },
    searchInput: { flex: 1, color: C.black, fontSize: 14 },
    clearText: { color: C.link, fontSize: 26, fontWeight: "700", paddingHorizontal: 4 },
    categoriesWrapper: { paddingVertical: 12, paddingLeft: 12 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, marginHorizontal: 4, backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.border },
    chipActive: { backgroundColor: C.button },
    chipText: { color: C.black, fontSize: 13, fontWeight: "700" },
    chipTextActive: { color: C.white },
    loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 10, color: C.black, fontSize: 14, fontWeight: "700" },
    listContent: { paddingHorizontal: 8, paddingBottom: 24 },
    emptyListContent: { flexGrow: 1, justifyContent: "center" },
    columnWrapper: { justifyContent: "space-between" },
    card: { width: "48%", marginHorizontal: 4, marginBottom: 12, borderRadius: 16, overflow: "hidden", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    cardImage: { width: "100%", height: 120 },
    cardBody: { padding: 10 },
    cardName: { fontWeight: "900", fontSize: 14, marginBottom: 5 },
    cardDescription: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
    metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    cardBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, maxWidth: "70%" },
    cardBadgeText: { fontSize: 10.5, fontWeight: "800" },
    ratingText: { fontSize: 11, fontWeight: "800" },
    stackRow: { flexDirection: "row", flexWrap: "wrap" },
    stackChip: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 9, marginRight: 5, marginBottom: 4 },
    stackText: { fontSize: 10, fontWeight: "700" },
    emptyBox: { alignItems: "center", paddingHorizontal: 30 },
    emptyTitle: { color: C.black, fontSize: 18, fontWeight: "900", marginBottom: 8 },
    emptyText: { color: C.link, textAlign: "center", fontSize: 14, lineHeight: 21 },
  }), [C]);

  return (
    <SafeAreaView key={theme} style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Projects Gallery</Text>
          <Text style={styles.subtitle}>{projects.length} approved projects</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, category, stack..."
          placeholderTextColor={C.link}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeFilter === cat && styles.chipActive]}
              onPress={() => setActiveFilter(cat)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, activeFilter === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={[styles.listContent, filtered.length === 0 && styles.emptyListContent]}
          columnWrapperStyle={filtered.length > 0 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProjectCard
              item={item}
              colors={C}
              onPress={() => router.push({ pathname: "/project-details", params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyText}>Try changing the search keyword or category.</Text>
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
