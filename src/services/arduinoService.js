import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3000";
const API_URL =
    process.env.EXPO_PUBLIC_ARDUINO_API_URL?.trim() || DEFAULT_API_URL;

const commandErrorSubscribers = new Set();

function buildDetailedArduinoError(prefix, error) {
    const baseMessage = error?.message ?? "Network Error";
    const details = [];

    if (error?.code) {
        details.push(`code=${error.code}`);
    }

    if (error?.response?.status) {
        details.push(`http=${error.response.status}`);
    }

    const apiDetail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.statusText;

    if (apiDetail) {
        details.push(`detail=${apiDetail}`);
    }

    return `${prefix}: ${baseMessage}${details.length ? ` (${details.join(" | ")})` : ""}`;
}

function publishCommandError(event) {
    commandErrorSubscribers.forEach((subscriber) => subscriber(event));
}

export function subscribeArduinoCommandErrors(subscriber) {
    commandErrorSubscribers.add(subscriber);
    return () => {
        commandErrorSubscribers.delete(subscriber);
    };
}

export async function fetchArduinoStatusVerbose() {
    try {
        const response = await axios.get(`${API_URL}/status`);
        return { data: response.data, error: null };
    } catch (error) {
        const detailedError = buildDetailedArduinoError(
            "Erro ao buscar status do Arduino",
            error,
        );
        return { data: null, error: detailedError };
    }
}

export async function fetchArduinoStatus() {
    const { data } = await fetchArduinoStatusVerbose();
    return data; // Retorna { estendido, chuva, roupa }
}

export async function sendCommandToArduino(action) {
    try {
        const response = await axios.post(`${API_URL}/command`, { action });
        publishCommandError({
            message: null,
            at: new Date().toISOString(),
            action,
        });
        return response.data.success;
    } catch (error) {
        const detailedError = buildDetailedArduinoError(
            "Erro ao enviar comando para a API",
            error,
        );
        publishCommandError({
            message: detailedError,
            at: new Date().toISOString(),
            action,
        });
        return false;
    }
}
