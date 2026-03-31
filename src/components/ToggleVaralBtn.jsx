import React, { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { fetchArduinoStatus, sendCommandToArduino } from '../services/arduinoService';

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

export default function WardrobeButton() {
    const [status, setStatus] = useState({ estendido: false, chuva: false, roupa: false });
    const progress = useSharedValue(0);

    // Consulta periodicamente o Arduino
    useEffect(() => {
        const interval = setInterval(async () => {
            const currentStatus = await fetchArduinoStatus();
            if (currentStatus) setStatus(currentStatus);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Animação visual isolada
    const triggerAnimation = useCallback(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.cubic),
        });
    }, [progress]);

    // Lógica principal do botão
    const handlePress = useCallback(async () => {
        console.log("Status atual antes do clique:", status);

        if (status.estendido) {
            console.log("Enviando comando: RECOLHER");
            triggerAnimation();
            await sendCommandToArduino('R');
            setStatus(prev => ({ ...prev, estendido: false }));
        } else {
            if (status.chuva) {
                if (Platform.OS === 'web') {
                    window.alert("Operação Bloqueada: Está chovendo. Não é possível estender o varal agora.");
                } else {
                    Alert.alert("Operação Bloqueada", "Está chovendo. Não é possível estender o varal agora.");
                }
                return;
            }

            if (!status.roupa) {
                console.log("Aviso de falta de roupa disparado.");

                if (Platform.OS === 'web') {
                    const confirmou = window.confirm("Nenhuma roupa foi detectada no varal. Deseja estender mesmo assim?");
                    if (confirmou) {
                        console.log("Usuário confirmou via web. Enviando: ESTENDER");
                        triggerAnimation();
                        await sendCommandToArduino('E');
                        setStatus(prev => ({ ...prev, estendido: true }));
                    }
                } else {
                    Alert.alert(
                        "Aviso de Confirmação",
                        "Nenhuma roupa foi detectada no varal. Deseja estender mesmo assim?",
                        [
                            { text: "Cancelar", style: "cancel" },
                            {
                                text: "Sim, Estender",
                                onPress: async () => {
                                    console.log("Usuário confirmou via celular. Enviando: ESTENDER");
                                    triggerAnimation();
                                    await sendCommandToArduino('E');
                                    setStatus(prev => ({ ...prev, estendido: true }));
                                }
                            }
                        ]
                    );
                }
            } else {
                console.log("Condições ideais. Enviando: ESTENDER");
                triggerAnimation();
                await sendCommandToArduino('E');
                setStatus(prev => ({ ...prev, estendido: true }));
            }
        }
    }, [status, triggerAnimation]);

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
                            : status.estendido ? "#F44336" : theme.colors.primary,
                    },
                ]}
            >
                <Text style={styles.label}>
                    {status.estendido ? "RECOLHER" : "EXPOR"}
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