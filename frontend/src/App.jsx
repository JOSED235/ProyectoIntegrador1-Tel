import { Radio, Send, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import RawDataView from './components/RawDataView'
import SessionList from './components/SessionList'

import client from './services/mqttService'

function App() {
  // STATE
  const [selectedSession, setSelectedSession] = useState(null)

  const [mqttStatus, setMqttStatus] = useState('Desconectado')

  const [mqttLog, setMqttLog] = useState([])

  const [topic, setTopic] = useState('sensor/control')

  const [mensaje, setMensaje] = useState('')

  const [liveData, setLiveData] = useState(null)

  const logRef = useRef(null)


  // HELPERS

  const agregarLog = (tipo, texto) => {

    const hora = new Date().toLocaleTimeString()

    setMqttLog((prev) => [
      ...prev.slice(-49),
      {
        tipo,
        texto,
        hora
      }
    ])
  }


  // MQTT SETUP

  useEffect(() => {

    const onConnect = () => {

      console.log('[MQTT] Conectado')

      setMqttStatus('Conectado')

      client.subscribe('sensor/data')

      client.subscribe('sensor/control')

      agregarLog(
        'sistema',
        'Conectado al broker MQTT'
      )
    }

    const onError = (err) => {

      console.error('[MQTT] Error', err)

      setMqttStatus('Error')

      agregarLog(
        'error',
        'Error de conexión MQTT'
      )
    }

    const onReconnect = () => {

      console.log('[MQTT] Reconectando...')

      agregarLog(
        'sistema',
        'Reconectando MQTT...'
      )
    }

    const onOffline = () => {

      console.log('[MQTT] Offline')

      setMqttStatus('Desconectado')

      agregarLog(
        'error',
        'MQTT desconectado'
      )
    }

    const onMessage = (topic, payload) => {

      const message = payload.toString()

      console.log('[MQTT]', topic, message)

      // LOG VISUAL
      agregarLog(
        'entrada',
        `[${topic}] ${message}`
      )

      // DATOS LIVE DEL ESP32
      if (topic === 'sensor/data') {

        try {

          const parsed = JSON.parse(message)

          setLiveData(parsed)

        } catch (err) {

          console.error(
            'Error parseando JSON MQTT',
            err
          )
        }
      }
    }

    // EVENTOS MQTT
    client.on('connect', onConnect)

    client.on('error', onError)

    client.on('reconnect', onReconnect)

    client.on('offline', onOffline)

    client.on('message', onMessage)

    // SI YA ESTABA CONECTADO
    if (client.connected) {

      setMqttStatus('Conectado')
    }

    // CLEANUP
    return () => {

      client.off('connect', onConnect)

      client.off('error', onError)

      client.off('reconnect', onReconnect)

      client.off('offline', onOffline)

      client.off('message', onMessage)
    }

  }, [])


  // AUTO SCROLL LOG

  useEffect(() => {

    if (logRef.current) {

      logRef.current.scrollTop =
        logRef.current.scrollHeight
    }

  }, [mqttLog])


  // MQTT PUBLISH MANUAL

  const publicar = () => {

    if (
      !mensaje.trim() ||
      mqttStatus !== 'Conectado'
    ) return

    client.publish(
      topic,
      mensaje
    )

    agregarLog(
      'salida',
      `[${topic}] ${mensaje}`
    )

    setMensaje('')
  }


  // MQTT START / STOP

  const publicarComando = (cmd) => {

    const payload = JSON.stringify({
      comando: cmd,
      ts: Date.now()
    })

    client.publish(
      'sensor/control',
      payload
    )

    agregarLog(
      'salida',
      `[sensor/control] ${payload}`
    )
  }


  // RENDER

  return (

    <div className="app">

      {/* HEADER */}

      <header className="app__header">

        <div className="header__titulo">

          <Radio size={20} />

          <span>
            Sistema de Captura de Temblor
          </span>

        </div>

        <div
          className={`
            header__mqtt-badge
            ${mqttStatus === 'Conectado'
              ? 'badge--on'
              : 'badge--off'
            }
          `}
        >

          {mqttStatus === 'Conectado'
            ? (
              <>
                <Wifi size={14} />
                Conectado
              </>
            )
            : (
              <>
                <WifiOff size={14} />
                {mqttStatus}
              </>
            )
          }

        </div>

      </header>


      {/* MAIN */}

      <main className="app__main">

        {/* LEFT */}

        <aside className="col-left">

          {/* SESIONES */}

          <section className="panel">

            <h2 className="panel__titulo">
              Sesiones registradas
            </h2>

            <SessionList
              onSelect={setSelectedSession}
              selectedId={selectedSession}
            />

          </section>


          {/* MQTT CONTROL */}

          <section className="panel">

            <h2 className="panel__titulo">
              Control MQTT
            </h2>


            {/* START / STOP */}

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


            {/* PUBLICADOR MANUAL */}

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
                onKeyDown={(e) =>
                  e.key === 'Enter' && publicar()
                }
                placeholder="mensaje"
              />

              <button
                className="mqtt-send"
                onClick={publicar}
                disabled={mqttStatus !== 'Conectado'}
              >

                <Send size={14} />

                Publicar

              </button>

            </div>


            {/* LOG MQTT */}

            <div
              className="mqtt-log"
              ref={logRef}
            >

              {mqttLog.length === 0
                ? (
                  <span className="texto-dim">
                    // Sin actividad aún
                  </span>
                )
                : (
                  mqttLog.map((entry, i) => (

                    <div
                      key={i}
                      className={`
                        log-line
                        log-line--${entry.tipo}
                      `}
                    >

                      <span className="log-hora">
                        {entry.hora}
                      </span>

                      <span className="log-texto">
                        {entry.texto}
                      </span>

                    </div>
                  ))
                )
              }

            </div>

          </section>

        </aside>


        {/* RIGHT */}

        <section className="col-right">

          {/* HTTP */}

          <section className="panel">

            <h2 className="panel__titulo">

              Respuesta HTTP — JSON crudo

              {selectedSession && (

                <span className="panel__titulo-sub">
                  {selectedSession}
                </span>
              )}

            </h2>

            <RawDataView
              sessionId={selectedSession}
            />

          </section>


          {/* MQTT LIVE */}

          <section className="panel">

            <h2 className="panel__titulo">
              MQTT LIVE DATA
            </h2>

            <pre className="json-view">

              {liveData
                ? JSON.stringify(
                    liveData,
                    null,
                    2
                  )
                : 'Esperando datos MQTT...'
              }

            </pre>

          </section>

        </section>

      </main>

    </div>
  )
}

export default App