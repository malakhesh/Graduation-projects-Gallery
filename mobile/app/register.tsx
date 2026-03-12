import { router } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { regUser } from "../services/auth";

export default function RegisterScreen() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (
            !fullName.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Password and confirm password do not match.");
            return;
        }

        try {
            setLoading(true);

            const result = await regUser(
                email.trim(),
                password,
                fullName.trim(),
                "client",
                "",
                ""
            );

            if (result === "email-in-use") {
                Alert.alert("Registration Failed", "This email is already in use.");
                return;
            }

            if (result === "register-fail") {
                Alert.alert("Registration Failed", "Something went wrong. Please try again.");
                return;
            }

            Alert.alert("Success", "Account created successfully!", [
                {
                    text: "OK",
                    onPress: () => router.replace("/login"),
                },
            ]);
        } catch (error) {
            Alert.alert("Error", "Unexpected error happened during registration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Create your account to upload and explore graduation projects.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="rgb(75, 48, 28)"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

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
                                    placeholder="Create your password"
                                    placeholderTextColor="rgb(75, 48, 28)"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={password}
                                    onChangeText={setPassword}
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="rgb(75, 48, 28)"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />

                                <TouchableOpacity
                                    onPress={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    style={styles.eyeButton}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.eyeText}>
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.disabledButton]}
                            activeOpacity={0.85}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.registerButtonText}>
                                {loading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSection}>
                        <Text style={styles.bottomText}>Already have an account?</Text>
                        <TouchableOpacity
                            onPress={() => router.push("/login")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginText}> Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgb(223, 205, 192)",
    },
    scrollContent: {
        flexGrow: 1,
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
        marginTop: 20,
        marginBottom: 28,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "rgb(47, 28, 15)",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "rgb(75, 48, 28)",
        textAlign: "center",
        lineHeight: 24,
        maxWidth: 320,
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
    registerButton: {
        backgroundColor: "rgb(104, 68, 42)",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
    },
    disabledButton: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: "rgb(254, 251, 245)",
        fontSize: 17,
        fontWeight: "700",
    },
    bottomSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 26,
        marginBottom: 8,
        flexWrap: "wrap",
    },
    bottomText: {
        color: "rgb(75, 48, 28)",
        fontSize: 15,
    },
    loginText: {
        color: "rgb(104, 68, 42)",
        fontSize: 15,
        fontWeight: "700",
    },
});