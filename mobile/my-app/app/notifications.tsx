import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "BOOKMARKED", message: "Salma Anter bookmarked your project", project: "Smart Home System", time: "2 minutes ago", read: false, icon: "bookmark", color: "#f59e0b" },
  { id: "2", type: "NEW RATING", message: "Salma Anter rated your project 5/5", project: "AI Study Assistant", time: "1 hour ago", read: false, icon: "star", color: "#f59e0b" },
  { id: "3", type: "NEW COMMENT", message: 'Salma Anter commented: "This is amazing!"', project: "Smart Home System", time: "3 hours ago", read: true, icon: "chatbubble", color: "rgb(104, 68, 42)" },
  { id: "4", type: "NEW RATING", message: "Salma Anter rated your project 4/5", project: "Fitness Tracking App", time: "1 day ago", read: true, icon: "star", color: "#f59e0b" },
  { id: "5", type: "BOOKMARKED", message: "Salma Anter bookmarked your project", project: "AI Study Assistant", time: "2 days ago", read: true, icon: "bookmark", color: "#f59e0b" },
  { id: "6", type: "NEW COMMENT", message: 'Salma Anter commented: "Great work!"', project: "Fitness Tracking App", time: "3 days ago", read: true, icon: "chatbubble", color: "rgb(104, 68, 42)" },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="rgb(47, 28, 15)" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="rgb(185, 174, 167)" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.card, !notif.read && styles.cardUnread]}
              activeOpacity={0.85}
              onPress={() => markRead(notif.id)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: notif.color + "20" }]}>
                <Ionicons name={notif.icon as any} size={22} color={notif.color} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: notif.color + "20" }]}>
                    <Text style={[styles.typeText, { color: notif.color }]}>{notif.type}</Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message}>{notif.message}</Text>
                <Text style={styles.project}>📁 {notif.project}</Text>
                <Text style={styles.time}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgb(240, 234, 228)" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgb(254, 251, 245)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "rgb(47, 28, 15)" },
  headerSubtitle: { fontSize: 13, color: "rgb(164, 132, 109)", fontWeight: "500" },
  markAllBtn: { backgroundColor: "rgb(104, 68, 42)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  markAllText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 30 },
  emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgb(92, 64, 51)" },
  emptySubtitle: { fontSize: 14, color: "rgb(164, 132, 109)" },
  card: { flexDirection: "row", gap: 14, backgroundColor: "#fff", borderRadius: 18, padding: 16, elevation: 2 },
  cardUnread: { backgroundColor: "rgb(254, 251, 245)", borderLeftWidth: 3, borderLeftColor: "rgb(104, 68, 42)" },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1, gap: 4 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: "700" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgb(104, 68, 42)" },
  message: { fontSize: 14, color: "rgb(47, 28, 15)", fontWeight: "600", lineHeight: 20 },
  project: { fontSize: 12, color: "rgb(164, 132, 109)", fontWeight: "500" },
  time: { fontSize: 11, color: "rgb(185, 174, 167)" },
});
