import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { regUser } from "../backend/auth";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const clearErrors = () => {
    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");
  };

  const handleRegister = async () => {
    let isValid = true;

    clearErrors();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const rawPassword = password;
    const rawConfirmPassword = confirmPassword;

    if (!trimmedFullName) {
      setFullNameError("Please enter your full name.");
      isValid = false;
    } else if (trimmedFullName.length < 3) {
      setFullNameError("Full name must be at least 3 characters.");
      isValid = false;
    }

    if (!trimmedEmail) {
      setEmailError("Please enter your email.");
      isValid = false;
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!rawPassword) {
      setPasswordError("Please create your password.");
      isValid = false;
    } else if (rawPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!rawConfirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (rawPassword !== rawConfirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);
      setGeneralError("");

      const result: any = await regUser(
        trimmedEmail,
        rawPassword,
        trimmedFullName,
        "student",
        "2024",
        "frontend"
      );

      if (result === "email-in-use") {
        setGeneralError("This email is already in use.");
        return;
      }

      if (result === "register-fail") {
        setGeneralError("Registration failed. Please try again.");
        return;
      }

      if (typeof result === "string") {
        setGeneralError("Could not create your account. Please try again.");
        return;
      }

      router.replace("/home");
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F5ECE4", "#DFCDBF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Create your account to upload and explore graduation projects.
            </Text>

            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{generalError}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="rgba(47, 28, 15, 0.55)"
                value={fullName}
                editable={!loading}
                onChangeText={(text) => {
                  setFullName(text);
                  setFullNameError("");
                  setGeneralError("");
                }}
                style={[
                  styles.input,
                  fullNameError ? styles.inputErrorBorder : null,
                ]}
              />

              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="rgba(47, 28, 15, 0.55)"
                value={email}
                editable={!loading}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                  setGeneralError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  emailError ? styles.inputErrorBorder : null,
                ]}
              />

              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <Text style={styles.label}>Password</Text>

              <View
                style={[
                  styles.passwordWrapper,
                  passwordError ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  placeholder="Create your password"
                  placeholderTextColor="rgba(47, 28, 15, 0.55)"
                  value={password}
                  editable={!loading}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                    setConfirmPasswordError("");
                    setGeneralError("");
                  }}
                  secureTextEntry={!showPass}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  disabled={loading}
                >
                  <Text style={styles.showText}>
                    {showPass ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <Text style={styles.label}>Confirm Password</Text>

              <View
                style={[
                  styles.passwordWrapper,
                  confirmPasswordError ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(47, 28, 15, 0.55)"
                  value={confirmPassword}
                  editable={!loading}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError("");
                    setGeneralError("");
                  }}
                  secureTextEntry={!showConfirm}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  disabled={loading}
                >
                  <Text style={styles.showText}>
                    {showConfirm ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="rgb(254, 251, 245)" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account? </Text>

              <TouchableOpacity
                onPress={() => router.push("/login")}
                disabled={loading}
              >
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
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

  gradient: {
    flex: 1,
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
    color: "rgb(47, 28, 15)",
    fontSize: 15,
    fontWeight: "800",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 108,
    paddingBottom: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14.5,
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 28,
    paddingHorizontal: 4,
  },

  card: {
    width: "100%",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 28,
    padding: 22,
    shadowColor: "rgb(47, 28, 15)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },

  label: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    width: "100%",
    height: 53,
    backgroundColor: "rgb(185, 174, 167)",
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 14.5,
    color: "rgb(47, 28, 15)",
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  passwordWrapper: {
    width: "100%",
    height: 53,
    backgroundColor: "rgb(185, 174, 167)",
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  passwordInput: {
    flex: 1,
    fontSize: 14.5,
    color: "rgb(47, 28, 15)",
  },

  showText: {
    color: "rgb(75, 48, 28)",
    fontSize: 13.5,
    fontWeight: "900",
    marginLeft: 10,
  },

  button: {
    height: 54,
    backgroundColor: "rgb(104, 68, 42)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.8,
  },

  buttonText: {
    color: "rgb(254, 251, 245)",
    fontSize: 16,
    fontWeight: "900",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 8,
  },

  bottomText: {
    color: "rgb(104, 68, 42)",
    fontSize: 14,
    fontWeight: "500",
  },

  loginText: {
    color: "rgb(47, 28, 15)",
    fontSize: 14,
    fontWeight: "900",
  },

  errorText: {
    color: "rgb(160, 40, 40)",
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 5,
    marginLeft: 4,
  },

  errorBox: {
    backgroundColor: "rgba(180, 40, 40, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(180, 40, 40, 0.3)",
    borderRadius: 14,
    padding: 11,
    marginBottom: 14,
  },

  errorBoxText: {
    color: "rgb(130, 25, 25)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  inputErrorBorder: {
    borderColor: "rgb(160, 40, 40)",
  },
});