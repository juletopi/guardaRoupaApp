import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    useFonts,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export default function Layout() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_700Bold,
        Nunito_900Black,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingRoot} accessibilityLabel="Carregando">
                <ActivityIndicator
                    size="large"
                    color={theme.colors.textLight}
                />
                <Text style={styles.loadingText}>Carregando…</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }} />
        </>
    );
}

const styles = StyleSheet.create({
    loadingRoot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textLight,
        opacity: 0.9,
    },
});
