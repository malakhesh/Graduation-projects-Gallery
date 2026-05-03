import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { getUser } from "../backend/auth";
import { getUserProjs } from "../backend/projects";

const C = {
  bg: "rgb(223, 205, 192)",
  white: "rgb(254, 251, 245)",
  black: "rgb(47, 28, 15)",
  link: "rgb(164, 132, 109)",
  linkDark: "rgb(75, 48, 28)",
  button: "rgb(104, 68, 42)",
  input: "rgb(185, 174, 167)",
  border: "rgba(104, 68, 42, 0.15)",
  danger: "rgb(150, 55, 45)",
  success: "rgb(45, 130, 75)",
  warning: "rgb(180, 130, 40)",
};

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userData: any = await getUser(userId);

      if (
        userData === "no-data" ||
        userData === "get-fail" ||
        typeof userData === "string"
      ) {
        setUser(null);
        setProjects([]);
        return;
      }

      setUser(userData);

      const userProjects: any = await getUserProjs(userId);

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

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const openUrl = async (url: string, label: string) => {
    try {
      if (!url) {
        Alert.alert("Not Available", `${label} link is not available.`);
        return;
      }

      const finalUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      const supported = await Linking.canOpenURL(finalUrl);

      if (!supported) {
        Alert.alert("Error", `Could not open ${label} link.`);
        return;
      }

      await Linking.openURL(finalUrl);
    } catch {
      Alert.alert("Error", `Could not open ${label} link.`);
    }
  };

  const getStatusStyle = (status: string) => {
    const normalized = status?.toLowerCase();

    if (normalized === "approved") {
      return {
        bg: "rgba(45, 130, 75, 0.14)",
        color: C.success,
      };
    }

    if (normalized === "rejected") {
      return {
        bg: "rgba(150, 55, 45, 0.14)",
        color: C.danger,
      };
    }

    return {
      bg: "rgba(180, 130, 40, 0.14)",
      color: C.warning,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={C.button} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>User profile not found.</Text>

        <TouchableOpacity
          style={styles.backButtonCenter}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonCenterText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const name = user.name || "User";
  const email = user.email || "";
  const role = user.role || "Student";
  const year = user.year || "";
  const bio = user.bio || user.about || "No bio added yet.";
  const status = user.status || "active";
  const violations = user.violations || 0;

  const avatar =
    user.photoURL ||
    user.avatar ||
    user.image ||
    user.profileImage ||
    user.profilePic ||
    "";

  const linkedIn =
    user.socialLinks?.linkedin ||
    user.linkedin ||
    user.linkedIn ||
    user.linkedinUrl ||
    user.linkedInUrl ||
    user.linkedinLink ||
    user.linkedinProfile ||
    user.linkedInProfile ||
    user.linkedin_url ||
    user.linked_in ||
    user.LinkedIn ||
    "";

  const github =
    user.socialLinks?.github ||
    user.github ||
    user.githubUrl ||
    user.githubLink ||
    user.githubProfile ||
    "";

  const portfolio =
    user.socialLinks?.portfolio ||
    user.portfolio ||
    user.portfolioUrl ||
    user.website ||
    user.personalWebsite ||
    "";

  const techStack = Array.isArray(user.techStack)
    ? user.techStack
    : user.techStack
    ? [user.techStack]
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={C.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>User Profile</Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={42} color={C.button} />
              )}
            </View>

            <View style={styles.profileMainInfo}>
              <Text style={styles.name}>{name}</Text>

              {email ? (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={15} color={C.link} />
                  <Text style={styles.infoText}>{email}</Text>
                </View>
              ) : null}

              {year ? (
                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={15} color={C.link} />
                  <Text style={styles.infoText}>Class of {year}</Text>
                </View>
              ) : null}

              <View style={styles.badgesRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{role}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    status === "suspended" && styles.statusBadgeDanger,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === "suspended" && styles.statusTextDanger,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.bioText}>{bio}</Text>

          {violations > 0 ? (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={16} color={C.danger} />
              <Text style={styles.warningText}>
                {violations} violation{violations === 1 ? "" : "s"} recorded
              </Text>
            </View>
          ) : null}

          {(linkedIn || github || portfolio) ? (
            <View style={styles.socialRow}>
              {linkedIn ? (
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.85}
                  onPress={() => openUrl(linkedIn, "LinkedIn")}
                >
                  <Ionicons name="logo-linkedin" size={16} color={C.button} />
                  <Text style={styles.socialText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {github ? (
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.85}
                  onPress={() => openUrl(github, "GitHub")}
                >
                  <Ionicons name="logo-github" size={16} color={C.button} />
                  <Text style={styles.socialText}>GitHub</Text>
                </TouchableOpacity>
              ) : null}

              {portfolio ? (
                <TouchableOpacity
                  style={styles.socialButton}
                  activeOpacity={0.85}
                  onPress={() => openUrl(portfolio, "Portfolio")}
                >
                  <Ionicons name="globe-outline" size={16} color={C.button} />
                  <Text style={styles.socialText}>Portfolio</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {techStack.length > 0 ? (
            <View style={styles.stackRow}>
              {techStack.map((item: string, index: number) => (
                <View key={index} style={styles.stackChip}>
                  <Text style={styles.stackText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Projects</Text>

          <View style={styles.sectionCountBox}>
            <Text style={styles.sectionCount}>{projects.length}</Text>
          </View>
        </View>

        {projects.length > 0 ? (
          projects.map((project) => {
            const stack = Array.isArray(project.stack) ? project.stack : [];
            const statusStyle = getStatusStyle(project.status || "pending");

            const ratings = Array.isArray(project.ratings)
              ? project.ratings
              : [];

            const avgRating =
              ratings.length > 0
                ? (
                    ratings.reduce(
                      (sum: number, rate: number) => sum + Number(rate || 0),
                      0
                    ) / ratings.length
                  ).toFixed(1)
                : "0.0";

            return (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/project-details",
                    params: {
                      id: project.id,
                    },
                  })
                }
              >
                {project.imgUrl ? (
                  <Image
                    source={{ uri: project.imgUrl }}
                    style={styles.projectImage}
                  />
                ) : (
                  <View style={styles.projectImageFallback}>
                    <Ionicons name="folder-outline" size={24} color={C.button} />
                  </View>
                )}

                <View style={styles.projectInfo}>
                  <View style={styles.projectTitleRow}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {project.title || "Untitled Project"}
                    </Text>

                    <View
                      style={[
                        styles.projectStatusBadge,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.projectStatusText,
                          { color: statusStyle.color },
                        ]}
                      >
                        {project.status || "pending"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.projectDesc} numberOfLines={2}>
                    {project.desc || "No description added"}
                  </Text>

                  <View style={styles.projectMetaRow}>
                    {project.category ? (
                      <Text style={styles.projectMeta}>{project.category}</Text>
                    ) : null}

                    {project.year ? (
                      <Text style={styles.projectMeta}>{project.year}</Text>
                    ) : null}

                    <Text style={styles.projectMeta}>⭐ {avgRating}</Text>
                  </View>

                  {stack.length > 0 ? (
                    <View style={styles.projectStackRow}>
                      {stack.slice(0, 3).map((item: string, index: number) => (
                        <View key={index} style={styles.projectStackChip}>
                          <Text style={styles.projectStackText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={18} color={C.link} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyProjects}>
            <Ionicons name="folder-open-outline" size={42} color={C.link} />
            <Text style={styles.emptyProjectsText}>No projects found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  center: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 12,
    color: C.black,
    fontSize: 14,
    fontWeight: "700",
  },

  errorText: {
    color: C.black,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
  },

  backButtonCenter: {
    backgroundColor: C.button,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },

  backButtonCenterText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
  },

  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: C.black,
    fontSize: 20,
    fontWeight: "900",
  },

  headerSpace: {
    width: 40,
  },

  profileCard: {
    backgroundColor: C.white,
    marginHorizontal: 18,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.black,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(223, 205, 192, 0.6)",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  profileMainInfo: {
    flex: 1,
    alignItems: "flex-start",
  },

  name: {
    color: C.black,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "left",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  infoText: {
    color: C.link,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
    flexShrink: 1,
  },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },

  roleBadge: {
    backgroundColor: "rgba(164, 132, 109, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 7,
    marginBottom: 6,
  },

  roleText: {
    color: C.button,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  statusBadge: {
    backgroundColor: "rgba(45, 130, 75, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginBottom: 6,
  },

  statusBadgeDanger: {
    backgroundColor: "rgba(150, 55, 45, 0.12)",
  },

  statusText: {
    color: C.success,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  statusTextDanger: {
    color: C.danger,
  },

  bioText: {
    color: C.black,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "left",
    marginTop: 16,
  },

  warningBox: {
    marginTop: 14,
    backgroundColor: "rgba(150, 55, 45, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(150, 55, 45, 0.18)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  warningText: {
    color: C.danger,
    fontSize: 12.5,
    fontWeight: "800",
    marginLeft: 7,
  },

  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },

  socialButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: C.white,
  },

  socialText: {
    color: C.button,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 6,
  },

  stackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 8,
  },

  stackChip: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 7,
    marginBottom: 7,
  },

  stackText: {
    color: C.black,
    fontSize: 12.5,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    color: C.black,
    fontSize: 18,
    fontWeight: "900",
  },

  sectionCountBox: {
    backgroundColor: C.button,
    minWidth: 30,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
  },

  sectionCount: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
  },

  projectCard: {
    backgroundColor: C.white,
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  projectImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: C.input,
  },

  projectImageFallback: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(223, 205, 192, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  projectInfo: {
    flex: 1,
  },

  projectTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  projectTitle: {
    color: C.black,
    fontSize: 14.5,
    fontWeight: "900",
    flex: 1,
    marginRight: 6,
  },

  projectStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9,
  },

  projectStatusText: {
    fontSize: 9.5,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  projectDesc: {
    color: C.link,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 6,
  },

  projectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },

  projectMeta: {
    color: C.linkDark,
    fontSize: 11.5,
    fontWeight: "800",
    marginRight: 8,
    marginBottom: 3,
  },

  projectStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  projectStackChip: {
    backgroundColor: "rgba(223, 205, 192, 0.45)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 9,
    marginRight: 5,
    marginBottom: 4,
  },

  projectStackText: {
    color: C.black,
    fontSize: 10.5,
    fontWeight: "700",
  },

  emptyProjects: {
    marginHorizontal: 18,
    backgroundColor: "rgba(254, 251, 245, 0.6)",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  emptyProjectsText: {
    color: C.link,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },
});