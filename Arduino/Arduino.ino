#include <Stepper.h>

// --- Configurações do Motor ---
const int stepsPerRevolution = 2048;
const int passosPara90Graus = 512;
Stepper meuMotor(stepsPerRevolution, 8, 10, 9, 11);

// --- Configurações do Sensor Ultrassônico ---
const int pinoTrig = 6;
const int pinoEcho = 7;
const int limiteDistancia = 50; // cm

// --- Configurações do Sensor de Chuva ---
const int pinoSensorChuva = A0;
const int limiteChuva = 500; // Abaixo de 500 consideramos que está chovendo

// --- Variáveis de Controle ---
bool estaEstendido = false;      // O varal começa na posição "Recolhido"
bool recolhidoPelaChuva = false; // Memória para saber se foi a chuva que o fechou

// --- Estado dos Sensores (cache para reportar) ---
bool ultimaLeituraChuva = false;
bool ultimaLeituraRoupa = false;

// --- Controle do envio periódico de status do Arduino ---
unsigned long ultimoEnvioStatus = 0;
const unsigned long intervaloStatus = 2000; // 2 segundos

// --- Função Auxiliar para o Sensor Ultrassônico ---
int lerDistancia() {
  digitalWrite(pinoTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinoTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinoTrig, LOW);

  long duracao = pulseIn(pinoEcho, HIGH);
  int distancia = duracao * 0.034 / 2;
  return distancia;
}

// --- Função de Status do Arduino ---
// Envia o estado atual (estendido/chuva/roupa) em JSON pela serial.
// Usada tanto pelo envio periódico quanto em resposta ao comando 'S'.
void enviarStatusJson() {
  Serial.print("{\"estendido\":");
  Serial.print(estaEstendido ? "true" : "false");
  Serial.print(",\"chuva\":");
  Serial.print(ultimaLeituraChuva ? "true" : "false");
  Serial.print(",\"roupa\":");
  Serial.print(ultimaLeituraRoupa ? "true" : "false");
  Serial.println("}");
}

void setup() {
  meuMotor.setSpeed(15);

  pinMode(pinoTrig, OUTPUT);
  pinMode(pinoEcho, INPUT);

  Serial.begin(9600);

  Serial.println("=== Varal Inteligente Iniciado ===");
  Serial.println("--- COMANDOS ---");
  Serial.println(" '1' -> ESTENDER o varal");
  Serial.println(" '2' -> RECOLHER o varal");
  Serial.println(" 'S' -> Solicitar status (JSON)");
  Serial.println("----------------");
}

void loop() {
  // 1. LER SENSORES
  int umidadeChuva = analogRead(pinoSensorChuva);
  bool chovendo = (umidadeChuva < limiteChuva);

  int distancia = lerDistancia();
  bool temRoupa = (distancia > 0 && distancia <= limiteDistancia);

  ultimaLeituraChuva = chovendo;
  ultimaLeituraRoupa = temRoupa;

  // 2. VERIFICAR COMANDOS MANUAIS DO USUÁRIO
  if (Serial.available() > 0) {
    char comando = Serial.read();

    if (comando == 'S' || comando == 's') {
      enviarStatusJson();
    }
    else if (comando == '1') {
      if (!estaEstendido && !chovendo) {
        Serial.println("Comando manual: ESTENDENDO varal...");
        meuMotor.step(passosPara90Graus);
        estaEstendido = true;
        recolhidoPelaChuva = false;
        enviarStatusJson();
      } else if (chovendo) {
        Serial.println("Aviso: Nao e possivel estender, esta chovendo!");
      } else {
        Serial.println("O varal ja esta estendido.");
      }
    }
    else if (comando == '2') {
      if (estaEstendido) {
        Serial.println("Comando manual: RECOLHENDO varal...");
        meuMotor.step(-passosPara90Graus);
        estaEstendido = false;
        recolhidoPelaChuva = false;
        enviarStatusJson();
      } else {
        Serial.println("O varal ja esta recolhido.");
      }
    }
  }

  // 3. REGRAS AUTOMÁTICAS DA CHUVA E ROUPAS

  // Regra A: Se o varal estiver estendido e começar a chover
  if (estaEstendido && chovendo) {
    Serial.println("ALERTA: Chuva detectada! RECOLHENDO varal automaticamente...");
    meuMotor.step(-passosPara90Graus);
    estaEstendido = false;
    recolhidoPelaChuva = true;
    enviarStatusJson();
  }

  // Regra B: Se o varal foi recolhido pela chuva, e a chuva parou
  // A flag `recolhidoPelaChuva` SÓ é zerada quando efetivamente estendemos
  // de volta. Se ainda não houver roupa no momento em que a chuva passa,
  // mantemos a flag para tentar novamente em loops futuros assim que o
  // sensor ultrassônico detectar peça no varal.
  if (recolhidoPelaChuva && !chovendo) {
    if (temRoupa) {
      Serial.println("Roupas detectadas! ESTENDENDO varal novamente.");
      meuMotor.step(passosPara90Graus);
      estaEstendido = true;
      recolhidoPelaChuva = false;
      enviarStatusJson();
    }
    // Sem roupa: aguarda silenciosamente — o status periódico continua sendo
    // emitido pela seção 4 abaixo, não precisamos floodar a serial aqui.
  }

  // 4. ENVIO PERIÓDICO DE STATUS DO ARDUINO
  // Heartbeat: o Arduino emite seu status sozinho a cada `intervaloStatus` ms,
  // permitindo que o server detecte conexão ativa sem precisar fazer polling.
  unsigned long agora = millis();
  if (agora - ultimoEnvioStatus >= intervaloStatus) {
    enviarStatusJson();
    ultimoEnvioStatus = agora;
  }

  delay(100);
}
