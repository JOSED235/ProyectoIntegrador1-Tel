#include "HttpService.h"
#include "../config.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

float HttpService::sanitizeFloat(float value) {
    if (isnan(value) || isinf(value)) return 0.0f;
    return value;
}

bool HttpService::sendBatch(Sample* samples, int count, String sessionId) {

    // VALIDAR WIFI
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[HTTP] WiFi desconectado.");
        return false;
    }

    // DELAY SOLO EN PRIMERA LLAMADA
    static bool firstCall = true;
    if (firstCall) {
        delay(500);
        firstCall = false;
    }

    // CONSTRUIR JSON
    JSONVar payload;
    payload["session_id"]     = sessionId.c_str();
    payload["device_id"]      = "esp32-devkit";
    payload["sample_rate_hz"] = SAMPLE_RATE_HZ;

    JSONVar samplesArray;
    for (int i = 0; i < count; i++) {
        JSONVar s;
        s["seq"]      = samples[i].seq;
        s["ts_us"]    = (double)samples[i].ts_us;
        s["mpu_ax"]   = sanitizeFloat(samples[i].mpu_ax);
        s["mpu_ay"]   = sanitizeFloat(samples[i].mpu_ay);
        s["mpu_az"]   = sanitizeFloat(samples[i].mpu_az);
        s["mpu_gx"]   = sanitizeFloat(samples[i].mpu_gx);
        s["mpu_gy"]   = sanitizeFloat(samples[i].mpu_gy);
        s["mpu_gz"]   = sanitizeFloat(samples[i].mpu_gz);
        s["lsm_ax"]   = sanitizeFloat(samples[i].lsm_ax);
        s["lsm_ay"]   = sanitizeFloat(samples[i].lsm_ay);
        s["lsm_az"]   = sanitizeFloat(samples[i].lsm_az);
        s["lsm_mx"]   = sanitizeFloat(samples[i].lsm_mx);
        s["lsm_my"]   = sanitizeFloat(samples[i].lsm_my);
        s["lsm_mz"]   = sanitizeFloat(samples[i].lsm_mz);
        s["pressure"] = sanitizeFloat(samples[i].pressure);
        samplesArray[i] = s;
    }
    payload["samples"] = samplesArray;

    String jsonString = JSON.stringify(payload);
    if (jsonString.length() == 0) {
        Serial.println("[HTTP] Error serializando JSON.");
        return false;
    }

    // ENVIAR
    HTTPClient http;
    WiFiClient client;

    if (!http.begin(client, SERVER_URL)) {
        Serial.println("[HTTP] Error iniciando conexión.");
        return false;
    }

    http.addHeader("Content-Type", "application/json");
    http.setTimeout(1000);

    Serial.printf("[HTTP] Enviando... %d muestras | %d bytes\n", 
                  count, jsonString.length());

    int httpCode = http.POST(jsonString);
    http.end();

    if (httpCode > 0) {
        Serial.printf("[HTTP] OK | muestras=%d | código=%d\n", count, httpCode);
        return httpCode == 200 || httpCode == 201;
    }

    Serial.printf("[HTTP] Error conexión: %d\n", httpCode);
    return false;
}