import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getEffectiveCondition } from "../utils/weatherUtils";

const RAIN_ANIMATION = require("../../assets/animations/rain.json");
const CLOUDS_ANIMATION = require("../../assets/animations/clouds.json");
const SUNNY_ANIMATION = require("../../assets/animations/sunny.json");
const NIGHT_ANIMATION = require("../../assets/animations/night.json");

const CONDITION_ANIMATIONS = {
    rainy: RAIN_ANIMATION,
    sunny: SUNNY_ANIMATION,
    night: NIGHT_ANIMATION,
};

const CONDITION_MODES = {
    rainy: "overlay",
    sunny: "full",
    night: "full",
};

export default function WeatherBackdropAnimation({ condition }) {
    const [hasAnimationError, setHasAnimationError] = useState(false);
    const effectiveCondition = getEffectiveCondition(condition);
    const animationSource = CONDITION_ANIMATIONS[effectiveCondition];
    const backgroundMode = CONDITION_MODES[effectiveCondition] ?? "overlay";
    const isRainyWithClouds = effectiveCondition === "rainy";

    useEffect(() => {
        setHasAnimationError(false);
    }, [effectiveCondition]);

    if (!animationSource || hasAnimationError) {
        return null;
    }

    if (isRainyWithClouds) {
        return (
            <View
                pointerEvents="none"
                style={[styles.container, styles.overlayContainer]}
            >
                <LottieView
                    key={`clouds-${effectiveCondition}`}
                    source={CLOUDS_ANIMATION}
                    autoPlay
                    loop
                    resizeMode="cover"
                    onAnimationFailure={() => setHasAnimationError(true)}
                    style={[styles.animation, styles.cloudsLayer]}
                />
                <LottieView
                    key={`rain-${effectiveCondition}`}
                    source={RAIN_ANIMATION}
                    autoPlay
                    loop
                    resizeMode="cover"
                    onAnimationFailure={() => setHasAnimationError(true)}
                    style={styles.animation}
                />
            </View>
        );
    }

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                backgroundMode === "full"
                    ? styles.fullBackgroundContainer
                    : styles.overlayContainer,
            ]}
        >
            <LottieView
                key={`animation-${effectiveCondition}`}
                source={animationSource}
                autoPlay
                loop
                resizeMode="cover"
                onAnimationFailure={() => setHasAnimationError(true)}
                style={styles.animation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayContainer: {
        opacity: 0.7,
    },
    fullBackgroundContainer: {
        opacity: 1,
    },
    animation: {
        width: "100%",
        height: "100%",
    },
});
