#include "TimeUtils.h"

float TimeUtils::microsToSeconds(
    uint32_t microseconds
) {

    return
        microseconds / 1000000.0f;
}

uint32_t TimeUtils::secondsToMicros(
    float seconds
) {

    return
        (uint32_t)(seconds * 1000000.0f);
}