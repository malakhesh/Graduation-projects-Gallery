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
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import UploadProjectModal from "../components/modals/UploadProjectModal";
import { getApproved } from "../backend/projects";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const CATEGORIES = ["All", "Mobile", "Web", "AI", "Security", "Data Science"];

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
};

function ProjectCard({ item, onPress, colors, styles }: ProjectCardProps) {
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

  const projectTitle = item.title || item.name || "Untitled Project";

  const ownerName =
    item.author ||
    item.userName ||
    item.ownerName ||
    item.createdBy ||
    item.user?.name ||
    "Project Owner";

  const projectDate =
    item.year ||
    item.gradYear ||
    item.createdAt?.slice?.(0, 10) ||
    item.date ||
    "2025";

  const imageUrl =
    item.imgUrl ||
    item.image ||
    item.imageUrl ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

  const category =
    item.category ||
    (Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : "General");

  const githubUrl =
    item.githubUrl ||
    item.github ||
    item.githubLink ||
    item.repoUrl ||
    item.repositoryUrl ||
    "";

  const openGithub = async () => {
    if (!githubUrl) {
      Toast.show({
        type: "info",
        text1: "No GitHub link",
        text2: "This project has no GitHub link yet.",
      });
      return;
    }

    const canOpen = await Linking.canOpenURL(githubUrl);

    if (canOpen) {
      Linking.openURL(githubUrl);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid GitHub link",
        text2: "Could not open this link.",
      });
    }
  };

  const handleBookmark = () => {
    Toast.show({
      type: "success",
      text1: "Saved",
      text2: "Project added to bookmarks.",
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.white, shadowColor: colors.black },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <Text
          style={[styles.cardName, { color: colors.black }]}
          numberOfLines={1}
        >
          {projectTitle}
        </Text>

        <View style={styles.ownerRow}>
          <View style={[styles.ownerIcon, { borderColor: colors.border }]}>
            <Ionicons name="person" size={12} color={colors.button} />
          </View>

          <View style={styles.ownerInfo}>
            <Text
              style={[styles.ownerName, { color: colors.black }]}
              numberOfLines={1}
            >
              {ownerName}
            </Text>

            <Text style={[styles.projectDate, { color: colors.link }]}>
              {projectDate}
            </Text>
          </View>
        </View>
      </View>

      <Image
        source={{ uri: imageUrl }}
        style={[styles.cardImage, { backgroundColor: colors.input }]}
      />

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.categoryBadge,
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
            styles.ratingBadge,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Ionicons name="star" size={11} color="#f5b301" />
          <Text style={[styles.ratingText, { color: colors.black }]}>
            {averageRating}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.githubButton, { backgroundColor: colors.black }]}
          activeOpacity={0.85}
          onPress={openGithub}
        >
          <Ionicons name="logo-github" size={12} color="#fff" />
          <Text style={styles.githubText}>GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookmarkButton, { borderColor: colors.border }]}
          activeOpacity={0.85}
          onPress={handleBookmark}
        >
          <Ionicons name="bookmark-outline" size={14} color={colors.button} />
        </TouchableOpacity>
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

  const styles = useMemo(() => createStyles(C), [C]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getApproved();

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
    } catch {
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
  }, [loadProjects]);

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

    return projects.filter((p) => {
      const stack = Array.isArray(p.stack) ? p.stack : [];
      const tags = Array.isArray(p.tags) ? p.tags : [];

      const searchableText = [
        String(p.title || ""),
        String(p.name || ""),
        String(p.desc || ""),
        String(p.author || ""),
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
      const matchFilter =
        activeFilter === "All" ||
        keywords.some((keyword) =>
          searchableText.includes(keyword.toLowerCase())
        );

      return matchSearch && matchFilter;
    });
  }, [search, activeFilter, projects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);

    Toast.show({
      type: "success",
      text1: "Updated",
      text2: "Projects refreshed",
    });
  }, [loadProjects]);

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
          <Text style={styles.subtitle}>{projects.length} approved projects</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={C.link} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, category, stack..."
          placeholderTextColor={C.link}
          value={search}
          onChangeText={setSearch}
        />

        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={C.link} />
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
              <Text
                style={[
                  styles.chipText,
                  activeFilter === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
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
          renderItem={({ item }) => (
            <ProjectCard
              item={item}
              colors={C}
              styles={styles}
              onPress={() =>
                router.push({
                  pathname: "/project-details",
                  params: { id: item.id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="folder-open-outline" size={50} color={C.input} />
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptyText}>
                Try changing the search keyword or category.
              </Text>
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
      paddingTop: 16,
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
      fontSize: 12.5,
    },

    searchBox: {
      marginHorizontal: 16,
      backgroundColor: C.white,
      borderRadius: 18,
      paddingHorizontal: 13,
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: C.border,
    },

    searchInput: {
      flex: 1,
      color: C.black,
      fontSize: 13,
      paddingVertical: 0,
    },

    categoriesWrapper: {
      paddingVertical: 11,
      paddingLeft: 12,
    },

    chip: {
      paddingHorizontal: 13,
      paddingVertical: 8,
      marginHorizontal: 4,
      backgroundColor: C.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
    },

    chipActive: {
      backgroundColor: C.button,
      borderColor: C.button,
    },

    chipText: {
      color: C.black,
      fontSize: 12,
      fontWeight: "800",
    },

    chipTextActive: {
      color: C.white,
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
      paddingHorizontal: 10,
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
      width: "48%",
      marginBottom: 13,
      borderRadius: 15,
      padding: 9,
      borderWidth: 1,
      borderColor: C.border,
      shadowOpacity: 0.08,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    cardTop: {
      marginBottom: 8,
    },

    cardName: {
      fontWeight: "900",
      fontSize: 13.5,
      marginBottom: 8,
    },

    ownerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    ownerIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.white,
    },

    ownerInfo: {
      flex: 1,
    },

    ownerName: {
      fontSize: 10.5,
      fontWeight: "800",
      lineHeight: 14,
    },

    projectDate: {
      fontSize: 9.5,
      fontWeight: "700",
      marginTop: 1,
    },

    cardImage: {
      width: "100%",
      height: 105,
      borderRadius: 10,
      marginBottom: 8,
    },

    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    categoryBadge: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },

    categoryText: {
      fontSize: 9.5,
      fontWeight: "800",
    },

    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingHorizontal: 6,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },

    ratingText: {
      fontSize: 9.5,
      fontWeight: "900",
    },

    githubButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 6,
      borderRadius: 11,
    },

    githubText: {
      color: "#fff",
      fontSize: 8.5,
      fontWeight: "900",
    },

    bookmarkButton: {
      width: 26,
      height: 26,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.white,
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
  });
}