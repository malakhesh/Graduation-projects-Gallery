import { router } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
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

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword)
            return alert("Fill all fields");

        if (password !== confirmPassword)
            return alert("Passwords do not match");

        setLoading(true);

        const res = await regUser(email, password, fullName, "student", "2024", "frontend");

        setLoading(false);

        if (res === "email-in-use") alert("Email already used");
        else router.replace("/Gallery");
    };

    return (
        <SafeAreaView style={styles.container}>

            <Text style={styles.title}>Create Account</Text>

            <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
            />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                style={styles.input}
            />

            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "rgb(223,205,192)"
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 20
    },
    input: {
        backgroundColor: "#eee",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10
    },
    button: {
        backgroundColor: "#5a3d2b",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 5
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700"
    }
});