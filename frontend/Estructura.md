# ESTRUCTURA DEL FRONTEND

## Descripción General

Este frontend corresponde al sistema de monitoreo de sensores basado en:

- ESP32
- MQTT
- FastAPI
- PostgreSQL
- React + Vite

La aplicación permite:

- Visualizar datos en tiempo real provenientes del ESP32
- Mostrar gráficas de aceleración, giroscopio y presión
- Consultar sesiones históricas almacenadas
- Comunicarse con el backend mediante HTTP
- Suscribirse al broker MQTT para monitoreo en vivo


# Estructura del Proyecto

```text
frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── charts/
│   │   ├── layout/
│   │   ├── monitoring/
│   │   └── sessions/
│   │
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── ESTRUCTURA.md
```


# Explicación de Carpetas y Archivos


# public/

Contiene archivos públicos accesibles directamente desde el navegador.

Ejemplos:

- imágenes estáticas
- íconos
- favicon
- logos


# src/

Contiene todo el código fuente principal de la aplicación React.


# src/assets/

Almacena recursos gráficos y multimedia.

Ejemplos:

- imágenes
- logos
- íconos
- archivos SVG


# src/components/

Contiene componentes reutilizables de React.

La aplicación se divide por responsabilidad funcional.


# src/components/charts/

Componentes encargados de renderizar gráficas.

## Archivos

### AccelerationChart.jsx

Muestra gráficas de aceleración:

- eje X
- eje Y
- eje Z

Datos provenientes del:

- MPU6050
- LSM303DLHC


### GyroscopeChart.jsx

Visualiza velocidad angular del MPU6050.

Permite monitoreo en tiempo real del movimiento.


### PressureChart.jsx

Muestra información del sensor FSR402.

Visualiza presión o fuerza aplicada.


# src/components/layout/

Componentes visuales generales de la interfaz.

## Archivos

### Navbar.jsx

Barra superior de navegación.

Puede incluir:

- nombre del sistema
- estado MQTT
- navegación


### Sidebar.jsx

Menú lateral de navegación.

Permite cambiar entre:

- Dashboard
- Monitoreo
- Histórico


### PageContainer.jsx

Wrapper general para organizar las páginas.

Centraliza:

- márgenes
- padding
- estructura visual


# src/components/monitoring/

Componentes relacionados con monitoreo en tiempo real.

## Archivos

### LiveSensorCard.jsx

Tarjeta individual para mostrar datos en vivo de sensores.

Ejemplo:

- aceleración actual
- presión actual
- giroscopio actual


### SensorStatus.jsx

Muestra el estado de los sensores.

Ejemplos:

- conectado
- desconectado
- sin datos


### MqttConnection.jsx

Administra y visualiza el estado de conexión MQTT.

Ejemplos:

- conectado al broker
- reconectando
- error de conexión


# src/components/sessions/

Componentes relacionados con sesiones históricas.

## Archivos

### SessionCard.jsx

Tarjeta resumen de una sesión capturada.

Puede mostrar:

- fecha
- duración
- cantidad de muestras


### SessionTable.jsx

Tabla con listado completo de sesiones almacenadas.


### SessionDetails.jsx

Vista detallada de una sesión específica.

Permite visualizar:

- gráficas
- datos
- métricas


# src/hooks/

Custom Hooks de React.

Permiten reutilizar lógica.

## Archivos

### useMqtt.js

Hook personalizado para:

- conexión MQTT
- suscripción a tópicos
- recepción de mensajes


### useSessions.js

Hook encargado de consultar sesiones históricas desde FastAPI.


# src/pages/

Representa las páginas principales de la aplicación.

## Archivos

### Dashboard.jsx

Página principal del sistema.

Muestra:

- resumen general
- métricas
- estado de sensores


### Monitoring.jsx

Página de monitoreo en tiempo real.

Consume datos MQTT.


### History.jsx

Página de histórico de sesiones.

Consulta datos almacenados en PostgreSQL mediante FastAPI.


### NotFound.jsx

Página de error 404.

Se muestra cuando una ruta no existe.


# src/services/

Capa encargada de comunicación externa.

## Archivos

### api.js

Configuración base de llamadas HTTP al backend FastAPI.

Ejemplos:

- GET sesiones
- POST datos
- consultas históricas


### mqttClient.js

Configuración del cliente MQTT.

Administra:

- conexión
- tópicos
- eventos


### sessionService.js

Funciones específicas para manejo de sesiones.

Ejemplos:

- obtener sesiones
- obtener detalle
- consultar muestras


# src/store/

Manejo de estado global usando Redux Toolkit.

## Archivos

### store.js

Configuración principal del store global.


### sensorSlice.js

Estado global de sensores en tiempo real.


### sessionSlice.js

Estado global de sesiones históricas.


# src/styles/

Archivos globales de estilos.

## Archivos

### global.css

Estilos generales de toda la aplicación.

Ejemplos:

- tipografía
- colores
- layout
- responsive


# src/utils/

Funciones auxiliares reutilizables.

## Archivos

### formatters.js

Funciones para formatear datos.

Ejemplos:

- fechas
- números
- unidades


### constants.js

Constantes globales del sistema.

Ejemplos:

- tópicos MQTT
- URLs
- límites
- nombres de sensores


# Archivos Principales


# App.jsx

Componente raíz de la aplicación.

Define:

- rutas
- layout principal
- estructura global


# main.jsx

Punto de entrada de React.

Renderiza la aplicación en el DOM.


# Relación con el Diagrama de Despliegue

El frontend se conecta con:

## MQTT Broker

Para monitoreo en tiempo real.

Flujo:

```text
ESP32 → MQTT → Frontend
```


## Backend FastAPI

Para persistencia y consultas históricas.

Flujo:

```text
Frontend → FastAPI → PostgreSQL
```


# Sensores Visualizados

## LSM303DLHC

- aceleración
- campo magnético


## MPU6050

- aceleración
- velocidad angular


## FSR402

- presión
- fuerza


# Tecnologías Utilizadas

- React
- Vite
- Redux Toolkit
- MQTT.js
- Recharts
- React Router
- FastAPI
- PostgreSQL
- Docker


# Objetivo Arquitectónico

La estructura busca:

- modularidad
- escalabilidad
- reutilización
- mantenimiento sencillo
- separación de responsabilidades

Siguiendo una arquitectura basada en componentes y servicios.