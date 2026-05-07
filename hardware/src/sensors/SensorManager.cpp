#include "SensorManager.h"

void SensorManager::begin() {

    mpu6050.begin();

    lsm303.begin();

    fsr402.begin();

    Serial.println("Todos los sensores inicializados");
}

void SensorManager::fillSample(
    Sample& sample,
    float t
) {

    // MPU6050

    mpu6050.read(
        sample.mpu_ax,
        sample.mpu_ay,
        sample.mpu_az,
        sample.mpu_gx,
        sample.mpu_gy,
        sample.mpu_gz,
        t
    );

    // LSM303DLHC

    lsm303.read(
        sample.lsm_ax,
        sample.lsm_ay,
        sample.lsm_az,
        sample.lsm_mx,
        sample.lsm_my,
        sample.lsm_mz,
        t
    );

    // FSR402

    sample.pressure =
        fsr402.read(t);
}