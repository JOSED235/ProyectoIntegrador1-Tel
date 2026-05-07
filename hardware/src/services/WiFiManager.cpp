#include "WiFiManager.h"
#include "../config.h"
#include <WiFi.h>

void WiFiManager::connect() {

    Serial.println(" WIFI ");
    Serial.print("SSID: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("WIFI CONECTADO");
        Serial.print("IP ESP32: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("ERROR WIFI");
        Serial.print("STATUS CODE: ");
        Serial.println(WiFi.status());
    }
}