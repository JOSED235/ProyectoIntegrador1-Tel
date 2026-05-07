#include "MPU6050Sensor.h"

#include <Arduino.h>
#include <math.h>

void MPU6050Sensor::begin() {

    // TODO:
    // Inicializar MPU6050 real por I2C

    Serial.println("MPU6050 inicializado (SIMULACIÓN)");
}

void MPU6050Sensor::read(
    float& ax,
    float& ay,
    float& az,
    float& gx,
    float& gy,
    float& gz,
    float t
) {

    ax =
        0.12f * sinf(2.0f * PI * 6.0f * t) +
        0.03f * sinf(2.0f * PI * 10.0f * t);

    ay =
        0.09f * cosf(2.0f * PI * 6.0f * t) +
        0.02f * sinf(2.0f * PI * 11.0f * t);

    az =
        1.00f +
        0.04f * sinf(2.0f * PI * 6.0f * t);

    gx =
        18.0f * sinf(2.0f * PI * 6.0f * t);

    gy =
        14.0f * cosf(2.0f * PI * 6.0f * t);

    gz =
        7.0f * sinf(2.0f * PI * 4.0f * t);
}