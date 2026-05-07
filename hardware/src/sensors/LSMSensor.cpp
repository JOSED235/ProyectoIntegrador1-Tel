#include "LSMSensor.h"

#include <Arduino.h>
#include <math.h>

void LSMSensor::begin() {

    // TODO:
    // Inicializar LSM303DLHC real

    Serial.println("LSM303DLHC inicializado (SIMULACIÓN)");
}

void LSMSensor::read(
    float& ax,
    float& ay,
    float& az,
    float& mx,
    float& my,
    float& mz,
    float t
) {

    ax =
        0.10f * sinf(
            2.0f * PI * 6.0f * t + 0.2f
        );

    ay =
        0.08f * cosf(
            2.0f * PI * 6.0f * t + 0.1f
        );

    az =
        1.00f +
        0.03f * sinf(
            2.0f * PI * 5.0f * t
        );

    mx =
        25.0f +
        3.0f * sinf(
            2.0f * PI * 0.5f * t
        );

    my =
        -18.0f +
        2.0f * cosf(
            2.0f * PI * 0.5f * t
        );

    mz =
        42.0f +
        1.5f * sinf(
            2.0f * PI * 0.3f * t
        );
}