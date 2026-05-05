import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { getUser } from "../backend/auth";
import { getUserProjs } from "../backend/projects";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80";

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [userData, setUserData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!userId) {
      setLoading(false);
      Alert.alert("Error", "User profile not found.");
      return;
    }

    try {
      setLoading(true);

      const data = await getUser(userId);

      if (data && data !== "no-data" && data !== "get-fail" && typeof data !== "string") {
        setUserData(data);
      } else {
        setUserData(null);
      }

      const userProjects = await getUserProjs(userId);

      if (Array.isArray(userProjects)) {
        setProjects(userProjects);
      } else {
        setProjects([]);
      }
    } catch {
      Alert.alert("Error", "Could not load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [userId])
  );

  const openLink = async (url: string) => {
    if (!url) return;

    const finalUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    try {
      await Linking.openURL(finalUrl);
    } catch {
      Alert.alert("Error", "Could not open this link.");
    }
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
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: C.black,
    },

    headerSpacer: {
      width: 40,
      height: 40,
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 36,
    },

    profileCard: {
      backgroundColor: C.white,
      borderRadius: 24,
      padding: 18,
      alignItems: "center",
      marginBottom: 16,
      shadowColor: C.black,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },

    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: C.bg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: C.button,
      marginBottom: 12,
    },

    avatarText: {
      color: C.button,
      fontSize: 42,
      fontWeight: "900",
    },

    name: {
      fontSize: 22,
      fontWeight: "900",
      color: C.black,
      textAlign: "center",
    },

    email: {
      color: C.link,
      fontSize: 13,
      marginTop: 4,
      textAlign: "center",
    },

    year: {
      color: C.link,
      fontSize: 13,
      marginTop: 4,
      fontWeight: "700",
    },

    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
      width: "100%",
    },

    statBox: {
      flex: 1,
      backgroundColor: C.bg,
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: "center",
    },

    statNumber: {
      fontSize: 18,
      fontWeight: "900",
      color: C.button,
    },

    statLabel: {
      fontSize: 12,
      color: C.link,
      marginTop: 3,
      fontWeight: "700",
    },

    sectionCard: {
      backgroundColor: C.white,
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,
    },

    sectionTitle: {
      color: C.black,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 12,
    },

    bioText: {
      color: C.black,
      fontSize: 14,
      lineHeight: 21,
    },

    placeholderText: {
      color: C.link,
      fontSize: 14,
      fontWeight: "700",
    },

    socialLinks: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    socialBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: C.bg,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: C.border,
    },

    socialBtnText: {
      color: C.button,
      fontSize: 13,
      fontWeight: "800",
    },

    projectCard: {
      flexDirection: "row",
      gap: 12,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 16,
      padding: 10,
      marginBottom: 10,
      backgroundColor: C.white,
    },

    projectImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: C.bg,
    },

    projectInfo: {
      flex: 1,
      justifyContent: "center",
    },

    projectTitle: {
      color: C.black,
      fontSize: 14,
      fontWeight: "900",
      marginBottom: 4,
    },

    projectDesc: {
      color: C.link,
      fontSize: 12,
      lineHeight: 17,
    },

    projectStatus: {
      color: C.button,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 4,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={styles.loadingText}>Loading user profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.placeholderText}>User profile not found.</Text>
          <TouchableOpacity style={[styles.backBtn, { marginTop: 14 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const name = userData?.name || "User";
  const email = userData?.email || "";
  const year = userData?.year || "";
  const bio = userData?.bio || "";
  const github = userData?.socialLinks?.github || "";
  const linkedin = userData?.socialLinks?.linkedin || "";
  const portfolio = userData?.socialLinks?.portfolio || "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>User Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={styles.name}>{name}</Text>

          {email ? <Text style={styles.email}>{email}</Text> : null}
          {year ? <Text style={styles.year}>Class of {year}</Text> : null}

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{projects.length}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {projects.filter((p) => String(p.status || "").toLowerCase() === "approved").length}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {bio ? (
            <Text style={styles.bioText}>{bio}</Text>
          ) : (
            <Text style={styles.placeholderText}>No bio yet</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Social Links</Text>

          {github || linkedin || portfolio ? (
            <View style={styles.socialLinks}>
              {github ? (
                <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(github)}>
                  <Ionicons name="logo-github" size={17} color={C.button} />
                  <Text style={styles.socialBtnText}>GitHub</Text>
                </TouchableOpacity>
              ) : null}

              {linkedin ? (
                <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(linkedin)}>
                  <Ionicons name="logo-linkedin" size={17} color={C.button} />
                  <Text style={styles.socialBtnText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {portfolio ? (
                <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(portfolio)}>
                  <Ionicons name="globe-outline" size={17} color={C.button} />
                  <Text style={styles.socialBtnText}>Portfolio</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <Text style={styles.placeholderText}>No social links yet</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Projects</Text>

          {projects.length === 0 ? (
            <Text style={styles.placeholderText}>No projects uploaded yet.</Text>
          ) : (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: { id: project.id },
                  })
                }
              >
                <Image
                  source={{
                    uri: project.imgUrl || project.image || FALLBACK_IMAGE,
                  }}
                  style={styles.projectImage}
                />

                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {project.title || "Untitled Project"}
                  </Text>

                  <Text style={styles.projectDesc} numberOfLines={2}>
                    {project.desc || "No description added"}
                  </Text>

                  <Text style={styles.projectStatus}>
                    {project.status || "pending"}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={C.link} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}