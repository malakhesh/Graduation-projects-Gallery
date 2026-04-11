import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const C = {
  bg: 'rgb(223, 205, 192)',        // Main background color
  white: 'rgb(254, 251, 245)',     // White color
  black: 'rgb(47, 28, 15)',        // Black color
  link: 'rgb(164, 132, 109)',      // Link color
  linkHover: 'rgb(75, 48, 28)',    // Link hover color
  button: 'rgb(104, 68, 42)',      // Button color
  buttonHover: 'rgb(75, 48, 28)',  // Button hover color
  buttonClick: 'rgb(50, 30, 15)',  // Button click color
  input: 'rgb(185, 174, 167)',     // Input fields background
};

export default function ProjectDetails() {
  const params = useLocalSearchParams();

  const project = {
    title: params.title || "AI Health App",
    year: params.year || "2024",
    description: params.description || "This project is about AI health monitoring system...",
    image: params.image || "https://via.placeholder.com/300",
    github: "https://github.com",
    pdf: "https://example.com",
    techStack: ["React", "Node.js", "TensorFlow"]
  };

  return (
    <ScrollView style={styles.container}>

      <Image
        source={{
          uri: typeof project.image === "string" ? project.image : "https://via.placeholder.com/300"
        }}
        style={styles.image}
      />

      <Text style={styles.title}>{project.title}</Text>

      <Text style={styles.year}>{project.year}</Text>

      {/* Tech Stack */}
      <View style={styles.techStack}>
        {project.techStack.map((tech, index) => (
          <View key={index} style={styles.techChip}>
            <Text style={styles.techText}>{tech}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.description}>{project.description}</Text>

      {/* Buttons */}
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

      {/* Rating */}
      <Text style={styles.rating}>⭐⭐⭐⭐☆</Text>

      {/* Comments */}
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
