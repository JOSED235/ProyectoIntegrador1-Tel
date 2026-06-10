#include "LSMSensor.h"
#include <Arduino.h>
#include <math.h>

void LSMSensor::begin() {
    Serial.println("[LSM303] Iniciando detección de hardware...");

    if (!accel.begin()) {
        Serial.println("[LSM303] ERROR Acelerómetro no detectado.");
        accelPresent = false;
    } else {
        Serial.println("[LSM303] OK Acelerómetro detectado.");
        accelPresent = true;
    }

    if (!mag.begin()) {
        Serial.println("[LSM303] ERROR Magnetómetro no detectado.");
        magPresent = false;
    } else {
        Serial.println("[LSM303] OK Magnetómetro detectado.");
        magPresent = true;
    }
}

void LSMSensor::read(
    float& ax, float& ay, float& az,
    float& mx, float& my, float& mz,
    float t
) {
    bool useReal = false;

    if (accelPresent && magPresent) {
        sensors_event_t a_event, m_event;
        accel.getEvent(&a_event);
        mag.getEvent(&m_event);

        if (isDataQualityOk(a_event.acceleration.x, a_event.acceleration.y, a_event.acceleration.z)) {
            ax = a_event.acceleration.x;
            ay = a_event.acceleration.y;
            az = a_event.acceleration.z;
            mx = m_event.magnetic.x;
            my = m_event.magnetic.y;
            mz = m_event.magnetic.z;
            useReal = true;
        } else {
            static bool warningSent = false;
            if (!warningSent) {
                Serial.println("[LSM303] MALA CALIDAD DE DATOS: Conmutando a simulación.");
                warningSent = true;
            }
        }
    }

    if (!useReal) {
        getSimulatedData(ax, ay, az, mx, my, mz, t);
    }
}

bool LSMSensor::isDataQualityOk(float ax, float ay, float az) {
    float totalAccel = sqrt(ax*ax + ay*ay + az*az);
    // Validación física similar al MPU6050
    if (totalAccel < 2.0f || totalAccel > 25.0f) return false;
    return true;
}

void LSMSensor::getSimulatedData(
    float& ax, float& ay, float& az,
    float& mx, float& my, float& mz,
    float t
) {
    float noise = (random(-100, 100) / 1000.0f);
    
    // Aceleración similar al MPU pero con pequeñas variaciones de fase para diferenciar
    ax = 0.10f * sinf(2.0f * PI * 5.5f * t) + noise;
    ay = 0.14f * cosf(2.0f * PI * 4.5f * t) + noise;
    az = 9.81f + 0.12f * sinf(2.0f * PI * 5.8f * t) + noise;

    // Magnetómetro: Simular campo magnético terrestre base + ruido de interferencia
    // Valores típicos en microTeslas (uT)
    mx = 25.0f + 2.0f * sinf(2.0f * PI * 0.1f * t) + noise;
    my = -15.0f + 2.0f * cosf(2.0f * PI * 0.1f * t) + noise;
    mz = -35.0f + noise;
}