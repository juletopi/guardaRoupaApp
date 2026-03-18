import { theme } from "../../constants/theme";

export function getSkyColors(condition) {
    switch (condition) {
        case "rainy":
            return theme.colors.sky.rainy;
        case "night":
            return theme.colors.sky.night;
        case "sunny":
        default:
            return theme.colors.sky.sunny;
    }
}

export function getWeatherStatusText(condition) {
    switch (condition) {
        case "rainy":
            return "Chuva Detectada";
        case "night":
            return "Boa Noite";
        case "sunny":
        default:
            return "Céu Limpo";
    }
}

export function getSkyConditionFromIcon(icon) {
    if (!icon) return "sunny";
    if (icon.endsWith("n")) return "night";
    const code = icon.slice(0, 2);
    if (["09", "10", "11"].includes(code)) return "rainy";
    return "sunny";
}

export function getIconColor(apiIcon) {
    if (!apiIcon) return "#A0AEC0";
    const isNight = apiIcon.endsWith("n");
    const code = apiIcon.slice(0, 2);
    if (code === "01") return isNight ? "#667EEA" : "#ECC94B";
    if (code === "02") return isNight ? "#A0AEC0" : "#ECC94B";
    if (["03", "04"].includes(code)) return "#A0AEC0";
    if (["09", "10"].includes(code)) return "#63B3ED";
    if (code === "11") return "#9F7AEA";
    if (code === "13") return "#BEE3F8";
    if (code === "50") return "#CBD5E0";
    return "#A0AEC0";
}

// OpenWeatherMap -> MaterialCommunityIcons
// Referência: https://openweathermap.org/weather-conditions
export function mapApiIconToMCI(apiIcon) {
    const map = {
        "01d": "weather-sunny",
        "01n": "weather-night",
        "02d": "weather-partly-cloudy",
        "02n": "weather-night-partly-cloudy",
        "03d": "weather-cloudy",
        "03n": "weather-cloudy",
        "04d": "weather-cloudy",
        "04n": "weather-cloudy",
        "09d": "weather-pouring",
        "09n": "weather-pouring",
        "10d": "weather-rainy",
        "10n": "weather-rainy",
        "11d": "weather-lightning-rainy",
        "11n": "weather-lightning-rainy",
        "13d": "weather-snowy",
        "13n": "weather-snowy",
        "50d": "weather-fog",
        "50n": "weather-fog",
    };
    return map[apiIcon] ?? "weather-cloudy";
}
