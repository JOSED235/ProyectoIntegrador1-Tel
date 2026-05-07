#include "FSRSensor.h"

#include "../config.h"

#include <Arduino.h>
#include <math.h>

void FSRSensor::begin() {

    pinMode(FSR_PIN, INPUT);

    Serial.println("FSR402 inicializado");
}

float FSRSensor::read(float t) {

    // SIMULACIÓN

    return
        0.40f +
        0.10f * sinf(2.0f * PI * 1.0f * t) +
        0.02f * sinf(2.0f * PI * 6.0f * t);

    // HARDWARE REAL

    // return analogRead(FSR_PIN) / 4095.0f;
}