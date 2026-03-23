import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { LOCATION_OPTIONS } from "../data/locationOptions";

function OptionList({ options, selectedValue, onSelect, emptyLabel }) {
    if (!options || options.length === 0) {
        return <Text style={styles.emptyText}>{emptyLabel}</Text>;
    }

    return (
        <View style={styles.optionList}>
            {options.map((option) => {
                const isActive = option.code === selectedValue;
                return (
                    <TouchableOpacity
                        key={option.code}
                        activeOpacity={0.75}
                        style={[styles.optionBtn, isActive && styles.optionBtnActive]}
                        onPress={() => onSelect(option.code)}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                isActive && styles.optionTextActive,
                            ]}
                        >
                            {option.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function LocationSelectModal({
    visible,
    onClose,
    onConfirm,
    onUseCurrentLocation,
    currentSelection,
    defaultLocation,
}) {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [shouldSaveAsDefault, setShouldSaveAsDefault] = useState(false);

    useEffect(() => {
        if (!visible) return;
        const baseSelection = currentSelection ?? defaultLocation ?? null;
        setSelectedCountry(baseSelection?.countryCode ?? null);
        setSelectedState(baseSelection?.stateCode ?? null);
        setSelectedCity(baseSelection?.cityName ?? null);
        setShouldSaveAsDefault(false);
    }, [currentSelection, defaultLocation, visible]);

    const countries = useMemo(
        () => LOCATION_OPTIONS.map(({ code, name }) => ({ code, name })),
        [],
    );

    const states = useMemo(() => {
        const country = LOCATION_OPTIONS.find((item) => item.code === selectedCountry);
        if (!country) return [];
        return country.states.map(({ code, name }) => ({ code, name }));
    }, [selectedCountry]);

    const cities = useMemo(() => {
        const country = LOCATION_OPTIONS.find((item) => item.code === selectedCountry);
        const state = country?.states.find((item) => item.code === selectedState);
        if (!state) return [];
        return state.cities.map(({ name }) => ({ code: name, name }));
    }, [selectedCountry, selectedState]);

    const selectedPayload = useMemo(() => {
        const country = LOCATION_OPTIONS.find((item) => item.code === selectedCountry);
        const state = country?.states.find((item) => item.code === selectedState);
        const city = state?.cities.find((item) => item.name === selectedCity);
        if (!country || !state || !city) return null;
        return {
            countryCode: country.code,
            countryName: country.name,
            stateCode: state.code,
            stateName: state.name,
            city: city.name,
            cityName: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
        };
    }, [selectedCity, selectedCountry, selectedState]);

    function handleCountrySelect(countryCode) {
        setSelectedCountry(countryCode);
        setSelectedState(null);
        setSelectedCity(null);
    }

    function handleStateSelect(stateCode) {
        setSelectedState(stateCode);
        setSelectedCity(null);
    }

    function handleConfirm() {
        if (!selectedPayload) return;
        onConfirm(selectedPayload, { setAsDefault: shouldSaveAsDefault });
        onClose();
    }

    return (
        <Modal
            animationType="none"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.backdrop}
                onPress={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
            >
                <Pressable onPress={(event) => event.stopPropagation()}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Selecionar local</Text>
                            <Text style={styles.subtitle}>
                                Local padrão: {defaultLocation?.city ?? "São Paulo"}
                            </Text>
                        </View>

                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.content}
                            showsVerticalScrollIndicator={false}
                        >
                            <View>
                                <Text style={styles.label}>País</Text>
                                <OptionList
                                    options={countries}
                                    selectedValue={selectedCountry}
                                    onSelect={handleCountrySelect}
                                    emptyLabel="Sem países disponíveis"
                                />
                            </View>

                            {selectedCountry && (
                                <Animated.View
                                    entering={FadeIn.duration(180)}
                                >
                                    <View style={styles.divider} />
                                    <Text style={styles.label}>Estado</Text>
                                    <OptionList
                                        options={states}
                                        selectedValue={selectedState}
                                        onSelect={handleStateSelect}
                                        emptyLabel="Selecione um país primeiro"
                                    />
                                </Animated.View>
                            )}

                            {selectedState && (
                                <Animated.View
                                    entering={FadeIn.duration(180)}
                                >
                                    <View style={styles.divider} />
                                    <Text style={styles.label}>Município</Text>
                                    <OptionList
                                        options={cities}
                                        selectedValue={selectedCity}
                                        onSelect={setSelectedCity}
                                        emptyLabel="Selecione um estado primeiro"
                                    />

                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        style={styles.defaultQuestionRow}
                                        onPress={() =>
                                            selectedPayload &&
                                            setShouldSaveAsDefault((prev) => !prev)
                                        }
                                        disabled={!selectedPayload}
                                    >
                                        <MaterialCommunityIcons
                                            name={
                                                shouldSaveAsDefault
                                                    ? "checkbox-marked"
                                                    : "checkbox-blank-outline"
                                            }
                                            size={22}
                                            color={
                                                selectedPayload
                                                    ? theme.colors.primary
                                                    : theme.colors.textMuted
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.defaultQuestionText,
                                                !selectedPayload &&
                                                    styles.defaultQuestionTextDisabled,
                                            ]}
                                        >
                                            {selectedPayload
                                                ? `Salvar ${selectedPayload.city} como padrão?`
                                                : "Selecione um município para definir como padrão"}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </ScrollView>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.secondaryBtn]}
                                onPress={() => {
                                    onUseCurrentLocation();
                                    onClose();
                                }}
                            >
                                <Text style={styles.secondaryBtnText}>
                                    Usar localização atual
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.actionBtn,
                                    styles.primaryBtn,
                                    !selectedPayload && styles.primaryBtnDisabled,
                                ]}
                                onPress={handleConfirm}
                                disabled={!selectedPayload}
                            >
                                <Text style={styles.primaryBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        maxWidth: 570,
        height: 580,
        maxHeight: "85%",
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
        overflow: "hidden", 
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontFamily: theme.fonts.black,
        fontSize: 20,
        color: theme.colors.textDark,
    },
    subtitle: {
        marginTop: 2,
        fontFamily: theme.fonts.regular,
        fontSize: 13,
        color: theme.colors.textMuted,
    },
    content: {
        flexGrow: 1,
        paddingTop: 4,
        paddingBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginTop: 20,
        marginBottom: 8,
    },
    label: {
        marginBottom: 10,
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        color: theme.colors.textDark,
    },
    optionList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "flex-start",
    },
    optionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundAlt,
        borderWidth: 1,
        borderColor: "transparent",
    },
    optionBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontFamily: theme.fonts.regular,
        fontSize: 13,
        color: theme.colors.textDark,
    },
    optionTextActive: {
        color: theme.colors.textLight,
        fontFamily: theme.fonts.bold,
    },
    emptyText: {
        fontFamily: theme.fonts.regular,
        fontSize: 13,
        color: theme.colors.textMuted,
        opacity: 0.8,
    },
    defaultQuestionRow: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.backgroundAlt,
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    defaultQuestionText: {
        flex: 1,
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        color: theme.colors.textDark,
    },
    defaultQuestionTextDisabled: {
        fontFamily: theme.fonts.regular,
        color: theme.colors.textMuted,
    },
    actions: {
        paddingTop: 16,
        flexDirection: "row",
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.06)",
    },
    actionBtn: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryBtn: {
        backgroundColor: theme.colors.backgroundAlt,
    },
    secondaryBtnText: {
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        color: theme.colors.textDark,
    },
    primaryBtn: {
        backgroundColor: theme.colors.primary,
    },
    primaryBtnDisabled: {
        opacity: 0.5,
    },
    primaryBtnText: {
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        color: theme.colors.textLight,
    },
});
