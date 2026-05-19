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

// O Arduino emite status JSON automaticamente a cada 2s. Se ficarmos mais
// que esse limite sem receber, consideramos o Arduino offline.
const STATUS_TIMEOUT_MS = 6000;

let port = null;
let parser = null;
let isArduinoConnected = false;
let lastStatusAt = 0;

let arduinoStatus = { estendido: false, chuva: false, roupa: false };

function arduinoAtivo() {
    if (USE_MOCK) return isArduinoConnected;
    if (!port || !port.isOpen) return false;
    return Date.now() - lastStatusAt < STATUS_TIMEOUT_MS;
}

function initializeArduino() {
    if (USE_MOCK) {
        console.log("[API] Modo MOCK ativado: servindo status falso para desenvolvimento");
        isArduinoConnected = true;
        lastStatusAt = Date.now();
        setInterval(() => {
            arduinoStatus.chuva = !arduinoStatus.chuva;
            lastStatusAt = Date.now();
        }, 5000);
        return;
    }
    try {
        // Porta serial do Arduino. Permite override via env (ARDUINO_PORT)
        // e cai no default por plataforma:
        //   - Linux: /dev/ttyACM0 (placas com USB-CDC nativo, ex.: Uno/Nano clone)
        //   - Windows: COM9
        const defaultPath = process.platform === "win32" ? "COM9" : "/dev/ttyACM0";
        const serialPath = process.env.ARDUINO_PORT || defaultPath;
        port = new SerialPort({ path: serialPath, baudRate: 9600 });
        parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        parser.on("data", (data) => {
            const line = data.trim();
            if (!line) return;
            try {
                if (line.startsWith("{")) {
                    arduinoStatus = JSON.parse(line);
                    isArduinoConnected = true;
                    lastStatusAt = Date.now();
                } else {
                    // Logs textuais do firmware (println não-JSON): úteis para
                    // depurar regras automáticas (chuva detectada, recolhendo, etc.)
                    console.log(`[Arduino] ${line}`);
                }
            } catch (e) {
                console.error("Erro ao parsear dados do Arduino:", line);
            }
        });

        port.on("open", () => {
            console.log("[API] Porta serial aberta — aguardando heartbeat do Arduino...");
        });

        port.on("error", (err) => {
            console.error("[API] Erro na porta serial:", err.message);
            isArduinoConnected = false;
        });

        port.on("close", () => {
            console.log("[API] Porta serial fechada");
            isArduinoConnected = false;
        });
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
    const online = arduinoAtivo();
    if (!online) {
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

    if (!arduinoAtivo()) {
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
        // O firmware do Arduino aceita '1' para ESTENDER e '2' para RECOLHER.
        // Mantemos o contrato da API com "E"/"R" e traduzimos aqui no envio serial.
        const comandoSerial = action === "E" ? "1" : "2";
        port.write(comandoSerial, (err) => {
            if (err) {
                console.error(
                    "[API] Erro ao enviar para o Arduino:",
                    err.message,
                );
                return res.status(500).json({ error: "Erro na porta serial." });
            }
            console.log(
                `[API] Comando '${action}' (serial '${comandoSerial}') enviado ao Arduino com sucesso!`,
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
