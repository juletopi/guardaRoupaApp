import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3000";
const API_URL =
    process.env.EXPO_PUBLIC_ARDUINO_API_URL?.trim() || DEFAULT_API_URL;

export async function fetchArduinoStatus() {
    try {
        const response = await axios.get(`${API_URL}/status`);
        return response.data; // Retorna { estendido, chuva, roupa }
    } catch (error) {
        console.error("Erro ao buscar status do Arduino:", error.message);
        return null;
    }
}

export async function sendCommandToArduino(action) {
    try {
        const response = await axios.post(`${API_URL}/command`, { action });
        return response.data.success;
    } catch (error) {
        console.error("Erro ao enviar comando para a API:", error.message);
        return false;
    }
}