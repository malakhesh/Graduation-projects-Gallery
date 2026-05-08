import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqs = [
  {
    question: "How can I upload a project?",
    answer:
      "Go to My Projects or Upload Project, fill in the project details, add images and links, then submit your project.",
  },
  {
    question: "How can I save a project?",
    answer:
      "Open any project card or project details screen and tap the bookmark icon to save it to your bookmarks.",
  },
  {
    question: "How does AI recommendation work?",
    answer:
      "The app suggests projects based on your interests, viewed projects, searched tags, and general project popularity.",
  },
  {
    question: "Can I edit my uploaded project?",
    answer:
      "Yes, you can manage and edit your uploaded projects from the My Projects section.",
  },
  {
    question: "Can I report inappropriate content?",
    answer:
      "Yes, you can report comments or projects if they contain inappropriate or incorrect content.",
  },
];

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.paragraph}>
          Here are some common questions that can help you understand how to use
          the application.
        </Text>

        {faqs.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
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
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 18,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  question: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },
});