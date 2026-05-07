#ifndef TEST_MANAGER_H
#define TEST_MANAGER_H
#include "../services/WiFiManager.h"
#include "../core/BufferManager.h"
#include "../sensors/SensorManager.h"
#include "../services/HttpService.h"

class TestManager {

private:

    BufferManager bufferManager;
    SensorManager sensorManager;
    HttpService httpService;
    WiFiManager wifiManager;

    bool testRunning;

    String currentSessionId;

    uint32_t sequenceCounter;

    uint32_t sessionStartUs;

    uint32_t nextSampleUs;

    bool lastButtonState;

    uint32_t lastDebounceMs;

    void startTest();

    void stopTest();

    void handleButton();

    void acquireSample();

    String generateSessionId();

public:

    TestManager();

    void begin();

    void update();
};

#endif
