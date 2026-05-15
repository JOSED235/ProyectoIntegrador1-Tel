#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

#include "../models/Sample.h"

class MqttService {

public:

    static void begin();

    static void loop();

    static bool publishBatch(
        Sample* samples,
        int count,
        String sessionId
    );

private:

    static WiFiClient wifiClient;

    static PubSubClient client;
};