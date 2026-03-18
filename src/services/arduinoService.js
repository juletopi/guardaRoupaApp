import axios from "axios";

// Atualizar depois para o IP do Arduino na rede local
const ARDUINO_BASE_URL = "http://192.168.1.100";

export async function getDoorState() {
    const response = await axios.get(`${ARDUINO_BASE_URL}/status`);
    return response.data.state;
}

export async function toggleDoor() {
    const response = await axios.post(`${ARDUINO_BASE_URL}/toggle`);
    return response.data.state;
}
