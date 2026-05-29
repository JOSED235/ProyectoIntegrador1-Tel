import { useEffect, useState } from 'react'
import LoginModern from './components/LoginModern'
import MainHub from './components/MainHub'
import PatientManagement from './components/PatientManagement'
import PatientDetail from './components/PatientDetail'
import AnalysisModern from './components/AnalysisModern'
import CaptureModern from './components/CaptureModern'
import DashboardModern from './components/DashboardModern'
import client from './services/mqttService'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('hub') 
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientNameForDetail, setPatientNameForDetail] = useState("")

  const [mqttStatus, setMqttStatus] = useState('Desconectado')
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    try {
        const onConnect = () => {
            setMqttStatus('Conectado');
            client.subscribe('icesi/jose/esp32/status');
        }
        const onError = () => setMqttStatus('Error')
        const onOffline = () => setMqttStatus('Desconectado')

        const onMessage = (topic, payload) => {
          if (topic === 'icesi/jose/esp32/status') {
            try {
              const data = JSON.parse(payload.toString());
              if (data.status === "RECORDING") {
                  setIsRecording(true);
              } else if (data.status === "IDLE") {
                  setIsRecording(false);
              }
            } catch (err) {
              console.error('Error sync state', err);
            }
          }
        }

        client.on('connect', onConnect)
        client.on('error', onError)
        client.on('offline', onOffline)
        client.on('message', onMessage)

        if (client.connected) {
            setMqttStatus('Conectado');
            client.subscribe('icesi/jose/esp32/status');
        }

        return () => {
          client.off('connect', onConnect)
          client.off('error', onError)
          client.off('offline', onOffline)
          client.off('message', onMessage)
        }
    } catch (e) {
        console.error("MQTT setup error", e);
    }
  }, [])

  // RENDER SEGURO
  try {
      if (!isAuthenticated) {
        return <LoginModern onLogin={() => setIsAuthenticated(true)} />;
      }

      if (currentScreen === 'analysis' && selectedSession) {
        return (
          <AnalysisModern 
            sessionId={selectedSession} 
            patientName={patientNameForDetail}
            onBack={() => {
              setSelectedSession(null);
              if (selectedPatient) setCurrentScreen('patient-detail');
              else setCurrentScreen('history');
            }} 
          />
        );
      }

      if (currentScreen === 'capture') {
        return (
          <CaptureModern 
            mqttStatus={mqttStatus}
            isRecordingFromHardware={isRecording}
            patientInitialId={selectedPatient?.name || ""}
            onBack={() => {
                if (selectedPatient) setCurrentScreen('patient-detail');
                else setCurrentScreen('hub');
            }} 
          />
        );
      }

      if (currentScreen === 'patients') {
          return (
              <PatientManagement 
                onBack={() => setCurrentScreen('hub')}
                onSelectPatient={(p) => {
                    setSelectedPatient(p);
                    setCurrentScreen('patient-detail');
                }}
              />
          );
      }

      if (currentScreen === 'patient-detail' && selectedPatient) {
          return (
              <PatientDetail 
                patientId={selectedPatient.id}
                onBack={() => {
                    setSelectedPatient(null);
                    setCurrentScreen('patients');
                }}
                onViewSession={(sessionId, name) => {
                    setSelectedSession(sessionId);
                    setPatientNameForDetail(name);
                    setCurrentScreen('analysis');
                }}
                onNewCapture={(id, name) => {
                    setCurrentScreen('capture');
                }}
              />
          );
      }

      if (currentScreen === 'history') {
          return (
              <DashboardModern 
                onBack={() => setCurrentScreen('hub')}
                onViewDetails={(id, name) => {
                    setSelectedSession(id);
                    setPatientNameForDetail(name);
                    setCurrentScreen('analysis');
                }}
                onNewCapture={() => setCurrentScreen('capture')}
              />
          );
      }

      return (
        <MainHub 
          onNavigate={(target) => setCurrentScreen(target)}
        />
      );
  } catch (err) {
      return (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
              <h1 style={{ color: '#EF4444' }}>Error Crítico en la Interfaz</h1>
              <p>Ocurrió un error al renderizar la aplicación.</p>
              <pre style={{ background: '#F3F4F6', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
                  {err.message}
              </pre>
              <br />
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
