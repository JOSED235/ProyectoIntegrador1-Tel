#ifndef HTTP_SERVICE_H
#define HTTP_SERVICE_H

#include "../models/Sample.h"
#include <Arduino.h>

class HttpService {
public:
    bool sendBatch(Sample* samples, int count, String sessionId);

private:
    float sanitizeFloat(float value);
};

#endif