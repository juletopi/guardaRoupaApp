import {
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
    useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

export default function Layout() {
    const [fontsLoaded, fontError] = useFonts(
        Platform.OS === "web"
            ? {}
            : {
                  Nunito_400Regular,
                  Nunito_700Bold,
                  Nunito_900Black,
              },
    );

    if (!fontsLoaded && !fontError) {
        return (
            <SafeAreaProvider>
                <View
                    style={styles.loadingRoot}
                    accessibilityLabel="Carregando"
                >
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.textLight}
                    />
                    <Text style={styles.loadingText}>Carregando…</Text>
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="light" translucent={false} />
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingRoot: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: "700",
        color: theme.colors.textLight,
        opacity: 0.9,
    },
});
