#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <math.h>

//const char* ssid = "LABREDES";
//const char* password = "F0rmul4-1";
const char* ssid = "MAROARR";
const char* password = "Girare193819410";




//const char* ssid = "A54 de Jose David";
//const char* password = "123456789";

const char* serverUrl = "http://192.168.1.6:8001/captura";


#define BTN_PIN  0
#define FSR_PIN 34

const uint16_t SAMPLE_RATE_HZ   = 100;
const uint32_t SAMPLE_PERIOD_US = 1000000UL / SAMPLE_RATE_HZ;
const int      BUFFER_SIZE      = 50;

struct Sample {
  uint32_t seq;
  uint32_t ts_us;
  float mpu_ax, mpu_ay, mpu_az;
  float mpu_gx, mpu_gy, mpu_gz;
  float lsm_ax, lsm_ay, lsm_az;
  float lsm_mx, lsm_my, lsm_mz;
  float pressure;
};

Sample   samplesBuffer[BUFFER_SIZE];
int      bufferIndex = 0;
uint32_t seqCounter  = 1;

bool     testRunning    = false;
String   currentSession = "";
uint32_t sessionStartUs = 0;
uint32_t nextSampleUs   = 0;

void initWiFi();
void initSensors();
void acquireSample();
bool sendBatch(int count);
void startTest();
void stopTest();
String generateSessionId();
void readMPU6050(float &ax, float &ay, float &az, float &gx, float &gy, float &gz, float t);
void readLSM303DLHC(float &ax, float &ay, float &az, float &mx, float &my, float &mz, float t);
float readFSR402(float t);


void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(BTN_PIN, INPUT_PULLUP);
  analogReadResolution(12);
  initWiFi();
  initSensors();
  Serial.println("Sistema listo. Presiona el botón para iniciar/detener prueba.");
}

void loop() {
  static bool     lastBtn = HIGH;
  static uint32_t lastMs  = 0;
  bool currBtn = digitalRead(BTN_PIN);

  if (lastBtn == HIGH && currBtn == LOW && (millis() - lastMs > 300)) {
    lastMs = millis();
    if (!testRunning) startTest();
    else              stopTest();
  }
  lastBtn = currBtn;

  if (!testRunning) return;

  uint32_t nowUs = micros();
  while ((int32_t)(nowUs - nextSampleUs) >= 0) {
    if (bufferIndex < BUFFER_SIZE) acquireSample();
    nextSampleUs += SAMPLE_PERIOD_US;
    nowUs = micros();
  }

  if (bufferIndex >= BUFFER_SIZE) {
    if (!sendBatch(bufferIndex)) {
      Serial.println("Fallo en envío. Reintentando...");
      delay(200);
      sendBatch(bufferIndex);
    }
    bufferIndex = 0;
  }
}

// Conecta al WiFi y bloquea hasta obtener IP
void initWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nConectado! IP: " + WiFi.localIP().toString());
}

// Inicializa los sensores (aquí va Wire.begin y config de I2C cuando se use hardware real)
void initSensors() {
  // TODO: Wire.begin(SDA, SCL)
  // TODO: Inicializar MPU6050 (I2C 0x68) y LSM303DLHC (I2C 0x19 / 0x1E)
  Serial.println("Sensores en modo SIMULACIÓN.");
}

// Marca el inicio de una nueva sesión de prueba
void startTest() {
  currentSession = generateSessionId();
  sessionStartUs = micros();
  nextSampleUs   = micros();
  bufferIndex    = 0;
  seqCounter     = 1;
  testRunning    = true;
  Serial.println("PRUEBA INICIADA — Sesión: " + currentSession);
}

// Vacía el buffer pendiente y marca el fin de la prueba
void stopTest() {
  if (bufferIndex > 0) {
    sendBatch(bufferIndex);
    bufferIndex = 0;
  }
  testRunning = false;
  Serial.println("PRUEBA FINALIZADA — Sesión: " + currentSession);
}

String generateSessionId() {
  return "ses_" + String(millis());
}

// Lee los tres sensores y guarda la muestra en el buffer
void acquireSample() {
  Sample s;
  s.seq   = seqCounter++;
  s.ts_us = micros() - sessionStartUs;
  float t = s.ts_us / 1000000.0f;

  readMPU6050(s.mpu_ax, s.mpu_ay, s.mpu_az, s.mpu_gx, s.mpu_gy, s.mpu_gz, t);
  readLSM303DLHC(s.lsm_ax, s.lsm_ay, s.lsm_az, s.lsm_mx, s.lsm_my, s.lsm_mz, t);
  s.pressure = readFSR402(t);

  samplesBuffer[bufferIndex] = s;
  bufferIndex++;
}

// Simulación del MPU6050 — reemplazar con lectura I2C de registros 0x3B–0x48
void readMPU6050(float &ax, float &ay, float &az, float &gx, float &gy, float &gz, float t) {
  ax = 0.12f * sinf(2.0f * PI * 6.0f * t) + 0.03f * sinf(2.0f * PI * 10.0f * t);
  ay = 0.09f * cosf(2.0f * PI * 6.0f * t) + 0.02f * sinf(2.0f * PI * 11.0f * t);
  az = 1.00f + 0.04f * sinf(2.0f * PI * 6.0f * t);
  gx = 18.0f * sinf(2.0f * PI * 6.0f * t);
  gy = 14.0f * cosf(2.0f * PI * 6.0f * t);
  gz =  7.0f * sinf(2.0f * PI * 4.0f * t);
}

// Simulación del LSM303DLHC — reemplazar con lectura I2C (accel 0x19, mag 0x1E)
void readLSM303DLHC(float &ax, float &ay, float &az, float &mx, float &my, float &mz, float t) {
  ax =  0.10f * sinf(2.0f * PI * 6.0f * t + 0.2f);
  ay =  0.08f * cosf(2.0f * PI * 6.0f * t + 0.1f);
  az =  1.00f + 0.03f * sinf(2.0f * PI * 5.0f * t);
  mx =  25.0f + 3.0f * sinf(2.0f * PI * 0.5f * t);
  my = -18.0f + 2.0f * cosf(2.0f * PI * 0.5f * t);
  mz =  42.0f + 1.5f * sinf(2.0f * PI * 0.3f * t);
}

// Simulación del FSR402 — reemplazar con: return analogRead(FSR_PIN) / 4095.0f
float readFSR402(float t) {
  return 0.40f + 0.10f * sinf(2.0f * PI * 1.0f * t) + 0.02f * sinf(2.0f * PI * 6.0f * t);
}

// Empaqueta el buffer en JSON y lo envía al backend por HTTP POST
bool sendBatch(int count) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado.");
    return false;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);

  JSONVar payload;
  payload["session_id"]     = currentSession.c_str();
  payload["device_id"]      = "esp32-devkit";
  payload["sample_rate_hz"] = SAMPLE_RATE_HZ;

  JSONVar samplesArray;

  for (int i = 0; i < count; i++) {
    JSONVar s;

    // Datos básicos
    s["seq"]   = samplesBuffer[i].seq;
    s["ts_us"] = (double)samplesBuffer[i].ts_us;

    // MPU6050 (FLAT)
    s["mpu_ax"] = samplesBuffer[i].mpu_ax;
    s["mpu_ay"] = samplesBuffer[i].mpu_ay;
    s["mpu_az"] = samplesBuffer[i].mpu_az;

    s["mpu_gx"] = samplesBuffer[i].mpu_gx;
    s["mpu_gy"] = samplesBuffer[i].mpu_gy;
    s["mpu_gz"] = samplesBuffer[i].mpu_gz;

    // LSM303DLHC acelerómetro (FLAT)
    s["lsm_ax"] = samplesBuffer[i].lsm_ax;
    s["lsm_ay"] = samplesBuffer[i].lsm_ay;
    s["lsm_az"] = samplesBuffer[i].lsm_az;

    // LSM303DLHC magnetómetro (FLAT)
    s["lsm_mx"] = samplesBuffer[i].lsm_mx;
    s["lsm_my"] = samplesBuffer[i].lsm_my;
    s["lsm_mz"] = samplesBuffer[i].lsm_mz;

    // Presión
    s["pressure"] = samplesBuffer[i].pressure;

    samplesArray[i] = s;
  }

  payload["samples"] = samplesArray;

  int httpCode = http.POST(JSON.stringify(payload));
  http.end();

  if (httpCode > 0) {
    Serial.printf("Batch OK: %d muestras | HTTP %d\n", count, httpCode);
    return (httpCode == 200 || httpCode == 201);
  }

  Serial.printf("Error HTTP: %d\n", httpCode);
  return false;
}