import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { isRainyCondition } from "../utils/weatherUtils";

const RAIN_ANIMATION = require("../../assets/animations/rain.json");

export default function WeatherBackdropAnimation({ condition }) {
    const isRainy = isRainyCondition(condition);

    if (!isRainy) {
        return null;
    }

    return (
        <View pointerEvents="none" style={styles.container}>
            <LottieView
                source={RAIN_ANIMATION}
                autoPlay
                loop
                style={styles.animation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.7,
    },
    animation: {
        width: "100%",
        height: "100%",
    },
});
