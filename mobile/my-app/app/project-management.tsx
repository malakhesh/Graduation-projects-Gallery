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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { auth } from "../backend/firebase";
import { getUserProjs, toggleHideProject } from "../backend/projects";
import Toast from "react-native-toast-message";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

export default function ProjectManagement() {
  const { theme } = useTheme();
  const C = Colors[theme];
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProjs(user.uid);
      if (Array.isArray(data)) {
        setProjects(data);
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

  const toggleHide = async (id, currentHidden) => {
    try {
      setProjects(prev =>
        prev.map(p =>
          p.id === id ? { ...p, hidden: !currentHidden } : p
        )
      );

      await toggleHideProject(id, !currentHidden);
      
      Toast.show({
        type: "success",
        text1: !currentHidden ? "Project hidden" : "Project shown",
      });
    } catch (error) {
      setProjects(prev =>
        prev.map(p =>
          p.id === id ? { ...p, hidden: currentHidden } : p
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Hide All",
          onPress: async () => {
            const previousProjects = [...projects];
            const updatedProjects = projects.map(p => ({ ...p, hidden: true }));
            setProjects(updatedProjects);
            
            try {
              await Promise.all(
                projects.map(async (p) => {
                  await toggleHideProject(p.id, true);
                })
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Show All",
          onPress: async () => {
            const previousProjects = [...projects];
            const updatedProjects = projects.map(p => ({ ...p, hidden: false }));
            setProjects(updatedProjects);
            
            try {
              await Promise.all(
                projects.map(async (p) => {
                  await toggleHideProject(p.id, false);
                })
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

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: C.white, borderColor: C.border }]}>
      <Image
        source={{ uri: item.imgUrl || "https://via.placeholder.com/60" }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={[styles.title, { color: C.black }]}>{item.title}</Text>
        <Text style={[styles.status, { color: C.primary }]}>
          {item.status || "In Progress"}
        </Text>
        {item.hidden && (
          <Text style={[styles.hidden, { color: C.error }]}>
            Hidden from gallery
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: C.chip }]}
        onPress={() => toggleHide(item.id, item.hidden)}
      >
        <Ionicons
          name={item.hidden ? "eye-off-outline" : "eye-outline"}
          size={20}
          color={C.black}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const visibleCount = projects.filter(p => !p.hidden).length;
  const hiddenCount = projects.filter(p => p.hidden).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.black} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.black }]}>
          Project Management
        </Text>
        <View style={{ width: 40 }} />
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
          style={[styles.actionBtn, { backgroundColor: C.error + "20" }]}
          onPress={hideAll}
        >
          <Ionicons name="eye-off-outline" size={18} color={C.error} />
          <Text style={[styles.actionText, { color: C.error }]}>Hide All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: C.primary + "20" }]}
          onPress={showAll}
        >
          <Ionicons name="eye-outline" size={18} color={C.primary} />
          <Text style={[styles.actionText, { color: C.primary }]}>Show All</Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={C.border} />
          <Text style={[styles.emptyText, { color: C.black }]}>No projects yet</Text>
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