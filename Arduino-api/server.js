const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(cors());
app.use(express.json());

// Default = null
// Use true ou false para forçar o modo manualmente durante testes de conexão do Arduino
const DEBUG_MOCK_OVERRIDE = null;
const ENV_MOCK_ENABLED = process.env.ARDUINO_API_MOCK === "1";
const USE_MOCK = DEBUG_MOCK_OVERRIDE ?? ENV_MOCK_ENABLED;

let port = null;
let parser = null;
let isArduinoConnected = false;

let arduinoStatus = { estendido: false, chuva: false, roupa: false };

function initializeArduino() {
    if (USE_MOCK) {
        console.log("[API] Modo MOCK ativado: servindo status falso para desenvolvimento");
        isArduinoConnected = true;
        setInterval(() => {
            arduinoStatus.chuva = !arduinoStatus.chuva;
        }, 5000);
        return;
    }
    try {
        port = new SerialPort({ path: "COM9", baudRate: 9600 });
        parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        parser.on("data", (data) => {
            try {
                if (data.startsWith("{")) {
                    arduinoStatus = JSON.parse(data);
                    isArduinoConnected = true;
                }
            } catch (e) {
                console.error("Erro ao parsear dados do Arduino:", data);
            }
        });

        port.on("error", (err) => {
            console.error("[API] Erro na porta serial:", err.message);
            isArduinoConnected = false;
        });

        port.on("close", () => {
            console.log("[API] Porta serial fechada");
            isArduinoConnected = false;
        });

        setInterval(() => {
            if (port && port.isOpen) {
                port.write("S");
            }
        }, 2000); // Intervalo de status a cada 2 seg

        console.log("[API] Arduino conectado com sucesso!");
        isArduinoConnected = true;
    } catch (error) {
        console.warn("[API] Arduino não detectado:", error.message);
        console.warn(
            "[API] API rodando em modo offline - retornará status online=false até que o Arduino seja conectado.",
        );
        isArduinoConnected = false;
    }
}

initializeArduino();

// Ler o status no App
app.get("/status", (req, res) => {
    if (!isArduinoConnected) {
        return res.json({
            online: false,
            error: "Arduino desconectado ou não detectado. Verifique a conexão USB e a porta serial configurada.",
            status: "offline",
            ...arduinoStatus,
        });
    }
    res.json({
        online: true,
        ...arduinoStatus,
    });
});

// Enviar comandos (E ou R)
app.post("/command", (req, res) => {
    const { action } = req.body;
    console.log(
        `\n[API] Recebeu pedido do App para: ${action === "E" ? "ESTENDER" : "RECOLHER"}`,
    );

    if (!isArduinoConnected) {
        console.warn("[API] Tentativa de enviar comando sem Arduino conectado");
        if (USE_MOCK) {
            // Em modo mock aceitamos o comando e simulamos sucesso
            console.log(`[API-MOCK] Comando simulado: ${action}`);
            if (action === "E") arduinoStatus.estendido = true;
            if (action === "R") arduinoStatus.estendido = false;
            return res.json({ success: true, message: `Comando ${action} (mock) recebido.` });
        }
        return res.status(503).json({
            error: "Arduino desconectado. Não é possível enviar comandos.",
            success: false,
        });
    }

    if (action === "E" || action === "R") {
        port.write(action, (err) => {
            if (err) {
                console.error(
                    "[API] Erro ao enviar para o Arduino:",
                    err.message,
                );
                return res.status(500).json({ error: "Erro na porta serial." });
            }
            console.log(
                `[API] Comando '${action}' enviado ao Arduino com sucesso!`,
            );
            res.json({ success: true, message: `Comando ${action} enviado.` });
        });
    } else {
        res.status(400).json({ error: "Comando inválido." });
    }
});

app.listen(3000, () => {
    console.log("API do Arduino rodando na porta 3000");
});
