#include "TestManager.h"
#include <WiFi.h>
#include "../config.h"

TestManager::TestManager() {

    testRunning = false;

    currentSessionId = "";
    currentPatientName = "Anónimo";

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
    mqttService.begin();

    Serial.println("Sistema listo.");
    Serial.println("Presiona el botón para iniciar/detener prueba.");
}

void TestManager::update() {
    wifiManager.reconnectIfNeeded();
    mqttService.loop();
    handleButton();

    if (!testRunning) return;

    if (bufferManager.isFull()) {
        Sample tempBuffer[BUFFER_SIZE];
        int count = bufferManager.size();
        memcpy(tempBuffer, bufferManager.getBuffer(), sizeof(Sample) * count);
        bufferManager.clear();

        bool success = httpService.sendBatch(tempBuffer, count, currentSessionId, currentPatientName);
        if (!success) {
            Serial.println("Error enviando batch.");
            delay(100);
            httpService.sendBatch(tempBuffer, count, currentSessionId, currentPatientName);
        }

        bool mqttSuccess = mqttService.publishBatch(tempBuffer, count, currentSessionId, currentPatientName);
        if (!mqttSuccess) {
            Serial.println("Error MQTT publish.");
        }

        nextSampleUs = micros();
        return; 
    }

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
            startTest("Boton Físico");
        }
        else {
            stopTest();
        }
    }

    lastButtonState = currentButtonState;
}

void TestManager::startTest(String patientName) {

    if (testRunning) {
        Serial.println("La prueba ya está corriendo.");
        return;
    }

    currentSessionId = generateSessionId();
    currentPatientName = patientName;

    sessionStartUs = micros();
    nextSampleUs = micros();
    sequenceCounter = 1;

    bufferManager.clear();
    testRunning = true;

    Serial.println("PRUEBA INICIADA para: " + currentPatientName);
    Serial.println("Session ID: " + currentSessionId);
    
    // NOTIFICAR POR MQTT
    mqttService.publishStatus("RECORDING", currentSessionId, currentPatientName);
}

void TestManager::stopTest() {

    if (!testRunning) {
        Serial.println("No hay prueba activa.");
        return;
    }

    if (!bufferManager.isEmpty()) {
        httpService.sendBatch(
            bufferManager.getBuffer(),
            bufferManager.size(),
            currentSessionId,
            currentPatientName
        );

        mqttService.publishBatch(
            bufferManager.getBuffer(),
            bufferManager.size(),
            currentSessionId,
            currentPatientName
        );

        bufferManager.clear();
    }

    testRunning = false;

    Serial.println("PRUEBA FINALIZADA");
    
    // NOTIFICAR POR MQTT
    mqttService.publishStatus("IDLE");
}

bool TestManager::isRunning() {
    return testRunning;
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
        Serial.println("ERROR: buffer lleno.");
    }
}

String TestManager::generateSessionId() {
    return "ses_" + String(millis());
}