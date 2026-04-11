import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { LOCATION_OPTIONS } from "../data/locationOptions";
import {
    fetchCityName,
    fetchCurrentWeather,
    fetchHourlyForecast,
    isOpenWeatherConfigured,
} from "../services/weatherService";
import { getForecastItemsForDate } from "../utils/forecastDateUtils";
import {
    getEffectiveCondition,
    getSkyConditionFromIcon,
    getWeatherStatusText,
} from "../utils/weatherUtils";

const DEFAULT_LOCATION = {
    countryCode: "BR",
    countryName: "Brasil",
    stateCode: "SP",
    stateName: "São Paulo",
    city: "São Paulo",
    cityName: "São Paulo",
    latitude: -23.5505,
    longitude: -46.6333,
};
const DEFAULT_LOCATION_KEY = "defaultLocationPreference";

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function findRegisteredLocationByCity(cityName) {
    const targetCity = normalizeText(cityName);
    if (!targetCity) return null;

    for (const country of LOCATION_OPTIONS) {
        for (const state of country.states) {
            const matchedCity = state.cities.find(
                (city) => normalizeText(city.name) === targetCity,
            );
            if (matchedCity) {
                return {
                    countryCode: country.code,
                    countryName: country.name,
                    stateCode: state.code,
                    stateName: state.name,
                    city: matchedCity.name,
                    cityName: matchedCity.name,
                    latitude: matchedCity.latitude,
                    longitude: matchedCity.longitude,
                };
            }
        }
    }

    return null;
}

export function useWeather() {
    const [manualLocation, setManualLocation] = useState(null);
    const [defaultLocation, setDefaultLocation] = useState(DEFAULT_LOCATION);
    const [reloadToken, setReloadToken] = useState(0);
    const [state, setState] = useState({
        condition: "sunny",
        statusText: "Carregando...",
        city: null,
        forecastList: [],
        hourlyForecast: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        async function getPersistedDefaultLocation() {
            try {
                const rawValue =
                    await AsyncStorage.getItem(DEFAULT_LOCATION_KEY);
                if (!rawValue) return DEFAULT_LOCATION;
                const parsed = JSON.parse(rawValue);
                if (
                    typeof parsed?.latitude !== "number" ||
                    typeof parsed?.longitude !== "number"
                ) {
                    return DEFAULT_LOCATION;
                }
                return { ...DEFAULT_LOCATION, ...parsed };
            } catch {
                return DEFAULT_LOCATION;
            }
        }

        async function load() {
            if (!isOpenWeatherConfigured()) {
                if (!cancelled) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: "Erro ao tentar acessar a previsão do tempo com a API OpenWeatherMap. Verifique a configuração da sua chave da API e tente novamente.",
                    }));
                }
                return;
            }

            const resolvedDefaultLocation = await getPersistedDefaultLocation();
            if (!cancelled) {
                setDefaultLocation(resolvedDefaultLocation);
            }

            let lat =
                manualLocation?.latitude ?? resolvedDefaultLocation.latitude;
            let lon =
                manualLocation?.longitude ?? resolvedDefaultLocation.longitude;
            let usedFallbackLocation = false;
            const usedManualLocation = Boolean(manualLocation);

            if (!usedManualLocation) {
                try {
                    const { status } =
                        await Location.requestForegroundPermissionsAsync();
                    if (status !== "granted") {
                        usedFallbackLocation = true;
                        if (__DEV__) {
                            console.warn(
                                "[useWeather] Permissão de localização negada. Usando fallback.",
                            );
                        }
                    } else {
                        const loc = await Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.Balanced,
                        });
                        lat = loc.coords.latitude;
                        lon = loc.coords.longitude;
                    }
                } catch (locationError) {
                    usedFallbackLocation = true;
                    const isKnownWebLocationFailure =
                        locationError?.message?.includes(
                            "Failed to query location from network service",
                        );
                    if (__DEV__ && !isKnownWebLocationFailure) {
                        console.warn(
                            "[useWeather] Falha ao obter localização:",
                            {
                                message: locationError?.message,
                            },
                        );
                    }
                }
            }

            if (__DEV__) {
                const source = usedManualLocation
                    ? "manual"
                    : usedFallbackLocation
                      ? "fallback"
                      : "dispositivo";
                console.log(
                    `[useWeather] Origem da localização: ${source} | lat=${lat.toFixed(4)}, lon=${lon.toFixed(4)}`,
                );
            }

            const [resolvedCity, current, forecastList] = await Promise.all([
                fetchCityName(lat, lon),
                fetchCurrentWeather(lat, lon),
                fetchHourlyForecast(lat, lon),
            ]);

            const cityFromApi = resolvedCity ?? current?.city ?? null;
            const resolvedDefaultFromDevice =
                !usedManualLocation && !usedFallbackLocation
                    ? findRegisteredLocationByCity(cityFromApi)
                    : null;
            const nextDefaultLocation =
                resolvedDefaultFromDevice ?? DEFAULT_LOCATION;

            if (!usedManualLocation && !cancelled) {
                const defaultChanged =
                    resolvedDefaultLocation.cityName !==
                        nextDefaultLocation.cityName ||
                    resolvedDefaultLocation.stateCode !==
                        nextDefaultLocation.stateCode ||
                    resolvedDefaultLocation.countryCode !==
                        nextDefaultLocation.countryCode;

                if (defaultChanged) {
                    await setDefaultLocationPreference(nextDefaultLocation);
                    if (__DEV__) {
                        console.log(
                            `[useWeather] Local padrão atualizado automaticamente: ${nextDefaultLocation.cityName}`,
                        );
                    }
                }
            }

            const city = manualLocation?.city ?? cityFromApi;
            const hourlyForecast = getForecastItemsForDate(
                forecastList,
                new Date(),
            );

            const condition = getSkyConditionFromIcon(current.icon);
            const effectiveCondition = getEffectiveCondition(condition);
            if (__DEV__) {
                console.log(
                    `[useWeather] Cidade (OWM reverse geocoding): ${resolvedCity}`,
                );
                console.log(
                    `[useWeather] Clima: ${current.description} (${current.icon}) → condition=${condition} | effective=${effectiveCondition}`,
                );
                console.log(`[useWeather] Temp atual: ${current.temp}°C`);
                console.log(
                    `[useWeather] Itens de previsão para hoje: ${hourlyForecast.length}`,
                );
            }

            if (!cancelled) {
                setState({
                    condition: effectiveCondition,
                    statusText: getWeatherStatusText(effectiveCondition),
                    city,
                    forecastList,
                    hourlyForecast,
                    isLoading: false,
                    error: null,
                });
            }
        }

        load().catch((err) => {
            if (cancelled) return;
            let message = "Erro ao carregar previsão.";
            if (err?.message === "MISSING_OWM_API_KEY") {
                message =
                    "Chave da API ausente. Configure EXPO_PUBLIC_OWM_API_KEY no .env e reinicie o Expo.";
            } else if (err?.response?.status === 401) {
                message =
                    "Chave OpenWeatherMap inválida ou expirada. Verifique EXPO_PUBLIC_OWM_API_KEY no .env.";
            } else if (err?.response?.status === 429) {
                message =
                    "Limite de requisições da API atingido. Tente mais tarde.";
            } else if (err?.response?.status) {
                const status = err.response.status;
                const details =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "";
                message = `Erro na API (HTTP ${status}).${details ? ` ${details}` : ""}`;
            } else if (
                err?.message?.includes(
                    "Failed to query location from network service",
                )
            ) {
                message =
                    "Não foi possível usar sua localização agora. Tente novamente em instantes.";
            } else if (err?.message) {
                message = `Erro ao carregar previsão: ${err.message}`;
            }
            if (__DEV__) {
                console.warn("[useWeather] Erro:", {
                    message: err?.message,
                    status: err?.response?.status,
                    data: err?.response?.data,
                });
            }
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
        });

        return () => {
            cancelled = true;
        };
    }, [manualLocation, reloadToken]);

    function setManualLocationAndReload(location) {
        const nextLocation = { ...DEFAULT_LOCATION, ...location };
        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
        }));
        setManualLocation(nextLocation);
        setReloadToken((prev) => prev + 1);
    }

    function clearManualLocationAndReload() {
        setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
        }));
        setManualLocation(null);
        setReloadToken((prev) => prev + 1);
    }

    async function setDefaultLocationPreference(location) {
        const nextLocation = { ...DEFAULT_LOCATION, ...location };
        setDefaultLocation(nextLocation);
        try {
            await AsyncStorage.setItem(
                DEFAULT_LOCATION_KEY,
                JSON.stringify(nextLocation),
            );
        } catch {
            // Ignore persistence errors to avoid blocking UI flow.
        }
    }

    return {
        ...state,
        manualLocation,
        defaultLocation,
        setManualLocation: setManualLocationAndReload,
        clearManualLocation: clearManualLocationAndReload,
        setDefaultLocationPreference,
    };
}
