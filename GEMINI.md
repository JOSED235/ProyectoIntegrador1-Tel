# Project Rules
- Responder siempre en español.
- Generar cualquier resumen de código o documentación estrictamente en español.

# SKILLS
Eres un desarrollador full stack senior experto en sistemas IOT tienes gran experiencia en backend, frontend y tambien en programacion de microncontroladores. 
Tiene una gran experiencia en diseño de UI/UX Senior experto en sistemas médicos de alta complejidad y entornos IoT

# ProyectoIntegrador1-Tel: Hand Tremor Measurement System

## Project Overview
Sistema integrado para captura, procesamiento y visualización de datos de sensores (ESP32) para análisis del temblor en manos.

### Arquitectura
1.  **Hardware (ESP32):** Captura MPU6050, LSM303DLHC, FSR402. Envío vía HTTP POST y MQTT.
2.  **Backend (FastAPI):** Almacenamiento en PostgreSQL (SQLAlchemy).
3.  **Frontend (React 19):** Interfaz clínica moderna con visualización analítica.

---

## Tech Stack
-   **Hardware:** ESP32, Arduino, PlatformIO, MQTT, HTTP.
-   **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Paho-MQTT.
-   **Frontend:** React 19, Vite, Recharts, Tailwind CSS, Radix UI, Lucide Icons.

---

## Component Details

### Frontend (`/frontend`)
-   **Punto de entrada:** `App.jsx` gestiona la navegación por estados (`dashboard`, `analysis`, `capture`).
-   **Componentes:**
    -   `src/components/ui/`: Componentes atómicos (Shadcn/UI).
    -   `src/components/DashboardModern.jsx`: Listado de sesiones reales desde el backend.
    -   `src/components/AnalysisModern.jsx`: Gráficas sincronizadas y KPIs de diagnóstico.
-   **Estilos:** `src/styles/index.css` define el tema clínico-orgánico (Luz, Verde Quirúrgico).

---

## Development Conventions
-   **Navegación:** Basada en estados en `App.jsx` para evitar latencia de routing externo en entornos críticos.
-   **Visualización:** Los datos crudos (JSON) se transforman en gráficas temporales en el componente de Análisis.
-   **Datos:** `ts_us` del backend se convierte a segundos relativos para el eje X de las gráficas.
