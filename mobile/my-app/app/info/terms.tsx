import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <Text style={styles.paragraph}>
          By using Graduation Projects Gallery, you agree to use the application
          responsibly and follow the rules below.
        </Text>

        <Text style={styles.sectionTitle}>User Responsibility</Text>
        <Text style={styles.paragraph}>
          Users are responsible for the content they upload, including project
          titles, descriptions, images, links, comments, and any other shared
          information.
        </Text>

        <Text style={styles.sectionTitle}>Project Ownership</Text>
        <Text style={styles.paragraph}>
          Users should only upload projects they own or have permission to share.
          Copying or claiming another student&apos;s project as your own is not
          allowed.
        </Text>

        <Text style={styles.sectionTitle}>Acceptable Use</Text>
        <Text style={styles.paragraph}>
          Users must not upload harmful, offensive, fake, misleading, or
          inappropriate content. Comments should be respectful and relevant.
        </Text>

        <Text style={styles.sectionTitle}>Content Removal</Text>
        <Text style={styles.paragraph}>
          The app team may remove reported or inappropriate content to maintain a
          safe and useful environment for all users.
        </Text>

        <Text style={styles.sectionTitle}>Changes to Terms</Text>
        <Text style={styles.paragraph}>
          These terms may be updated when needed to improve the application and
          protect users.
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