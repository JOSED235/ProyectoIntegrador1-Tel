import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Label } from "./ui/label";
import { AlertCircle, WifiOff, Power, Play, Square, Activity, User, ArrowLeft, ChevronDown, Cpu } from "lucide-react";
import client from "../services/mqttService";
import { getPatients, getErrorMessage } from "../services/api";

export default function CaptureModern({ onBack, mqttStatus, isRecordingFromHardware, patientInitialId }) {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState(null);
  const [patientId, setPatientId] = useState(patientInitialId || "");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [samples, setSamples] = useState(0);
  const [bufferUsage, setBufferUsage] = useState(0);

  const isRecording = isRecordingFromHardware;
  const esp32Connected = mqttStatus === "Conectado";

  useEffect(() => {
    let active = true;
    setLoadingPatients(true);
    setPatientsError(null);
    getPatients()
      .then((data) => {
        if (!active) return;
        setPatients(data || []);
        if (patientInitialId) {
          if (data?.some((p) => p.id === patientInitialId)) {
            setPatientId(patientInitialId);
          } else {
            setPatientId(""); // Paciente eliminado — forzar selección manual
          }
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error cargando pacientes:", err);
        setPatientsError(getErrorMessage(err, "No se pudo cargar la lista de pacientes."));
      })
      .finally(() => active && setLoadingPatients(false));
    return () => { active = false; };
  }, [patientInitialId]);

  const selectedPatient = patients.find((p) => p.id === patientId);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setSamples((prev) => prev + Math.floor(Math.random() * 10) + 95);
        setBufferUsage((prev) => Math.min(prev + 0.1, 98));
      }, 1000);
    } else {
      setElapsedTime(0);
      setSamples(0);
      setBufferUsage(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStart = () => {
    if (!patientId || !esp32Connected) return;
    client.publish("icesi/jose/esp32/control", JSON.stringify({
      comando: "START",
      paciente: patientId,
      ts: Date.now()
    }));
  };

  const handleStop = () => {
    if (!esp32Connected) return;
    client.publish("icesi/jose/esp32/control", JSON.stringify({
      comando: "STOP",
      ts: Date.now()
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Razón por la que no se puede iniciar (null = se puede iniciar)
  const startBlocker = !esp32Connected
    ? "esp32"
    : !patientId
    ? "patient"
    : null;

  const getStatusColor = () => {
    if (esp32Connected) return "bg-emerald-500";
    if (mqttStatus === "Error") return "bg-red-500";
    return "bg-amber-500";
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8 font-sans animate-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" className="text-[#3B7A57] hover:bg-[#3B7A57]/10 font-bold">
            <ArrowLeft className="mr-2" /> Volver al Dashboard
          </Button>
          <div className="text-right">
            <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">Captura Activa</h1>
            <p className="text-lg text-[#3B7A57] font-bold">Telemetría ESP32</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selector de paciente */}
          <Card className="p-6 bg-white shadow-xl border-t-4 border-t-[#3B7A57]">
            <Label htmlFor="patientId" className="text-lg font-black text-[#2F3E46] mb-2 block">
              Paciente a Evaluar
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B7A57] z-10 pointer-events-none" size={20} />
              <select
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={isRecording || loadingPatients}
                className="w-full appearance-none pl-10 pr-10 h-14 text-xl font-bold border-2 rounded-md bg-white focus:ring-2 focus:ring-[#3B7A57] focus:border-[#3B7A57] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {loadingPatients ? "Cargando pacientes..." : "Selecciona un paciente registrado..."}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — CC {p.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B7A57] pointer-events-none" size={20} />
            </div>
            {patientsError && (
              <p className="text-sm text-red-600 font-bold mt-2 ml-1 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" /> {patientsError}
              </p>
            )}
            {!loadingPatients && !patientsError && patients.length === 0 && (
              <p className="text-sm text-amber-600 font-bold mt-2 ml-1">
                No hay pacientes registrados. Crea uno primero en "Gestión de Pacientes".
              </p>
            )}
            {selectedPatient && (
              <p className="text-sm text-gray-400 font-medium mt-2 ml-1">
                Edad: {selectedPatient.age} · Género: {selectedPatient.gender}
              </p>
            )}
          </Card>

          {/* Estado MQTT / ESP32 */}
          <Card className={`p-6 bg-white shadow-xl flex items-center justify-between border-t-4 ${esp32Connected ? "border-t-emerald-500" : "border-t-amber-500"}`}>
            <div className="space-y-1">
              <p className="text-xs font-black text-[#2F3E46]/40 uppercase tracking-widest">Dispositivo ESP32</p>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse shadow-lg`} />
                <span className="text-2xl font-black text-[#2F3E46]">{mqttStatus}</span>
              </div>
              {!esp32Connected && (
                <p className="text-xs text-amber-700 font-bold mt-1">
                  Verifica que el ESP32 esté encendido y conectado a la red WiFi
                </p>
              )}
            </div>
            <Cpu size={48} className={esp32Connected ? "text-emerald-500" : "text-gray-300"} />
          </Card>
        </div>

        {/* Alerta previa al inicio cuando hay bloqueadores */}
        {!isRecording && startBlocker && (
          <div className={`flex items-start gap-4 px-6 py-5 rounded-2xl border-2 font-bold ${
            startBlocker === "esp32"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            {startBlocker === "esp32" ? (
              <WifiOff size={24} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={24} className="shrink-0 mt-0.5" />
            )}
            <div>
              {startBlocker === "esp32" ? (
                <>
                  <p className="text-lg">ESP32 no conectado</p>
                  <p className="text-sm font-medium mt-1 opacity-80">
                    No se puede iniciar la prueba sin el dispositivo de captura. Enciende el ESP32,
                    espera a que se conecte a la red WiFi y verifica que el indicador cambie a "Conectado".
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg">Paciente no seleccionado</p>
                  <p className="text-sm font-medium mt-1 opacity-80">
                    Selecciona el paciente que realizará la prueba antes de iniciar la captura.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Panel principal de captura */}
        <Card className="p-10 bg-white shadow-2xl border-2 border-[#3B7A57]/10 relative overflow-hidden rounded-3xl">
          {isRecording && (
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
          )}

          <div className="text-center space-y-8">
            {!isRecording ? (
              <div className="space-y-6">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center mx-auto border-4 border-dashed transition-colors ${
                  startBlocker ? "bg-gray-50 border-gray-200" : "bg-[#F4F7F5] border-[#3B7A57]/30"
                }`}>
                  <Activity size={80} className={startBlocker ? "text-gray-300" : "text-[#3B7A57]/40"} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-[#2F3E46]">¿Preparado para la prueba?</h2>
                  <p className="text-[#2F3E46]/60 text-lg font-medium max-w-md mx-auto">
                    {startBlocker
                      ? "Resuelve los requisitos indicados arriba para habilitar la captura."
                      : "Presiona el botón o usa el interruptor físico del ESP32 para iniciar."}
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={!!startBlocker}
                  className="w-full h-24 text-3xl font-black bg-[#3B7A57] hover:bg-[#2d5f43] shadow-xl hover:scale-[1.01] active:scale-95 transition-all gap-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <Play size={36} fill="currentColor" /> INICIAR CAPTURA
                </Button>
              </div>
            ) : (
              <div className="space-y-8 animate-in duration-500">
                {/* Alerta de MQTT caído durante grabación */}
                {!esp32Connected && (
                  <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 font-bold">
                    <WifiOff size={20} className="shrink-0" />
                    Conexión con el ESP32 perdida. La grabación fue interrumpida.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#F4F7F5] p-8 rounded-3xl border-2 border-[#3B7A57]/20 shadow-inner">
                    <p className="text-xs font-black text-[#3B7A57] uppercase tracking-widest mb-2">Cronómetro</p>
                    <p className="text-6xl font-black text-[#2F3E46] font-mono">{formatTime(elapsedTime)}</p>
                  </div>
                  <div className="bg-[#F4F7F5] p-8 rounded-3xl border-2 border-[#3B7A57]/20 shadow-inner">
                    <p className="text-xs font-black text-[#3B7A57] uppercase tracking-widest mb-2">Muestras</p>
                    <p className="text-6xl font-black text-[#2F3E46] font-mono">{samples.toLocaleString()}</p>
                  </div>
                </div>

                <div className="relative aspect-square max-w-xs mx-auto border-8 border-[#3B7A57]/10 rounded-full flex items-center justify-center bg-white shadow-2xl">
                  <svg className="w-3/4 h-3/4 text-[#3B7A57]/10" viewBox="0 0 100 100">
                    <path d="M50,50 C50,40 55,40 60,50 C65,65 50,70 40,60 C25,45 50,30 70,45 C95,65 55,90 25,70 C-10,45 45,5 85,35" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    <span className="font-black text-red-600 tracking-tighter">GRABANDO</span>
                    <span className="text-sm font-bold text-gray-400">{selectedPatient?.name || patientId}</span>
                  </div>
                </div>

                <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg font-black text-[#2F3E46]">Buffer Interno</Label>
                    <span className="font-mono font-black text-2xl text-[#3B7A57]">{bufferUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={bufferUsage} className="h-6 rounded-full" />
                </div>

                <Button
                  onClick={handleStop}
                  disabled={!esp32Connected}
                  className="w-full h-24 text-3xl font-black bg-red-600 hover:bg-red-700 shadow-2xl gap-4 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <Square size={32} fill="currentColor" /> FINALIZAR Y GUARDAR
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
