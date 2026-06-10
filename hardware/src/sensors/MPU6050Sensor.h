#ifndef MPU6050_SENSOR_H
#define MPU6050_SENSOR_H

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

class MPU6050Sensor {

public:
    void begin();

    void read(
        float& ax,
        float& ay,
        float& az,
        float& gx,
        float& gy,
        float& gz,
        float t
    );

private:
    Adafruit_MPU6050 mpu;
    bool hardwarePresent = false;
    
    // Método para simulación realista
    void getSimulatedData(float& ax, float& ay, float& az, float& gx, float& gy, float& gz, float t);
    
    // Validación de calidad de datos
    bool isDataQualityOk(float ax, float ay, float az);
};

#endif