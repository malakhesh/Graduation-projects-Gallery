import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconBox}>
          <Feather name="grid" size={34} color="#6B4EFF" />
        </View>

        <Text style={styles.title}>Graduation Projects Gallery</Text>

        <Text style={styles.paragraph}>
          Graduation Projects Gallery is a mobile application designed to help
          students explore, upload, save, and interact with graduation projects
          in an easy and organized way.
        </Text>

        <Text style={styles.paragraph}>
          The app allows users to browse projects, view project details,
          bookmark their favorite projects, rate projects, add comments, and get
          AI-based recommendations based on their interests and activity.
        </Text>

        <Text style={styles.paragraph}>
          Our goal is to make graduation projects more accessible, useful, and
          inspiring for students, supervisors, and anyone interested in academic
          project ideas.
        </Text>

        <Text style={styles.sectionTitle}>Main Features</Text>

        <Text style={styles.bullet}>• Browse graduation projects</Text>
        <Text style={styles.bullet}>• View project details</Text>
        <Text style={styles.bullet}>• Save projects to bookmarks</Text>
        <Text style={styles.bullet}>• Upload and manage your projects</Text>
        <Text style={styles.bullet}>• Rate and comment on projects</Text>
        <Text style={styles.bullet}>• Get AI recommendations</Text>
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
    backgroundColor: "#F8F7FC",
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
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginTop: 10,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 25,
    color: "#444",
    marginBottom: 6,
  },
});