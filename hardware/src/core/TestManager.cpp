#include "TestManager.h"
#include <WiFi.h>
#include "../config.h"

TestManager::TestManager() {

    testRunning = false;

    currentSessionId = "";

    sequenceCounter = 1;

    sessionStartUs = 0;

    nextSampleUs = 0;

    lastButtonState = HIGH;

    lastDebounceMs = 0;
}

void TestManager::begin() {

    pinMode(BTN_PIN, INPUT_PULLUP);

    analogReadResolution(12);

    sensorManager.begin();
    wifiManager.connect();

    Serial.println("Sistema listo.");
    Serial.println("Presiona el botón para iniciar/detener prueba.");
}

void TestManager::update() {
    wifiManager.reconnectIfNeeded();
    handleButton();

    if (!testRunning) return;

    // Primero enviar si está lleno, ANTES de seguir muestreando
    if (bufferManager.isFull()) {
        Sample tempBuffer[BUFFER_SIZE];
        int count = bufferManager.size();
        memcpy(tempBuffer, bufferManager.getBuffer(), sizeof(Sample) * count);
        bufferManager.clear();  // limpia para que el while pueda seguir

        bool success = httpService.sendBatch(tempBuffer, count, currentSessionId);
        if (!success) {
            Serial.println("Error enviando batch.");
            // Opcional: reintentar una vez
            delay(200);
            httpService.sendBatch(tempBuffer, count, currentSessionId);
        }

        // Resetear el timing para no acumular muestras perdidas durante el envío
        nextSampleUs = micros();
        return; // salir y dejar que loop() vuelva a llamar update()
    }

    // Solo muestrear si el buffer tiene espacio
    uint32_t nowUs = micros();
    while ((int32_t)(nowUs - nextSampleUs) >= 0) {
        acquireSample();
        nextSampleUs += SAMPLE_PERIOD_US;
        nowUs = micros();
    }
}

void TestManager::handleButton() {

    bool currentButtonState = digitalRead(BTN_PIN);

    bool buttonPressed =
        (lastButtonState == HIGH) &&
        (currentButtonState == LOW);

    bool debounceOk =
        (millis() - lastDebounceMs > 300);

    if (buttonPressed && debounceOk) {

        lastDebounceMs = millis();

        if (!testRunning) {
            startTest();
        }
        else {
            stopTest();
        }
    }

    lastButtonState = currentButtonState;
}



bool WiFiManager::isConnected() {

    return WiFi.status() == WL_CONNECTED;
}


void WiFiManager::reconnectIfNeeded() {

    static unsigned long lastAttempt = 0;

    if (
        WiFi.status() != WL_CONNECTED &&
        millis() - lastAttempt > 10000
    ) {

        lastAttempt = millis();

        Serial.println(
            "Reintentando WiFi..."
        );

        connect();
    }
}

void TestManager::startTest() {

    currentSessionId = generateSessionId();

    sessionStartUs = micros();

    nextSampleUs = micros();

    sequenceCounter = 1;

    bufferManager.clear();

    testRunning = true;

    
    Serial.println("PRUEBA INICIADA");
    Serial.println("Session ID: " + currentSessionId);
    
}

void TestManager::stopTest() {

    if (!bufferManager.isEmpty()) {

        httpService.sendBatch(
            bufferManager.getBuffer(),
            bufferManager.size(),
            currentSessionId
        );

        bufferManager.clear();
    }

    testRunning = false;

    
    Serial.println("PRUEBA FINALIZADA");
    Serial.println("Session ID: " + currentSessionId);
    
}

void TestManager::acquireSample() {

    Sample sample;

    sample.seq = sequenceCounter++;

    sample.ts_us = micros() - sessionStartUs;

    float timeSeconds =
        sample.ts_us / 1000000.0f;

    sensorManager.fillSample(
        sample,
        timeSeconds
    );

    bool added =
        bufferManager.addSample(sample);

    if (!added) {

        Serial.println(
            "ERROR: buffer lleno."
        );
    }
}

String TestManager::generateSessionId() {

    return "ses_" + String(millis());
}