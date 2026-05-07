#ifndef LSM_SENSOR_H
#define LSM_SENSOR_H

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
};

#endif