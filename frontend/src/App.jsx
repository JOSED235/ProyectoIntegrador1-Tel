import { useEffect, useRef, useState } from 'react'
import { Wifi, WifiOff, Radio, Send } from 'lucide-react'
import SessionList from './components/SessionList'
import RawDataView from './components/RawDataView'
import client from './services/mqttService'

function App() {
  const [selectedSession, setSelectedSession] = useState(null)
  const [mqttStatus, setMqttStatus]           = useState('Desconectado')
  const [mqttLog, setMqttLog]                 = useState([])
  const [topic, setTopic]                     = useState('sensor/control')
  const [mensaje, setMensaje]                 = useState('')

  const logRef = useRef(null)

  // ── MQTT ──────────────────────────────────────────────
  useEffect(() => {
    const onConnect = () => {
      setMqttStatus('Conectado')
      client.subscribe('sensor/data')
      client.subscribe('sensor/control')
      agregarLog('sistema', 'Conectado al broker MQTT')
    }

    const onError = () => {
      setMqttStatus('Error')
      agregarLog('error', 'Error de conexión MQTT')
    }

    const onMessage = (t, payload) => {
      agregarLog('entrada', `[${t}] ${payload.toString()}`)
    }

    client.on('connect', onConnect)
    client.on('error', onError)
    client.on('message', onMessage)

    if (client.connected) {
      setMqttStatus('Conectado')
    }

    return () => {
      client.off('connect', onConnect)
      client.off('error', onError)
      client.off('message', onMessage)
    }
  }, [])

  // Auto-scroll del log MQTT
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [mqttLog])

  const agregarLog = (tipo, texto) => {
    const hora = new Date().toLocaleTimeString()
    setMqttLog((prev) => [...prev.slice(-49), { tipo, texto, hora }])
  }

  const publicar = () => {
    if (!mensaje.trim() || mqttStatus !== 'Conectado') return
    client.publish(topic, mensaje)
    agregarLog('salida', `[${topic}] ${mensaje}`)
    setMensaje('')
  }

  const publicarComando = (cmd) => {
    const payload = JSON.stringify({ comando: cmd, ts: Date.now() })
    client.publish('sensor/control', payload)
    agregarLog('salida', `[sensor/control] ${payload}`)
  }

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="app__header">
        <div className="header__titulo">
          <Radio size={20} />
          <span>Sistema de Captura de Temblor</span>
        </div>
        <div className={`header__mqtt-badge ${mqttStatus === 'Conectado' ? 'badge--on' : 'badge--off'}`}>
          {mqttStatus === 'Conectado'
            ? <><Wifi size={14} /> Conectado</>
            : <><WifiOff size={14} /> {mqttStatus}</>
          }
        </div>
      </header>

      {/* ── LAYOUT PRINCIPAL ── */}
      <main className="app__main">

        {/* ── COLUMNA IZQUIERDA ── */}
        <aside className="col-left">

          {/* Panel sesiones */}
          <section className="panel">
            <h2 className="panel__titulo">Sesiones registradas</h2>
            <SessionList
              onSelect={setSelectedSession}
              selectedId={selectedSession}
            />
          </section>

          {/* Panel control MQTT */}
          <section className="panel">
            <h2 className="panel__titulo">Control MQTT</h2>

            {/* Botones de comando rápido */}
            <div className="mqtt-cmds">
              <button
                className="cmd-btn cmd-btn--start"
                onClick={() => publicarComando('START')}
                disabled={mqttStatus !== 'Conectado'}
              >
                ▶ START
              </button>
              <button
                className="cmd-btn cmd-btn--stop"
                onClick={() => publicarComando('STOP')}
                disabled={mqttStatus !== 'Conectado'}
              >
                ■ STOP
              </button>
            </div>

            {/* Publicación manual */}
            <div className="mqtt-manual">
              <input
                className="mqtt-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="topic"
              />
              <input
                className="mqtt-input"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && publicar()}
                placeholder="mensaje"
              />
              <button
                className="mqtt-send"
                onClick={publicar}
                disabled={mqttStatus !== 'Conectado'}
              >
                <Send size={14} /> Publicar
              </button>
            </div>

            {/* Log MQTT */}
            <div className="mqtt-log" ref={logRef}>
              {mqttLog.length === 0
                ? <span className="texto-dim">// Sin actividad aún</span>
                : mqttLog.map((entry, i) => (
                    <div key={i} className={`log-line log-line--${entry.tipo}`}>
                      <span className="log-hora">{entry.hora}</span>
                      <span className="log-texto">{entry.texto}</span>
                    </div>
                  ))
              }
            </div>
          </section>

        </aside>

        {/* ── COLUMNA DERECHA: JSON crudo ── */}
        <section className="col-right panel">
          <h2 className="panel__titulo">
            Respuesta HTTP — JSON crudo
            {selectedSession && (
              <span className="panel__titulo-sub">{selectedSession}</span>
            )}
          </h2>
          <RawDataView sessionId={selectedSession} />
        </section>

      </main>
    </div>
  )
}

export default App