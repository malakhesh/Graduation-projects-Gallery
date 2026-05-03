import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.container}>
        <View style={styles.softCircleOne} />
        <View style={styles.softCircleTwo} />

        <View style={styles.content}>
          <Image
            source={require("../assets/images/index.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.title}>Explore Graduation Projects</Text>

          <Text style={styles.subtitle}>
            Discover, browse, and save inspiring graduation projects in one
            organized gallery.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </Pressable>
        </View>
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
    position: "relative",
  },

  softCircleOne: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(254, 251, 245, 0.45)",
  },

  softCircleTwo: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(254, 251, 245, 0.28)",
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 310,
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
    marginBottom: 38,
    paddingHorizontal: 6,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgb(104, 68, 42)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "rgb(47, 28, 15)",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  primaryButtonPressed: {
    backgroundColor: "rgb(50, 30, 15)",
    transform: [{ scale: 0.98 }],
  },

  primaryButtonText: {
    color: "rgb(254, 251, 245)",
    fontSize: 18,
    fontWeight: "800",
  },

  loginText: {
    fontSize: 15,
    color: "rgb(104, 68, 42)",
  },

  loginLink: {
    color: "rgb(47, 28, 15)",
    fontWeight: "900",
  },
});