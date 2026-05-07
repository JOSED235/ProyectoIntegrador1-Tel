#include <Arduino.h>

#include "core/TestManager.h"

TestManager testManager;

void setup() {

    Serial.begin(115200);

    delay(1000);

    Serial.println();
    Serial.println("INICIANDO SISTEMA");

    testManager.begin();
}

void loop() {

    testManager.update();
}