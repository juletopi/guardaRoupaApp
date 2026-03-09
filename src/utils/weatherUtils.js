import { theme } from '../../constants/theme';

// condition: 'sunny' | 'rainy' | 'night'
// Will receive live data from weatherService once API is integrated
export function getSkyColors(condition) {
    switch (condition) {
        case 'rainy': return theme.colors.sky.rainy;
        case 'night': return theme.colors.sky.night;
        case 'sunny':
        default:      return theme.colors.sky.sunny;
    }
}

export function getWeatherStatusText(condition) {
    switch (condition) {
        case 'rainy': return 'Chuva Detectada';
        case 'night': return 'Boa Noite';
        case 'sunny':
        default:      return 'Céu Limpo';
    }
}

// Maps OpenWeatherMap icon codes (e.g. '10d') to MaterialCommunityIcons names.
// Reference: https://openweathermap.org/weather-conditions
export function mapApiIconToMCI(apiIcon) {
    const map = {
        '01d': 'weather-sunny',
        '01n': 'weather-night',
        '02d': 'weather-partly-cloudy',
        '02n': 'weather-night-partly-cloudy',
        '03d': 'weather-cloudy',         '03n': 'weather-cloudy',
        '04d': 'weather-cloudy',         '04n': 'weather-cloudy',
        '09d': 'weather-pouring',        '09n': 'weather-pouring',
        '10d': 'weather-rainy',          '10n': 'weather-rainy',
        '11d': 'weather-lightning-rainy','11n': 'weather-lightning-rainy',
        '13d': 'weather-snowy',          '13n': 'weather-snowy',
        '50d': 'weather-fog',            '50n': 'weather-fog',
    };
    return map[apiIcon] ?? 'weather-cloudy';
}
