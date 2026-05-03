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

const C = {
  bg: "rgb(240, 234, 228)",
  white: "rgb(254, 251, 245)",
  black: "rgb(47, 28, 15)",
  link: "rgb(164, 132, 109)",
  button: "rgb(104, 68, 42)",
  input: "rgb(185, 174, 167)",
};

export default function BookmarksScreen() {
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const bookmarkIds = await getBookmarks(currentUser.uid);

      if (!Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
        setBookmarks([]);
        return;
      }

      const projects = await Promise.all(
        bookmarkIds.map(async (projectId: string) => {
          const project = await getProj(projectId);

          if (
            project === "no-proj" ||
            project === "get-fail" ||
            typeof project === "string"
          ) {
            return null;
          }

          return {
            ...project,
            projectId,
          };
        })
      );

      setBookmarks(projects.filter(Boolean));
    } catch {
      Alert.alert("Error", "Could not load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [])
  );

  const filtered = bookmarks.filter((p) => {
    const title = p.title || "";
    const desc = p.desc || "";
    const category = p.category || "";
    const stack = Array.isArray(p.stack) ? p.stack : [];

    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase()) ||
      stack.some((t: string) =>
        t.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  const handleRemoveBookmark = async (projectId: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    try {
      setRemovingId(projectId);

      const result = await removeBookmark(currentUser.uid, projectId);

      if (result === "bookmark-removed") {
        setBookmarks((prev) =>
          prev.filter((project) => project.projectId !== projectId)
        );
        return;
      }

      Alert.alert("Error", "Could not remove bookmark.");
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRemovingId(null);
    }
  };

  const getRating = (project: any) => {
    const ratings = Array.isArray(project.ratings) ? project.ratings : [];

    if (ratings.length === 0) return "0.0";

    const avg =
      ratings.reduce((sum: number, r: number) => sum + Number(r || 0), 0) /
      ratings.length;

    return avg.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bookmarks</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookmarks.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={C.link} />

        <TextInput
          style={styles.searchInput}
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
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={64}
                color={C.input}
              />
              <Text style={styles.emptyTitle}>No bookmarks yet</Text>
              <Text style={styles.emptySubtitle}>
                Save projects you like to find them here
              </Text>

              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push("/Gallery")}
              >
                <Text style={styles.exploreBtnText}>Explore Projects</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((project) => (
              <TouchableOpacity
                key={project.projectId}
                style={styles.card}
                activeOpacity={0.92}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: { id: project.projectId },
                  })
                }
              >
                <View style={styles.cardImgWrapper}>
                  <Image
                    source={{
                      uri:
                        project.imgUrl ||
                        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
                    }}
                    style={styles.cardImg}
                  />

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.cardGradient}
                  />

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveBookmark(project.projectId)}
                    disabled={removingId === project.projectId}
                  >
                    {removingId === project.projectId ? (
                      <ActivityIndicator size="small" color={C.button} />
                    ) : (
                      <Ionicons name="bookmark" size={18} color={C.button} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>
                      {getRating(project)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>
                    {project.title || "Untitled Project"}
                  </Text>

                  <View style={styles.cardMeta}>
                    <View style={styles.authorDot}>
                      <Text style={styles.authorInitial}>
                        {(project.category || project.title || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.authorName}>
                      {project.category || "Graduation Project"}
                    </Text>

                    <Text style={styles.cardYear}>{project.year || ""}</Text>
                  </View>

                  <View style={styles.tagsRow}>
                    {(Array.isArray(project.stack) ? project.stack : [])
                      .slice(0, 4)
                      .map((tag: string) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.savedInfo}>
                      <Ionicons name="bookmark-outline" size={14} color={C.link} />
                      <Text style={styles.savedDate}>Saved</Text>
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.black,
  },

  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.button,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: C.input,
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.black,
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: C.black,
  },

  list: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 30,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgb(92, 64, 51)",
  },

  emptySubtitle: {
    fontSize: 14,
    color: C.link,
    textAlign: "center",
  },

  exploreBtn: {
    backgroundColor: C.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },

  exploreBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
  },

  cardImgWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
  },

  cardImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },

  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: C.white,
    padding: 8,
    borderRadius: 12,
    minWidth: 34,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  ratingBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  cardBody: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.black,
    marginBottom: 8,
  },

  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  authorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.button,
    justifyContent: "center",
    alignItems: "center",
  },

  authorInitial: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  authorName: {
    fontSize: 13,
    color: "rgb(92, 64, 51)",
    flex: 1,
    fontWeight: "500",
  },

  cardYear: {
    fontSize: 13,
    color: C.link,
    fontWeight: "500",
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },

  tag: {
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  tagText: {
    fontSize: 12,
    color: "rgb(92, 64, 51)",
    fontWeight: "600",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  savedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  savedDate: {
    fontSize: 12,
    color: C.link,
  },

  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.button,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  viewBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});