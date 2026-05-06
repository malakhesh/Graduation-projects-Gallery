import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { auth, db } from "../backend/firebase";
import { checkStatus, logOut } from "../backend/auth";

type TimeLeft = {
  h: number;
  m: number;
  s: number;
};

function convertSuspendedUntilToDate(value: any): Date | null {
  if (!value) return null;

  if (value?.toDate && typeof value.toDate === "function") {
    return value.toDate();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function SuspendedScreen() {
  const [loading, setLoading] = useState(true);
  const [suspendedUntil, setSuspendedUntil] = useState<any>(null);
  const [suspendReasons, setSuspendReasons] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  const suspendedUntilDate = useMemo(() => {
    return convertSuspendedUntilToDate(suspendedUntil);
  }, [suspendedUntil]);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      async (snapshot) => {
        if (!snapshot.exists()) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        const data = snapshot.data();

        if (data.status !== "suspended") {
          setLoading(false);
          router.replace("/home");
          return;
        }

        setSuspendedUntil(data.suspendedUntil ?? null);
        setSuspendReasons(
          Array.isArray(data.suspendReasons) ? data.suspendReasons : []
        );
        setLoading(false);
      },
      (error) => {
        console.log("Suspended snapshot error:", error);
        setLoading(false);
        router.replace("/login");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!suspendedUntilDate) {
      setTimeLeft(null);
      setExpired(false);
      return;
    }

    const tick = async () => {
      const diff = suspendedUntilDate.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft(null);
        setExpired(true);

        const user = auth.currentUser;

        if (user) {
          await checkStatus(user.uid);
        }

        return;
      }

      setExpired(false);

      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();

    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [suspendedUntilDate]);

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  const handleGoToLoginAfterExpired = async () => {
    await logOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.container}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="rgb(104, 68, 42)" />
            <Text style={styles.loadingText}>Checking account status...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="ban-outline" size={34} color="rgb(254, 251, 245)" />
            </View>

            <View>
              <Text style={styles.title}>Account Suspended</Text>

              <Text style={styles.subtitle}>
                You are currently suspended from using our app for violating our
                terms three times.
              </Text>
            </View>

            <View style={styles.divider} />

            <View>
              <Text style={styles.timerLabel}>
                {expired ? "Suspension ended" : "Suspension ends in"}
              </Text>

              {expired ? (
                <View style={styles.expiredBox}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="rgb(46, 125, 50)"
                  />
                  <Text style={styles.expiredText}>
                    Your suspension has ended. You can now log back in.
                  </Text>
                </View>
              ) : (
                <View style={styles.timerRow}>
                  {[
                    { value: timeLeft ? pad(timeLeft.h) : "00", label: "Hours" },
                    {
                      value: timeLeft ? pad(timeLeft.m) : "00",
                      label: "Minutes",
                    },
                    {
                      value: timeLeft ? pad(timeLeft.s) : "00",
                      label: "Seconds",
                    },
                  ].map((item) => (
                    <View key={item.label} style={styles.timeBox}>
                      <Text style={styles.timeNumber}>{item.value}</Text>
                      <Text style={styles.timeLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {suspendReasons.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Recorded violations</Text>

                <View style={styles.reasonsList}>
                  {suspendReasons.map((reason, index) => (
                    <View key={`${reason}-${index}`} style={styles.reasonCard}>
                      <View style={styles.reasonNumber}>
                        <Text style={styles.reasonNumberText}>{index + 1}</Text>
                      </View>

                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Recorded violations</Text>

                <View style={styles.reasonCard}>
                  <View style={styles.reasonNumber}>
                    <Text style={styles.reasonNumberText}>!</Text>
                  </View>

                  <Text style={styles.reasonText}>
                    No violation details available.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={expired ? handleGoToLoginAfterExpired : handleLogout}
            >
              <Text style={styles.logoutText}>
                {expired ? "Back to login" : "Log out"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#DFCDBF",
  },

  container: {
    flex: 1,
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  card: {
    width: "100%",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(164, 132, 109, 0.35)",
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 22,
    shadowColor: "rgb(47, 28, 15)",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgb(160, 40, 40)",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: "Times New Roman",
    fontSize: 24,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(164, 132, 109, 0.35)",
  },

  timerLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "rgb(164, 132, 109)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  timeBox: {
    flex: 1,
    maxWidth: 100,
    backgroundColor: "rgb(240, 234, 228)",
    borderWidth: 1,
    borderColor: "rgba(164, 132, 109, 0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },

  timeNumber: {
    fontFamily: "Times New Roman",
    fontSize: 28,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    lineHeight: 31,
  },

  timeLabel: {
    fontSize: 10,
    color: "rgb(164, 132, 109)",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  expiredBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(46, 125, 50, 0.12)",
    borderWidth: 1,
    borderColor: "rgb(46, 125, 50)",
    borderRadius: 12,
    padding: 12,
  },

  expiredText: {
    flex: 1,
    fontSize: 13,
    color: "rgb(46, 125, 50)",
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 10,
  },

  reasonsList: {
    gap: 8,
  },

  reasonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgb(240, 234, 228)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(164, 132, 109, 0.35)",
  },

  reasonNumber: {
    width: 22,
    height: 22,
    minWidth: 22,
    borderRadius: 11,
    backgroundColor: "rgb(160, 40, 40)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  reasonNumberText: {
    color: "rgb(254, 251, 245)",
    fontSize: 11,
    fontWeight: "900",
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    color: "rgb(104, 68, 42)",
    lineHeight: 20,
    fontWeight: "700",
  },

  logoutButton: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "rgb(50, 30, 15)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonPressed: {
    backgroundColor: "rgb(75, 48, 28)",
    transform: [{ scale: 0.98 }],
  },

  logoutText: {
    color: "rgb(254, 251, 245)",
    fontSize: 15,
    fontWeight: "900",
  },
});