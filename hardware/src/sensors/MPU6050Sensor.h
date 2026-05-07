#ifndef MPU6050_SENSOR_H
#define MPU6050_SENSOR_H

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
};

#endif