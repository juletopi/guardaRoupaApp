import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    useFonts,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { View, ActivityIndicator } from 'react-native';

export default function Layout() {
    const [fontsLoaded] = useFonts({
        Nunito_400Regular,
        Nunito_700Bold,
        Nunito_900Black,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2d3748" />
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
