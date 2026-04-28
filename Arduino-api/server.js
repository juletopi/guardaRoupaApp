const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
app.use(cors());
app.use(express.json());

// ATENÇÃO: Verifique a porta do seu Arduino (COM3, COM4, /dev/ttyACM0, etc.)
let port = null;
let parser = null;
let isArduinoConnected = false;

let arduinoStatus = { estendido: false, chuva: false, roupa: false };

function initializeArduino() {
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
            "[API] API rodando em modo offline - retornará erros 503 até que o Arduino seja conectado.",
        );
        isArduinoConnected = false;
    }
}

initializeArduino();

// Ler o status no App
app.get("/status", (req, res) => {
    if (!isArduinoConnected) {
        return res.status(503).json({
            error: "Arduino desconectado ou não detectado. Verifique a conexão USB e a porta serial configurada.",
            status: "offline",
        });
    }
    res.json(arduinoStatus);
});

// Enviar comandos (E ou R)
app.post("/command", (req, res) => {
    const { action } = req.body;
    console.log(
        `\n[API] Recebeu pedido do App para: ${action === "E" ? "ESTENDER" : "RECOLHER"}`,
    );

    if (!isArduinoConnected) {
        console.warn("[API] Tentativa de enviar comando sem Arduino conectado");
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
