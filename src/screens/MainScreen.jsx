import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import LocationSelectModal from "../components/LocationSelectModal";
import WeatherBackdropAnimation from "../components/WeatherBackdropAnimation";
import ToggleVaralBtn, {
    WRAPPER_HALF_HEIGHT,
} from "../components/ToggleVaralBtn";
import { useClotheslineHistoryTracker } from "../hooks/useClotheslineHistoryTracker";
import { useWeather } from "../hooks/useWeather";
import { useClotheslineHistory } from "../services/clotheslineHistoryService";
import {
    formatPtBrFullDate,
    formatRelativeDayLabel,
    getForecastItemsForDate,
    startOfDay,
} from "../utils/forecastDateUtils";
import { formatHistoryEntryLabel } from "../utils/historyUtils";
import { getSkyColors } from "../utils/weatherUtils";

const TOGGLE_HALF_HEIGHT = WRAPPER_HALF_HEIGHT;
const SKY_EXPANDED_HEIGHT = 100;
const CLOTHESLINE_STATE_KEY = "@clothesline/isExposed";
const HISTORY_PAGE_SIZE = 5;
const TIMING_CONFIG = {
    duration: 650,
    easing: Easing.inOut(Easing.cubic),
};

function areSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function MainScreenContent({ weather }) {
    const { height: screenHeight } = useWindowDimensions();
    const SKY_COLLAPSED_HEIGHT = screenHeight * 0.76;

    const {
        condition,
        statusText,
        city,
        forecastList,
        hourlyForecast,
        isLoading,
        error,
        manualLocation,
        setManualLocation,
        clearManualLocation,
        defaultLocation,
        setDefaultLocationPreference,
    } = weather;
    const [isClotheslineExposed, setIsClotheslineExposed] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
    const [selectedForecast, setSelectedForecast] = useState(hourlyForecast);
    const [isDateLoading, setIsDateLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [isClotheslineStateHydrated, setIsClotheslineStateHydrated] =
        useState(false);
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const modalCloseLockUntilRef = useRef(0);
    const scrollViewRef = useRef(null);
    const {
        history,
        isLoading: isHistoryLoading,
        isRefreshing: isHistoryRefreshing,
        reloadHistory,
    } = useClotheslineHistory();

    useClotheslineHistoryTracker(
        isClotheslineExposed,
        "Manual",
        isClotheslineStateHydrated,
    );

    const skyHeight = useSharedValue(SKY_COLLAPSED_HEIGHT);
    const expandedProgress = useSharedValue(0);
    const dateLoadingTimeoutRef = useRef(null);
    const isExpandedRef = useRef(isExpanded);

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

    const selectedDateLabel = formatRelativeDayLabel(selectedDate);
    const collapsedTitle = city
        ? `${city}, ${selectedDateLabel}`
        : selectedDateLabel;
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

            if (areSameDay(targetDate, startOfDay(new Date()))) {
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

            if (areSameDay(clampedDate, selectedDate)) return;

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

    const handleLocationConfirm = useCallback(
        async (location, options = {}) => {
            setManualLocation(location);
            if (options.setAsDefault) {
                await setDefaultLocationPreference(location);
            }
        },
        [setDefaultLocationPreference, setManualLocation],
    );

    const openLocationModal = useCallback(() => {
        if (Date.now() < modalCloseLockUntilRef.current) return;
        setIsLocationModalVisible(true);
    }, []);

    const closeLocationModal = useCallback(() => {
        modalCloseLockUntilRef.current = Date.now() + 220;
        setIsLocationModalVisible(false);
    }, []);

    useEffect(() => {
        const today = startOfDay(new Date());
        const clampedToday = clampDateToForecastRange(today);

        setSelectedDate((previousDate) =>
            areSameDay(previousDate, clampedToday)
                ? previousDate
                : clampedToday,
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

    useEffect(() => {
        let isMounted = true;

        const loadPersistedClotheslineState = async () => {
            try {
                const persistedState = await AsyncStorage.getItem(
                    CLOTHESLINE_STATE_KEY,
                );

                if (
                    isMounted &&
                    (persistedState === "true" || persistedState === "false")
                ) {
                    setIsClotheslineExposed(persistedState === "true");
                }
            } catch (storageError) {
                console.error(
                    "Erro ao carregar estado persistido do varal:",
                    storageError,
                );
            } finally {
                if (isMounted) {
                    setIsClotheslineStateHydrated(true);
                }
            }
        };

        loadPersistedClotheslineState();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        isExpandedRef.current = isExpanded;
    }, [isExpanded]);

    useEffect(() => {
        if (!isExpandedRef.current) {
            skyHeight.value = SKY_COLLAPSED_HEIGHT;
            expandedProgress.value = 0;
        }
    }, [SKY_COLLAPSED_HEIGHT, expandedProgress, skyHeight]);

    const handleSheetToggle = () => {
        const willExpand = !isExpanded;
        setIsExpanded(willExpand);

        if (!willExpand) {
            setHistoryPage(1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }

        skyHeight.value = withTiming(
            willExpand ? SKY_EXPANDED_HEIGHT : SKY_COLLAPSED_HEIGHT,
            TIMING_CONFIG,
        );

        expandedProgress.value = withTiming(willExpand ? 1 : 0, {
            duration: 320,
            easing: Easing.inOut(Easing.cubic),
        });
    };

    const handleToggleClothesline = useCallback((nextStateFromButton) => {
        setIsClotheslineExposed((previousState) => {
            const nextState =
                typeof nextStateFromButton === "boolean"
                    ? nextStateFromButton
                    : !previousState;

            AsyncStorage.setItem(
                CLOTHESLINE_STATE_KEY,
                String(nextState),
            ).catch((storageError) => {
                console.error(
                    "Erro ao persistir estado do varal:",
                    storageError,
                );
            });

            return nextState;
        });
    }, []);

    const handleReloadHistory = useCallback(async () => {
        await reloadHistory();
    }, [reloadHistory]);

    const handleLoadMoreHistory = useCallback(() => {
        setHistoryPage((previousPage) => previousPage + 1);
    }, []);

    const isHistoryBusy = isHistoryLoading || isHistoryRefreshing;
    const visibleHistory = useMemo(
        () => history.slice(0, historyPage * HISTORY_PAGE_SIZE),
        [history, historyPage],
    );
    const hasMoreHistory = visibleHistory.length < history.length;

    useEffect(() => {
        const maxHistoryPage = Math.max(
            1,
            Math.ceil(history.length / HISTORY_PAGE_SIZE),
        );
        setHistoryPage((previousPage) =>
            Math.min(previousPage, maxHistoryPage),
        );
    }, [history.length]);

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
                <WeatherBackdropAnimation condition={condition} />

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
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={isExpanded}
                >
                    <View style={styles.titleArea}>
                        <Animated.View
                            style={[
                                collapsedTitleStyle,
                                styles.collapsedTitleWrapper,
                            ]}
                        >
                            <TouchableOpacity
                                activeOpacity={0.6}
                                style={styles.locationTrigger}
                                onPress={openLocationModal}
                            >
                                <MaterialCommunityIcons
                                    name="map-marker"
                                    size={20}
                                    color={theme.colors.textDark}
                                />
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.sectionTitle,
                                        styles.collapsedTitleText,
                                    ]}
                                >
                                    {collapsedTitle}
                                </Text>

                                <Text
                                    style={[
                                        styles.locationActionText,
                                        {
                                            fontSize: 12,
                                            color: theme.colors.textMuted,
                                        },
                                    ]}
                                >
                                    {"  "}•{"  "}alterar região
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

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

                    <View style={styles.historyTitleRow}>
                        <MaterialCommunityIcons
                            name="history"
                            size={20}
                            color={theme.colors.textDark}
                        />
                        <Text
                            style={[
                                styles.sectionTitle,
                                styles.historyTitleText,
                            ]}
                        >
                            Histórico de atividade
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={handleReloadHistory}
                        >
                            <Text style={styles.reloadHistoryText}>
                                •{"  "}
                                {isHistoryRefreshing
                                    ? "recarregando..."
                                    : "recarregar"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historySectionWrapper}>
                        {visibleHistory.map((item) => (
                            <View key={item.id} style={styles.historyCard}>
                                <Text style={styles.historyText}>
                                    {formatHistoryEntryLabel(item)}
                                </Text>
                            </View>
                        ))}

                        {!isHistoryBusy && visibleHistory.length === 0 && (
                            <View style={styles.historyCard}>
                                <Text style={styles.historyText}>
                                    Sem atividade registrada ainda.
                                </Text>
                            </View>
                        )}

                        {!isHistoryBusy && hasMoreHistory && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.loadMoreHistoryBtn}
                                onPress={handleLoadMoreHistory}
                            >
                                <Text style={styles.loadMoreHistoryText}>
                                    Carregar mais
                                </Text>
                            </TouchableOpacity>
                        )}

                        {isHistoryBusy && (
                            <Animated.View
                                entering={FadeInDown.duration(180)}
                                exiting={FadeOutUp.duration(140)}
                                style={styles.historyLoadingOverlay}
                            >
                                <ActivityIndicator
                                    size="small"
                                    color={theme.colors.textDark}
                                />
                                <Text style={styles.historyLoadingText}>
                                    Carregando histórico...
                                </Text>
                            </Animated.View>
                        )}
                    </View>
                </ScrollView>
            </View>

            <Animated.View
                style={[styles.floatingToggleWrapper, floatingToggleStyle]}
                pointerEvents="box-none"
            >
                <ToggleVaralBtn
                    isExposed={isClotheslineExposed}
                    onPress={handleToggleClothesline}
                />
            </Animated.View>

            <LocationSelectModal
                visible={isLocationModalVisible}
                onClose={closeLocationModal}
                onConfirm={handleLocationConfirm}
                onUseCurrentLocation={clearManualLocation}
                currentSelection={manualLocation}
                defaultLocation={defaultLocation}
            />
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
    historyTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
        marginBottom: 15,
    },
    historyTitleText: {
        marginTop: 0,
        marginBottom: 0,
    },
    reloadHistoryText: {
        fontFamily: theme.fonts.regular,
        fontSize: 12,
        color: theme.colors.textMuted,
    },
    collapsedTitleText: {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 6,
    },
    collapsedTitleWrapper: {
        alignSelf: "flex-start",
    },
    locationTrigger: {
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "100%",
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
    historySectionWrapper: {
        position: "relative",
        minHeight: 76,
    },
    historyLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    historyLoadingText: {
        fontFamily: theme.fonts.regular,
        color: theme.colors.textDark,
        fontSize: 13,
    },
    loadMoreHistoryBtn: {
        alignSelf: "center",
        marginTop: 4,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: theme.colors.backgroundAlt,
    },
    loadMoreHistoryText: {
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        color: theme.colors.textDark,
    },
    floatingToggleWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 20,
    },
});
