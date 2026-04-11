import { router } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";

export default function LandingScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topSection}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>CS Projects Portal</Text>
                    </View>

                    <Text style={styles.title}>Graduation Projects Gallery</Text>

                    <Text style={styles.description}>
                        Explore innovative graduation projects from Computer Science students
                        and discover inspiring ideas from previous years.
                    </Text>
                </View>

                <View style={styles.buttonsSection}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => { }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.primaryButtonText}>Browse Projects</Text>
                    </TouchableOpacity>

                    <View style={styles.rowButtons}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/login")}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryButtonText}>Login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/register")}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.secondaryButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.footerText}>
                    Search projects by technology, year, and category.
                </Text>
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
        paddingBottom: 28,
        justifyContent: "center",
    },
    topSection: {
        alignItems: "center",
        marginBottom: 34,
    },
    badge: {
        backgroundColor: "rgb(254, 251, 245)",
        borderWidth: 1,
        borderColor: "rgb(164, 132, 109)",
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 22,
    },
    badgeText: {
        color: "rgb(104, 68, 42)",
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.4,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "rgb(47, 28, 15)",
        textAlign: "center",
        lineHeight: 34,
        marginBottom: 16,
        maxWidth: 330,
    },
    description: {
        fontSize: 17,
        color: "rgb(75, 48, 28)",
        textAlign: "center",
        lineHeight: 27,
        paddingHorizontal: 8,
        maxWidth: 340,
    },
    buttonsSection: {
        marginTop: 12,
    },
    primaryButton: {
        width: "100%",
        backgroundColor: "rgb(104, 68, 42)",
        paddingVertical: 17,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: "rgb(47, 28, 15)",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    primaryButtonText: {
        color: "rgb(254, 251, 245)",
        fontSize: 17,
        fontWeight: "700",
    },
    rowButtons: {
        flexDirection: "row",
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "rgb(254, 251, 245)",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgb(164, 132, 109)",
    },
    secondaryButtonText: {
        color: "rgb(104, 68, 42)",
        fontSize: 16,
        fontWeight: "700",
    },
    footerText: {
        textAlign: "center",
        color: "rgb(75, 48, 28)",
        fontSize: 13,
        lineHeight: 20,
        marginTop: 24,
        paddingHorizontal: 18,
    },
});