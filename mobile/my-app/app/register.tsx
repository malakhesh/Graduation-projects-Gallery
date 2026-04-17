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

  const handleRegister = async () => {
    let isValid = true;

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFullName) {
      setFullNameError("Please enter your full name");
      isValid = false;
    }

    if (!trimmedEmail) {
      setEmailError("Please enter your email");
      isValid = false;
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!trimmedPassword) {
      setPasswordError("Please create your password");
      isValid = false;
    } else if (trimmedPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (!trimmedConfirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);

      const res = await regUser(
        trimmedEmail,
        trimmedPassword,
        trimmedFullName,
        "student",
        "2024",
        "frontend"
      );

      setLoading(false);

      if (res === "email-in-use") {
        setGeneralError("This email is already in use");
        return;
      }

      router.replace("/home");
    } catch (error) {
      setLoading(false);
      setGeneralError("Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Create your account to upload and explore graduation projects.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              placeholderTextColor="rgb(95, 78, 66)"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (fullNameError) setFullNameError("");
                if (generalError) setGeneralError("");
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
              placeholderTextColor="rgb(95, 78, 66)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
                if (generalError) setGeneralError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, emailError ? styles.inputErrorBorder : null]}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordWrapper,
                passwordError ? styles.inputErrorBorder : null,
              ]}
            >
              <TextInput
                placeholder="Create your password"
                placeholderTextColor="rgb(95, 78, 66)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                  if (confirmPasswordError) setConfirmPasswordError("");
                  if (generalError) setGeneralError("");
                }}
                secureTextEntry={!showPass}
                style={styles.passwordInput}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Text style={styles.showText}>{showPass ? "Hide" : "Show"}</Text>
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
                placeholderTextColor="rgb(95, 78, 66)"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError("");
                  if (generalError) setGeneralError("");
                }}
                secureTextEntry={!showConfirm}
                style={styles.passwordInput}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.showText}>
                  {showConfirm ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            ) : null}

            {generalError ? (
              <Text style={[styles.errorText, { marginTop: 8 }]}>
                {generalError}
              </Text>
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
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgb(223, 205, 192)",
  },
  container: {
    flex: 1,
    backgroundColor: "rgb(223, 205, 192)",
  },
  backButton: {
    marginTop: 8,
    marginLeft: 16,
  },
  backText: {
    color: "rgb(47, 28, 15)",
    fontSize: 18,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  card: {
    width: "100%",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgb(47, 28, 15)",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: "100%",
    backgroundColor: "rgb(185, 174, 167)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "rgb(47, 28, 15)",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  passwordWrapper: {
    width: "100%",
    backgroundColor: "rgb(185, 174, 167)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "rgb(47, 28, 15)",
  },
  showText: {
    color: "rgb(75, 48, 28)",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  button: {
    backgroundColor: "rgb(104, 68, 42)",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: "rgb(254, 251, 245)",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  bottomText: {
    color: "rgb(104, 68, 42)",
    fontSize: 16,
    fontWeight: "500",
  },
  loginText: {
    color: "rgb(75, 48, 28)",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#b3261e",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 4,
  },
  inputErrorBorder: {
    borderColor: "#b3261e",
  },
});