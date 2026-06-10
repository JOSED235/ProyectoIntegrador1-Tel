#ifndef LSM_SENSOR_H
#define LSM_SENSOR_H

#include <Adafruit_LSM303_Accel.h>
#include <Adafruit_LSM303DLH_Mag.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

class LSMSensor {

public:
    void begin();

    void read(
        float& ax,
        float& ay,
        float& az,
        float& mx,
        float& my,
        float& mz,
        float t
    );

private:
    Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(54321);
    Adafruit_LSM303DLH_Mag_Unified mag = Adafruit_LSM303DLH_Mag_Unified(12345);

    bool accelPresent = false;
    bool magPresent = false;

    void getSimulatedData(float& ax, float& ay, float& az, float& mx, float& my, float& mz, float t);
    bool isDataQualityOk(float ax, float ay, float az);
};

#endif