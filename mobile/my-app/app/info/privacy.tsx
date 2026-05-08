import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          We respect your privacy and are committed to protecting your personal
          information while using Graduation Projects Gallery.
        </Text>

        <Text style={styles.sectionTitle}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          The app may collect basic information such as your name, email address,
          profile image, uploaded projects, bookmarks, ratings, comments, and
          activity related to project recommendations.
        </Text>

        <Text style={styles.sectionTitle}>How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to create your account, display your projects,
          improve your experience, provide bookmarks and comments, and generate
          AI-based recommendations.
        </Text>

        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={styles.paragraph}>
          We use Firebase and secure services to store and manage user data.
          However, users should avoid sharing sensitive personal information
          inside project descriptions or comments.
        </Text>

        <Text style={styles.sectionTitle}>User Content</Text>
        <Text style={styles.paragraph}>
          Projects, comments, ratings, and profile information may be visible to
          other users depending on the app features.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact
          the application team.
        </Text>
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 12,
  },
});