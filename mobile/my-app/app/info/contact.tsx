import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactScreen() {
  const email = "support@graduationgallery.com";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Need Help?</Text>

        <Text style={styles.paragraph}>
          If you have any questions, feedback, or technical issues, feel free to
          contact our team. We are here to help you improve your experience.
        </Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => Linking.openURL(`mailto:${email}`)}
        >
          <View style={styles.iconBox}>
            <Feather name="mail" size={24} color="#6B4EFF" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Email Support</Text>
            <Text style={styles.cardText}>{email}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Feather name="message-circle" size={24} color="#6B4EFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Feedback</Text>
            <Text style={styles.cardText}>
              You can share your suggestions with our team to help us improve
              the app.
            </Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Response Time</Text>
          <Text style={styles.noteText}>
            Our team will review your message as soon as possible.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7FC",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: "#EEEAFE",
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },
});