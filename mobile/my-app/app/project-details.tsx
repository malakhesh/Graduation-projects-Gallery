import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Share,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Feather, Ionicons } from "@expo/vector-icons";

import { auth } from "../backend/firebase";
import {
  getUser,
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../backend/auth";
import {
  getProj,
  addComment,
  addRate,
  removeComment,
} from "../backend/projects";
import { addReport } from "../backend/reports";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

export default function ProjectDetails() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRating, setSelectedRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  const [ratingLoading, setRatingLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<number | null>(
    null
  );

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [projectReportReason, setProjectReportReason] = useState("");
  const [projectReportLoading, setProjectReportLoading] = useState(false);

  const [commentReportModalVisible, setCommentReportModalVisible] =
    useState(false);
  const [commentReportReason, setCommentReportReason] = useState("");
  const [commentReportLoading, setCommentReportLoading] = useState(false);
  const [selectedCommentToReport, setSelectedCommentToReport] =
    useState<any>(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<
    number | null
  >(null);

  const fetchProject = async () => {
    setLoading(true);
    setError("");

    if (!id) {
      setError("No project ID");
      setLoading(false);
      return;
    }

    const data = await getProj(id);

    if (data === "no-proj") {
      setError("Project not found");
      setLoading(false);
      return;
    }

    if (data === "get-fail") {
      setError("Failed to fetch project");
      setLoading(false);
      return;
    }

    const projectData: any = data;
    setProject(projectData);

    if (projectData.userId) {
      const userData: any = await getUser(projectData.userId);

      if (
        userData !== "no-data" &&
        userData !== "get-fail" &&
        typeof userData !== "string"
      ) {
        setOwner(userData);
      } else {
        setOwner(null);
      }
    } else {
      setOwner(null);
    }

    const currentUid = auth.currentUser?.uid;

    if (
      currentUid &&
      projectData.userRatings &&
      projectData.userRatings[currentUid]
    ) {
      setSelectedRating(projectData.userRatings[currentUid]);
    } else {
      setSelectedRating(0);
    }

    if (currentUid && id) {
      const bookmarks = await getBookmarks(currentUid);

      if (Array.isArray(bookmarks)) {
        setIsBookmarked(bookmarks.includes(id));
      } else {
        setIsBookmarked(false);
      }
    } else {
      setIsBookmarked(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCopyLink = async () => {
    const linkToCopy = project?.gitLink || `Project: ${project?.title || ""}`;

    try {
      await Clipboard.setStringAsync(linkToCopy);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      Alert.alert("Error", "Could not copy link.");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: project?.gitLink
          ? `${project.title}\n${project.gitLink}`
          : `${project?.title || "Project"}`,
      });
    } catch {
      Alert.alert("Error", "Could not share project.");
    }
  };

  const handleBookmark = async () => {
    if (!id) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to save this project.");
      return;
    }

    try {
      setBookmarkLoading(true);

      const result = isBookmarked
        ? await removeBookmark(currentUser.uid, id)
        : await addBookmark(currentUser.uid, id);

      if (result === "bookmark-added") {
        setIsBookmarked(true);
      } else if (result === "bookmark-removed") {
        setIsBookmarked(false);
      } else {
        Alert.alert("Error", "Could not update bookmark.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleOpenProjectReport = () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to report this project.");
      return;
    }

    setProjectReportReason("");
    setReportModalVisible(true);
  };

  const handleSubmitProjectReport = async () => {
    if (!id) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to report this project.");
      return;
    }

    if (!projectReportReason.trim()) {
      Alert.alert("Reason Required", "Please write the report reason.");
      return;
    }

    try {
      setProjectReportLoading(true);

      const reason = `Project report: ${projectReportReason.trim()}`;
      const result = await addReport(id, currentUser.uid, reason);

      if (result === "report-added") {
        setReportModalVisible(false);
        setProjectReportReason("");

        Alert.alert(
          "Report Sent",
          "Your project report has been submitted for review."
        );
        return;
      }

      Alert.alert("Error", "Could not submit report. Please try again.");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setProjectReportLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!id) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to rate this project.");
      return;
    }

    if (selectedRating === 0) {
      Alert.alert("Rating Required", "Please choose a rating first.");
      return;
    }

    try {
      setRatingLoading(true);

      const result = await addRate(id, selectedRating, currentUser.uid);

      if (result === "rate-ok") {
        await fetchProject();
        Alert.alert("Done", "Your rating has been submitted.");
      } else {
        Alert.alert("Error", "Could not submit rating.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!id) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to comment.");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Comment Required", "Please write your comment first.");
      return;
    }

    try {
      setCommentLoading(true);

      let userName = currentUser.email || "User";

      const userData: any = await getUser(currentUser.uid);

      if (
        userData !== "no-data" &&
        userData !== "get-fail" &&
        typeof userData !== "string" &&
        userData.name
      ) {
        userName = userData.name;
      }

      const newComment = {
        userId: currentUser.uid,
        userName,
        text: commentText.trim(),
        date: new Date().toLocaleDateString(),
      };

      const result = await addComment(id, newComment);

      if (result === "comment-ok") {
        setCommentText("");
        await fetchProject();
      } else {
        Alert.alert("Error", "Could not submit comment.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (comment: any, commentIndex: number) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    if (!id) {
      Alert.alert("Error", "Project ID not found.");
      return;
    }

    if (comment.userId !== currentUser.uid) {
      Alert.alert("Not Allowed", "You can only delete your own comments.");
      return;
    }

    Alert.alert("Delete Comment", "Are you sure you want to delete this comment?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleteCommentLoading(commentIndex);

            const result = await removeComment(id, comment);

            if (result === "comment-removed") {
              await fetchProject();
              return;
            }

            Alert.alert("Error", "Could not delete comment. Please try again.");
          } catch {
            Alert.alert("Error", "Something went wrong. Please try again.");
          } finally {
            setDeleteCommentLoading(null);
          }
        },
      },
    ]);
  };

  const handleOpenCommentReport = (comment: any, commentIndex: number) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to report a comment.");
      return;
    }

    if (comment.userId === currentUser.uid) {
      Alert.alert("Not Allowed", "You cannot report your own comment.");
      return;
    }

    setSelectedCommentToReport(comment);
    setSelectedCommentIndex(commentIndex);
    setCommentReportReason("");
    setCommentReportModalVisible(true);
  };

  const handleSubmitCommentReport = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first to report a comment.");
      return;
    }

    if (!id) {
      Alert.alert("Error", "Project ID not found.");
      return;
    }

    if (!selectedCommentToReport || selectedCommentIndex === null) {
      Alert.alert("Error", "Comment not found.");
      return;
    }

    if (!commentReportReason.trim()) {
      Alert.alert("Reason Required", "Please write the report reason.");
      return;
    }

    try {
      setCommentReportLoading(true);

      const encodedProjectId = `${id}_comment_${selectedCommentIndex}`;

      const reason = `Comment report: ${commentReportReason.trim()} | Comment by ${
        selectedCommentToReport.userName || "Anonymous"
      }: ${selectedCommentToReport.text || ""}`;

      const result = await addReport(encodedProjectId, currentUser.uid, reason);

      if (result === "report-added") {
        setCommentReportModalVisible(false);
        setCommentReportReason("");
        setSelectedCommentToReport(null);
        setSelectedCommentIndex(null);

        Alert.alert(
          "Report Sent",
          "Your comment report has been submitted for review."
        );

        return;
      }

      Alert.alert("Error", "Could not submit report. Please try again.");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setCommentReportLoading(false);
    }
  };

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
      fontSize: 14,
      color: C.black,
      fontWeight: "700",
    },

    errorMessage: {
      fontSize: 16,
      fontWeight: "800",
      color: C.black,
      marginBottom: 16,
      textAlign: "center",
    },

    errorBackButton: {
      backgroundColor: C.button,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 14,
    },

    errorBackButtonText: {
      color: C.white,
      fontSize: 14,
      fontWeight: "900",
    },

    coverWrapper: {
      width: "100%",
      height: 230,
      position: "relative",
      backgroundColor: C.bg,
    },

    coverImage: {
      width: "100%",
      height: "100%",
    },

    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(47, 28, 15, 0.18)",
    },

    topActionsRow: {
      position: "absolute",
      top: 14,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    copyLinkPill: {
      height: 33,
      backgroundColor: "rgba(47, 28, 15, 0.82)",
      borderRadius: 18,
      paddingHorizontal: 12,
      marginRight: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    copyLinkText: {
      color: C.white,
      fontSize: 12,
      fontWeight: "800",
      marginLeft: 6,
      textTransform: "lowercase",
    },

    reportProjectPill: {
      height: 33,
      backgroundColor: C.error,
      borderRadius: 18,
      paddingHorizontal: 11,
      marginRight: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    reportProjectText: {
      color: C.white,
      fontSize: 12,
      fontWeight: "800",
      marginLeft: 5,
    },

    topIconButton: {
      width: 33,
      height: 33,
      borderRadius: 16.5,
      backgroundColor: "rgba(254, 251, 245, 0.95)",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 7,
    },

    coverContent: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },

    coverTitle: {
      color: C.white,
      fontSize: 27,
      fontWeight: "900",
      marginBottom: 10,
    },

    coverBadgesRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },

    coverBadge: {
      backgroundColor: "rgba(254, 251, 245, 0.20)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 6,
    },

    coverBadgeText: {
      color: C.white,
      fontSize: 11.5,
      fontWeight: "800",
    },

    card: {
      backgroundColor: C.white,
      marginHorizontal: 18,
      marginTop: -14,
      marginBottom: 24,
      borderRadius: 22,
      padding: 16,
      shadowColor: C.black,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
    },

    ownerBox: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },

    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(223, 205, 192, 0.35)",
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    avatarText: {
      color: C.button,
      fontSize: 16,
      fontWeight: "900",
    },

    ownerInfo: {
      flex: 1,
    },

    ownerName: {
      color: C.black,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 2,
    },

    ownerYear: {
      color: C.link,
      fontSize: 12,
      fontWeight: "700",
    },

    ownerEmail: {
      color: C.link,
      fontSize: 11.5,
      marginTop: 2,
      opacity: 0.7,
    },

    profileLink: {
      color: C.link,
      fontSize: 12.5,
      fontWeight: "800",
    },

    description: {
      color: C.black,
      fontSize: 14.5,
      lineHeight: 22,
      marginBottom: 15,
    },

    stackRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },

    stackChip: {
      backgroundColor: C.bg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 16,
      paddingHorizontal: 13,
      paddingVertical: 8,
      marginRight: 8,
      marginBottom: 8,
    },

    stackChipText: {
      color: C.black,
      fontSize: 13,
      fontWeight: "700",
    },

    emptyText: {
      color: C.link,
      fontSize: 13,
      fontWeight: "700",
    },

    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },

    githubButton: {
      height: 42,
      backgroundColor: C.button,
      borderRadius: 21,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    githubButtonText: {
      color: C.white,
      fontSize: 13.5,
      fontWeight: "900",
      marginLeft: 7,
    },

    smallBookmarkButton: {
      width: 44,
      height: 42,
      borderRadius: 21,
      backgroundColor: C.black,
      alignItems: "center",
      justifyContent: "center",
    },

    smallBookmarkButtonActive: {
      backgroundColor: C.button,
    },

    ratingSection: {
      marginBottom: 16,
    },

    sectionTitle: {
      color: C.black,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 10,
    },

    rateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },

    submitRatingButton: {
      backgroundColor: C.chip,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 9,
      minWidth: 82,
      alignItems: "center",
    },

    submitRatingText: {
      color: C.button,
      fontSize: 13,
      fontWeight: "900",
    },

    ratingCountText: {
      color: C.button,
      fontSize: 13.5,
      fontWeight: "900",
    },

    divider: {
      height: 1,
      backgroundColor: C.border,
      marginBottom: 16,
    },

    commentsSection: {
      marginBottom: 4,
    },

    commentInput: {
      minHeight: 96,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      backgroundColor: C.bg,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: C.black,
      textAlignVertical: "top",
      marginBottom: 12,
    },

    commentButton: {
      alignSelf: "flex-end",
      backgroundColor: C.button,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginBottom: 16,
    },

    commentButtonText: {
      color: C.white,
      fontSize: 12.8,
      fontWeight: "900",
    },

    commentCard: {
      backgroundColor: C.chip,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },

    commentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },

    commentUser: {
      color: C.black,
      fontSize: 14.2,
      fontWeight: "900",
      flex: 1,
      marginRight: 8,
    },

    commentActions: {
      flexDirection: "row",
      alignItems: "center",
    },

    commentDate: {
      color: C.link,
      fontSize: 11,
      marginRight: 6,
    },

    deleteCommentButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(150, 55, 45, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },

    reportCommentButton: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(254, 251, 245, 0.75)",
      alignItems: "center",
      justifyContent: "center",
    },

    commentBody: {
      color: C.black,
      fontSize: 13.8,
      lineHeight: 20,
    },

    noCommentsCard: {
      backgroundColor: C.chip,
      borderRadius: 16,
      padding: 14,
    },

    noCommentsText: {
      color: C.link,
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(47, 28, 15, 0.35)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },

    reportModal: {
      width: "100%",
      backgroundColor: C.white,
      borderRadius: 18,
      padding: 18,
    },

    reportModalTitle: {
      color: C.black,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 8,
    },

    reportModalSubtitle: {
      color: C.link,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 14,
    },

    reportReasonInput: {
      minHeight: 105,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: C.black,
      textAlignVertical: "top",
      backgroundColor: C.bg,
      marginBottom: 16,
    },

    reportModalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },

    cancelReportButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
    },

    cancelReportText: {
      color: C.link,
      fontSize: 13,
      fontWeight: "800",
    },

    submitReportButton: {
      backgroundColor: C.error,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      minWidth: 120,
      alignItems: "center",
    },

    submitReportText: {
      color: C.white,
      fontSize: 13,
      fontWeight: "900",
    },

    disabledButton: {
      opacity: 0.65,
    },
  });

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorMessage}>{error}</Text>

        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading || !project) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={C.button} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </SafeAreaView>
    );
  }

  const ownerName = owner?.name || "Project Owner";
  const ownerEmail = owner?.email || "";
  const ownerYear = owner?.year || project.year || "";

  const stack = Array.isArray(project.stack) ? project.stack : [];
  const comments = Array.isArray(project.comments) ? project.comments : [];
  const ratings = Array.isArray(project.ratings) ? project.ratings : [];

  const ratingCount = ratings.length;
  const averageRating =
    ratingCount > 0
      ? (
          ratings.reduce((sum: number, r: number) => sum + Number(r || 0), 0) /
          ratingCount
        ).toFixed(1)
      : "0.0";

  const currentUid = auth.currentUser?.uid;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: project.imgUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          <View style={styles.coverOverlay} />

          <View style={styles.topActionsRow}>
            <TouchableOpacity
              style={styles.copyLinkPill}
              activeOpacity={0.85}
              onPress={handleCopyLink}
            >
              <Feather name="link-2" size={13} color={C.white} />
              <Text style={styles.copyLinkText}>
                {copied ? "link copied" : "copy link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportProjectPill}
              activeOpacity={0.85}
              onPress={handleOpenProjectReport}
            >
              <Ionicons name="flag-outline" size={14} color={C.white} />
              <Text style={styles.reportProjectText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topIconButton}
              activeOpacity={0.85}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={18} color={C.black} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topIconButton}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={18} color={C.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.coverContent}>
            <Text style={styles.coverTitle}>{project.title}</Text>

            <View style={styles.coverBadgesRow}>
              {project.category ? (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>{project.category}</Text>
                </View>
              ) : null}

              {project.type ? (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>{project.type}</Text>
                </View>
              ) : null}

              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>
                  ⭐ {averageRating} ({ratingCount} rating
                  {ratingCount === 1 ? "" : "s"})
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.ownerBox}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {ownerName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{ownerName}</Text>

              {ownerYear ? (
                <Text style={styles.ownerYear}>{ownerYear}</Text>
              ) : null}

              {ownerEmail ? (
                <Text style={styles.ownerEmail}>{ownerEmail}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!project?.userId) {
                  Alert.alert("Error", "User profile not found.");
                  return;
                }

                router.push({
                  pathname: "/user-profile",
                  params: {
                    userId: project.userId,
                  },
                });
              }}
            >
              <Text style={styles.profileLink}>View profile →</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            {project.desc || "No description added"}
          </Text>

          <View style={styles.stackRow}>
            {stack.length > 0 ? (
              stack.map((item: string, index: number) => (
                <View key={index} style={styles.stackChip}>
                  <Text style={styles.stackChipText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No tech stack added</Text>
            )}
          </View>

          <View style={styles.actionButtonsRow}>
            {project.gitLink ? (
              <TouchableOpacity
                style={styles.githubButton}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(project.gitLink)}
              >
                <Ionicons name="logo-github" size={15} color={C.white} />
                <Text style={styles.githubButtonText}>View on GitHub</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.smallBookmarkButton,
                isBookmarked && styles.smallBookmarkButtonActive,
              ]}
              activeOpacity={0.85}
              onPress={handleBookmark}
              disabled={bookmarkLoading}
            >
              {bookmarkLoading ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={C.white}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Rate this project</Text>

            <View style={styles.rateRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.8}
                    onPress={() => setSelectedRating(star)}
                  >
                    <Ionicons
                      name={selectedRating >= star ? "star" : "star-outline"}
                      size={23}
                      color={C.link}
                      style={{ marginRight: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitRatingButton,
                  ratingLoading && styles.disabledButton,
                ]}
                activeOpacity={0.85}
                onPress={handleSubmitRating}
                disabled={ratingLoading}
              >
                {ratingLoading ? (
                  <ActivityIndicator size="small" color={C.link} />
                ) : (
                  <Text style={styles.submitRatingText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.ratingCountText}>⭐ {ratingCount} Ratings</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments:</Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts on this project..."
              placeholderTextColor={C.link}
              multiline
              value={commentText}
              onChangeText={setCommentText}
            />

            <TouchableOpacity
              style={[
                styles.commentButton,
                commentLoading && styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={handleSubmitComment}
              disabled={commentLoading}
            >
              {commentLoading ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={styles.commentButtonText}>Post Comment</Text>
              )}
            </TouchableOpacity>

            {comments.length > 0 ? (
              comments.map((item: any, index: number) => {
                const isMyComment = item.userId === currentUid;

                return (
                  <View key={index} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>
                        {item.userName || "Anonymous"}
                      </Text>

                      <View style={styles.commentActions}>
                        <Text style={styles.commentDate}>{item.date || ""}</Text>

                        {isMyComment ? (
                          <TouchableOpacity
                            style={styles.deleteCommentButton}
                            activeOpacity={0.8}
                            onPress={() => handleDeleteComment(item, index)}
                            disabled={deleteCommentLoading === index}
                          >
                            {deleteCommentLoading === index ? (
                              <ActivityIndicator size="small" color={C.error} />
                            ) : (
                              <Ionicons
                                name="trash-outline"
                                size={14}
                                color={C.error}
                              />
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.reportCommentButton}
                            activeOpacity={0.8}
                            onPress={() => handleOpenCommentReport(item, index)}
                          >
                            <Ionicons
                              name="flag-outline"
                              size={14}
                              color={C.link}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <Text style={styles.commentBody}>{item.text || ""}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noCommentsCard}>
                <Text style={styles.noCommentsText}>No comments yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={commentReportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportModalTitle}>Report Comment</Text>

            <Text style={styles.reportModalSubtitle}>
              Describe the issue and an admin will review it.
            </Text>

            <TextInput
              style={styles.reportReasonInput}
              placeholder="What's wrong with this?"
              placeholderTextColor={C.link}
              multiline
              value={commentReportReason}
              onChangeText={setCommentReportReason}
            />

            <View style={styles.reportModalActions}>
              <TouchableOpacity
                style={styles.cancelReportButton}
                onPress={() => {
                  setCommentReportModalVisible(false);
                  setCommentReportReason("");
                  setSelectedCommentToReport(null);
                  setSelectedCommentIndex(null);
                }}
                disabled={commentReportLoading}
              >
                <Text style={styles.cancelReportText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitReportButton,
                  commentReportLoading && styles.disabledButton,
                ]}
                onPress={handleSubmitCommentReport}
                disabled={commentReportLoading}
              >
                {commentReportLoading ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.submitReportText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportModalTitle}>Report Project</Text>

            <Text style={styles.reportModalSubtitle}>
              Describe the issue and an admin will review it.
            </Text>

            <TextInput
              style={styles.reportReasonInput}
              placeholder="What's wrong with this project?"
              placeholderTextColor={C.link}
              multiline
              value={projectReportReason}
              onChangeText={setProjectReportReason}
            />

            <View style={styles.reportModalActions}>
              <TouchableOpacity
                style={styles.cancelReportButton}
                onPress={() => setReportModalVisible(false)}
                disabled={projectReportLoading}
              >
                <Text style={styles.cancelReportText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitReportButton,
                  projectReportLoading && styles.disabledButton,
                ]}
                onPress={handleSubmitProjectReport}
                disabled={projectReportLoading}
              >
                {projectReportLoading ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Text style={styles.submitReportText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}