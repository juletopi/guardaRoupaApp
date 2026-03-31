#include <Stepper.h>

// --- Configurações do Motor ---
const int stepsPerRevolution = 2048;
const int passosPara90Graus = 512;
Stepper meuMotor(stepsPerRevolution, 8, 10, 9, 11);

// --- Configurações dos Sensores ---
const int pinoTrig = 3;
const int pinoEcho = 4;
const int pinoSensorChuva = A0; 

// --- Parâmetros da Lógica ---
const int limiteDistancia = 15;
const int limiteChuva = 500;

// --- Variáveis de Estado ---
bool motorEstendido = false; 
bool comandoEstender = false; // Guarda a intenção de estado (true = exposto, false = recolhido)

void setup() {
  meuMotor.setSpeed(15); 
  Serial.begin(9600);
  
  pinMode(pinoTrig, OUTPUT); 
  pinMode(pinoEcho, INPUT);
  Serial.println("--- SISTEMA INICIADO (Aguardando Comandos) ---");
}

void loop() {
  // 1. LEITURA DOS SENSORES
  digitalWrite(pinoTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinoTrig, HIGH); 
  delayMicroseconds(10);
  digitalWrite(pinoTrig, LOW);
  long duracao = pulseIn(pinoEcho, HIGH);
  int distancia = duracao * 0.034 / 2;
  
  int leituraChuva = analogRead(pinoSensorChuva);
  bool estaChovendo = (leituraChuva < limiteChuva);
  bool temRoupa = (distancia > 0 && distancia <= limiteDistancia);

  // 2. ESCUTA COMANDOS DO SERVIDOR API
  if (Serial.available() > 0) {
    char comando = Serial.read();
    
    if (comando == 'E') {
      comandoEstender = true; // Usuário quer estender
    } 
    else if (comando == 'R') {
      comandoEstender = false; // Usuário quer recolher
    }
    else if (comando == 'S') {
      // Retorna o status atual em formato JSON simples para a API
      Serial.print("{\"estendido\":");
      Serial.print(motorEstendido ? "true" : "false");
      Serial.print(",\"chuva\":");
      Serial.print(estaChovendo ? "true" : "false");
      Serial.print(",\"roupa\":");
      Serial.print(temRoupa ? "true" : "false");
      Serial.println("}");
    }
  }

  // 3. LÓGICA DE SEGURANÇA
  if (estaChovendo) {
    comandoEstender = false; // Recolhe imediatamente e anula ordens de estender
  }

  // 4. MOVIMENTO DO MOTOR
  if (comandoEstender && !motorEstendido) {
    meuMotor.step(passosPara90Graus);
    motorEstendido = true;
  } 
  else if (!comandoEstender && motorEstendido) {
    meuMotor.step(-passosPara90Graus);
    motorEstendido = false;
  }

  delay(100);
}