#ifndef TIME_UTILS_H
#define TIME_UTILS_H

#include <Arduino.h>

class TimeUtils {

public:

    static float microsToSeconds(
        uint32_t microseconds
    );

    static uint32_t secondsToMicros(
        float seconds
    );
};

#endif