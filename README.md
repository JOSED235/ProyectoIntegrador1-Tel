# ProyectoIntegrador1-Tel — Sistema de Medición de Temblor en Manos

**DISEÑO E IMPLEMENTACIÓN DE UN SISTEMA BASADO EN ESP32 PARA LA MEDICIÓN DEL TEMBLOR EN MANOS EN LA PRUEBA DE LA ESPIRAL DE ARQUÍMEDES**

Proyecto Integrador 1 — Ingeniería Telemática, Universidad Icesi
Autor: Jose David Rodríguez Pinilla

---

## ¿Qué es este proyecto?

Es un sistema **IoT clínico de extremo a extremo** que captura, procesa, almacena y visualiza datos de sensores de movimiento durante la **prueba de la espiral de Arquímedes**, una prueba clínica estándar para evaluar el temblor en las manos (por ejemplo, en pacientes con Parkinson u otros trastornos del movimiento).

El sistema combina:
- Un **dispositivo ESP32** con sensores inerciales y de presión que el paciente sostiene mientras dibuja la espiral.
- Un **backend** que recibe, valida y almacena los datos de cada sesión de captura.
- Una **aplicación web (frontend)** donde médicos y pacientes inician sesiones de captura, controlan el dispositivo en tiempo real y visualizan/analizan los resultados.

## ¿Para qué sirve?

- Permite a un **doctor** registrar pacientes, iniciar/detener una captura desde la web (control remoto del ESP32), y revisar el historial de pruebas de cada paciente con gráficas de los datos crudos de los sensores.
- Permite a un **paciente** consultar el historial y resultados de sus propias pruebas.
- Permite a un **administrador** gestionar las cuentas de los doctores del sistema.
- Sirve como base para análisis cuantitativo del temblor (aceleración, orientación, presión de agarre) en lugar de una evaluación puramente visual/subjetiva de la espiral dibujada.

## ¿Cómo funciona? (Arquitectura general)

```
┌────────────┐   MQTT (data/status/control)   ┌────────────────────────┐
│   ESP32    │ ───────────────────────────────▶│   broker.emqx.io       │
│ (sensores) │ ◀─────────────────────────────── │  (broker MQTT público) │
└─────┬──────┘                                  └──────────┬─────────────┘
      │ HTTP POST /captura (vía redundante)                │
      ▼                                                     ▼
┌─────────────────────────────┐   suscriptor MQTT   ┌──────────────────┐
│  Backend FastAPI (api)       │◀────────────────────│  broker.emqx.io  │
│  + PostgreSQL (db)           │                      └──────────┬───────┘
└──────────────┬────────────────┘                                │
               │ REST API (/api/...) vía proxy Nginx             │ MQTT WebSocket
               ▼                                                  ▼
        ┌──────────────────────────────────────────────────────────┐
        │  Frontend React + Nginx (frontend)                        │
        │  Login, gestión de pacientes/doctores, captura, análisis  │
        └──────────────────────────────────────────────────────────┘
```

1. **Hardware (ESP32):** lee continuamente el MPU6050 (acelerómetro/giroscopio), el LSM303DLHC (acelerómetro/magnetómetro) y un sensor de presión FSR402 mientras el paciente dibuja la espiral. Cada lote de muestras se envía por **dos vías redundantes**: HTTP POST (`/captura`) y MQTT (topic `icesi/jose/esp32/data` en `broker.emqx.io`). También publica su estado de conexión (`icesi/jose/esp32/status`) y escucha comandos remotos `START`/`STOP` (`icesi/jose/esp32/control`) enviados desde el frontend.
2. **Backend (FastAPI + PostgreSQL):** expone una API REST con autenticación JWT por roles (admin/doctor/paciente). Un suscriptor MQTT (Paho) corre en segundo plano conectado al mismo broker público — es la **vía principal de persistencia**, ya que no depende de que el ESP32 pueda alcanzar la IP del backend por red local.
3. **Frontend (React 19 + Vite + Nginx):** SPA donde los usuarios inician sesión, gestionan pacientes/doctores, controlan la captura del ESP32 en tiempo real (vía MQTT sobre WebSocket) y visualizan los resultados de cada sesión con gráficas (Recharts).
4. **Nginx (dentro del contenedor frontend):** sirve los archivos estáticos de React y actúa como proxy inverso de `/api/` hacia el backend, para que el código del frontend nunca dependa de una URL fija.

> Todo el tráfico MQTT (ESP32, backend y frontend) converge en el **broker público `broker.emqx.io`**, por lo que no es necesario desplegar ni exponer un broker MQTT propio.

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Hardware** | ESP32, Arduino (PlatformIO), MPU6050, LSM303DLHC, FSR402, MQTT, HTTP |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy, PostgreSQL 17, Paho-MQTT, bcrypt, JWT (python-jose) |
| **Frontend** | React 19, Vite, Tailwind CSS, Radix UI, Recharts, Axios, MQTT.js |
| **Infraestructura** | Docker Compose (3 contenedores: api, frontend, db), Nginx, broker MQTT público `broker.emqx.io` |

## Estructura del repositorio

```
ProyectoIntegrador1-Tel/
├── docker-compose.yml      ← Archivo canónico para levantar todo el sistema
├── hardware/                ← Firmware ESP32 (PlatformIO)
│   └── src/                 ← main.cpp, sensores, servicios MQTT/HTTP, config
├── backend/                 ← API REST (FastAPI) + suscriptor MQTT + PostgreSQL
│   ├── main.py              ← Endpoints de la API
│   ├── models.py            ← Modelos de base de datos (SQLAlchemy)
│   ├── auth.py               ← Autenticación JWT + bcrypt
│   ├── crud.py               ← Operaciones de base de datos
│   ├── database.py           ← Conexión y migraciones automáticas
│   └── mqtt_subscriber.py    ← Suscriptor MQTT (persistencia primaria)
├── frontend/                ← Aplicación web (React + Vite + Nginx)
│   └── src/
│       ├── components/       ← Pantallas: login, captura, historial, análisis, gestión
│       ├── contexts/          ← Autenticación
│       └── services/          ← Cliente API y cliente MQTT
└── docs/                     ← Diagramas y documento de presentación final
```

## Roles y flujo de uso

```
Admin
  └── Crea doctor (cédula + nombre)
          ↓
      Doctor activa su cuenta (cédula → email + contraseña)
          ↓
      Doctor crea paciente (cédula + nombre + edad + género + notas)
          ↓
      Paciente activa su cuenta (cédula → email + contraseña)
          ↓
      Doctor inicia/detiene una captura (control remoto del ESP32)
          ↓
      Doctor y paciente consultan el historial y el análisis de cada sesión
```

## Cómo ejecutar el proyecto

### Con Docker (recomendado)

Desde la raíz del proyecto (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

| Servicio | URL / Puerto | Descripción |
|----------|--------------|-------------|
| `frontend` | http://localhost:5173 | Aplicación web (React servido por Nginx) |
| `api` | http://localhost:8001 | API REST (FastAPI) |
| `db` | 127.0.0.1:5432 | PostgreSQL (solo accesible localmente) |

Al iniciar, el backend crea automáticamente un usuario administrador semilla:
- **Cédula:** `0000000000`
- **Email:** `admin@sistema.com`
- **Contraseña:** `admin123`

### Hardware (ESP32)

1. Abrir la carpeta `hardware/` en VS Code con la extensión PlatformIO.
2. Configurar credenciales de WiFi y parámetros MQTT en `hardware/src/config.h`.
3. Compilar y cargar el firmware al ESP32.

## Documentación adicional

La carpeta [`docs/`](docs/) contiene los diagramas de arquitectura, el diagrama entidad-relación actualizado y el documento de presentación final con el detalle de análisis, diseño e implementación del proyecto.
