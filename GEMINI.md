# Project Gemini - Archimedes Spiral Tremor Measurement System

## Project Overview
This project is an IoT ecosystem designed to measure and analyze hand tremors in patients performing the Archimedes spiral test. It uses an ESP32-based wearable/handheld device to capture high-frequency sensor data, which is then transmitted via MQTT to a central backend for storage and analysis, with a web-based dashboard for medical professionals.

### Key Technologies
- **Hardware**: ESP32 (Arduino Framework), PlatformIO, MPU6050 (Accel/Gyro), LSM303 (Accel/Mag), FSR (Pressure), MQTT.
- **Backend**: FastAPI (Python), SQLAlchemy (ORM), PostgreSQL (Database), Paho-MQTT (Subscriber), JWT (Authentication).
- **Frontend**: React (Vite), Tailwind CSS (Styling), Recharts (Visualization), MQTT.js (Real-time control).
- **Infrastructure**: Docker, Docker Compose, Nginx.

## Architecture
1.  **Hardware Layer**: Captures data from multiple sensors at a high sample rate (e.g., 100Hz). Buffers samples and sends them in JSON batches via MQTT to minimize overhead.
2.  **Communication Layer**: Uses an MQTT broker (default: `broker.emqx.io`) as the bridge between hardware, backend, and frontend.
3.  **Service Layer**: 
    -   `mqtt_subscriber.py`: A background service that ingests MQTT data into the database.
    -   `main.py`: REST API for user management, patient records, and data retrieval.
4.  **Presentation Layer**: A modern dashboard for doctors to manage patients, trigger recording sessions, and view analyzed tremor data.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.12 (for local backend development)
- PlatformIO (for hardware development)

### Running with Docker (Recommended)
From the root directory:
```bash
docker-compose up --build
```
-   **API**: [http://localhost:8001](http://localhost:8001)
-   **Frontend**: [http://localhost:5173](http://localhost:5173)

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Hardware
1.  Open the `hardware` directory in VS Code with the PlatformIO extension.
2.  Configure `WiFi` and `MQTT` settings in `hardware/src/config.h` (or similar).
3.  Build and Upload to the ESP32.

## Development Conventions

### Backend
-   Follow FastAPI best practices (Dependency Injection, Pydantic schemas).
-   Use `crud.py` for all database interactions.
-   Models are defined in `models.py` using SQLAlchemy.

### Frontend
-   Modular React components in `src/components`.
-   Tailwind CSS for styling.
-   Use `src/services/api.js` for backend communication.

### Hardware
-   The `TestManager` handles the state machine for recording sessions.
-   `BufferManager` manages memory-efficient sampling.
-   Sensors are abstracted into classes under `src/sensors`.

## Documentation
-   `docs/`: Contains architectural diagrams, entity-relationship diagrams, and project documentation.
-   `README.md`: Basic project introduction.
