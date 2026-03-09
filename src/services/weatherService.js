import axios from 'axios';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(lat, lon, apiKey) {
    const response = await axios.get(WEATHER_API_URL, {
        params: {
            lat,
            lon,
            appid: apiKey,
            units: 'metric',
            lang: 'pt_br',
        },
    });

    const data = response.data;
    return {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
    };
}
