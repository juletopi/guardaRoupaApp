const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(cors());
app.use(express.json());

// ATENÇÃO: Verifique a porta do seu Arduino (COM3, COM4, /dev/ttyACM0, etc.)
const port = new SerialPort({ path: 'COM9', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let arduinoStatus = { estendido: false, chuva: false, roupa: false };

// Escuta as respostas do Arduino
parser.on('data', (data) => {
    try {
        if (data.startsWith('{')) {
            arduinoStatus = JSON.parse(data);
        }
    } catch (e) {
        console.error("Erro ao parsear dados do Arduino:", data);
    }
});

// Pede status ao Arduino a cada 2 segundos
setInterval(() => {
    port.write('S');
}, 2000);

// Endpoint para ler o status no App
app.get('/status', (req, res) => {
    res.json(arduinoStatus);
});

// Endpoint para enviar comandos (E ou R)
app.post('/command', (req, res) => {
    const { action } = req.body;
    console.log(`\n[API] Recebeu pedido do App para: ${action === 'E' ? 'ESTENDER' : 'RECOLHER'}`);

    if (action === 'E' || action === 'R') {
        port.write(action, (err) => {
            if (err) {
                console.error("[API] Erro ao enviar para o Arduino:", err.message);
                return res.status(500).json({ error: "Erro na porta serial." });
            }
            console.log(`[API] Comando '${action}' enviado ao Arduino com sucesso!`);
            res.json({ success: true, message: `Comando ${action} enviado.` });
        });
    } else {
        res.status(400).json({ error: "Comando inválido." });
    }
});

app.listen(3000, () => {
    console.log('API do Arduino rodando na porta 3000');
});