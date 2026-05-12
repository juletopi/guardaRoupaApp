#include <Stepper.h>
#include <EEPROM.h>

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

// --- Persistência da Calibração (EEPROM) ---
const int ENDERECO_CALIBRACAO = 0;
const byte FLAG_CALIBRADO = 0xA5;

// --- Variáveis de Controle ---
bool calibrado = false;
bool estaEstendido = false;     // O varal começa na posição "Recolhido"
bool recolhidoPelaChuva = false; // Memória para saber se foi a chuva que o fechou

// --- Estado dos Sensores (cache para reportar via 'S') ---
bool ultimaLeituraChuva = false;
bool ultimaLeituraRoupa = false;

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

  if (EEPROM.read(ENDERECO_CALIBRACAO) == FLAG_CALIBRADO) {
    calibrado = true;
    Serial.println("Calibracao carregada da EEPROM. Varal pronto.");
  } else {
    Serial.println("=== MODO DE CALIBRACAO ===");
    Serial.println(" 'D' -> Girar para a DIREITA");
    Serial.println(" 'E' -> Girar para a ESQUERDA");
    Serial.println(" '0' -> Confirmar Posicao Inicial (Varal Recolhido)!");
    Serial.println("==========================");
  }
}

void loop() {

  // ---------------------------------------------------------
  // 1. MODO DE CALIBRAÇÃO
  // ---------------------------------------------------------
  if (!calibrado) {
    if (Serial.available() > 0) {
      char comando = Serial.read();

      if (comando == 'D' || comando == 'd') {
        meuMotor.step(20);
        Serial.println("Ajustando -> Direita");
      }
      else if (comando == 'E' || comando == 'e') {
        meuMotor.step(-20);
        Serial.println("Ajustando <- Esquerda");
      }
      else if (comando == '0') {
        calibrado = true;
        EEPROM.update(ENDERECO_CALIBRACAO, FLAG_CALIBRADO);
        Serial.println("\n=== POSICAO ZERO SALVA! ===");
        Serial.println("Calibracao persistida na EEPROM (nao sera pedida novamente).");
        Serial.println("O varal esta configurado como RECOLHIDO.");
        Serial.println("--- COMANDOS MANUAIS ---");
        Serial.println(" '1' -> ESTENDER o varal");
        Serial.println(" '2' -> RECOLHER o varal");
        Serial.println(" 'S' -> Solicitar status (JSON)");
        Serial.println(" 'C' -> Limpar calibracao (recalibrar no proximo boot)");
        Serial.println("------------------------\n");
        delay(1000);
      }
    }
  }

  // ---------------------------------------------------------
  // 2. MODO AUTOMÁTICO / MANUAL
  // ---------------------------------------------------------
  else {
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
      else if (comando == 'C' || comando == 'c') {
        EEPROM.update(ENDERECO_CALIBRACAO, 0xFF);
        Serial.println("Calibracao apagada. Reinicie o Arduino para recalibrar.");
      }
      else if (comando == '1') {
        if (!estaEstendido && !chovendo) {
          Serial.println("Comando manual: ESTENDENDO varal...");
          meuMotor.step(passosPara90Graus);
          estaEstendido = true;
          recolhidoPelaChuva = false; // Reseta a memória da chuva
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
          recolhidoPelaChuva = false; // Foi o usuário quem fechou
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
      recolhidoPelaChuva = true; // Salva na memória que a culpa foi da chuva
    }

    // Regra B: Se o varal foi recolhido pela chuva, e a chuva parou
    if (recolhidoPelaChuva && !chovendo) {
      Serial.println("A chuva parou. Verificando se ainda ha roupas...");

      if (temRoupa) {
        Serial.println("Roupas detectadas! ESTENDENDO varal novamente.");
        meuMotor.step(passosPara90Graus);
        estaEstendido = true;
      } else {
        Serial.println("Nenhuma roupa detectada. O varal permanecera recolhido.");
      }

      // Independentemente se estendeu ou não, a rotina de "fim de chuva" já foi processada
      recolhidoPelaChuva = false;
    }

    // Pequeno atraso para não sobrecarregar o monitor serial e as leituras
    delay(1000);
  }
}
