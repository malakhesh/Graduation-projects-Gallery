import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../backend/firebase";
import { getUserProjs, toggleHideProject } from "../backend/projects";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getUserProjs(user.uid);
    if (Array.isArray(data)) setProjects(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleHide = async (id, current) => {
    await toggleHideProject(id, !current);

    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, hidden: !current } : p
      )
    );
  };

  const hideAll = async () => {
    const updated = await Promise.all(
      projects.map(async (p) => {
        await toggleHideProject(p.id, true);
        return { ...p, hidden: true };
      })
    );
    setProjects(updated);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imgUrl || "https://via.placeholder.com/60" }}
        style={styles.image}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>{item.status}</Text>

        {item.hidden && <Text style={styles.hidden}>Hidden</Text>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => toggleHide(item.id, item.hidden)}
        >
          <Ionicons
            name={item.hidden ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#444"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Project Management</Text>

      <View style={styles.top}>
        <Text style={styles.sub}>
          {projects.length} projects • hidden only visible to you
        </Text>

        <TouchableOpacity style={styles.hideAll} onPress={hideAll}>
          <Ionicons name="eye-off-outline" size={16} />
          <Text>Hide all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f6f6f6" },

  header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sub: { fontSize: 12, color: "#777", flex: 1 },

  hideAll: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#eee",
    padding: 6,
    borderRadius: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },

  title: { fontSize: 14, fontWeight: "600" },
  status: { fontSize: 12, color: "green" },

  hidden: { fontSize: 11, color: "red" },

  actions: { flexDirection: "row" },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
});