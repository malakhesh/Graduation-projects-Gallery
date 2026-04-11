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

import { logUser } from "../backend/auth";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return alert("Fill all fields");

        setLoading(true);
        const res = await logUser(email, password);
        setLoading(false);

        if (res === "wrong-password") alert("Wrong password");
        else if (res === "no-user") alert("No user found");
        else router.replace("/Gallery");
    };

    return (
        <SafeAreaView style={styles.container}>

            <Text style={styles.title}>Login</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />

            <View style={styles.passBox}>
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    style={{ flex: 1 }}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Text style={styles.eye}>
                        {showPass ? "🙈" : "👁️"}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
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
    passBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10
    },
    eye: {
        fontSize: 18
    },
    button: {
        backgroundColor: "#5a3d2b",
        padding: 16,
        borderRadius: 12,
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700"
    }
});