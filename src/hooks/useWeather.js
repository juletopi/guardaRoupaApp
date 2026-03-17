import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  fetchCityName,
  fetchCurrentWeather,
  fetchHourlyForecast,
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
      const { status } = await Location.requestForegroundPermissionsAsync();
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

      const hourlyForecast = getForecastItemsForDate(forecastList, new Date());

      const condition = getSkyConditionFromIcon(current.icon);
      if (__DEV__) {
        console.log(`[useWeather] Cidade (OWM reverse geocoding): ${city}`);
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

    load().catch(() => {
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Erro ao carregar previsão.",
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
