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
import { resetPass } from "../services/auth";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert("Missing Email", "Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            await resetPass(email.trim());

            Alert.alert(
                "Reset Email Sent",
                "A password reset link has been sent to your email.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/login"),
                    },
                ]
            );
        } catch (error: any) {
            if (error.code === "auth/user-not-found") {
                Alert.alert("Error", "No account found with this email.");
            } else if (error.code === "auth/invalid-email") {
                Alert.alert("Error", "Please enter a valid email address.");
            } else {
                Alert.alert("Error", "Could not send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
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
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email and we’ll send you a link to reset your password.
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

                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.disabledButton]}
                        activeOpacity={0.85}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSection}>
                    <Text style={styles.bottomText}>Remember your password?</Text>
                    <TouchableOpacity
                        onPress={() => router.push("/login")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginText}> Login</Text>
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
        marginTop: 40,
        marginBottom: 30,
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
    resetButton: {
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
    resetButtonText: {
        color: "rgb(254, 251, 245)",
        fontSize: 17,
        fontWeight: "700",
    },
    bottomSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 26,
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