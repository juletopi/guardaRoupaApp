import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
    cancelAnimation,
    Easing,
    FadeInDown,
    FadeOutUp,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../../constants/theme";
import {
    fetchArduinoStatusVerbose,
    subscribeArduinoCommandErrors,
} from "../services/arduinoService";

const DEFAULT_POLL_INTERVAL = 3000;
const COMMAND_ALERT_DURATION = 30000;
const ALERT_ACCENT = "#d97706";
const ALERT_RING_SIZE = 40;
const ALERT_RING_STROKE = 2.5;
const ALERT_RING_RADIUS = (ALERT_RING_SIZE - ALERT_RING_STROKE) / 2;
const ALERT_RING_CIRCUMFERENCE = 2 * Math.PI * ALERT_RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ArduinoConnectionStatus({
    onStatusChange,
    pollInterval = DEFAULT_POLL_INTERVAL,
}) {
    const [isOnline, setIsOnline] = useState(false);
    const [lastError, setLastError] = useState("Nenhum erro registrado.");
    const [lastErrorAt, setLastErrorAt] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [commandError, setCommandError] = useState(null);
    const [commandErrorAt, setCommandErrorAt] = useState(null);
    const [commandAlertSequence, setCommandAlertSequence] = useState(0);
    const [isCommandErrorModalVisible, setIsCommandErrorModalVisible] =
        useState(false);
    const commandAlertTimeoutRef = useRef(null);
    const commandAlertVisibleRef = useRef(false);
    const commandAlertProgress = useSharedValue(0);
    const commandAlertPulse = useSharedValue(0);

    const triggerCommandAlertPulse = useCallback(() => {
        commandAlertPulse.value = 0;
        commandAlertPulse.value = withSequence(
            withTiming(1.3, { duration: 95 }),
            withTiming(0.9, { duration: 85 }),
            withTiming(1.22, { duration: 105 }),
            withTiming(0, { duration: 140 }),
        );
    }, [commandAlertPulse]);

    useEffect(() => {
        let mounted = true;

        const checkConnection = async () => {
            const { data, error } = await fetchArduinoStatusVerbose();
            if (!mounted) return;

            if (data) {
                setIsOnline(true);
                setLastError("Nenhum erro registrado.");
                setLastErrorAt(null);
                onStatusChange?.(data);
                return;
            }

            setIsOnline(false);
            setLastError(error ?? "Network Error");
            setLastErrorAt(new Date());
        };

        checkConnection();
        const intervalId = setInterval(checkConnection, pollInterval);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [onStatusChange, pollInterval]);

    useEffect(() => {
        const unsubscribe = subscribeArduinoCommandErrors((event) => {
            if (!event) return;

            if (!event.message) {
                setCommandError(null);
                setCommandErrorAt(null);
                setCommandAlertSequence(0);
                return;
            }

            setCommandAlertSequence((previous) => previous + 1);

            if (commandAlertVisibleRef.current) {
                triggerCommandAlertPulse();
            }

            setCommandError(event.message);
            setCommandErrorAt(event.at ? new Date(event.at) : new Date());
        });

        return unsubscribe;
    }, [triggerCommandAlertPulse]);

    useEffect(() => {
        commandAlertVisibleRef.current = Boolean(commandError);

        if (commandAlertTimeoutRef.current) {
            clearTimeout(commandAlertTimeoutRef.current);
            commandAlertTimeoutRef.current = null;
        }

        if (!commandError) {
            cancelAnimation(commandAlertProgress);
            commandAlertProgress.value = 0;
            commandAlertPulse.value = 0;
            setIsCommandErrorModalVisible(false);
            return undefined;
        }

        cancelAnimation(commandAlertProgress);
        commandAlertProgress.value = 1;
        commandAlertProgress.value = withTiming(0, {
            duration: COMMAND_ALERT_DURATION,
            easing: Easing.linear,
        });

        commandAlertTimeoutRef.current = setTimeout(() => {
            setCommandError(null);
            setCommandErrorAt(null);
            setIsCommandErrorModalVisible(false);
        }, COMMAND_ALERT_DURATION);

        return () => {
            if (!commandAlertTimeoutRef.current) return;
            clearTimeout(commandAlertTimeoutRef.current);
            commandAlertTimeoutRef.current = null;
        };
    }, [
        commandAlertProgress,
        commandAlertPulse,
        commandAlertSequence,
        commandError,
    ]);

    const statusLabel = useMemo(() => (isOnline ? "ON" : "OFF"), [isOnline]);

    const lastErrorTimeLabel = useMemo(() => {
        if (!lastErrorAt) return "Sem registros.";
        return lastErrorAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }, [lastErrorAt]);

    const instructionText = useMemo(() => {
        if (isOnline) {
            return "Conexao ativa. Nenhuma acao necessaria no momento.";
        }

        const normalizedError = String(lastError ?? "").toLowerCase();

        if (
            normalizedError.includes("network") ||
            normalizedError.includes("timeout")
        ) {
            return "Confirme se a API Arduino esta rodando no computador, se o celular esta na mesma rede e se EXPO_PUBLIC_ARDUINO_API_URL aponta para o IP correto.";
        }

        if (
            normalizedError.includes("404") ||
            normalizedError.includes("not found")
        ) {
            return "Verifique se os endpoints /status e /command existem na API local e se a porta configurada esta correta.";
        }

        if (
            normalizedError.includes("econnrefused") ||
            normalizedError.includes("refused")
        ) {
            return "A conexao foi recusada. Inicie o servidor Arduino-api e libere a porta no firewall do Windows.";
        }

        return "Confira cabo USB, porta serial configurada no servidor e se o processo Arduino-api esta ativo.";
    }, [isOnline, lastError]);

    const commandErrorTimeLabel = useMemo(() => {
        if (!commandErrorAt) return "Sem registros.";
        return commandErrorAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }, [commandErrorAt]);

    const commandInstructionText = useMemo(() => {
        if (!commandError) {
            return "Nenhuma acao necessaria no momento.";
        }

        const normalizedError = String(commandError).toLowerCase();

        if (
            normalizedError.includes("network") ||
            normalizedError.includes("timeout")
        ) {
            return "Confirme se a API Arduino esta ativa, se o celular esta na mesma rede do computador e se EXPO_PUBLIC_ARDUINO_API_URL usa o IP correto.";
        }

        if (
            normalizedError.includes("econnrefused") ||
            normalizedError.includes("refused")
        ) {
            return "Inicie o servidor Arduino-api e verifique bloqueio de firewall na porta configurada.";
        }

        if (normalizedError.includes("http=404")) {
            return "Verifique se o endpoint /command existe e se a rota da API esta correta.";
        }

        return "Verifique cabo USB, porta serial no servidor e logs do processo Arduino-api.";
    }, [commandError]);

    const commandAlertBadgeStyle = useAnimatedStyle(() => ({
        opacity: commandError ? 1 : 0,
    }));

    const commandAlertIconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: 1 + commandAlertPulse.value * 0.4,
            },
        ],
    }));

    const commandAlertRingProps = useAnimatedProps(() => ({
        strokeDashoffset:
            ALERT_RING_CIRCUMFERENCE * (1 - commandAlertProgress.value),
    }));

    return (
        <>
            <View style={styles.badgesRow}>
                <View style={styles.alertBadgeShell} pointerEvents="box-none">
                    {Boolean(commandError) && (
                        <Animated.View
                            entering={FadeInDown.duration(520).easing(
                                Easing.out(Easing.cubic),
                            )}
                            exiting={FadeOutUp.duration(460).easing(
                                Easing.in(Easing.cubic),
                            )}
                            style={[
                                styles.alertBadgeInner,
                                commandAlertBadgeStyle,
                            ]}
                        >
                            <Svg
                                width={ALERT_RING_SIZE}
                                height={ALERT_RING_SIZE}
                                style={styles.alertRingSvg}
                            >
                                <AnimatedCircle
                                    cx={ALERT_RING_SIZE / 2}
                                    cy={ALERT_RING_SIZE / 2}
                                    r={ALERT_RING_RADIUS}
                                    fill="none"
                                    stroke={ALERT_ACCENT}
                                    strokeWidth={ALERT_RING_STROKE}
                                    strokeLinecap="round"
                                    strokeDasharray={ALERT_RING_CIRCUMFERENCE}
                                    animatedProps={commandAlertRingProps}
                                />
                            </Svg>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.alertBadge}
                                onPress={() =>
                                    setIsCommandErrorModalVisible(true)
                                }
                            >
                                <Animated.View style={commandAlertIconStyle}>
                                    <MaterialCommunityIcons
                                        name="alert-circle"
                                        size={13}
                                        color={ALERT_ACCENT}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.badge}
                    onPress={() => setIsModalVisible(true)}
                >
                    <View
                        style={[
                            styles.dot,
                            isOnline ? styles.dotOnline : styles.dotOffline,
                        ]}
                    />
                    <Text style={styles.badgeLabel}>Arduino {statusLabel}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setIsModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalCard}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text style={styles.modalTitle}>Status de conexão</Text>

                        <View style={styles.statusRow}>
                            <View
                                style={[
                                    styles.dot,
                                    isOnline
                                        ? styles.dotOnline
                                        : styles.dotOffline,
                                ]}
                            />
                            <Text style={styles.statusText}>
                                Arduino {statusLabel}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.errorLabel}>Último erro</Text>
                        <Text style={styles.errorText}>{lastError}</Text>

                        <Text style={styles.errorTimeLabel}>
                            Horário: {lastErrorTimeLabel}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.instructionLabel}>Instrução</Text>
                        <Text style={styles.instructionText}>
                            {instructionText}
                        </Text>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Fechar</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                animationType="fade"
                transparent
                visible={isCommandErrorModalVisible}
                onRequestClose={() => setIsCommandErrorModalVisible(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setIsCommandErrorModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalCard}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text style={styles.modalTitle}>Alerta de comando</Text>

                        <View style={styles.divider} />

                        <Text style={styles.errorLabel}>ÚLTIMO ERRO</Text>
                        <Text style={styles.errorText}>
                            {commandError ?? "Nenhum erro registrado."}
                        </Text>

                        <Text style={styles.errorTimeLabel}>
                            Horário: {commandErrorTimeLabel}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.instructionLabel}>INSTRUÇÃO</Text>
                        <Text style={styles.instructionText}>
                            {commandInstructionText}
                        </Text>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setIsCommandErrorModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Fechar</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    badgesRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    alertBadgeShell: {
        width: ALERT_RING_SIZE,
        height: ALERT_RING_SIZE,
        marginRight: 2,
        position: "relative",
    },
    alertBadgeInner: {
        width: ALERT_RING_SIZE,
        height: ALERT_RING_SIZE,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        left: 0,
    },
    alertRingSvg: {
        position: "absolute",
        top: 0,
        left: 0,
        transform: [{ rotate: "-90deg" }],
    },
    alertBadge: {
        width: 33,
        height: 33,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.88)",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.88)",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dotOnline: {
        backgroundColor: "#2ecc71",
    },
    dotOffline: {
        backgroundColor: "#e74c3c",
    },
    badgeLabel: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.textDark,
        fontSize: 12,
        letterSpacing: 0.6,
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    modalTitle: {
        fontFamily: theme.fonts.black,
        color: theme.colors.textDark,
        fontSize: 18,
    },
    statusRow: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusText: {
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        color: theme.colors.textDark,
    },
    divider: {
        marginTop: 14,
        marginBottom: 12,
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    errorLabel: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    errorText: {
        marginTop: 6,
        color: theme.colors.textDark,
        fontSize: 13,
    },
    errorTimeLabel: {
        marginTop: 6,
        color: theme.colors.textMuted,
        fontSize: 12,
    },
    instructionLabel: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    instructionText: {
        marginTop: 6,
        color: theme.colors.textDark,
        fontSize: 13,
    },
    closeBtn: {
        marginTop: 16,
        alignSelf: "flex-end",
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    closeBtnText: {
        color: theme.colors.textLight,
        fontSize: 12,
    },
});
