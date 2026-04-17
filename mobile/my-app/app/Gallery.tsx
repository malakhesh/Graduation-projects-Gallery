import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import UploadProjectModal from "../components/modals/UploadProjectModal";
import { getApproved } from "../backend/projects";

// ── Colors ────────────────────────────────────────
const C = {
  bg: "rgb(223, 205, 192)",
  white: "rgb(254, 251, 245)",
  black: "rgb(47, 28, 15)",
  link: "rgb(164, 132, 109)",
  button: "rgb(104, 68, 42)",
  input: "rgb(185, 174, 167)",
};

// ── Categories ─────────────────────────────────────
const CATEGORIES = ["All", "Mobile", "Web", "AI", "Security", "Data Science"];

// ── Card ───────────────────────────────────────────
function ProjectCard({ item, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: item.imgUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardStudent} numberOfLines={1}>
          {item.userId}
        </Text>

        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────
export default function GalleryScreen() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch from Firebase
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getApproved();

    if (Array.isArray(data)) {
      setProjects(data);
    } else {
      Toast.show({
        type: "error",
        text1: "Failed to load projects",
      });
    }

    setLoading(false);
  };

  // Filter
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();

      const matchSearch =
        p.title?.toLowerCase().includes(q) ||
        p.userId?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      const matchFilter =
        activeFilter === "All" || p.category === activeFilter;

      return matchSearch && matchFilter;
    });
  }, [search, activeFilter, projects]);

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    loadProjects().then(() => {
      setRefreshing(false);

      Toast.show({
        type: "success",
        text1: "Updated",
        text2: "Projects refreshed",
      });
    });
  }, []);

  // Upload success
  const handleUploadSuccess = () => {
    Toast.show({
      type: "success",
      text1: "Project uploaded",
      text2: "Waiting for approval",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>🗂️ Projects Gallery</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              activeFilter === cat && styles.chipActive,
            ]}
            onPress={() => setActiveFilter(cat)}
          >
            <Text>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}   // 🔥 Firestore ID المهم
        numColumns={2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <ProjectCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/project-details",
                params: {
                  id: item.id,   // 🔥 مهم جدًا
                },
              })
            }
          />
        )}
      />

      {/* Modal */}
      <UploadProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <Toast />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: C.black,
  },

  uploadButton: {
    backgroundColor: C.button,
    padding: 8,
    borderRadius: 20,
  },

  uploadButtonText: {
    color: "white",
  },

  searchBox: {
    margin: 10,
    backgroundColor: C.input,
    borderRadius: 10,
    padding: 8,
  },

  searchInput: {
    height: 40,
  },

  chip: {
    padding: 10,
    margin: 5,
    backgroundColor: C.white,
    borderRadius: 20,
  },

  chipActive: {
    backgroundColor: C.button,
  },

  card: {
    flex: 1,
    margin: 8,
    backgroundColor: C.white,
    borderRadius: 10,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 120,
  },

  cardBody: {
    padding: 8,
  },

  cardName: {
    fontWeight: "bold",
  },

  cardStudent: {
    fontSize: 12,
    color: "gray",
  },

  cardBadge: {
    marginTop: 5,
    backgroundColor: C.input,
    padding: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  cardBadgeText: {
    fontSize: 10,
  },
});