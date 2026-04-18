import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const C = {
  bg: 'rgb(223, 205, 192)',
  white: 'rgb(254, 251, 245)',
  black: 'rgb(47, 28, 15)',
  link: 'rgb(164, 132, 109)',
  linkHover: 'rgb(75, 48, 28)',
  button: 'rgb(104, 68, 42)',
  buttonHover: 'rgb(75, 48, 28)',
  buttonClick: 'rgb(50, 30, 15)',
  input: 'rgb(185, 174, 167)',
};

export default function ProjectDetails() {
  const params = useLocalSearchParams();

  const techStack =
    typeof params.techStack === "string"
      ? JSON.parse(params.techStack)
      : ["React", "Node.js", "TensorFlow"];

  const project = {
    title: typeof params.title === "string" ? params.title : "AI Health App",
    year: typeof params.year === "string" ? params.year : "2024",
    description:
      typeof params.description === "string"
        ? params.description
        : "This project is about AI health monitoring system...",
    image:
      typeof params.image === "string"
        ? params.image
        : "https://via.placeholder.com/300",
    github:
      typeof params.github === "string"
        ? params.github
        : "https://github.com",
    pdf:
      typeof params.pdf === "string"
        ? params.pdf
        : "https://example.com",
    techStack,
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: project.image }} style={styles.image} />

      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.year}>{project.year}</Text>

      <View style={styles.techStack}>
        {project.techStack.map((tech: string, index: number) => (
          <View key={index} style={styles.techChip}>
            <Text style={styles.techText}>{tech}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.description}>{project.description}</Text>

      <TouchableOpacity
        onPress={() => Linking.openURL(project.github)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>View on GitHub</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(project.pdf)}
        style={[styles.button, styles.pdfButton]}
      >
        <Text style={styles.buttonText}>Open PDF</Text>
      </TouchableOpacity>

      <Text style={styles.rating}>⭐⭐⭐⭐☆</Text>

      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments:</Text>

        <View style={styles.commentBox}>
          <Text>Great project 👏</Text>
        </View>

        <View style={styles.commentBox}>
          <Text>Very useful idea 💡</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: C.bg,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: C.black,
  },
  year: {
    color: "gray",
    marginBottom: 10,
  },
  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  techChip: {
    backgroundColor: C.white,
    padding: 6,
    margin: 4,
    borderRadius: 6,
  },
  techText: {
    fontSize: 14,
    color: C.black,
  },
  description: {
    marginTop: 10,
    fontSize: 16,
    color: C.black,
  },
  button: {
    backgroundColor: C.button,
    padding: 12,
    marginTop: 15,
    borderRadius: 8,
  },
  pdfButton: {
    backgroundColor: C.link,
  },
  buttonText: {
    color: C.white,
    textAlign: "center",
  },
  rating: {
    marginTop: 15,
    fontSize: 18,
    color: "gold",
  },
  commentsSection: {
    marginTop: 15,
  },
  commentsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: C.black,
  },
  commentBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: C.input,
    borderRadius: 6,
  },
});