export const MOCK_HOURLY_FORECAST = [
    {
        id: "1",
        time: "06:00",
        icon: "weather-cloudy",
        temp: "25°",
        iconColor: "#A0AEC0",
    },
    {
        id: "2",
        time: "09:00",
        icon: "weather-partly-cloudy",
        temp: "28°",
        iconColor: "#ECC94B",
    },
    {
        id: "3",
        time: "12:00",
        icon: "weather-sunny",
        temp: "33°",
        iconColor: "#ECC94B",
    },
    {
        id: "4",
        time: "15:00",
        icon: "weather-sunny",
        temp: "34°",
        iconColor: "#ECC94B",
    },
    {
        id: "5",
        time: "18:00",
        icon: "weather-sunny",
        temp: "32°",
        iconColor: "#ECC94B",
    },
    {
        id: "6",
        time: "21:00",
        icon: "weather-partly-cloudy",
        temp: "30°",
        iconColor: "#ECC94B",
    },
];

export const MOCK_HISTORY = [
    { id: "1", label: "Hoje, 09:00 - Exposto (Automático)" },
    { id: "2", label: "Ontem, 18:30 - Recolhido (Chuva leve)" },
    { id: "3", label: "Ontem, 08:15 - Exposto (Automático)" },
    { id: "4", label: "02 de Mar, 19:00 - Recolhido (Fim do dia)" },
];

// Estado mockado do Arduino
export const MOCK_ARDUINO_STATE = {
    isClotheslineExposed: true,
    lastUpdated: "09:00",
};
