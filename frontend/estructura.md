# Frontend — Sistema de Captura de Temblor

Interfaz web del sistema de captura de movimiento de mano durante la prueba de la espiral de Arquímedes. Construida con **React + Vite**, consume el backend FastAPI via HTTP y se conecta al broker MQTT Mosquitto para control en tiempo real.

---

## Estructura de archivos

```
frontend/
├── src/
│   ├── App.jsx                  # Componente raíz — integra toda la interfaz
│   ├── main.jsx                 # Punto de entrada de React
│   ├── components/
│   │   ├── SessionList.jsx      # Lista las sesiones registradas en la DB
│   │   └── RawDataView.jsx      # Muestra el JSON crudo de una sesión
│   ├── services/
│   │   ├── api.js               # Funciones HTTP para consumir el backend
│   │   └── mqttService.js       # Cliente MQTT singleton (conexión al broker)
│   └── styles/
│       └── index.css            # Estilos globales (tema terminal industrial)
├── index.html
├── package.json
└── vite.config.js
```

---

## Archivos editados y qué hace cada uno

### `src/services/api.js`

Configura Axios con la URL base del backend y exporta dos funciones:

- `getSesiones()` — hace `GET /sesiones` y retorna la lista de sesiones registradas en la base de datos.
- `getCaptura(sessionId)` — hace `GET /captura/{session_id}` y retorna el JSON completo con los datos de sensores de esa sesión.

El puerto es `8001`, que es el que expone el contenedor FastAPI según el `docker-compose.yml`.

---

### `src/services/mqttService.js`

Crea y exporta un cliente MQTT como **singleton** (una sola conexión compartida en toda la app).

- Se conecta al broker Mosquitto local via WebSocket en `ws://localhost:9001`.
- El puerto `9001` es el que Mosquitto expone para WebSockets (el `1883` es TCP puro y el navegador no puede usarlo directamente).
- El `clientId` es aleatorio para evitar colisiones si hay varias pestañas abiertas.
- Tiene handlers de log para `connect`, `error`, `reconnect` y `offline`.

---

### `src/components/SessionList.jsx`

Componente que muestra la lista de sesiones disponibles en la base de datos.

- Al montarse llama `getSesiones()` via `useEffect`.
- Muestra cada sesión como un botón con su `id`, `device_id` y `sample_rate_hz`.
- Cuando el usuario hace clic en una sesión, llama `onSelect(session_id)` para notificar al componente padre.
- Resalta visualmente la sesión actualmente seleccionada con la clase `session-item--active`.
- Maneja tres estados: cargando, error de conexión, y lista vacía.

---

### `src/components/RawDataView.jsx`

Componente que muestra los datos crudos en formato JSON de la sesión seleccionada.

- Recibe `sessionId` como prop desde `App.jsx`.
- Cada vez que `sessionId` cambia, el `useEffect` dispara una llamada a `getCaptura(sessionId)`.
- Muestra un header con la metadata de la sesión: `session_id` y cantidad de muestras (`count`).
- Debajo muestra el JSON completo con `JSON.stringify(data, null, 2)` dentro de un `<pre>`.
- Maneja cuatro estados: sin sesión seleccionada, cargando, error, y datos listos.

---

### `src/App.jsx`

Componente raíz que integra todos los módulos y maneja el estado global.

**Estado que maneja:**
- `selectedSession` — el `session_id` de la sesión actualmente seleccionada. Fluye de `SessionList` hacia `RawDataView`.
- `mqttStatus` — estado de la conexión MQTT (`Desconectado`, `Conectado`, `Error`).
- `mqttLog` — historial de mensajes MQTT recibidos y enviados (máximo 50 entradas).
- `topic` y `mensaje` — inputs del publicador manual MQTT.

**Layout:**
- Header fijo con el nombre del sistema y el badge de estado MQTT.
- Columna izquierda con el panel de sesiones y el panel de control MQTT.
- Columna derecha con la vista JSON cruda.

**Panel de control MQTT:**
- Botón `START` — publica `{"comando":"START", "ts": ...}` en el topic `sensor/control`.
- Botón `STOP` — publica `{"comando":"STOP", "ts": ...}` en el topic `sensor/control`.
- Publicador manual — permite escribir cualquier topic y mensaje y publicarlo.
- Log en tiempo real — muestra todos los mensajes entrantes (`sensor/data`, `sensor/control`) y salientes, con hora y código de color por tipo.

---

### `src/styles/index.css`

Estilos globales con tema **terminal industrial**. Usa las fuentes `IBM Plex Mono` e `IBM Plex Sans` de Google Fonts.

Variables CSS principales:

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#0d0f12` | Fondo general |
| `--bg-panel` | `#13161b` | Fondo del header y panels |
| `--bg-item` | `#1a1e25` | Fondo de items de lista |
| `--green` | `#4caf6a` | Acentos principales, MQTT conectado |
| `--red` | `#e05555` | Errores, MQTT desconectado |
| `--blue` | `#4a90d9` | Mensajes entrantes MQTT |
| `--font-mono` | `IBM Plex Mono` | Labels, IDs, JSON, log |
| `--font-sans` | `IBM Plex Sans` | Texto general |

El layout principal usa `CSS Grid` con dos columnas: `320px` fija para la columna izquierda y `1fr` para el área de datos.

---

## Cómo levantar el frontend

```bash
cd frontend

# Primera vez o en un computador nuevo
npm install

# Levantar servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador.

> El backend y Mosquitto deben estar corriendo antes de abrir la app.  
> Ver instrucciones en `backend/README.md`.

---

## Dependencias principales

| Paquete | Para qué se usa |
|---|---|
| `react` | Librería de UI |
| `vite` | Servidor de desarrollo y build |
| `axios` | Peticiones HTTP al backend |
| `mqtt` | Cliente MQTT via WebSocket |
| `lucide-react` | Íconos (Wifi, Send, Radio) |
| `tailwindcss` | Clases utilitarias de CSS |