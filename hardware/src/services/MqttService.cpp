#include "MqttService.h"
#include "../core/TestManager.h"

extern TestManager* globalTestManager;
#include "../models/Sample.h"
#include "../config.h"

#include <Arduino_JSON.h>


WiFiClient MqttService::wifiClient;
PubSubClient MqttService::client(wifiClient);


void MqttService::begin() {

    client.setServer(MQTT_SERVER, 1883);

    // IMPORTANTE:
    // El payload JSON es grande
    client.setBufferSize(12000);

    // CALLBACK PARA RECIBIR MENSAJES
    client.setCallback(callback);

    while (!client.connected()) {

        Serial.println("[MQTT] Conectando...");

        if (client.connect("esp32-client")) {

            Serial.println("[MQTT] Conectado");

            // SUSCRIBIRSE A TOPICS DE CONTROL
            client.subscribe("sensor/control");

            Serial.println("[MQTT] Suscrito a sensor/control");

        } else {

            Serial.print("[MQTT] Error conexión. rc=");
            Serial.println(client.state());

            delay(1000);
        }
    }
}


void MqttService::loop() {

    if (!client.connected()) {

        Serial.println("[MQTT] Reconectando...");

        while (!client.connected()) {

            if (client.connect("esp32-client")) {

                Serial.println("[MQTT] Reconectado");

                client.subscribe("sensor/control");

                Serial.println("[MQTT] Resuscrito a sensor/control");

            } else {

                Serial.print("[MQTT] Error reconexión. rc=");
                Serial.println(client.state());

                delay(1000);
            }
        }
    }

    client.loop();
}


void MqttService::callback(
    char* topic,
    byte* payload,
    unsigned int length
) {

    Serial.println();
    Serial.println(" MQTT MESSAGE ");

    Serial.print("TOPIC: ");
    Serial.println(topic);

    String message = "";

    for (unsigned int i = 0; i < length; i++) {

        message += (char)payload[i];
    }

    Serial.print("PAYLOAD: ");
    Serial.println(message);

    // PARSEAR JSON
    JSONVar json = JSON.parse(message);

    if (JSON.typeof(json) == "undefined") {

        Serial.println("[MQTT] JSON inválido");
        return;
    }

    // EXTRAER COMANDO
    String comando = (const char*) json["comando"];

    Serial.print("[MQTT] Comando recibido: ");
    Serial.println(comando);

    if (comando == "START") {

        Serial.println("[MQTT] Solicitud START recibida");
            if (globalTestManager != nullptr) {

                globalTestManager->startTest();
            }

    } else if (comando == "STOP") {

        Serial.println("[MQTT] Solicitud STOP recibida");
        
        if (globalTestManager != nullptr) {
                globalTestManager->stopTest();
            }


    } else {

        Serial.println("[MQTT] Comando desconocido");
    }

    Serial.println();
}


bool MqttService::publishBatch(
    Sample* samples,
    int count,
    String sessionId
) {

    JSONVar payload;

    payload["session_id"] = sessionId;
    payload["device_id"] = "esp32-devkit";
    payload["sample_rate_hz"] = SAMPLE_RATE_HZ;

    JSONVar samplesArray;

    for (int i = 0; i < count; i++) {

        JSONVar s;

        s["seq"] = samples[i].seq;
        s["ts_us"] = (double)samples[i].ts_us;

        s["mpu_ax"] = samples[i].mpu_ax;
        s["mpu_ay"] = samples[i].mpu_ay;
        s["mpu_az"] = samples[i].mpu_az;

        s["mpu_gx"] = samples[i].mpu_gx;
        s["mpu_gy"] = samples[i].mpu_gy;
        s["mpu_gz"] = samples[i].mpu_gz;

        s["lsm_ax"] = samples[i].lsm_ax;
        s["lsm_ay"] = samples[i].lsm_ay;
        s["lsm_az"] = samples[i].lsm_az;

        s["lsm_mx"] = samples[i].lsm_mx;
        s["lsm_my"] = samples[i].lsm_my;
        s["lsm_mz"] = samples[i].lsm_mz;

        s["pressure"] = samples[i].pressure;

        samplesArray[i] = s;
    }

    payload["samples"] = samplesArray;

    String jsonString = JSON.stringify(payload);

    bool success = client.publish(
        "sensor/data",
        jsonString.c_str()
    );

    if (success) {

        Serial.printf(
            "[MQTT] Batch publicado | muestras=%d\n",
            count
        );

    } else {

        Serial.println("[MQTT] Error publish");
    }

    return success;
}