import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
    fetchCityName,
    fetchCurrentWeather,
    fetchHourlyForecast,
    isOpenWeatherConfigured,
} from "../services/weatherService";
import { getForecastItemsForDate } from "../utils/forecastDateUtils";
import {
    getSkyConditionFromIcon,
    getWeatherStatusText,
} from "../utils/weatherUtils";

export function useWeather() {
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

        async function load() {
            if (!isOpenWeatherConfigured()) {
                if (!cancelled) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error:
                            "Erro ao tentar acessar a previsão do tempo com a API OpenWeatherMap. Verifique a configuração da sua chave da API e tente novamente.",
                    }));
                }
                return;
            }

            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                if (!cancelled) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: "Permissão de localização negada.",
                    }));
                }
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude: lat, longitude: lon } = loc.coords;
            if (__DEV__)
                console.log(
                    `[useWeather] Localização: lat=${lat.toFixed(4)}, lon=${lon.toFixed(4)}`,
                );

            const [city, current, forecastList] = await Promise.all([
                fetchCityName(lat, lon),
                fetchCurrentWeather(lat, lon),
                fetchHourlyForecast(lat, lon),
            ]);

            const hourlyForecast = getForecastItemsForDate(
                forecastList,
                new Date(),
            );

            const condition = getSkyConditionFromIcon(current.icon);
            if (__DEV__) {
                console.log(
                    `[useWeather] Cidade (OWM reverse geocoding): ${city}`,
                );
                console.log(
                    `[useWeather] Clima: ${current.description} (${current.icon}) → condition=${condition}`,
                );
                console.log(`[useWeather] Temp atual: ${current.temp}°C`);
                console.log(
                    `[useWeather] Itens de previsão para hoje: ${hourlyForecast.length}`,
                );
            }

            if (!cancelled) {
                setState({
                    condition,
                    statusText: getWeatherStatusText(condition),
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
    }, []);

    return state;
}
