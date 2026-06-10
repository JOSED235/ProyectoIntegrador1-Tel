#ifndef FSR_SENSOR_H
#define FSR_SENSOR_H

class FSRSensor {

public:
    void begin();
    float read(float t);

private:
    bool hardwarePresent = false;
    float getSimulatedPressure(float t);
    bool isDataQualityOk(int rawValue);
};

#endif