import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3000";
const API_URL =
    process.env.EXPO_PUBLIC_ARDUINO_API_URL?.trim() || DEFAULT_API_URL;

const DEFAULT_TIMEOUT_MS = 10000;
const API_TIMEOUT_MS =
    Number(process.env.EXPO_PUBLIC_ARDUINO_API_TIMEOUT_MS) ||
    DEFAULT_TIMEOUT_MS;

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT_MS,
});

axiosInstance.interceptors.response.use(
    (r) => r,
    (err) => {
        try {
            const payload = err?.toJSON ? err.toJSON() : { message: err.message };
            console.error("[arduinoService][axios error]", payload);
        } catch (e) {
            console.error("[arduinoService][axios error] could not serialize error", err);
        }
        return Promise.reject(err);
    },
);

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function normalizeArduinoStatusData(raw) {
    return {
        estendido: Boolean(raw?.estendido),
        chuva: Boolean(raw?.chuva),
        roupa: Boolean(raw?.roupa),
    };
}

export function subscribeArduinoCommandErrors(subscriber) {
    commandErrorSubscribers.add(subscriber);
    return () => {
        commandErrorSubscribers.delete(subscriber);
    };
}

export async function fetchArduinoStatusVerbose() {
    const maxAttempts = 3;
    const retryDelays = [0, 500, 1000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            if (retryDelays[attempt - 1]) await delay(retryDelays[attempt - 1]);
            const response = await axiosInstance.get(`/status`);
            const normalizedData = normalizeArduinoStatusData(response.data);
            const isOnline = response?.data?.online !== false;
            const offlineError =
                response?.data?.error ||
                "Arduino desconectado ou não detectado.";

            return {
                data: normalizedData,
                error: isOnline ? null : offlineError,
                isOnline,
            };
        } catch (error) {
            if (attempt === maxAttempts) {
                const detailedError = buildDetailedArduinoError(
                    "Erro ao buscar status do Arduino",
                    error,
                );
                console.error(
                    "[arduinoService] erro final ao buscar status:",
                    detailedError,
                );
                return {
                    data: normalizeArduinoStatusData(null),
                    error: detailedError,
                    isOnline: false,
                };
            }
            console.warn(
                `[arduinoService] tentativa ${attempt} falhou: ${error?.message}`,
            );
        }
    }
}

export async function fetchArduinoStatus() {
    const { data } = await fetchArduinoStatusVerbose();
    return data; // Retorna { estendido, chuva, roupa }
}

export async function sendCommandToArduino(action) {
    try {
        const response = await axiosInstance.post(`/command`, { action });
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
