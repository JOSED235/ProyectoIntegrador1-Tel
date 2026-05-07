#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include "../models/Sample.h"

#include "MPU6050Sensor.h"
#include "LSMSensor.h"
#include "FSRSensor.h"

class SensorManager {

private:

    MPU6050Sensor mpu6050;

    LSMSensor lsm303;

    FSRSensor fsr402;

public:

    void begin();

    void fillSample(
        Sample& sample,
        float t
    );
};

#endif