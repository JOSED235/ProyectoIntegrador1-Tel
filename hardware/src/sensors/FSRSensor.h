#ifndef FSR_SENSOR_H
#define FSR_SENSOR_H

class FSRSensor {

public:

    void begin();

    float read(float t);
};

#endif