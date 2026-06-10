import { useEffect, useState } from 'react'
import LoginModern from './components/LoginModern'
import MainHub from './components/MainHub'
import PatientManagement from './components/PatientManagement'
import PatientDetail from './components/PatientDetail'
import AnalysisModern from './components/AnalysisModern'
import CaptureModern from './components/CaptureModern'
import DashboardModern from './components/DashboardModern'
import DoctorManagement from './components/DoctorManagement'
import { useAuth } from './contexts/AuthContext'
import client from './services/mqttService'
import { WifiOff, RefreshCw } from 'lucide-react'

function App() {
  const { user, loading } = useAuth()
  const [currentScreen, setCurrentScreen] = useState('hub')
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientNameForDetail, setPatientNameForDetail] = useState("")
  const [mqttStatus, setMqttStatus] = useState('Desconectado')
  const [isRecording, setIsRecording] = useState(false)
  const [backendOnline, setBackendOnline] = useState(true)
  const [checkingBackend, setCheckingBackend] = useState(false)

  // ── Chequeo de conectividad del backend ──────────────────────────────────────
  const checkBackend = async () => {
    setCheckingBackend(true)
    try {
      // /api/ → Vite proxy (dev) o Nginx proxy_pass (Docker)
      const res = await fetch('/api/', { signal: AbortSignal.timeout(5000) })
      setBackendOnline(res.ok)
    } catch {
      setBackendOnline(false)
    } finally {
      setCheckingBackend(false)
    }
  }

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── MQTT ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const onConnect = () => {
        setMqttStatus('Conectado')
        client.subscribe('icesi/jose/esp32/status')
      }
      const onError = () => setMqttStatus('Error')
      const onOffline = () => {
        setMqttStatus('Desconectado')
        // Si el ESP32 se desconecta durante una grabación, forzar estado IDLE
        // para evitar que la pantalla quede bloqueada en "GRABANDO" indefinidamente
        setIsRecording(false)
      }
      const onMessage = (topic, payload) => {
        if (topic === 'icesi/jose/esp32/status') {
          try {
            const data = JSON.parse(payload.toString())
            if (data.status === "RECORDING") setIsRecording(true)
            else if (data.status === "IDLE") setIsRecording(false)
          } catch (err) {
            console.error('Error sync state', err)
          }
        }
      }
      client.on('connect', onConnect)
      client.on('error', onError)
      client.on('offline', onOffline)
      client.on('message', onMessage)
      if (client.connected) {
        setMqttStatus('Conectado')
        client.subscribe('icesi/jose/esp32/status')
      }
      return () => {
        client.off('connect', onConnect)
        client.off('error', onError)
        client.off('offline', onOffline)
        client.off('message', onMessage)
      }
    } catch (e) {
      console.error("MQTT setup error", e)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center font-sans">
        <div className="text-[#3B7A57] text-xl font-bold animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginModern />
  }

  const BackendBanner = !backendOnline ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow-xl font-bold">
      <div className="flex items-center gap-3">
        <WifiOff size={20} />
        <span>Sin conexión al servidor — algunas funciones no estarán disponibles</span>
      </div>
      <button
        onClick={checkBackend}
        disabled={checkingBackend}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={checkingBackend ? "animate-spin" : ""} />
        Reintentar
      </button>
    </div>
  ) : null

  try {
    if (currentScreen === 'analysis' && selectedSession) {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <AnalysisModern
              sessionId={selectedSession}
              patientName={patientNameForDetail}
              onBack={() => {
                setSelectedSession(null)
                if (selectedPatient) setCurrentScreen('patient-detail')
                else setCurrentScreen('history')
              }}
            />
          </div>
        </>
      )
    }

    // Solo doctors pueden iniciar capturas
    if (currentScreen === 'capture' && user.role === 'doctor') {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <CaptureModern
              mqttStatus={mqttStatus}
              isRecordingFromHardware={isRecording}
              patientInitialId={selectedPatient?.id || ""}
              onBack={() => {
                if (selectedPatient) setCurrentScreen('patient-detail')
                else setCurrentScreen('hub')
              }}
            />
          </div>
        </>
      )
    }

    if (currentScreen === 'patients' && user.role !== 'patient') {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <PatientManagement
              onBack={() => setCurrentScreen('hub')}
              onSelectPatient={(p) => {
                setSelectedPatient(p)
                setCurrentScreen('patient-detail')
              }}
            />
          </div>
        </>
      )
    }

    if (currentScreen === 'doctors' && user.role === 'admin') {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <DoctorManagement onBack={() => setCurrentScreen('hub')} />
          </div>
        </>
      )
    }

    if (currentScreen === 'patient-detail' && selectedPatient) {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <PatientDetail
              patientId={selectedPatient.id}
              onBack={() => {
                setSelectedPatient(null)
                setCurrentScreen('patients')
              }}
              onViewSession={(sessionId, name) => {
                setSelectedSession(sessionId)
                setPatientNameForDetail(name)
                setCurrentScreen('analysis')
              }}
              // Solo doctors pueden iniciar capturas; admin pasa null → botón oculto
              onNewCapture={user.role === 'doctor' ? () => setCurrentScreen('capture') : null}
            />
          </div>
        </>
      )
    }

    if (currentScreen === 'history') {
      return (
        <>
          {BackendBanner}
          <div className={BackendBanner ? "pt-12" : ""}>
            <DashboardModern
              onBack={() => setCurrentScreen('hub')}
              onViewDetails={(id, name) => {
                setSelectedSession(id)
                setPatientNameForDetail(name)
                setCurrentScreen('analysis')
              }}
              onNewCapture={user.role === 'doctor' ? () => setCurrentScreen('capture') : null}
              patientFilter={user.role === 'patient' ? user.cedula : null}
            />
          </div>
        </>
      )
    }

    return (
      <>
        {BackendBanner}
        <div className={BackendBanner ? "pt-12" : ""}>
          <MainHub onNavigate={(target) => setCurrentScreen(target)} />
        </div>
      </>
    )
  } catch (err) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#EF4444' }}>Error Crítico en la Interfaz</h1>
        <p>Ocurrió un error al renderizar la aplicación.</p>
        <pre style={{ background: '#F3F4F6', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
          {err.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Recargar Página
        </button>
      </div>
    )
  }
}

export default App
