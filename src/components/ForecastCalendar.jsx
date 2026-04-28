import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { theme } from "../../constants/theme";
import {
    buildMonthGrid,
    formatDateInput,
    isSameDay,
    parseDateInput,
} from "../utils/forecastDateUtils";

const WEEKDAY_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"];

export default function ForecastCalendar({
    selectedDate,
    onSelectDate,
    minDate,
    maxDate,
}) {
    const [viewDate, setViewDate] = useState(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    const [inputDate, setInputDate] = useState(formatDateInput(selectedDate));
    const [inputError, setInputError] = useState("");

    useEffect(() => {
        setInputDate(formatDateInput(selectedDate));
        setViewDate(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        );
        setInputError("");
    }, [selectedDate]);

    const weeks = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

    const isOutOfRange = (date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const handleInputSubmit = () => {
        const parsedDate = parseDateInput(inputDate);

        if (!parsedDate) {
            setInputError("Data inválida. Use DD/MM/AAAA.");
            return;
        }

        if (isOutOfRange(parsedDate)) {
            setInputError("Data fora da previsão disponível.");
            return;
        }

        setInputError("");
        onSelectDate(parsedDate);
    };

    const canGoPrevMonth =
        !minDate ||
        new Date(viewDate.getFullYear(), viewDate.getMonth(), 0) >=
            new Date(
                minDate.getFullYear(),
                minDate.getMonth(),
                minDate.getDate(),
            );

    const canGoNextMonth =
        !maxDate ||
        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) <=
            new Date(
                maxDate.getFullYear(),
                maxDate.getMonth(),
                maxDate.getDate(),
            );

    return (
        <View style={styles.wrapper}>
            <Text style={styles.monthLabel}>
                {viewDate.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                })}
            </Text>

            <View style={styles.monthNavRow}>
                <Pressable
                    android_ripple={null}
                    disabled={!canGoPrevMonth}
                    style={({ pressed }) => [
                        styles.monthNavBtn,
                        !canGoPrevMonth && styles.navBtnDisabled,
                        canGoPrevMonth &&
                            pressed && { backgroundColor: "#1a202c" },
                    ]}
                    onPress={() =>
                        canGoPrevMonth &&
                        setViewDate(
                            new Date(
                                viewDate.getFullYear(),
                                viewDate.getMonth() - 1,
                                1,
                            ),
                        )
                    }
                >
                    <MaterialCommunityIcons
                        name="chevron-left"
                        size={18}
                        color={theme.colors.textLight}
                    />
                    <Text style={styles.monthNavText}>Mês anterior</Text>
                </Pressable>

                <Pressable
                    android_ripple={null}
                    disabled={!canGoNextMonth}
                    style={({ pressed }) => [
                        styles.monthNavBtn,
                        !canGoNextMonth && styles.navBtnDisabled,
                        canGoNextMonth &&
                            pressed && { backgroundColor: "#1a202c" },
                    ]}
                    onPress={() =>
                        canGoNextMonth &&
                        setViewDate(
                            new Date(
                                viewDate.getFullYear(),
                                viewDate.getMonth() + 1,
                                1,
                            ),
                        )
                    }
                >
                    <Text style={styles.monthNavText}>Próximo mês</Text>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={theme.colors.textLight}
                    />
                </Pressable>
            </View>

            <View style={styles.weekHeader}>
                {WEEKDAY_LABELS.map((label, index) => (
                    <Text key={`${label}-${index}`} style={styles.weekLabel}>
                        {label}
                    </Text>
                ))}
            </View>

            {weeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.weekRow}>
                    {week.map((dayCell) => {
                        const selected = isSameDay(dayCell.date, selectedDate);
                        const disabled = isOutOfRange(dayCell.date);

                        return (
                            <Pressable
                                key={dayCell.key}
                                android_ripple={null}
                                disabled={disabled}
                                style={({ pressed }) => [
                                    styles.dayBtn,
                                    !dayCell.isCurrentMonth &&
                                        styles.dayBtnOutsideMonth,
                                    selected && styles.dayBtnSelected,
                                    pressed &&
                                        !disabled && {
                                            backgroundColor: selected
                                                ? "#1a202c"
                                                : "rgba(45, 55, 72, 0.1)",
                                        },
                                ]}
                                onPress={() =>
                                    !disabled && onSelectDate(dayCell.date)
                                }
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        !dayCell.isCurrentMonth &&
                                            styles.dayTextOutsideMonth,
                                        selected && styles.dayTextSelected,
                                        disabled && styles.dayTextDisabled,
                                    ]}
                                >
                                    {dayCell.date.getDate()}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ))}

            <View style={styles.searchRow}>
                <TextInput
                    value={inputDate}
                    onChangeText={(value) => {
                        setInputDate(value);
                        if (inputError) setInputError("");
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.searchInput}
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="done"
                    onSubmitEditing={handleInputSubmit}
                />
                <Pressable
                    android_ripple={null}
                    style={({ pressed }) => [
                        styles.searchBtn,
                        pressed && { backgroundColor: "#1a202c" },
                    ]}
                    onPress={handleInputSubmit}
                >
                    <Text style={styles.searchBtnText}>Ir</Text>
                </Pressable>
            </View>

            {!!inputError && (
                <Text style={styles.inputError}>{inputError}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: theme.colors.backgroundAlt,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 12,
        marginBottom: 18,
    },
    monthLabel: {
        color: theme.colors.textDark,
        fontSize: 14,
        marginBottom: 10,
        fontFamily:
            Platform.OS === "web"
                ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
                : undefined,
        fontWeight: "700",
    },
    monthNavRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    monthNavBtn: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    navBtnDisabled: {
        opacity: 0.45,
    },
    monthNavText: {
        fontFamily: theme.fonts.bold,
        fontSize: 12,
        color: theme.colors.textLight,
    },
    weekHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    weekLabel: {
        width: "14.28%",
        textAlign: "center",
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        color: theme.colors.textMuted,
        marginTop: 7,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    dayBtn: {
        width: "14.28%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        height: 36,
    },
    dayBtnOutsideMonth: {
        opacity: 0.8,
    },
    dayBtnSelected: {
        backgroundColor: theme.colors.textDark,
    },
    dayText: {
        color: theme.colors.calendarDayText,
        fontSize: 13,
        fontFamily:
            Platform.OS === "web"
                ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
                : undefined,
        fontWeight: "700",
    },
    dayTextOutsideMonth: {
        color: theme.colors.calendarDayText,
    },
    dayTextSelected: {
        color: theme.colors.textLight,
    },
    dayTextDisabled: {
        opacity: 0.3,
    },
    searchRow: {
        marginTop: 10,
        flexDirection: "row",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.textDark,
        fontSize: 13,
        fontFamily:
            Platform.OS === "web"
                ? "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
                : undefined,
        fontWeight: "400",
    },
    searchBtn: {
        backgroundColor: theme.colors.textDark,
        borderRadius: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBtnText: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.surface,
        fontSize: 13,
    },
    inputError: {
        marginTop: 8,
        fontFamily: theme.fonts.regular,
        fontSize: 12,
        color: theme.colors.textMuted,
    },
});
