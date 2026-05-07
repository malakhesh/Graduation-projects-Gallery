import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { ListRenderItem } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { auth } from "../backend/firebase";
import { getUserProjs, toggleHideProject } from "../backend/projects";
import Toast from "react-native-toast-message";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

type Project = {
  id: string;
  title?: string;
  imgUrl?: string;
  status?: string;
  hidden?: boolean;
};

export default function ProjectManagement() {
  const { theme } = useTheme();
  const themeColors = Colors[theme] as any;

  const C = {
    bg: themeColors.bg || "#F5ECE4",
    white: themeColors.white || "#FFFBF5",
    black: themeColors.black || "#2F1C0F",
    primary: themeColors.primary || "#68442A",
    error: themeColors.error || "#D9534F",
    border: themeColors.border || "#E5D8CF",
    chip: themeColors.chip || "#EFE3DA",
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchProjects = async () => {
    const user = auth.currentUser;

    if (!user) {
      setProjects([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await getUserProjs(user.uid);

      if (Array.isArray(data)) {
        const formattedProjects: Project[] = data.map((project: any) => ({
          id: String(project.id),
          title: project.title || "Untitled Project",
          imgUrl: project.imgUrl || "",
          status: project.status || "In Progress",
          hidden: Boolean(project.hidden),
        }));

        setProjects(formattedProjects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);

      Toast.show({
        type: "error",
        text1: "Failed to load projects",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleHide = async (id: string, currentHidden: boolean = false) => {
    try {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, hidden: !currentHidden }
            : project
        )
      );

      await toggleHideProject(id, !currentHidden);

      Toast.show({
        type: "success",
        text1: !currentHidden ? "Project hidden" : "Project shown",
      });
    } catch (error) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, hidden: currentHidden }
            : project
        )
      );

      Toast.show({
        type: "error",
        text1: "Failed to update project",
      });
    }
  };

  const hideAll = async () => {
    Alert.alert(
      "Hide All Projects",
      "Are you sure you want to hide all projects?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Hide All",
          style: "destructive",
          onPress: async () => {
            const previousProjects = [...projects];

            const updatedProjects = projects.map((project) => ({
              ...project,
              hidden: true,
            }));

            setProjects(updatedProjects);

            try {
              await Promise.all(
                projects.map((project) =>
                  toggleHideProject(project.id, true)
                )
              );

              Toast.show({
                type: "success",
                text1: "All projects hidden",
              });
            } catch (error) {
              setProjects(previousProjects);

              Toast.show({
                type: "error",
                text1: "Failed to hide all projects",
              });
            }
          },
        },
      ]
    );
  };

  const showAll = async () => {
    Alert.alert(
      "Show All Projects",
      "Are you sure you want to show all projects?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Show All",
          onPress: async () => {
            const previousProjects = [...projects];

            const updatedProjects = projects.map((project) => ({
              ...project,
              hidden: false,
            }));

            setProjects(updatedProjects);

            try {
              await Promise.all(
                projects.map((project) =>
                  toggleHideProject(project.id, false)
                )
              );

              Toast.show({
                type: "success",
                text1: "All projects shown",
              });
            } catch (error) {
              setProjects(previousProjects);

              Toast.show({
                type: "error",
                text1: "Failed to show all projects",
              });
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const renderItem: ListRenderItem<Project> = ({ item }) => {
    const isHidden = Boolean(item.hidden);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: C.white,
            borderColor: C.border,
          },
        ]}
      >
        <Image
          source={{
            uri: item.imgUrl || "https://via.placeholder.com/60",
          }}
          style={styles.image}
        />

        <View style={styles.info}>
          <Text style={[styles.title, { color: C.black }]}>
            {item.title || "Untitled Project"}
          </Text>

          <Text style={[styles.status, { color: C.primary }]}>
            {item.status || "In Progress"}
          </Text>

          {isHidden && (
            <Text style={[styles.hidden, { color: C.error }]}>
              Hidden from gallery
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: C.chip }]}
          onPress={() => toggleHide(item.id, isHidden)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isHidden ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={C.black}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const visibleCount = projects.filter((project) => !project.hidden).length;
  const hiddenCount = projects.filter((project) => project.hidden).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={C.black} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: C.black }]}>
          Project Management
        </Text>

        <View style={styles.headerRightSpace} />
      </View>

      <View style={[styles.statsBar, { backgroundColor: C.chip }]}>
        <Text style={[styles.statsText, { color: C.black }]}>
          📁 {visibleCount} visible
        </Text>

        <Text style={[styles.statsText, { color: C.black }]}>
          👁️ {hiddenCount} hidden
        </Text>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${C.error}20` }]}
          onPress={hideAll}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-off-outline" size={18} color={C.error} />
          <Text style={[styles.actionText, { color: C.error }]}>
            Hide All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${C.primary}20` }]}
          onPress={showAll}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={18} color={C.primary} />
          <Text style={[styles.actionText, { color: C.primary }]}>
            Show All
          </Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={C.border} />
          <Text style={[styles.emptyText, { color: C.black }]}>
            No projects yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  headerRightSpace: {
    width: 40,
  },

  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },

  statsText: {
    fontSize: 14,
    fontWeight: "600",
  },

  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },

  image: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  status: {
    fontSize: 12,
    marginBottom: 2,
  },

  hidden: {
    fontSize: 11,
    fontWeight: "500",
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
  },
});