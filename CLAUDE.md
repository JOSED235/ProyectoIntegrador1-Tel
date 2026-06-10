# Project Rules
- Responder siempre en español.
- Generar cualquier resumen de código o documentación estrictamente en español.
- Actualizar este archivo (Claude.md) cada vez que se haga cualquier cambio al proyecto.

# SKILLS
Eres un desarrollador full stack senior experto en sistemas IOT tienes gran experiencia en backend, frontend y tambien en programacion de microncontroladores.
Tiene una gran experiencia en diseño de UI/UX Senior experto en sistemas médicos de alta complejidad y entornos IoT

---

## Documentación de sustentación
- `docs/Documento_Presentacion_Final.md` — documento consolidado para la presentación final: fase de análisis (árbol de problemas, justificación, objetivos), decisiones de diseño con diagrama de bloques y diagrama Entidad-Relación **actualizados** (reemplazan los PNG de la fase de diseño en `docs/`), descripción de la app web (accionar/visualizar/gestionar), nodo lógico de persistencia, estado del hardware, mensajería MQTT asíncrona y contenerización.
- `docs/Diagrama-EntidadRelacion-Actualizado.puml` — fuente PlantUML del diagrama Entidad-Relación actualizado (Usuario, Paciente, SesionCaptura, MuestraSensor — nombres en español, mismo estilo visual que `Diagrama-EntidadRelacion.png`), reemplaza el modelo genérico (Device/Batch/TransmissionLog/Metrics) que no se implementó.

---

# ProyectoIntegrador1-Tel: Hand Tremor Measurement System

## Project Overview
Sistema integrado para captura, procesamiento y visualización de datos de sensores (ESP32) para análisis del temblor en manos. La prueba clínica es la **espiral de Arquímedes**. Incluye sistema de autenticación basado en roles (admin / doctor / paciente) y despliegue completo vía Docker Compose con 3 contenedores independientes.

### Arquitectura general
1. **Hardware (ESP32):** Captura MPU6050, LSM303DLHC, FSR402. Envía cada lote por dos vías redundantes: HTTP POST (`/captura`) y MQTT (`broker.emqx.io`, topic `icesi/jose/esp32/data`). También publica su estado (`icesi/jose/esp32/status`) y escucha comandos START/STOP (`icesi/jose/esp32/control`).
2. **Backend (FastAPI):** API REST en Python. PostgreSQL como base de datos. Autenticación JWT con roles. MQTT subscriber Paho en hilo de fondo, conectado también a `broker.emqx.io` — es la vía principal de persistencia de muestras (no depende de que el ESP32 alcance la IP del backend por HTTP).
3. **Frontend (React 19):** SPA clínica con autenticación, control de roles, MQTT WebSocket (`broker.emqx.io`) y visualización analítica. Compilada con Vite y servida por Nginx.
4. **Nginx (dentro del contenedor frontend):** Sirve los archivos estáticos de React Y actúa como proxy inverso hacia el backend (`/api/` → `http://api:8001/`).

> **Importante:** Todo el tráfico MQTT (ESP32, backend y frontend) converge en el broker público `broker.emqx.io`. Ya no hay broker MQTT local — esto simplifica el despliegue (no hay que exponer puertos MQTT) y evita el problema histórico de que el backend escuchaba un broker/topic distinto al que usaba el ESP32 (por lo que nunca recibía datos por MQTT).

---

## Tech Stack
- **Hardware:** ESP32, Arduino, PlatformIO, MQTT, HTTP POST.
- **Backend:** Python 3.13, FastAPI, SQLAlchemy, PostgreSQL 17, Paho-MQTT, bcrypt, python-jose (JWT).
- **Frontend:** React 19, Vite, Recharts, Tailwind CSS, Radix UI, Lucide Icons, Axios, MQTT.js.
- **Infraestructura:** Docker Compose (raíz del proyecto), Nginx. Broker MQTT público `broker.emqx.io` (sin broker local).

---

## Estructura de archivos clave

```
ProyectoIntegrador1-Tel/
├── docker-compose.yml          ← Archivo CANÓNICO. Ejecutar desde aquí.
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── main.py                 ← FastAPI app + endpoints
│   ├── auth.py                 ← JWT + bcrypt
│   ├── models.py               ← Modelos SQLAlchemy
│   ├── schemas.py              ← Schemas Pydantic
│   ├── crud.py                 ← Operaciones DB + seed_admin
│   ├── database.py             ← Engine + run_migrations()
│   └── mqtt_subscriber.py      ← Suscriptor Paho (broker.emqx.io) en hilo de fondo
└── frontend/
    ├── Dockerfile              ← Build Vite (node:22) + serve Nginx
    ├── .dockerignore
    ├── nginx.conf              ← Proxy /api/ + SPA fallback
    ├── vite.config.js          ← Proxy dev /api/ → localhost:8001
    └── src/
        ├── main.jsx            ← Entry: <AuthProvider><App/>
        ├── App.jsx             ← Navegación por estados + MQTT + health check
        ├── contexts/
        │   └── AuthContext.jsx ← user, token, login(), logout(), loading
        ├── services/
        │   ├── api.js          ← Axios baseURL: '/api' + interceptores
        │   └── mqttService.js  ← Cliente MQTT.js singleton (broker.emqx.io)
        ├── components/
        │   ├── LoginModern.jsx
        │   ├── RegisterFlow.jsx
        │   ├── MainHub.jsx
        │   ├── DoctorManagement.jsx
        │   ├── PatientManagement.jsx
        │   ├── PatientDetail.jsx
        │   ├── DashboardModern.jsx
        │   ├── CaptureModern.jsx
        │   ├── AnalysisModern.jsx
        │   └── ui/             ← Componentes atómicos Shadcn/UI
        └── styles/
            └── index.css       ← Tema clínico (#3B7A57 verde quirúrgico)
```

---

## Docker — Cómo levantar el proyecto

```bash
# Desde la RAÍZ del proyecto (donde está docker-compose.yml)
docker compose up --build

# Servicios y puertos:
#   frontend  → http://localhost:5173   (Nginx sirviendo React)
#   api       → http://localhost:8001   (FastAPI directo)
#   db        → 127.0.0.1:5432          (PostgreSQL, solo localhost)
```

### 3 contenedores

| Servicio | Imagen/Build | Puerto host | Descripción |
|----------|-------------|-------------|-------------|
| `api` | `./backend` | `8001:8001` | FastAPI. Depende de `db` con health check. |
| `frontend` | `./frontend` | `5173:80` | React + Nginx. Proxy `/api/` → backend. |
| `db` | `postgres:17` | `127.0.0.1:5432:5432` | PostgreSQL con health check `pg_isready`. Solo accesible desde la propia máquina (no exponer en AWS/internet). |

- `api` tiene `depends_on: db: condition: service_healthy` — espera que Postgres esté listo antes de arrancar.
- Todos los servicios tienen `restart: unless-stopped` (excepto `db` que tiene `restart: always`).
- Volumen persistente `postgres_data` para la base de datos.
- Variables de entorno del contenedor `api`: `DATABASE_URL`, `MQTT_BROKER` (`broker.emqx.io`), `MQTT_PORT` (`1883`), `MQTT_TOPIC` (`icesi/jose/esp32/data`). `SECRET_KEY` también es configurable por entorno (con default para desarrollo) — para AWS, definirla como variable de entorno propia.

### Por qué Nginx hace de proxy
El JavaScript compilado por Vite se ejecuta en el **browser del usuario**, no en el contenedor. Si el `baseURL` fuera `http://localhost:8001`, funcionaría solo en la misma máquina donde corre Docker. Con el proxy:
- El frontend llama a `/api/patients` (URL relativa).
- Nginx (dentro del contenedor frontend) recibe esa llamada y la reenvía a `http://api:8001/patients` usando el DNS interno de Docker.
- Funciona en cualquier máquina o servidor sin cambiar el código.

En desarrollo local sin Docker (`npm run dev`), Vite hace lo mismo gracias al `server.proxy` en `vite.config.js`.

---

## Backend — Detalles

### Modelos (`models.py`)

| Modelo | Tabla | Campos clave |
|--------|-------|-------------|
| `User` | `users` | `cedula` (PK), `name`, `email`, `password_hash`, `role`, `is_registered`, `created_by` |
| `Patient` | `patients` | `id` (cédula, PK), `name`, `age`, `gender`, `notes` |
| `CaptureSession` | `capture_sessions` | `id`, `device_id`, `patient_id` (FK), `patient_name`, `sample_rate_hz`, `created_at` |
| `SensorSample` | `sensor_samples` | `id` (auto), `session_id` (FK), `seq`, `ts_us`, campos de 3 sensores + `pressure` |

- `CaptureSession.created_at` — `DateTime(timezone=True)` con `server_default=func.now()`. Permite mostrar la fecha real de cada prueba en el frontend.

### Autenticación (`auth.py`)
- Hash de contraseñas con **bcrypt directo** (no passlib — se tuvieron problemas con hashes inválidos).
- Tokens **JWT HS256**, payload `{sub: cedula, name, role, exp}`. Expiración: 24 h.
- `SECRET_KEY = os.getenv("SECRET_KEY", "tremor_esp32_icesi_secret_2024")` — configurable por entorno (definir uno propio en producción/AWS).
- Dependencias: `get_current_user`, `require_admin`, `require_doctor` (acepta admin y doctor).

### Endpoints (`main.py`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/check-cedula` | Libre | Verifica cédula en sistema (pre-registro) |
| POST | `/auth/complete-registration` | Libre | Completa registro con email + password |
| POST | `/auth/login` | Libre | Login por email o cédula |
| GET | `/auth/me` | JWT | Usuario autenticado |
| POST | `/users/doctors` | Admin | Crea pre-registro de doctor |
| GET | `/users/doctors` | Admin | Lista doctores |
| GET | `/patients` | Doctor/Admin | Lista pacientes |
| POST | `/patients` | Doctor/Admin | Crea paciente + User con rol patient |
| GET | `/patients/{id}` | JWT | Detalle + sesiones (con `created_at`) |
| POST | `/captura` | Libre (ESP32) | Recibe lote de muestras |
| GET | `/sesiones` | JWT | Lista todas las sesiones |
| GET | `/captura/{session_id}` | JWT | Datos crudos de una sesión |

- `GET /patients/{id}` construye la lista de sesiones manualmente (no retorna objetos SQLAlchemy directamente) para evitar `DetachedInstanceError` y serializar correctamente `created_at`.

### Seed admin (`crud.py → seed_admin`)
- Corre en startup. Cédula: `0000000000`, email: `admin@sistema.com`, password: `admin123`.
- Repara hashes inválidos automáticamente.

### Migraciones auto-healing (`database.py → run_migrations`)
- `create_all()` no agrega columnas a tablas existentes.
- `run_migrations()` agrega por `ALTER TABLE` las columnas que falten: `patient_id`, `patient_name`, `created_at`.
- **Patrón obligatorio:** siempre que se agregue una columna al modelo, agregar su `ALTER TABLE` aquí. No usar Alembic.

### MQTT Subscriber (`mqtt_subscriber.py`)
- Se importa en `main.py` → `connect_async()` + `loop_start()` (conexión y reconexión en hilo de fondo, no bloquea el arranque de FastAPI).
- Broker: `os.getenv("MQTT_BROKER", "broker.emqx.io")`.
- Puerto: `os.getenv("MQTT_PORT", "1883")`.
- Topic: `os.getenv("MQTT_TOPIC", "icesi/jose/esp32/data")` — el mismo topic donde `MqttService::publishBatch` (firmware) publica cada lote.
- El payload MQTT tiene la misma forma que el body de `POST /captura` (`session_id`, `device_id`, `patient_name`, `sample_rate_hz`, `samples[]`), así que `on_message` reutiliza la misma lógica de resolución de paciente y guardado que `crud.save_capture`.
- Esta vía MQTT es ahora la **persistencia primaria**: funciona aunque el ESP32 no pueda alcanzar el backend por HTTP (p. ej. por firewall/NAT), porque tanto el ESP32 como el backend salen a internet hacia `broker.emqx.io`.

---

## Frontend — Detalles

### Autenticación (`AuthContext.jsx`)
- Al cargar la app, decodifica el JWT almacenado en `localStorage` y verifica que `exp * 1000 > Date.now()`. Si está expirado, limpia la sesión **antes** del primer API call (evita flash de UI autenticada).
- `user = {cedula, name, role}`. Persiste en `localStorage` como `auth_token` y `auth_user`.

### API Service (`services/api.js`)
- `baseURL: '/api'` — URL relativa. En desarrollo Vite la proxea a `localhost:8001`; en Docker Nginx la proxea al contenedor `api`.
- **Interceptor request:** adjunta `Authorization: Bearer <token>`.
- **Interceptor response (401):** cuando el token expira, limpia `localStorage` y hace `window.location.reload()` → el usuario ve la pantalla de login automáticamente.
- `getErrorMessage(err, fallback)` — normaliza errores FastAPI (string `detail` y lista 422).

### Navegación (`App.jsx`)
Basada en estado `currentScreen`. Guards de rol antes de cada pantalla:

| `currentScreen` | Componente | Roles permitidos |
|-----------------|-----------|------------------|
| `hub` | `MainHub` | Todos |
| `history` | `DashboardModern` | Todos (paciente ve solo sus sesiones) |
| `patients` | `PatientManagement` | Doctor, Admin |
| `patient-detail` | `PatientDetail` | Doctor, Admin |
| `doctors` | `DoctorManagement` | Admin |
| `capture` | `CaptureModern` | **Solo Doctor** |
| `analysis` | `AnalysisModern` | Todos |

- **MQTT:** `onOffline` resetea `isRecording = false` → evita que la pantalla quede bloqueada en "GRABANDO" si el ESP32 se desconecta.
- **Health check backend:** `GET /api/` cada 30 s. Si falla, muestra banner rojo fijo con botón "Reintentar".

### Flujo de roles
```
Admin
  └── Crea doctor (cédula + nombre) → DoctorManagement
          ↓
      Doctor activa su cuenta (RegisterFlow: cédula → email + pass)
          ↓
      Doctor crea paciente (cédula + nombre + edad + género + notas)
          ↓
      Paciente activa su cuenta (RegisterFlow: cédula → email + pass)
          ↓
      Paciente ve su historial (DashboardModern filtrado por cedula)
```

### Validaciones en formularios
- **Cédula:** `^\d{6,12}$` — solo números, 6 a 12 dígitos. Validado en `PatientManagement`, `DoctorManagement` y `RegisterFlow`.
- **Edad:** entre 1 y 120 años.
- **Password:** mínimo 6 caracteres (validado en frontend; backend no impone reglas adicionales).

### Componentes — comportamientos relevantes

**`CaptureModern.jsx`**
- Solo accesible para doctors (guard en `App.jsx`).
- Calcula `startBlocker`: si ESP32 no está conectado → alerta roja; si no hay paciente seleccionado → alerta amarilla. El botón START queda deshabilitado con mensaje explicativo.
- Si el paciente inicial (`patientInitialId`) no existe en la lista, se limpia a `""` para forzar selección manual.
- Botón STOP tiene guard: `if (!esp32Connected) return`.

**`AnalysisModern.jsx`**
- Si la sesión existe pero `data.count === 0` → muestra pantalla "Sesión sin datos" con mensaje explicativo.

**`PatientDetail.jsx`**
- Botón "Nueva Medición" solo se renderiza si `onNewCapture !== null` (los admins reciben `null`, evita crash `null is not a function`).
- Fecha de sesión usa `session.created_at` desde el backend (no `new Date()`).

**`DashboardModern.jsx`**
- `patientFilter` — si el usuario es paciente, filtra sesiones por `session.patientId === user.cedula`.
- Título dinámico: "Mis Resultados" para pacientes / "Historial Clínico" para médicos.

**Diálogos (`PatientManagement`, `DoctorManagement`)**
- `onOpenChange` y botón Cancelar resetean `formData` completo al cerrar (no solo `formError`).

---

## Convenciones de desarrollo

- **URL del backend:** Siempre usar `/api/...` (relativo). Nunca `localhost:8001` en el código fuente.
- **Navegación:** Basada en estados en `App.jsx` — sin React Router.
- **Migraciones:** Patrón `run_migrations()` con `ALTER TABLE` explícito. No usar Alembic.
- **Bcrypt:** Usar `bcrypt` directamente. Hashes válidos empiezan con `$2a$`, `$2b$` o `$2y$`.
- **Errores 422 FastAPI:** Siempre pasar por `getErrorMessage()` antes de mostrar al usuario.
- **Fechas de sesión:** `ts_us` del ESP32 → segundos relativos para gráficas. `created_at` de la BD → fecha real de la prueba.
- **Columnas nuevas en BD:** agregar tanto al modelo en `models.py` como al `run_migrations()` en `database.py`.
- **Docker compose:** El archivo canónico es `/docker-compose.yml` (raíz). El de `/backend/docker-compose.yml` solo contiene un aviso de que fue movido.
- **Roles:** Admin solo gestiona doctores. Doctor gestiona pacientes e inicia capturas. Paciente solo ve su historial.
