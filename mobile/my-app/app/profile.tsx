import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { auth } from "../backend/firebase";
import { getUser, updateUser, checkStatus } from "../backend/auth";
import { getUserProjs } from "../backend/projects";

const C = {
  bg: "rgb(240, 234, 228)",
  white: "rgb(254, 251, 245)",
  black: "rgb(47, 28, 15)",
  brown: "rgb(104, 68, 42)",
  link: "rgb(164, 132, 109)",
  input: "rgb(185, 174, 167)",
  danger: "#c0392b",
  success: "#2e7d32",
};

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [projectCount, setProjectCount] = useState(0);
  const [violations, setViolations] = useState(0);

  const [bio, setBio] = useState("");
  const [year, setYear] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [tempBio, setTempBio] = useState("");
  const [tempYear, setTempYear] = useState("");
  const [tempGithub, setTempGithub] = useState("");
  const [tempLinkedin, setTempLinkedin] = useState("");
  const [tempPortfolio, setTempPortfolio] = useState("");

  const fetchProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const data = await getUser(user.uid);

      if (data && data !== "no-data" && data !== "get-fail") {
        setProfileData(data);

        setBio(data.bio || "");
        setYear(data.year ? String(data.year) : "");
        setGithub(data.socialLinks?.github || "");
        setLinkedin(data.socialLinks?.linkedin || "");
        setPortfolio(data.socialLinks?.portfolio || "");
      }

      const projects = await getUserProjs(user.uid);

      if (Array.isArray(projects)) {
        setProjectCount(projects.length);
      } else {
        setProjectCount(0);
      }

      const status = await checkStatus(user.uid);

      if (status && typeof status === "object" && status.violations) {
        setViolations(status.violations);
      } else {
        setViolations(0);
      }
    } catch {
      Alert.alert("Error", "Could not load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleEdit = () => {
    setTempBio(bio);
    setTempYear(year);
    setTempGithub(github);
    setTempLinkedin(linkedin);
    setTempPortfolio(portfolio);
    setSaveError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
  };

  const handleConfirm = async () => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const result = await updateUser(user.uid, {
        bio: tempBio,
        year: tempYear,
        socialLinks: {
          github: tempGithub,
          linkedin: tempLinkedin,
          portfolio: tempPortfolio,
        },
      });

      if (result === "update-fail") {
        setSaveError("Failed to save. Please try again.");
        return;
      }

      setBio(tempBio);
      setYear(tempYear);
      setGithub(tempGithub);
      setLinkedin(tempLinkedin);
      setPortfolio(tempPortfolio);

      setProfileData((prev: any) => ({
        ...prev,
        bio: tempBio,
        year: tempYear,
        socialLinks: {
          github: tempGithub,
          linkedin: tempLinkedin,
          portfolio: tempPortfolio,
        },
      }));

      setEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openLink = async (url: string) => {
    if (!url) return;

    const finalUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    try {
      const supported = await Linking.canOpenURL(finalUrl);

      if (supported) {
        await Linking.openURL(finalUrl);
      } else {
        Alert.alert("Invalid URL", "This link cannot be opened.");
      }
    } catch {
      Alert.alert("Error", "Could not open this link.");
    }
  };

  const user = auth.currentUser;
  const displayName = user?.displayName || profileData?.name || "User";
  const email = user?.email || profileData?.email || "";
  const avatarSrc = user?.photoURL || null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.brown} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.black} />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <Ionicons name="school" size={24} color={C.brown} />

          <View>
            <Text style={styles.logoBold}>Graduation</Text>
            <Text style={styles.logoLight}>Gallery</Text>
          </View>
        </View>

        <View style={styles.navIconBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topLinks}>
          <TouchableOpacity
            style={styles.topLink}
            onPress={() => router.push("/my-projects")}
          >
            <Ionicons name="folder-open-outline" size={17} color={C.brown} />
            <Text style={styles.topLinkText}>My Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.topLink, styles.topLinkActive]}>
            <Ionicons name="person-outline" size={17} color="#fff" />
            <Text style={[styles.topLinkText, styles.topLinkTextActive]}>
              My Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topLink}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings-outline" size={17} color={C.brown} />
            <Text style={styles.topLinkText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardActions}>
            {!editing ? (
              <TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
                <Ionicons name="pencil" size={18} color={C.brown} />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.iconBtn, styles.saveIconBtn]}
                  onPress={handleConfirm}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtn, styles.cancelIconBtn]}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.avatarWrapper}>
            {avatarSrc ? (
              <Image source={{ uri: avatarSrc }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={58} color={C.brown} />
              </View>
            )}

            {editing && (
              <TouchableOpacity
                style={styles.avatarEditBtn}
                onPress={() =>
                  Alert.alert(
                    "Change Photo",
                    "Photo upload is not connected yet."
                  )
                }
              >
                <Ionicons name="camera" size={17} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.divider} />

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={20} color={C.brown} />
              <Text style={styles.detailText}>{email || "No email"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={20} color={C.brown} />

              {editing ? (
                <TextInput
                  style={styles.inlineInput}
                  placeholder="Graduation year e.g. 2025"
                  placeholderTextColor={C.link}
                  value={tempYear}
                  onChangeText={setTempYear}
                  maxLength={4}
                  keyboardType="number-pad"
                />
              ) : year ? (
                <Text style={styles.detailText}>Class of {year}</Text>
              ) : (
                <Text style={styles.placeholderText}>
                  No graduation year specified
                </Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="git-branch-outline" size={20} color={C.brown} />
              <Text style={styles.detailText}>
                {projectCount} project{projectCount !== 1 ? "s" : ""} uploaded
              </Text>
            </View>

            {violations > 0 && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={C.link}
                />
                <Text style={[styles.detailText, { color: C.link }]}>
                  {violations} violation{violations !== 1 ? "s" : ""} recorded
                </Text>
              </View>
            )}
          </View>

          {editing ? (
            <TextInput
              style={styles.textarea}
              placeholder="Write a short bio about yourself..."
              placeholderTextColor={C.link}
              value={tempBio}
              onChangeText={setTempBio}
              maxLength={300}
              multiline
              textAlignVertical="top"
            />
          ) : bio ? (
            <View style={styles.bioBox}>
<Ionicons name="chatbubble-ellipses-outline" size={20} color={C.brown} />              <Text style={styles.bioText}>{bio}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>No bio yet</Text>
          )}

          {editing ? (
            <View style={styles.socialInputs}>
              <View style={styles.socialInputRow}>
                <Ionicons name="logo-github" size={20} color={C.brown} />
                <TextInput
                  style={styles.socialInput}
                  placeholder="GitHub URL"
                  placeholderTextColor={C.link}
                  value={tempGithub}
                  onChangeText={setTempGithub}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.socialInputRow}>
                <Ionicons name="logo-linkedin" size={20} color={C.brown} />
                <TextInput
                  style={styles.socialInput}
                  placeholder="LinkedIn URL"
                  placeholderTextColor={C.link}
                  value={tempLinkedin}
                  onChangeText={setTempLinkedin}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.socialInputRow}>
                <Ionicons name="globe-outline" size={20} color={C.brown} />
                <TextInput
                  style={styles.socialInput}
                  placeholder="Portfolio URL"
                  placeholderTextColor={C.link}
                  value={tempPortfolio}
                  onChangeText={setTempPortfolio}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ) : github || linkedin || portfolio ? (
            <View style={styles.socialLinks}>
              {github ? (
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => openLink(github)}
                >
                  <Ionicons name="logo-github" size={17} color={C.brown} />
                  <Text style={styles.socialBtnText}>GitHub</Text>
                </TouchableOpacity>
              ) : null}

              {linkedin ? (
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => openLink(linkedin)}
                >
                  <Ionicons name="logo-linkedin" size={17} color={C.brown} />
                  <Text style={styles.socialBtnText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {portfolio ? (
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => openLink(portfolio)}
                >
                  <Ionicons name="globe-outline" size={17} color={C.brown} />
                  <Text style={styles.socialBtnText}>Portfolio</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <Text style={styles.placeholderText}>No social links yet</Text>
          )}

          {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 14,
    fontWeight: "700",
  },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoBold: {
    fontSize: 17,
    fontWeight: "800",
    color: C.black,
    lineHeight: 19,
  },

  logoLight: {
    fontSize: 13,
    color: C.brown,
    lineHeight: 15,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  topLinks: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  topLink: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.input,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  topLinkActive: {
    backgroundColor: C.brown,
    borderColor: C.brown,
  },

  topLinkText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.brown,
  },

  topLinkTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 28,
    padding: 18,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  cardActions: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },

  editActions: {
    flexDirection: "row",
    gap: 8,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgb(243, 232, 220)",
    alignItems: "center",
    justifyContent: "center",
  },

  saveIconBtn: {
    backgroundColor: C.success,
  },

  cancelIconBtn: {
    backgroundColor: C.danger,
  },

  avatarWrapper: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 14,
    position: "relative",
  },

  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },

  avatarPlaceholder: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgb(243, 232, 220)",
    borderWidth: 3,
    borderColor: C.brown,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarEditBtn: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.brown,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.white,
  },

  name: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: C.black,
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "rgb(235, 225, 215)",
    marginBottom: 14,
  },

  details: {
    gap: 12,
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  detailText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.black,
  },

  placeholderText: {
    fontSize: 14,
    color: C.link,
    fontWeight: "600",
    marginVertical: 8,
  },

  inlineInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.input,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: C.black,
    fontSize: 14,
  },

  textarea: {
    minHeight: 95,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.input,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: C.black,
    fontSize: 14,
    marginBottom: 14,
  },

  bioBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgb(243, 232, 220)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  bioText: {
    flex: 1,
    color: C.black,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  socialInputs: {
    gap: 10,
  },

  socialInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.input,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  socialInput: {
    flex: 1,
    color: C.black,
    fontSize: 14,
  },

  socialLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },

  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgb(243, 232, 220)",
    borderWidth: 1,
    borderColor: C.input,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  socialBtnText: {
    color: C.brown,
    fontSize: 13,
    fontWeight: "800",
  },

  errorText: {
    color: C.danger,
    fontSize: 13,
    marginTop: 12,
    fontWeight: "700",
  },
});