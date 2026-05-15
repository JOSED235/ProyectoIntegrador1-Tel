#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

#include "../models/Sample.h"

class MqttService {

public:

    // INICIALIZAR MQTT
    static void begin();

    // LOOP MQTT
    static void loop();

    // PUBLICAR DATOS
    static bool publishBatch(
        Sample* samples,
        int count,
        String sessionId
    );

    // CALLBACK DE MENSAJES MQTT
    static void callback(
        char* topic,
        byte* payload,
        unsigned int length
    );

    // FLAGS DE CONTROL
    static bool startRequested;

    static bool stopRequested;

private:

    static WiFiClient wifiClient;

    static PubSubClient client;
};