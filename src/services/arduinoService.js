import axios from "axios";

// ATENÇÃO: Se for testar no celular físico via Wi-Fi, troque localhost pelo seu IP (ex: "http://192.168.1.15:3000")
const API_URL = "http://localhost:3000";

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