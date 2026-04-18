import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getProj } from "../backend/projects";

const C = {
  bg: "rgb(223, 205, 192)",
  white: "rgb(254, 251, 245)",
  black: "rgb(47, 28, 15)",
  link: "rgb(164, 132, 109)",
  button: "rgb(104, 68, 42)",
  input: "rgb(185, 174, 167)",
};

export default function ProjectDetails() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);

      if (!id) {
        setError("No project ID");
        setLoading(false);
        return;
      }

      const data = await getProj(id);

      if (data === "no-proj") {
        setError("Project not found");
      } else if (data === "get-fail") {
        setError("Failed to fetch project");
      } else {
        setProject(data);
      }

      setLoading(false);
    };

    fetchProject();
  }, [id]);

  // ⛔ Error UI
  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  // ⏳ Loading UI
  if (loading || !project) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* IMAGE */}
        <Image source={{ uri: project.imgUrl }} style={styles.image} />

        {/* TITLE */}
        <Text style={styles.title}>{project.title}</Text>

        {/* YEAR */}
        <Text style={styles.year}>{project.year}</Text>

        {/* TECH STACK */}
        <View style={styles.techStack}>
          {project.stack?.map((tech: string, index: number) => (
            <View key={index} style={styles.techChip}>
              <Text style={styles.techText}>{tech}</Text>
            </View>
          ))}
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.description}>{project.desc}</Text>

        {/* GITHUB */}
        {project.gitLink && (
          <TouchableOpacity
            onPress={() => Linking.openURL(project.gitLink)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>View on GitHub</Text>
          </TouchableOpacity>
        )}

        {/* PDF */}
        {project.pdf && (
          <TouchableOpacity
            onPress={() => Linking.openURL(project.pdf)}
            style={[styles.button, styles.pdfButton]}
          >
            <Text style={styles.buttonText}>Open PDF</Text>
          </TouchableOpacity>
        )}

        {/* RATINGS */}
        <Text style={styles.rating}>
          ⭐ {project.ratings?.length || 0} Ratings
        </Text>

        {/* COMMENTS */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments:</Text>

          {project.comments?.length > 0 ? (
            project.comments.map((c: any, i: number) => (
              <View key={i} style={styles.commentBox}>
                <Text style={styles.commentUser}>
                  {c.userName}
                </Text>

                <Text style={styles.commentText}>
                  {c.text}
                </Text>

                <Text style={styles.commentDate}>
                  {c.date}
                </Text>
              </View>
            ))
          ) : (
            <Text>No comments yet</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 220,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    paddingHorizontal: 16,
    color: C.black,
  },

  year: {
    paddingHorizontal: 16,
    color: "gray",
  },

  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 10,
  },

  techChip: {
    backgroundColor: C.white,
    padding: 6,
    margin: 4,
    borderRadius: 6,
  },

  techText: {
    color: C.black,
  },

  description: {
    paddingHorizontal: 16,
    marginTop: 10,
    fontSize: 16,
    color: C.black,
  },

  button: {
    backgroundColor: C.button,
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },

  pdfButton: {
    backgroundColor: C.link,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
  },

  rating: {
    paddingHorizontal: 16,
    marginTop: 10,
    color: "gold",
  },

  commentsSection: {
    padding: 16,
  },

  commentsTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  commentBox: {
    backgroundColor: C.input,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  commentUser: {
    fontWeight: "bold",
  },

  commentText: {
    marginTop: 2,
  },

  commentDate: {
    fontSize: 10,
    color: "gray",
    marginTop: 4,
  },
});