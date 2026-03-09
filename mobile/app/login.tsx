import { router } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }

        Alert.alert("Login", "Email/password login will be connected next.");
    };

    const handleGoogleLogin = async () => {
        Alert.alert(
            "Google Login",
            "Google login UI is ready, but the real Expo/Firebase setup is still needed."
        );
    };

    const handleGithubLogin = async () => {
        Alert.alert(
            "GitHub Login",
            "GitHub login UI is ready, but the real Expo/Firebase setup is still needed."
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.headerSection}>
                    <Text style={styles.title}>Login</Text>

                    <Text style={styles.subtitle}>
                        Sign in to continue exploring graduation projects.
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="rgb(75, 48, 28)"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>

                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
                                placeholderTextColor="rgb(75, 48, 28)"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.eyeText}>
                                    {showPassword ? "Hide" : "Show"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/forgot-password")}
                        style={styles.forgotContainer}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.85}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.socialButton}
                        activeOpacity={0.85}
                        onPress={handleGoogleLogin}
                    >
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        activeOpacity={0.85}
                        onPress={handleGithubLogin}
                    >
                        <Text style={styles.socialButtonText}>Continue with GitHub</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSection}>
                    <Text style={styles.bottomText}>Don&apos;t have an account?</Text>
                    <TouchableOpacity
                        onPress={() => router.push("/register")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerText}> Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    backButton: {
        alignSelf: "flex-start",
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 4,
    },
    backText: {
        color: "rgb(75, 48, 28)",
        fontSize: 15,
        fontWeight: "600",
    },
    headerSection: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "rgb(47, 28, 15)",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "rgb(75, 48, 28)",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: 310,
    },
    formCard: {
        backgroundColor: "rgb(254, 251, 245)",
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgb(185, 174, 167)",
        shadowColor: "rgb(47, 28, 15)",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: "700",
        color: "rgb(47, 28, 15)",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "rgb(185, 174, 167)",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 15,
        color: "rgb(47, 28, 15)",
    },
    passwordWrapper: {
        backgroundColor: "rgb(185, 174, 167)",
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 14,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 15,
        color: "rgb(47, 28, 15)",
    },
    eyeButton: {
        paddingLeft: 10,
        paddingVertical: 4,
    },
    eyeText: {
        color: "rgb(104, 68, 42)",
        fontSize: 13,
        fontWeight: "700",
    },
    forgotContainer: {
        alignSelf: "flex-end",
        marginTop: -2,
        marginBottom: 22,
    },
    forgotText: {
        color: "rgb(104, 68, 42)",
        fontSize: 14,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "rgb(104, 68, 42)",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonText: {
        color: "rgb(254, 251, 245)",
        fontSize: 17,
        fontWeight: "700",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 18,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgb(185, 174, 167)",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "rgb(104, 68, 42)",
        fontSize: 13,
        fontWeight: "600",
    },
    socialButton: {
        backgroundColor: "rgb(223, 205, 192)",
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgb(164, 132, 109)",
        marginBottom: 12,
    },
    socialButtonText: {
        color: "rgb(75, 48, 28)",
        fontSize: 15,
        fontWeight: "700",
    },
    bottomSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
        flexWrap: "wrap",
    },
    bottomText: {
        color: "rgb(75, 48, 28)",
        fontSize: 15,
    },
    registerText: {
        color: "rgb(104, 68, 42)",
        fontSize: 15,
        fontWeight: "700",
    },
});