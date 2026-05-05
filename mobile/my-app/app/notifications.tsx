import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { auth } from "../backend/firebase";
import {
  listenNotifs,
  markRead,
  markAllSeen,
} from "../backend/notifications";
import { useTheme } from "../context/ThemeContext";
import { Colors } from "../constants/theme";

function getNotifStyle(type: string, colors: any) {
  const lowerType = type?.toLowerCase() || "";

  if (lowerType.includes("bookmark")) {
    return {
      icon: "bookmark",
      color: colors.gold || "#f59e0b",
      label: "BOOKMARKED",
    };
  }

  if (lowerType.includes("rating") || lowerType.includes("rate")) {
    return {
      icon: "star",
      color: colors.gold || "#f59e0b",
      label: "NEW RATING",
    };
  }

  if (lowerType.includes("comment")) {
    return {
      icon: "chatbubble",
      color: colors.button,
      label: "NEW COMMENT",
    };
  }

  if (lowerType.includes("welcome")) {
    return {
      icon: "sparkles",
      color: colors.button,
      label: "WELCOME",
    };
  }

  if (lowerType.includes("warning")) {
    return {
      icon: "warning",
      color: colors.gold || "#f59e0b",
      label: "WARNING",
    };
  }

  if (lowerType.includes("danger")) {
    return {
      icon: "alert-circle",
      color: colors.error,
      label: "FINAL WARNING",
    };
  }

  if (lowerType.includes("suspended")) {
    return {
      icon: "lock-closed",
      color: colors.error,
      label: "SUSPENDED",
    };
  }

  if (lowerType.includes("info")) {
    return {
      icon: "information-circle",
      color: colors.success || "#16a34a",
      label: "INFO",
    };
  }

  return {
    icon: "notifications",
    color: colors.button,
    label: "NOTIFICATION",
  };
}

function formatTime(createdAt: any) {
  try {
    if (!createdAt) return "";

    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const C = Colors[theme];

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = listenNotifs(currentUser.uid, async (notifs: any[]) => {
      setNotifications(notifs || []);
      setLoading(false);

      await markAllSeen(currentUser.uid);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    try {
      setMarkingAll(true);

      const unreadNotifications = notifications.filter((n) => !n.read);

      await Promise.all(
        unreadNotifications.map((notif) =>
          markRead(currentUser.uid, notif.id)
        )
      );
    } catch {
      Alert.alert("Error", "Could not mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handlePressNotification = async (notif: any) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Login Required", "Please login first.");
      return;
    }

    try {
      setReadingId(notif.id);

      if (!notif.read) {
        await markRead(currentUser.uid, notif.id);
      }

      if (notif.clickable && notif.projectId) {
        router.push({
          pathname: "/project-details",
          params: {
            id: notif.projectId,
          },
        });
      }
    } catch {
      Alert.alert("Error", "Could not open notification.");
    } finally {
      setReadingId(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
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

    headerTextBox: {
      flex: 1,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: C.black,
    },

    headerSubtitle: {
      fontSize: 13,
      color: C.link,
      fontWeight: "500",
      marginTop: 2,
    },

    markAllBtn: {
      backgroundColor: C.button,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      minWidth: 92,
      alignItems: "center",
    },

    markAllText: {
      color: C.white,
      fontSize: 12,
      fontWeight: "700",
    },

    headerRightSpace: {
      width: 92,
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

    list: {
      paddingHorizontal: 16,
      gap: 12,
      paddingBottom: 30,
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 80,
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
    },

    card: {
      flexDirection: "row",
      gap: 14,
      backgroundColor: C.white,
      borderRadius: 18,
      padding: 16,
      elevation: 2,
      alignItems: "flex-start",
      shadowColor: C.black,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },

    cardUnread: {
      backgroundColor: C.white,
      borderLeftWidth: 3,
      borderLeftColor: C.button,
    },

    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },

    cardContent: {
      flex: 1,
      gap: 4,
    },

    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },

    typeText: {
      fontSize: 11,
      fontWeight: "700",
    },

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: C.button,
    },

    message: {
      fontSize: 14,
      color: C.black,
      fontWeight: "600",
      lineHeight: 20,
    },

    project: {
      fontSize: 12,
      color: C.link,
      fontWeight: "500",
    },

    time: {
      fontSize: 11,
      color: C.input,
    },

    chevron: {
      marginTop: 15,
    },
  });

  if (!auth.currentUser) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.black} />
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Notifications</Text>

          {unreadCount > 0 ? (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          ) : (
            <Text style={styles.headerSubtitle}>You're all caught up</Text>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={styles.markAllText}>Mark all read</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightSpace} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.button} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={C.input}
              />

              <Text style={styles.emptyTitle}>No notifications</Text>

              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
            </View>
          ) : (
            notifications.map((notif) => {
              const notifStyle = getNotifStyle(notif.type, C);

              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.card, !notif.read && styles.cardUnread]}
                  activeOpacity={0.85}
                  onPress={() => handlePressNotification(notif)}
                  disabled={readingId === notif.id}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor: `${notifStyle.color}20`,
                      },
                    ]}
                  >
                    {readingId === notif.id ? (
                      <ActivityIndicator size="small" color={notifStyle.color} />
                    ) : (
                      <Ionicons
                        name={notifStyle.icon as any}
                        size={22}
                        color={notifStyle.color}
                      />
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: `${notifStyle.color}20`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            {
                              color: notifStyle.color,
                            },
                          ]}
                        >
                          {notifStyle.label}
                        </Text>
                      </View>

                      {!notif.read ? <View style={styles.unreadDot} /> : null}
                    </View>

                    <Text style={styles.message}>
                      {notif.message || "New notification"}
                    </Text>

                    {notif.projectId ? (
                      <Text style={styles.project}>📁 Project notification</Text>
                    ) : null}

                    <Text style={styles.time}>
                      {formatTime(notif.createdAt)}
                    </Text>
                  </View>

                  {notif.clickable && notif.projectId ? (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={C.link}
                      style={styles.chevron}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}