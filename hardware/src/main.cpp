#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <math.h>

const char* ssid = "LABREDES";
const char* password = "F0rmul4-1";





//const char* ssid = "A54 de Jose David";
//const char* password = "123456789";

const char* serverUrl = "http://192.168.130.48:8001/captura";

const uint16_t SAMPLE_RATE_HZ = 100;
const uint32_t SAMPLE_PERIOD_US = 1000000UL / SAMPLE_RATE_HZ; // 10000 us
const int BUFFER_SIZE = 20;

struct Sample {
  uint32_t seq;
  uint32_t ts_us;
  float ax;
  float ay;
  float az;
  float gx;
  float gy;
  float gz;
  float pressure;
};

Sample samplesBuffer[BUFFER_SIZE];
int bufferIndex = 0;
uint32_t seqCounter = 1;
uint32_t sessionStartUs = 0;
uint32_t nextSampleTimeUs = 0;

//  DECLARACIONES 
void initWiFi();
void acquireSample();
void sendBatch(int count);

//  SETUP 
void setup() {
  Serial.begin(115200);
  delay(1000);

  initWiFi();

  sessionStartUs = micros();
  nextSampleTimeUs = micros();

  Serial.println("Sistema iniciado");
  Serial.print("Frecuencia de muestreo: ");
  Serial.print(SAMPLE_RATE_HZ);
  Serial.println(" Hz");
  Serial.print("Periodo de muestreo: ");
  Serial.print(SAMPLE_PERIOD_US);
  Serial.println(" us");
}

//  LOOP 
void loop() {
  uint32_t nowUs = micros();

  // Captura periodica no bloqueante
  while ((int32_t)(nowUs - nextSampleTimeUs) >= 0) {
    if (bufferIndex < BUFFER_SIZE) {
      acquireSample();
    }
    nextSampleTimeUs += SAMPLE_PERIOD_US;
    nowUs = micros();
  }

  // Envio por lote cuando el buffer se llena
  if (bufferIndex >= BUFFER_SIZE) {
    sendBatch(bufferIndex);
    bufferIndex = 0;
  }
}

//  WIFI 
void initWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("\nConectado!");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());
}

//  ADQUISICION DE MUESTRA 
void acquireSample() {
  Sample s;

  s.seq = seqCounter++;
  s.ts_us = micros() - sessionStartUs;

  // Tiempo en segundos para generar senales simuladas
  float t = s.ts_us / 1000000.0f;

  // Senales simuladas con oscilaciones suaves
  // Esto luego se reemplaza por lecturas reales del sensor
  s.ax = 0.15f * sinf(2.0f * PI * 5.0f * t);
  s.ay = 0.10f * cosf(2.0f * PI * 5.0f * t);
  s.az = 9.8f + 0.05f * sinf(2.0f * PI * 2.0f * t);

  s.gx = 0.20f * sinf(2.0f * PI * 6.0f * t);
  s.gy = 0.15f * cosf(2.0f * PI * 6.0f * t);
  s.gz = 0.08f * sinf(2.0f * PI * 4.0f * t);

  s.pressure = 0.5f + 0.02f * sinf(2.0f * PI * 1.0f * t);

  samplesBuffer[bufferIndex] = s;
  bufferIndex++;
}

//  ENVIO DE LOTE 
void sendBatch(int count) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado, no se puede enviar lote");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  JSONVar payload;
  payload["session_id"] = "123";
  payload["device_id"] = "esp32-batch";

  JSONVar samplesArray;

  for (int i = 0; i < count; i++) {
    JSONVar sample;
    sample["seq"] = samplesBuffer[i].seq;
    sample["ts_ms"] = (int)(samplesBuffer[i].ts_us / 1000);
    sample["ax"] = samplesBuffer[i].ax;
    sample["ay"] = samplesBuffer[i].ay;
    sample["az"] = samplesBuffer[i].az;
    sample["gx"] = samplesBuffer[i].gx;
    sample["gy"] = samplesBuffer[i].gy;
    sample["gz"] = samplesBuffer[i].gz;
    sample["pressure"] = samplesBuffer[i].pressure;
    samplesArray[i] = sample;
  }

  payload["samples"] = samplesArray;

  String jsonString = JSON.stringify(payload);

  Serial.println("Enviando batch...");
  Serial.print("Cantidad de muestras: ");
  Serial.println(count);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.print("Codigo HTTP: ");
    Serial.println(httpResponseCode);

    String response = http.getString();
    Serial.println("Respuesta backend:");
    Serial.println(response);
  } else {
    Serial.print("Error HTTP: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}