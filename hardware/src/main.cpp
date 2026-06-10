#include <Arduino.h>
#include "soc/soc.h"           // Cabeceras para control de hardware
#include "soc/rtc_cntl_reg.h"  // Cabeceras para control de potencia
#include "core/TestManager.h"

TestManager testManager;
TestManager* globalTestManager = &testManager;

void setup() {
    // DESACTIVAR BROWNOUT DETECTOR para evitar reinicios por picos de WiFi
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 

    Serial.begin(115200);
    Serial.println();
    Serial.println("INICIANDO SISTEMA");

    testManager.begin();
}

void loop() {
    testManager.update();
}