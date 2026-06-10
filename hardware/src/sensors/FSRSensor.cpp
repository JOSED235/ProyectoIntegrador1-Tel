#include "FSRSensor.h"
#include "../config.h"
#include <Arduino.h>
#include <math.h>

// Definición del pin si no está en config.h
#ifndef FSR_PIN
#define FSR_PIN 34
#endif

void FSRSensor::begin() {
    pinMode(FSR_PIN, INPUT);
    
    // El FSR es analógico, no podemos "detectarlo" por I2C.
    // Asumimos que está presente y validamos la calidad en la primera lectura.
    Serial.println("[FSR402] Inicializado en pin D34");
    hardwarePresent = true; 
}

float FSRSensor::read(float t) {
    int rawValue = analogRead(FSR_PIN);
    
    // Validar calidad de datos (si está desconectado o en corto)
    if (isDataQualityOk(rawValue)) {
        // Mapear 0-4095 a 0.0-1.0 (Presión normalizada)
        return (float)rawValue / 4095.0f;
    } else {
        // Datos de mala calidad (ej: pin flotante o sensor dañado)
        static bool warningSent = false;
        if (!warningSent) {
            Serial.println("[FSR402] ADVERTENCIA: Datos inconsistentes. Usando simulación.");
            warningSent = true;
        }
        return getSimulatedPressure(t);
    }
}

bool FSRSensor::isDataQualityOk(int rawValue) {
    // Un FSR desconectado suele dar 0 o valores máximos constantes 
    // dependiendo del circuito pull-up/pull-down.
    
    // Si el valor es exactamente 0 durante mucho tiempo, es sospechoso.
    // Si el valor es > 4090 (casi VCC) es sospechoso de corto.
    if (rawValue > 4090) return false;
    
    // Implementamos una validación simple: si el valor cambia un poco, es real.
    static int lastRaw = -1;
    static int steadyCount = 0;
    
    if (rawValue == lastRaw) {
        steadyCount++;
    } else {
        steadyCount = 0;
    }
    lastRaw = rawValue;

    // Si el valor no cambia en absoluto por 500 muestras, probablemente es ruido eléctrico
    // o sensor desconectado (un sensor real siempre tiene algo de ruido analógico).
    if (steadyCount > 500) return false;

    return true;
}

float FSRSensor::getSimulatedPressure(float t) {
    // Simulación de presión: Base estable (0.5) + Ritmo de dibujo (1Hz) + Temblor (6Hz)
    float noise = (random(-50, 50) / 1000.0f);
    
    return 0.50f + 
           0.15f * sinf(2.0f * PI * 0.5f * t) + // Variación lenta al dibujar
           0.05f * sinf(2.0f * PI * 6.0f * t) + // Transmisión del temblor a la presión
           noise;
}