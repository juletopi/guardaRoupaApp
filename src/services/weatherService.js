import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.EXPO_PUBLIC_OWM_API_KEY?.trim();

export function isOpenWeatherConfigured() {
    return Boolean(API_KEY);
}

const defaultParams = (lat, lon) => ({
    lat,
    lon,
    appid: API_KEY,
    units: "metric",
    lang: "pt_br",
});

export async function fetchCurrentWeather(lat, lon) {
    if (!API_KEY) {
        throw new Error("MISSING_OWM_API_KEY");
    }
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: defaultParams(lat, lon),
    });
    const { main, weather, name } = response.data;
    return {
        temp: Math.round(main.temp),
        description: weather[0].description,
        icon: weather[0].icon,
        city: name,
    };
}

export async function fetchHourlyForecast(lat, lon) {
    if (!API_KEY) {
        throw new Error("MISSING_OWM_API_KEY");
    }
    const response = await axios.get(`${BASE_URL}/forecast`, {
        params: { ...defaultParams(lat, lon), cnt: 40 },
    });
    return response.data.list;
}

export async function fetchCityName(lat, lon) {
    if (!API_KEY) {
        throw new Error("MISSING_OWM_API_KEY");
    }
    const response = await axios.get(
        "https://api.openweathermap.org/geo/1.0/reverse",
        {
            params: { lat, lon, limit: 1, appid: API_KEY },
        },
    );
    return response.data[0]?.local_names?.pt ?? response.data[0]?.name ?? null;
}
