import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    Easing,
    Extrapolation,
    FadeInDown,
    FadeOutUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import ExpandMenuBtn from "../components/ExpandMenuBtn";
import ForecastCalendar from "../components/ForecastCalendar";
import HourlyForecast from "../components/HourlyForecast";
import ToggleVaralBtn, {
    WRAPPER_HALF_HEIGHT,
} from "../components/ToggleVaralBtn";
import { MOCK_HISTORY } from "../data/mockData";
import { useWeather } from "../hooks/useWeather";
import {
    formatPtBrFullDate,
    getForecastItemsForDate,
    isSameDay,
    startOfDay,
} from "../utils/forecastDateUtils";
import { getSkyColors } from "../utils/weatherUtils";

const TOGGLE_HALF_HEIGHT = WRAPPER_HALF_HEIGHT;
const SKY_EXPANDED_HEIGHT = 100;
const TIMING_CONFIG = {
    duration: 650,
    easing: Easing.inOut(Easing.cubic),
};

function MainScreenContent({ weather }) {
    const { height: screenHeight } = useWindowDimensions();
    const SKY_COLLAPSED_HEIGHT = screenHeight * 0.77;

    const {
        condition,
        statusText,
        city,
        forecastList,
        hourlyForecast,
        isLoading,
        error,
    } = weather;
    const [isClotheslineExposed, setIsClotheslineExposed] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [selectedForecast, setSelectedForecast] = useState(hourlyForecast);
    const [isDateLoading, setIsDateLoading] = useState(false);

    const skyHeight = useSharedValue(SKY_COLLAPSED_HEIGHT);
    const expandedProgress = useSharedValue(0);
    const dateLoadingTimeoutRef = useRef(null);

    const availableRange = useMemo(() => {
        if (!forecastList || forecastList.length === 0) {
            return { minDate: null, maxDate: null };
        }

        const firstItemDate = new Date(forecastList[0].dt * 1000);
        const lastItemDate = new Date(
            forecastList[forecastList.length - 1].dt * 1000,
        );

        return {
            minDate: startOfDay(firstItemDate),
            maxDate: startOfDay(lastItemDate),
        };
    }, [forecastList]);

    const collapsedTitle = city ? `Hoje, ${city}` : "Hoje";
    const expandedDateLabel = formatPtBrFullDate(selectedDate);

    const clampDateToForecastRange = useCallback(
        (date) => {
            if (!availableRange.minDate || !availableRange.maxDate) return date;
            if (date < availableRange.minDate) return availableRange.minDate;
            if (date > availableRange.maxDate) return availableRange.maxDate;
            return date;
        },
        [availableRange.maxDate, availableRange.minDate],
    );

    const setForecastForDate = useCallback(
        (targetDate) => {
            if (forecastList.length > 0) {
                setSelectedForecast(
                    getForecastItemsForDate(forecastList, targetDate),
                );
                return;
            }

            if (isSameDay(targetDate, startOfDay(new Date()))) {
                setSelectedForecast(hourlyForecast);
                return;
            }

            setSelectedForecast([]);
        },
        [forecastList, hourlyForecast],
    );

    const handleSelectDate = useCallback(
        (nextDate) => {
            const normalizedDate = startOfDay(nextDate);
            const clampedDate = clampDateToForecastRange(normalizedDate);

            if (isSameDay(clampedDate, selectedDate)) return;

            setSelectedDate(clampedDate);
            setIsDateLoading(true);

            if (dateLoadingTimeoutRef.current) {
                clearTimeout(dateLoadingTimeoutRef.current);
            }

            dateLoadingTimeoutRef.current = setTimeout(() => {
                setForecastForDate(clampedDate);
                setIsDateLoading(false);
            }, 220);
        },
        [clampDateToForecastRange, selectedDate, setForecastForDate],
    );

    const canStepPrev = availableRange.minDate
        ? selectedDate > availableRange.minDate
        : false;
    const canStepNext = availableRange.maxDate
        ? selectedDate < availableRange.maxDate
        : false;

    const handleStepDate = (dayOffset) => {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + dayOffset);
        handleSelectDate(nextDate);
    };

    useEffect(() => {
        const today = startOfDay(new Date());
        const clampedToday = clampDateToForecastRange(today);

        setSelectedDate((previousDate) =>
            isSameDay(previousDate, clampedToday) ? previousDate : clampedToday,
        );
        setForecastForDate(clampedToday);
        setIsDateLoading(false);
    }, [
        clampDateToForecastRange,
        forecastList,
        hourlyForecast,
        setForecastForDate,
    ]);

    useEffect(() => {
        return () => {
            if (dateLoadingTimeoutRef.current) {
                clearTimeout(dateLoadingTimeoutRef.current);
            }
        };
    }, []);

    const handleSheetToggle = () => {
        const willExpand = !isExpanded;
        setIsExpanded(willExpand);

        skyHeight.value = withTiming(
            willExpand ? SKY_EXPANDED_HEIGHT : SKY_COLLAPSED_HEIGHT,
            TIMING_CONFIG,
        );

        expandedProgress.value = withTiming(willExpand ? 1 : 0, {
            duration: 320,
            easing: Easing.inOut(Easing.cubic),
        });
    };

    const skyWrapperStyle = useAnimatedStyle(() => ({
        height: skyHeight.value,
    }));

    const floatingToggleStyle = useAnimatedStyle(() => ({
        top: skyHeight.value - TOGGLE_HALF_HEIGHT,
    }));

    const skyMainOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            skyHeight.value,
            [SKY_EXPANDED_HEIGHT + 80, SKY_COLLAPSED_HEIGHT * 0.65],
            [0, 1],
            Extrapolation.CLAMP,
        ),
    }));

    const skyMiniOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(
            skyHeight.value,
            [SKY_EXPANDED_HEIGHT + 45, SKY_EXPANDED_HEIGHT + 5],
            [0, 1],
            Extrapolation.CLAMP,
        ),
        transform: [
            {
                translateY: interpolate(
                    skyHeight.value,
                    [SKY_EXPANDED_HEIGHT, SKY_EXPANDED_HEIGHT + 45],
                    [0, 8],
                    Extrapolation.CLAMP,
                ),
            },
        ],
    }));

    const collapsedTitleStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            expandedProgress.value,
            [0, 1],
            [1, 0],
            Extrapolation.CLAMP,
        ),
        transform: [
            {
                translateX: interpolate(
                    expandedProgress.value,
                    [0, 1],
                    [0, 34],
                    Extrapolation.CLAMP,
                ),
            },
            {
                translateY: interpolate(
                    expandedProgress.value,
                    [0, 1],
                    [0, -2],
                    Extrapolation.CLAMP,
                ),
            },
        ],
    }));

    const expandedDateRowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            expandedProgress.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP,
        ),
        transform: [
            {
                translateY: interpolate(
                    expandedProgress.value,
                    [0, 1],
                    [-8, 0],
                    Extrapolation.CLAMP,
                ),
            },
        ],
    }));

    const chevronsStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            expandedProgress.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP,
        ),
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getSkyColors(condition)}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View style={[styles.skyWrapper, skyWrapperStyle]}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        styles.skyLayer,
                        skyMainOpacity,
                    ]}
                >
                    <Text style={styles.weatherStatusText}>{statusText}</Text>
                    <View style={styles.clotheslinePlaceholder}>
                        <Text style={styles.clotheslineText}>
                            {isClotheslineExposed
                                ? "VARAL EXPOSTO"
                                : "GUARDADO"}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        styles.skyLayer,
                        skyMiniOpacity,
                    ]}
                >
                    <Text style={styles.miniVaralText}>
                        {isClotheslineExposed ? "VARAL EXPOSTO" : "GUARDADO"}
                    </Text>
                </Animated.View>
            </Animated.View>

            <View style={styles.bottomSheet}>
                <ExpandMenuBtn
                    isExpanded={isExpanded}
                    onPress={handleSheetToggle}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={isExpanded}
                >
                    <View style={styles.titleArea}>
                        <Animated.Text
                            numberOfLines={1}
                            style={[
                                styles.sectionTitle,
                                styles.collapsedTitleText,
                                collapsedTitleStyle,
                            ]}
                        >
                            {collapsedTitle}
                        </Animated.Text>

                        <Animated.View
                            style={[
                                styles.expandedDateRow,
                                expandedDateRowStyle,
                            ]}
                            pointerEvents={isExpanded ? "auto" : "none"}
                        >
                            <Animated.View style={chevronsStyle}>
                                <TouchableOpacity
                                    style={[
                                        styles.dateChevronBtn,
                                        (!canStepPrev || !isExpanded) &&
                                            styles.dateChevronBtnDisabled,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => handleStepDate(-1)}
                                    disabled={!canStepPrev || !isExpanded}
                                >
                                    <MaterialCommunityIcons
                                        name="chevron-left"
                                        size={20}
                                        color={theme.colors.textDark}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.sectionTitle,
                                    styles.expandedDateText,
                                ]}
                            >
                                {expandedDateLabel}
                            </Text>

                            <Animated.View style={chevronsStyle}>
                                <TouchableOpacity
                                    style={[
                                        styles.dateChevronBtn,
                                        (!canStepNext || !isExpanded) &&
                                            styles.dateChevronBtnDisabled,
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => handleStepDate(1)}
                                    disabled={!canStepNext || !isExpanded}
                                >
                                    <MaterialCommunityIcons
                                        name="chevron-right"
                                        size={20}
                                        color={theme.colors.textDark}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    </View>

                    <HourlyForecast
                        items={selectedForecast}
                        isLoading={isLoading}
                        showLoadingOverlay={
                            isDateLoading && selectedForecast.length > 0
                        }
                        error={error}
                    />

                    {isExpanded && (
                        <Animated.View
                            entering={FadeInDown.duration(300).easing(
                                Easing.out(Easing.cubic),
                            )}
                            exiting={FadeOutUp.duration(260).easing(
                                Easing.in(Easing.cubic),
                            )}
                        >
                            <ForecastCalendar
                                selectedDate={selectedDate}
                                onSelectDate={handleSelectDate}
                                minDate={availableRange.minDate}
                                maxDate={availableRange.maxDate}
                            />
                        </Animated.View>
                    )}

                    <Text style={styles.sectionTitle}>
                        Histórico de Atividade
                    </Text>
                    {MOCK_HISTORY.map((item) => (
                        <View key={item.id} style={styles.historyCard}>
                            <Text style={styles.historyText}>{item.label}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <Animated.View
                style={[styles.floatingToggleWrapper, floatingToggleStyle]}
                pointerEvents="box-none"
            >
                <ToggleVaralBtn
                    isExposed={isClotheslineExposed}
                    onPress={() =>
                        setIsClotheslineExposed(!isClotheslineExposed)
                    }
                />
            </Animated.View>
        </View>
    );
}

export default function MainScreen() {
    const weather = useWeather();
    if (weather.isLoading) {
        return (
            <View
                style={styles.loadingRoot}
                accessibilityLabel="Carregando clima"
            >
                <ActivityIndicator
                    size="large"
                    color={theme.colors.textLight}
                />
                <Text style={styles.loadingText}>Carregando…</Text>
            </View>
        );
    }
    return <MainScreenContent weather={weather} />;
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
    container: {
        flex: 1,
    },
    skyWrapper: {
        overflow: "hidden",
    },
    skyLayer: {
        alignItems: "center",
        justifyContent: "center",
    },
    weatherStatusText: {
        fontFamily: theme.fonts.black,
        fontSize: 28,
        color: theme.colors.textLight,
        marginBottom: 20,
        textShadowColor: "rgba(0, 0, 0, 0.2)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    clotheslinePlaceholder: {
        width: 180,
        height: 180,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
        borderStyle: "dashed",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    clotheslineText: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.textLight,
        fontSize: 16,
    },
    miniVaralText: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.textLight,
        fontSize: 13,
        letterSpacing: 2,
        opacity: 0.9,
    },
    bottomSheet: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 25,
        overflow: "visible",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    titleArea: {
        minHeight: 36,
        marginTop: -10,
        marginBottom: 10,
        justifyContent: "center",
        paddingRight: 82,
    },
    scrollView: {
        marginTop: 42,
    },
    sectionTitle: {
        fontFamily: theme.fonts.bold,
        fontSize: 18,
        color: theme.colors.textDark,
        marginTop: 10,
        marginBottom: 15,
    },
    collapsedTitleText: {
        marginTop: 0,
        marginBottom: 0,
    },
    expandedDateRow: {
        position: "absolute",
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    expandedDateText: {
        marginTop: 0,
        marginBottom: 0,
        fontSize: 15,
        maxWidth: "72%",
        textAlign: "center",
    },
    dateChevronBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.backgroundAlt,
        alignItems: "center",
        justifyContent: "center",
    },
    dateChevronBtnDisabled: {
        opacity: 0.35,
    },
    historyCard: {
        backgroundColor: theme.colors.backgroundAlt,
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    historyText: {
        fontFamily: theme.fonts.regular,
        color: theme.colors.textMuted,
        fontSize: 15,
    },
    floatingToggleWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 20,
    },
});
