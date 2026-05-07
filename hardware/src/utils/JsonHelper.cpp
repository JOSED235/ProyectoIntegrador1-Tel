#include "JsonHelper.h"

JSONVar JsonHelper::sampleToJson(
    const Sample& sample
) {

    JSONVar s;

    // METADATOS

    s["seq"] =
        sample.seq;

    s["ts_us"] =
        (double)sample.ts_us;

    // MPU6050

    s["mpu_ax"] =
        sample.mpu_ax;

    s["mpu_ay"] =
        sample.mpu_ay;

    s["mpu_az"] =
        sample.mpu_az;

    s["mpu_gx"] =
        sample.mpu_gx;

    s["mpu_gy"] =
        sample.mpu_gy;

    s["mpu_gz"] =
        sample.mpu_gz;

    // LSM303DLHC

    s["lsm_ax"] =
        sample.lsm_ax;

    s["lsm_ay"] =
        sample.lsm_ay;

    s["lsm_az"] =
        sample.lsm_az;

    s["lsm_mx"] =
        sample.lsm_mx;

    s["lsm_my"] =
        sample.lsm_my;

    s["lsm_mz"] =
        sample.lsm_mz;

    // FSR402

    s["pressure"] =
        sample.pressure;

    return s;
}

JSONVar JsonHelper::samplesToJsonArray(
    Sample* samples,
    int count
) {

    JSONVar array;

    for (int i = 0; i < count; i++) {

        array[i] =
            sampleToJson(samples[i]);
    }

    return array;
}