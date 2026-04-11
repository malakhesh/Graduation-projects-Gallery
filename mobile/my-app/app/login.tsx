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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { logUser } from "../backend/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleLogin = async () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setEmailError("Please enter your email");
      isValid = false;
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!trimmedPassword) {
      setPasswordError("Please enter your password");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);

      const res = await logUser(trimmedEmail, trimmedPassword);

      setLoading(false);

      if (res === "wrong-password") {
        setGeneralError("Wrong password");
        return;
      }

      if (res === "no-user") {
        setGeneralError("No user found with this email");
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
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Sign in to continue exploring graduation projects.
          </Text>

          <View style={styles.card}>
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
              style={[
                styles.input,
                emailError ? styles.inputErrorBorder : null,
              ]}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
            <View
              style={[
                styles.passwordWrapper,
                passwordError ? styles.inputErrorBorder : null,
              ]}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="rgb(95, 78, 66)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
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

            <TouchableOpacity
              style={styles.forgotWrapper}
              onPress={() => {
                // غيري المسار ده لو عندك صفحة forgot password
                // router.push("/forgot-password");
                Alert.alert("Forgot Password", "Add your forgot password screen route here.");
              }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {generalError ? (
              <Text style={[styles.errorText, { marginBottom: 12 }]}>
                {generalError}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="rgb(254, 251, 245)" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                // غيري المسار ده لو صفحة الريجستر عندك اسمها مختلف
                router.push("/register");
              }}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
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
    paddingTop: 70,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 26,
    paddingHorizontal: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "rgb(254, 251, 245)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 28,
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
    marginBottom: 10,
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
  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 14,
    marginBottom: 24,
  },
  forgotText: {
    color: "rgb(75, 48, 28)",
    fontSize: 15,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "rgb(104, 68, 42)",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 28,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  bottomText: {
    color: "rgb(47, 28, 15)",
    fontSize: 16,
  },
  createAccountText: {
    color: "rgb(75, 48, 28)",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#b3261e",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  inputErrorBorder: {
    borderColor: "#b3261e",
  },
});