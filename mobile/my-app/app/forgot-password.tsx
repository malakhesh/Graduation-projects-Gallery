import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { resetPass } from "../backend/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleResetPassword = async () => {
    setEmailError("");
    setGeneralError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPass(cleanEmail);

      if (result === "reset-sent") {
        Alert.alert(
          "Check Your Email",
          "A reset link has been sent to your email."
        );

        router.push("/login");
        return;
      }

      if (result === "reset-fail") {
        setGeneralError(
          "Could not send reset link. Please make sure this email is registered."
        );
        return;
      }

      setGeneralError("Something went wrong. Please try again.");
    } catch (error) {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{generalError}</Text>
                </View>
              ) : null}

              <Text style={styles.title}>Forgot Password</Text>

              <Text style={styles.subtitle}>
                Enter your email to receive a reset link.
              </Text>

              <Text style={styles.label}>Email</Text>

              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Enter your email"
                placeholderTextColor="rgba(47, 28, 15, 0.55)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError("");
                  setGeneralError("");
                }}
              />

              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.sendButtonPressed,
                  loading && styles.disabledButton,
                ]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="rgb(254, 251, 245)" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Reset Link</Text>
                )}
              </Pressable>

              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.loginText}>
                  Remember your password?{" "}
                  <Text style={styles.loginLink}>Login</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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

  backButton: {
    position: "absolute",
    top: 48,
    left: 28,
    zIndex: 10,
  },

  backText: {
    fontSize: 15,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "100%",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 28,
    padding: 24,
    shadowColor: "rgb(47, 28, 15)",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  errorBox: {
    backgroundColor: "rgba(180, 40, 40, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(180, 40, 40, 0.3)",
    borderRadius: 14,
    padding: 11,
    marginBottom: 15,
  },

  errorBoxText: {
    color: "rgb(130, 25, 25)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 9,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgb(104, 68, 42)",
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 9,
  },

  input: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgb(185, 174, 167)",
    paddingHorizontal: 20,
    fontSize: 14.5,
    color: "rgb(47, 28, 15)",
    marginBottom: 8,
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: "rgb(160, 40, 40)",
  },

  errorText: {
    color: "rgb(160, 40, 40)",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 17,
    marginLeft: 4,
  },

  sendButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgb(104, 68, 42)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 8,
  },

  sendButtonPressed: {
    backgroundColor: "rgb(50, 30, 15)",
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.7,
  },

  sendButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "rgb(254, 251, 245)",
  },

  loginText: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
  },

  loginLink: {
    color: "rgb(47, 28, 15)",
    fontWeight: "900",
  },
});