import { formatRelativeDayLabel, startOfDay } from "./forecastDateUtils";

export function formatHistoryEntryLabel(entry) {
    try {
        const timestamp = new Date(entry.timestamp);
        const datePart = formatRelativeDayLabel(startOfDay(timestamp));
        const timePart = timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const statusPart = entry.status || "Desconhecido";
        const exposedPart = entry.isExposed ? "Exposto" : "Recolhido";

        return `${datePart}, ${timePart} - ${exposedPart} (${statusPart})`;
    } catch (error) {
        console.error("Erro ao formatar entrada do histórico:", error);
        return "Erro ao formatar";
    }
}

export function getStatusIcon(status) {
    const iconMap = {
        Automático: "calendar-check",
        Manual: "hand-okay",
        "Chuva detectada": "cloud-rain",
        "Fim do dia": "weather-sunset",
    };

    return iconMap[status] || "information";
}

export function getStatusColor(status) {
    const colorMap = {
        Automático: "#3182CE",
        Manual: "#805AD5",
        "Chuva detectada": "#DD6B20",
        "Fim do dia": "#D69E2E",
    };

    return colorMap[status] || "#718096";
}
