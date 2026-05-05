import * as Font from "expo-font";
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
    // Font custom Croogla
    const [customFontsLoaded, setCustomFontsLoaded] = React.useState(false);

    React.useEffect(() => {
        if (Platform.OS !== "web") {
            Font.loadAsync({
                "Croogla-ExtraLight": require("../assets/fonts/croogla-extralight.otf"),
                "Croogla-Light": require("../assets/fonts/croogla-light.otf"),
                "Croogla-Regular": require("../assets/fonts/croogla-regular.otf"),
                "Croogla-Medium": require("../assets/fonts/croogla-medium.otf"),
                "Croogla-Bold": require("../assets/fonts/croogla-bold.otf"),
            })
                .then(() => setCustomFontsLoaded(true))
                .catch((err) => {
                    console.error("Erro ao carregar fontes:", err);
                    setCustomFontsLoaded(true); // Prossegue o app mesmo sem as fontes
                });
        } else {
            setCustomFontsLoaded(true);
        }
    }, []);

    if (!customFontsLoaded) {
        return (
            <SafeAreaProvider>
                <View
                    style={styles.loadingRoot}
                    accessibilityLabel="Carregando fontes"
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
        fontFamily: theme.fonts.bold,
        fontSize: 15,
        color: theme.colors.textLight,
        opacity: 0.9,
    },
});
