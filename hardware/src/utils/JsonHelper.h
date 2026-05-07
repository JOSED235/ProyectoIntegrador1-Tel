#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include "../models/Sample.h"

#include <Arduino_JSON.h>

class JsonHelper {

public:

    static JSONVar sampleToJson(
        const Sample& sample
    );

    static JSONVar samplesToJsonArray(
        Sample* samples,
        int count
    );
};

#endif