import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import {
    fetchArduinoStatus,
    sendCommandToArduino,
} from "../services/arduinoService";

const LINES_COUNT = 8;
const OUTER_RADIUS = 82;
const INNER_RADIUS = 46;
const ANIMATION_DURATION = 650;

const WRAPPER_W = 340;
const WRAPPER_H = 220;

export const WRAPPER_HALF_HEIGHT = WRAPPER_H / 2;

function Line({ angle, progress }) {
    const style = useAnimatedStyle(() => {
        const dist = interpolate(
            progress.value,
            [0, 1],
            [INNER_RADIUS, OUTER_RADIUS],
            "clamp",
        );
        const opacity = interpolate(
            progress.value,
            [0, 0.08, 0.65, 1],
            [0, 1, 0.8, 0],
        );
        return {
            opacity,
            transform: [
                { translateX: dist * Math.cos(angle) },
                { translateY: dist * Math.sin(angle) },
                { rotate: `${angle + Math.PI / 2}rad` },
            ],
        };
    });

    return <Animated.View style={[styles.line, style]} />;
}

export default function WardrobeButton({ isExposed, onPress, arduinoStatus }) {
    const [status, setStatus] = useState({
        estendido: false,
        chuva: false,
        roupa: false,
    });
    const progress = useSharedValue(0);
    const isControlled = typeof isExposed === "boolean";
    const hasExternalStatus = Boolean(arduinoStatus);
    const currentIsExposed = isControlled ? isExposed : status.estendido;

    useEffect(() => {
        if (!hasExternalStatus) return;
        setStatus((previous) => ({ ...previous, ...arduinoStatus }));
    }, [arduinoStatus, hasExternalStatus]);

    // Consulta periodicamente o Arduino quando nao houver status externo
    useEffect(() => {
        if (hasExternalStatus) return undefined;

        const interval = setInterval(async () => {
            const currentStatus = await fetchArduinoStatus();
            if (currentStatus) setStatus(currentStatus);
        }, 3000);

        return () => clearInterval(interval);
    }, [hasExternalStatus]);

    const triggerAnimation = useCallback(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.cubic),
        });
    }, [progress]);

    const confirmExtendAnyway = useCallback(
        async (message) => {
            if (Platform.OS === "web") {
                const confirmou = window.confirm(message);
                if (!confirmou) return false;
            } else {
                const confirmou = await new Promise((resolve) => {
                    Alert.alert("Aviso de Confirmação", message, [
                        {
                            text: "Cancelar",
                            style: "cancel",
                            onPress: () => resolve(false),
                        },
                        { text: "Sim, Estender", onPress: () => resolve(true) },
                    ]);
                });

                if (!confirmou) return false;
            }

            console.log("Usuário confirmou a ação. Enviando: ESTENDER");
            triggerAnimation();
            await sendCommandToArduino("E");
            setStatus((prev) => ({ ...prev, estendido: true }));
            onPress?.(true);
            return true;
        },
        [onPress, triggerAnimation],
    );

    const handlePress = useCallback(async () => {
        console.log("Status atual antes do clique:", status);

        if (currentIsExposed) {
            console.log("Enviando comando: RECOLHER");
            triggerAnimation();
            await sendCommandToArduino("R");
            setStatus((prev) => ({ ...prev, estendido: false }));
            onPress?.(false);
        } else {
            if (status.chuva) {
                const confirmou = await confirmExtendAnyway(
                    "Está chovendo. Deseja estender mesmo assim?",
                );
                if (!confirmou) return;
            }

            if (!status.roupa) {
                console.log("Aviso de falta de roupa disparado.");

                await confirmExtendAnyway(
                    "Nenhuma roupa foi detectada no varal. Deseja estender mesmo assim?",
                );
            } else {
                console.log("Condições ideais. Enviando: ESTENDER");
                triggerAnimation();
                await sendCommandToArduino("E");
                setStatus((prev) => ({ ...prev, estendido: true }));
                onPress?.(true);
            }
        }
    }, [
        confirmExtendAnyway,
        currentIsExposed,
        onPress,
        status,
        triggerAnimation,
    ]);

    const angles = Array.from(
        { length: LINES_COUNT },
        (_, i) => (i / LINES_COUNT) * 2 * Math.PI,
    );

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: pressed
                            ? "#1a202c"
                            : currentIsExposed
                              ? "#F44336"
                              : theme.colors.primary,
                    },
                ]}
            >
                <Text style={styles.label}>
                    {currentIsExposed ? "RECOLHER" : "EXPOR"}
                </Text>
            </Pressable>

            <View style={styles.linesLayer} pointerEvents="none">
                {angles.map((angle, i) => (
                    <Line key={i} angle={angle} progress={progress} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: WRAPPER_W,
        height: WRAPPER_H,
        alignItems: "center",
        justifyContent: "center",
    },
    linesLayer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    line: {
        position: "absolute",
        width: 3,
        height: 18,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderRadius: 2,
    },
    button: {
        width: 160,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.textLight,
        fontSize: 14,
        letterSpacing: 1.5,
    },
});
