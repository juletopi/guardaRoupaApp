import { formatRelativeDayLabel, startOfDay } from "./forecastDateUtils";

export function formatHistoryEntryLabel(entry) {
    try {
        const timestamp = new Date(entry.timestamp);
        const datePart = formatRelativeDayLabel(startOfDay(timestamp));
        const timePart = timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const exposedPart = entry.isExposed ? "Exposto" : "Recolhido";

        return `${datePart}, ${timePart} - ${exposedPart}`;
    } catch (error) {
        console.error("Erro ao formatar entrada do histórico:", error);
        return "Erro ao formatar";
    }
}

export function getStatusIcon(status) {
    const iconMap = {
        Automático: "calendar-check",
        Manual: "hand-okay",
        "Chuva detectada": "water",
        "Fim do dia": "moon-waning-crescent",
    };

    return iconMap[status] || "information";
}

export function getStatusBadgeConfig(status) {
    const normalizedStatus = status || "Desconhecido";
    const accentColorMap = {
        Automático: "#3CAAA5",
        Manual: "#6B7280",
        "Chuva detectada": "#3182CE",
        "Fim do dia": "#805AD5",
    };
    const accentColor = accentColorMap[normalizedStatus] || "#718096";

    const badgeConfigMap = {
        Automático: {
            label: "Automático",
            iconName: getStatusIcon("Automático"),
            textColor: "#3CAAA5",
            backgroundColor: "rgba(6, 212, 167, 0.14)",
        },
        Manual: {
            label: "Manual",
            iconName: getStatusIcon("Manual"),
            textColor: "#4B5563",
            backgroundColor: "rgba(107, 114, 128, 0.14)",
        },
        "Chuva detectada": {
            label: "Chuva detectada",
            iconName: getStatusIcon("Chuva detectada"),
            textColor: "#1E4E8C",
            backgroundColor: "rgba(49, 130, 206, 0.14)",
        },
        "Fim do dia": {
            label: "Fim do dia",
            iconName: getStatusIcon("Fim do dia"),
            textColor: "#5B21B6",
            backgroundColor: "rgba(128, 90, 213, 0.14)",
        },
    };

    return (
        badgeConfigMap[normalizedStatus] ?? {
            label: normalizedStatus,
            iconName: getStatusIcon(normalizedStatus),
            textColor: accentColor,
            backgroundColor: "rgba(113, 128, 150, 0.14)",
        }
    );
}
