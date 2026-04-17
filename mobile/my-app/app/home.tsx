import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";

import { auth } from "../backend/firebase";
import { getUser, logOut } from "../backend/auth";

type UserData = {
  name: string;
  email: string;
};

type ProjectItem = {
  id: string;
  title: string;
  author: string;
  year: string;
  category: string;
};

const CATEGORIES = ["All Projects", "AI / ML", "Web Dev", "Mobile", "Design"];

const RECOMMENDED: ProjectItem[] = [
  {
    id: "1",
    title: "AI Robotics Research System",
    author: "Emily Johnson",
    year: "2024",
    category: "AI / ML",
  },
  {
    id: "2",
    title: "Art Installation Project",
    author: "David Miller",
    year: "2023",
    category: "Design",
  },
  {
    id: "3",
    title: "Smart City Dashboard",
    author: "Ahmed Hassan",
    year: "2022",
    category: "Web Dev",
  },
  {
    id: "4",
    title: "Mobile Health Tracker",
    author: "Sara Ahmed",
    year: "2024",
    category: "Mobile",
  },
  {
    id: "5",
    title: "E-Learning Graduation Platform",
    author: "Mohamed Ali",
    year: "2024",
    category: "Web Dev",
  },
];

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }

        const data = await getUser(user.uid);
        setUserData(data as UserData);
      } catch (error) {
        console.log("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const filteredProjects = useMemo(() => {
    return RECOMMENDED.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Projects" ||
        item.category === selectedCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.author.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchText]);

  const handleLogout = async () => {
    try {
      await logOut();
      setMenuVisible(false);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const renderProjectCard = ({ item }: { item: ProjectItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.projectCard}
      onPress={() =>
        router.push({
          pathname: "/project-details",
          params: { id: item.id },
        })
      }
    >
      <LinearGradient
        colors={["rgb(254, 251, 245)", "rgb(242, 234, 226)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.projectGradient}
      >
        <View style={styles.projectTopRow}>
          <View style={styles.projectBadge}>
            <Text style={styles.projectBadgeText}>{item.category}</Text>
          </View>

          <Text style={styles.projectYear}>{item.year}</Text>
        </View>

        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectAuthor}>By {item.author}</Text>

        <View style={styles.projectFooter}>
          <Text style={styles.projectFooterText}>View Details</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="rgb(75, 48, 28)"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(104, 68, 42)" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={26} color="rgb(47, 28, 15)" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Graduation Projects</Text>
            <Text style={styles.headerSubtitle}>
              Welcome back, {userData?.name || "Student"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/Gallery")}
            style={styles.galleryButton}
            activeOpacity={0.8}
          >
            <Ionicons name="grid-outline" size={22} color="rgb(47, 28, 15)" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["rgb(129, 86, 54)", "rgb(104, 68, 42)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroTitle}>Discover inspiring student work</Text>
          <Text style={styles.heroText}>
            Explore graduation projects in AI, web, mobile, and design.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            activeOpacity={0.85}
            onPress={() => router.push("/Gallery")}
          >
            <Text style={styles.heroButtonText}>Browse Projects</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="rgb(75, 48, 28)"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search by title, author, or category"
            placeholderTextColor="rgb(110, 90, 78)"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.85}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recommended Projects</Text>
          <TouchableOpacity onPress={() => router.push("/Gallery")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {filteredProjects.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="document-text-outline"
              size={42}
              color="rgb(164, 132, 109)"
            />
            <Text style={styles.emptyTitle}>No projects found</Text>
            <Text style={styles.emptyText}>
              Try another category or search keyword.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            renderItem={renderProjectCard}
            scrollEnabled={false}
            contentContainerStyle={styles.projectsList}
          />
        )}
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuPanel}>
            <View style={styles.menuTopRow}>
              <Text style={styles.menuTitle}>Menu</Text>

              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="rgb(47, 28, 15)" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuProfileRow}>
              <Image
                source={require("../assets/images/avatar.jpg")}
                style={styles.menuAvatar}
              />

              <View>
                <Text style={styles.menuName}>{userData?.name}</Text>
                <Text style={styles.menuEmail}>{userData?.email}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/Gallery");
              }}
            >
              <Ionicons
                name="images-outline"
                size={20}
                color="rgb(75, 48, 28)"
              />
              <Text style={styles.menuItemText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/forgot-password");
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="rgb(75, 48, 28)"
              />
              <Text style={styles.menuItemText}>Forgot Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="rgb(75, 48, 28)"
              />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(223, 205, 192)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(223, 205, 192)",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgb(254, 251, 245)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgb(104, 68, 42)",
    marginTop: 2,
  },
  galleryButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgb(254, 251, 245)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "rgb(254, 251, 245)",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 24,
    color: "rgb(245, 236, 229)",
    marginBottom: 18,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgb(254, 251, 245)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroButtonText: {
    color: "rgb(75, 48, 28)",
    fontSize: 15,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(104, 68, 42, 0.08)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: "rgb(47, 28, 15)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
    marginBottom: 12,
  },
  categoriesRow: {
    paddingBottom: 8,
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgb(254, 251, 245)",
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "rgb(104, 68, 42)",
  },
  categoryChipText: {
    color: "rgb(75, 48, 28)",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "rgb(254, 251, 245)",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
  },
  viewAllText: {
    color: "rgb(164, 132, 109)",
    fontSize: 14,
    fontWeight: "700",
  },
  projectsList: {
    paddingBottom: 6,
  },
  projectCard: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
  },
  projectGradient: {
    padding: 16,
    borderRadius: 20,
  },
  projectTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  projectBadge: {
    backgroundColor: "rgba(104, 68, 42, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  projectBadgeText: {
    color: "rgb(75, 48, 28)",
    fontSize: 12,
    fontWeight: "700",
  },
  projectYear: {
    color: "rgb(104, 68, 42)",
    fontSize: 13,
    fontWeight: "700",
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
    marginBottom: 8,
  },
  projectAuthor: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    marginBottom: 14,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectFooterText: {
    color: "rgb(75, 48, 28)",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyBox: {
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "row",
  },
  overlayTouch: {
    flex: 1,
  },
  menuPanel: {
    width: 290,
    backgroundColor: "rgb(254, 251, 245)",
    paddingTop: 58,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  menuTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },
  menuProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  menuAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },
  menuEmail: {
    fontSize: 13,
    color: "rgb(104, 68, 42)",
    marginTop: 3,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(104, 68, 42, 0.15)",
    marginVertical: 22,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgb(75, 48, 28)",
    marginLeft: 12,
  },
});