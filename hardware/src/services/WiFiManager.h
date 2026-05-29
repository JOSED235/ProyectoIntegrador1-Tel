#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <WiFi.h>
#include <Arduino.h>
#include "../config.h"

class WiFiManager {

public:

    void connect();

    inline bool isConnected() {
        return WiFi.status() == WL_CONNECTED;
    }

    inline void reconnectIfNeeded() {
        static unsigned long lastAttempt = 0;
        if (WiFi.status() != WL_CONNECTED && millis() - lastAttempt > 10000) {
            lastAttempt = millis();
            Serial.println("Reintentando WiFi...");
            connect();
        }
    }
};

#endif