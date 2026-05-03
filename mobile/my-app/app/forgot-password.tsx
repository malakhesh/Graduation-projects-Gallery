import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleResetPassword = async () => {
    setEmailError("");
    setStatusMessage("");
    setIsSuccess(false);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await resetPass(trimmedEmail);

      if (result === "reset-sent") {
        setIsSuccess(true);
        setStatusMessage("Check your email for a reset link!");
        return;
      }

      if (result === "reset-fail") {
        setIsSuccess(false);
        setStatusMessage("Could not send reset link. Please check your email.");
        return;
      }

      setIsSuccess(false);
      setStatusMessage("Something went wrong. Please try again.");
    } catch {
      setIsSuccess(false);
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>
              Enter your email to receive a reset link.
            </Text>

            <View style={styles.card}>
              {statusMessage ? (
                <View
                  style={[
                    styles.messageBox,
                    isSuccess ? styles.successBox : styles.errorBox,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isSuccess ? styles.successText : styles.errorBoxText,
                    ]}
                  >
                    {statusMessage}
                  </Text>
                </View>
              ) : null}

              {!isSuccess ? (
                <>
                  <Text style={styles.label}>Email</Text>

                  <TextInput
                    style={[styles.input, emailError ? styles.inputError : null]}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(47, 28, 15, 0.55)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    editable={!loading}
                    onChangeText={(value) => {
                      setEmail(value);
                      setEmailError("");
                      setStatusMessage("");
                    }}
                  />

                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.resetButton,
                      pressed && styles.resetButtonPressed,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="rgb(254, 251, 245)" />
                    ) : (
                      <Text style={styles.resetButtonText}>
                        Send Reset Link
                      </Text>
                    )}
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.loginButton}
                  onPress={() => router.replace("/login")}
                >
                  <Text style={styles.loginButtonText}>Back to Login</Text>
                </Pressable>
              )}
            </View>

            {!isSuccess ? (
              <Pressable
                onPress={() => router.replace("/login")}
                disabled={loading}
              >
                <Text style={styles.bottomText}>
                  Remembered it?{" "}
                  <Text style={styles.bottomLink}>Back to Login</Text>
                </Text>
              </Pressable>
            ) : null}
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
    paddingTop: 125,
    paddingBottom: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    marginBottom: 30,
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
    marginBottom: 28,
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
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 8,
  },

  inputError: {
    borderColor: "rgb(160, 40, 40)",
  },

  errorText: {
    color: "rgb(160, 40, 40)",
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 14,
    marginLeft: 4,
  },

  messageBox: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },

  successBox: {
    backgroundColor: "rgba(45, 130, 75, 0.12)",
    borderColor: "rgba(45, 130, 75, 0.32)",
  },

  errorBox: {
    backgroundColor: "rgba(180, 40, 40, 0.12)",
    borderColor: "rgba(180, 40, 40, 0.3)",
  },

  messageText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 19,
  },

  successText: {
    color: "rgb(35, 105, 60)",
  },

  errorBoxText: {
    color: "rgb(130, 25, 25)",
  },

  resetButton: {
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgb(104, 68, 42)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  resetButtonPressed: {
    backgroundColor: "rgb(50, 30, 15)",
    transform: [{ scale: 0.98 }],
  },

  resetButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgb(254, 251, 245)",
  },

  loginButton: {
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgb(104, 68, 42)",
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgb(254, 251, 245)",
  },

  disabledButton: {
    opacity: 0.7,
  },

  bottomText: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
  },

  bottomLink: {
    color: "rgb(47, 28, 15)",
    fontWeight: "900",
  },
});