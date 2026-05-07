#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>


// WIFI

/*
PARA EL LAB DE REDES
inline constexpr const char* WIFI_SSID =
    "LABREDES";

inline constexpr const char* WIFI_PASSWORD =
    "F0rmul4-1";

inline constexpr const char* SERVER_URL =
    "http://192.168.130.41:8001/captura";



*/

//para probar con el mi cel
// WIFI_SSID = "A54 de Jose David"
// WIFI_PASSWORD = "123456789"
//ip server con mi cel SERVER_URL = 10.177.137.170



inline constexpr const char* WIFI_SSID = "LABREDES";

inline constexpr const char* WIFI_PASSWORD =
    "F0rmul4-1";


// BACKEND

//192.168.130.33 es la ip del servidor en el laboratorio


inline constexpr const char* SERVER_URL =
    "http://192.168.130.33:8001/captura";


// PINES


inline constexpr uint8_t BTN_PIN =
    0;

inline constexpr uint8_t FSR_PIN =
    34;


// SAMPLING


inline constexpr uint16_t SAMPLE_RATE_HZ =
    100;

inline constexpr uint32_t SAMPLE_PERIOD_US =
    1000000UL / SAMPLE_RATE_HZ;


// BUFFER


inline constexpr int BUFFER_SIZE =
    20;

#endif