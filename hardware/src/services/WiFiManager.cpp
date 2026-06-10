#include "WiFiManager.h"
#include "../config.h"
#include <WiFi.h>

void WiFiManager::connect() {

    Serial.println(" WIFI ");
    Serial.print("SSID: ");
    Serial.println(WIFI_SSID);

    // Ajustes de estabilidad
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false); // Evitar que el radio entre en modo sueño durante la conexión
    
    delay(200); // Pequeña espera para estabilizar voltajes
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    // Bajar potencia de transmisión para consumir menos corriente (opcional, prueba con esto)
    // WiFi.setTxPower(WIFI_POWER_11dBm); // 11dBm consume menos que el default de 20dBm

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(1000); // Aumentamos el delay a 1s para dar respiro al regulador
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
