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
import { getUserProjs, delProj } from "../backend/projects";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

const STATUS_COLORS: any = {
  approved: { bg: "#d1fae5", text: "#065f46", label: "Approved" },
  published: { bg: "#d1fae5", text: "#065f46", label: "Published" },
  pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
  draft: { bg: "#f3f4f6", text: "#374151", label: "Draft" },
};

export default function MyProjectsScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const data = await getUserProjs(currentUser.uid);

      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
        Alert.alert("Error", "Could not load your projects.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong while loading projects.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const getAverageRating = (project: any) => {
    const ratings = Array.isArray(project.ratings) ? project.ratings : [];

    if (ratings.length === 0) return "0.0";

    const total = ratings.reduce(
      (sum: number, rating: number) => sum + Number(rating || 0),
      0
    );

    return (total / ratings.length).toFixed(1);
  };

  const getProjectStatus = (project: any) => {
    const status = String(project.status || "draft").toLowerCase();
    return STATUS_COLORS[status] || STATUS_COLORS.draft;
  };

  const getProjectImage = (project: any) => {
    return project.imgUrl || project.image || FALLBACK_IMAGE;
  };

  const getProjectTags = (project: any) => {
    if (Array.isArray(project.tags) && project.tags.length > 0) {
      return project.tags;
    }

    if (Array.isArray(project.stack) && project.stack.length > 0) {
      return project.stack;
    }

    if (project.category) {
      return [project.category];
    }

    return [];
  };

  const getTotalViews = () => {
    return projects.reduce((total, project) => {
      return total + Number(project.views || project.visitations || 0);
    }, 0);
  };

  const filtered = projects.filter((project) => {
    const q = search.toLowerCase().trim();

    if (!q) return true;

    const title = String(project.title || "").toLowerCase();
    const desc = String(project.desc || "").toLowerCase();
    const category = String(project.category || "").toLowerCase();
    const status = String(project.status || "").toLowerCase();
    const tags = getProjectTags(project).map((tag: string) =>
      String(tag).toLowerCase()
    );

    return (
      title.includes(q) ||
      desc.includes(q) ||
      category.includes(q) ||
      status.includes(q) ||
      tags.some((tag: string) => tag.includes(q))
    );
  });

  const handleViewProject = (project: any) => {
    router.push({
      pathname: "/project-details",
      params: {
        id: project.id,
      },
    });
  };

  const handleEditProject = (project: any) => {
    Alert.alert(
      "Edit Project",
      "Edit project screen is not created yet."
    );
  };

  const handleAddProject = () => {
    router.push({
      pathname: "/Gallery",
      params: {
        openUpload: "true",
      },
    });
  };

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(projectId);

              const result = await delProj(projectId);

              if (result === "del-ok") {
                setProjects((prev) =>
                  prev.filter((project) => project.id !== projectId)
                );
                return;
              }

              Alert.alert("Error", "Could not delete this project.");
            } catch {
              Alert.alert("Error", "Something went wrong.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },

    loadingBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: C.black,
      fontWeight: "700",
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

    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.button,
      justifyContent: "center",
      alignItems: "center",
    },

    statsRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 16,
    },

    statCard: {
      flex: 1,
      backgroundColor: C.white,
      borderRadius: 16,
      padding: 14,
      alignItems: "center",
      elevation: 2,
      shadowColor: C.black,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },

    statNumber: {
      fontSize: 24,
      fontWeight: "800",
      color: C.button,
    },

    statLabel: {
      fontSize: 12,
      color: C.link,
      fontWeight: "600",
      marginTop: 2,
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
      borderColor: C.border,
      marginBottom: 16,
    },

    searchInput: {
      flex: 1,
      fontSize: 14,
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
      color: C.link,
    },

    emptySubtitle: {
      fontSize: 14,
      color: C.link,
      textAlign: "center",
    },

    emptyAddBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: C.button,
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 16,
      marginTop: 6,
    },

    emptyAddBtnText: {
      color: C.white,
      fontWeight: "800",
      fontSize: 14,
    },

    card: {
      backgroundColor: C.white,
      borderRadius: 20,
      overflow: "hidden",
      elevation: 4,
      shadowColor: C.black,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
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

    statusBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },

    statusText: {
      fontSize: 12,
      fontWeight: "700",
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
      marginBottom: 6,
    },

    cardDesc: {
      fontSize: 13,
      color: C.link,
      marginBottom: 8,
      lineHeight: 18,
    },

    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 10,
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
      color: C.black,
      fontWeight: "600",
    },

    cardActions: {
      flexDirection: "row",
      gap: 8,
    },

    editBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: C.button,
    },

    editBtnText: {
      color: C.button,
      fontSize: 13,
      fontWeight: "700",
    },

    deleteBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: C.error,
    },

    deleteBtnText: {
      color: C.error,
      fontSize: 13,
      fontWeight: "700",
    },

    viewBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: C.button,
    },

    viewBtnText: {
      color: C.white,
      fontSize: 13,
      fontWeight: "700",
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={styles.loadingText}>Loading your projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const approvedCount = projects.filter((project) => {
    const status = String(project.status || "").toLowerCase();
    return status === "approved" || status === "published";
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Projects</Text>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddProject}>
          <Ionicons name="add" size={24} color={C.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getTotalViews()}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={C.link} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search your projects..."
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={C.link} />

            <Text style={styles.emptyTitle}>
              {projects.length === 0 ? "No projects yet" : "No projects found"}
            </Text>

            <Text style={styles.emptySubtitle}>
              {projects.length === 0
                ? "Upload your first project to see it here"
                : "Try a different search"}
            </Text>

            {projects.length === 0 ? (
              <TouchableOpacity style={styles.emptyAddBtn} onPress={handleAddProject}>
                <Ionicons name="add" size={18} color={C.white} />
                <Text style={styles.emptyAddBtnText}>Upload Project</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filtered.map((project) => {
            const status = getProjectStatus(project);
            const tags = getProjectTags(project);

            return (
              <TouchableOpacity
                key={project.id}
                style={styles.card}
                activeOpacity={0.92}
                onPress={() => handleViewProject(project)}
              >
                <View style={styles.cardImgWrapper}>
                  <Image
                    source={{ uri: getProjectImage(project) }}
                    style={styles.cardImg}
                  />

                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.cardGradient}
                  />

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: status.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: status.text }]}>
                      {status.label}
                    </Text>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>
                      {getAverageRating(project)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {project.title || "Untitled Project"}
                  </Text>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {project.desc || "No description added"}
                  </Text>

                  <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={14} color={C.link} />

                    <Text style={styles.cardYear}>
                      {project.year || "No year"}
                    </Text>

                    <Ionicons name="eye-outline" size={14} color={C.link} style={{ marginLeft: 12 }} />

                    <Text style={styles.cardYear}>
                      {Number(project.views || project.visitations || 0)} views
                    </Text>
                  </View>

                  <View style={styles.tagsRow}>
                    {tags.length === 0 ? (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>No tags</Text>
                      </View>
                    ) : (
                      tags.slice(0, 4).map((tag: string, index: number) => (
                        <View key={`${tag}-${index}`} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleEditProject(project)}
                    >
                      <Ionicons name="pencil-outline" size={16} color={C.button} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteProject(project.id)}
                      disabled={deletingId === project.id}
                    >
                      {deletingId === project.id ? (
                        <ActivityIndicator size="small" color={C.error} />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={16} color={C.error} />
                          <Text style={styles.deleteBtnText}>Delete</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => handleViewProject(project)}
                    >
                      <Ionicons name="eye-outline" size={16} color={C.white} />
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}