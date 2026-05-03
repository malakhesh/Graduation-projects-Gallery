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

import { logUser } from "../backend/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
  };

  const validateForm = () => {
    let isValid = true;

    clearErrors();

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setGeneralError("");

      const result = await logUser(email.trim().toLowerCase(), password);

      if (result === "no-user") {
        setEmailError("This email is not registered.");
        return;
      }

      if (result === "wrong-password") {
        setPasswordError("Incorrect password.");
        return;
      }

      if (result === "login-fail") {
        setGeneralError("Login failed. Please try again.");
        return;
      }

      if (typeof result === "string") {
        setGeneralError("Email or password is incorrect.");
        return;
      }

      router.replace("/home");
    } catch (error) {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Google Login",
      "Google login is not connected yet for mobile."
    );
  };

  const handleGithubLogin = () => {
    Alert.alert(
      "GitHub Login",
      "GitHub login is not connected yet for mobile."
    );
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
            <Text style={styles.title}>Login</Text>

            <Text style={styles.subtitle}>
              Sign in to continue exploring graduation projects.
            </Text>

            <View style={styles.card}>
              {generalError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{generalError}</Text>
                </View>
              ) : null}

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

              <Text style={styles.label}>Password</Text>

              <View
                style={[
                  styles.passwordContainer,
                  passwordError ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(47, 28, 15, 0.55)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setPasswordError("");
                    setGeneralError("");
                  }}
                />

                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <Pressable
                style={styles.forgotButton}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                  loading && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="rgb(254, 251, 245)" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </Pressable>

              <Text style={styles.orText}>Or Login With</Text>

              <View style={styles.socialRow}>
                <Pressable
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                >
                  <Text style={styles.socialText}>Google</Text>
                </Pressable>

                <Pressable
                  style={styles.socialButtonDark}
                  onPress={handleGithubLogin}
                >
                  <Text style={styles.socialTextLight}>GitHub</Text>
                </Pressable>
              </View>
            </View>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.registerText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.registerLink}>Create Account</Text>
              </Text>
            </Pressable>
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
    fontSize: 17,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 105,
    paddingBottom: 45,
    alignItems: "center",
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 27,
    color: "rgb(47, 28, 15)",
    textAlign: "center",
    marginBottom: 34,
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
    marginBottom: 30,
  },

  errorBox: {
    backgroundColor: "rgba(180, 40, 40, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(180, 40, 40, 0.3)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },

  errorBoxText: {
    color: "rgb(130, 25, 25)",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgb(47, 28, 15)",
    marginBottom: 10,
  },

  input: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgb(185, 174, 167)",
    paddingHorizontal: 20,
    fontSize: 15,
    color: "rgb(47, 28, 15)",
    marginBottom: 8,
  },

  passwordContainer: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgb(185, 174, 167)",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "rgb(47, 28, 15)",
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: "rgb(160, 40, 40)",
  },

  errorText: {
    color: "rgb(160, 40, 40)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
    marginLeft: 4,
  },

  showText: {
    fontSize: 14,
    fontWeight: "900",
    color: "rgb(104, 68, 42)",
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 22,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: "900",
    color: "rgb(75, 48, 28)",
  },

  loginButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgb(104, 68, 42)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  loginButtonPressed: {
    backgroundColor: "rgb(50, 30, 15)",
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "rgb(254, 251, 245)",
  },

  orText: {
    fontSize: 14,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
    marginBottom: 14,
  },

  socialRow: {
    flexDirection: "row",
    gap: 12,
  },

  socialButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgb(254, 251, 245)",
    borderWidth: 1,
    borderColor: "rgba(104, 68, 42, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  socialButtonDark: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgb(47, 28, 15)",
    alignItems: "center",
    justifyContent: "center",
  },

  socialText: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgb(47, 28, 15)",
  },

  socialTextLight: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgb(254, 251, 245)",
  },

  registerText: {
    fontSize: 15,
    color: "rgb(104, 68, 42)",
    textAlign: "center",
  },

  registerLink: {
    color: "rgb(47, 28, 15)",
    fontWeight: "900",
  },
});