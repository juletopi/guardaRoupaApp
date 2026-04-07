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
    {
        id: "1",
        timestamp: "2026-04-07T09:00:00",
        isExposed: true,
        status: "Automático",
    },
    {
        id: "2",
        timestamp: "2026-04-06T18:30:00",
        isExposed: false,
        status: "Chuva detectada",
    },
    {
        id: "3",
        timestamp: "2026-04-06T08:15:00",
        isExposed: true,
        status: "Automático",
    },
    {
        id: "4",
        timestamp: "2026-03-02T19:00:00",
        isExposed: false,
        status: "Fim do dia",
    },
];

export const MOCK_ARDUINO_STATE = {
    isClotheslineExposed: true,
    lastUpdated: "09:00",
};
