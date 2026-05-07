#ifndef SAMPLE_H
#define SAMPLE_H

#include <Arduino.h>

struct Sample {

    // METADATOS

    uint32_t seq;

    uint32_t ts_us;

    // MPU6050

    float mpu_ax;
    float mpu_ay;
    float mpu_az;

    float mpu_gx;
    float mpu_gy;
    float mpu_gz;

    // LSM303DLHC - ACELERÓMETRO

    float lsm_ax;
    float lsm_ay;
    float lsm_az;

    // LSM303DLHC - MAGNETÓMETRO

    float lsm_mx;
    float lsm_my;
    float lsm_mz;

    // FSR402

    float pressure;
};

#endif