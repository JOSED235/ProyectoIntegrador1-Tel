import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, Power } from "lucide-react";

interface PatientCaptureScreenProps {
  onTestComplete: (sessionData: {
    sessionId: string;
    patientId: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    samples: number;
  }) => void;
}

type HardwareStatus = "disconnected" | "syncing" | "ready";

export function PatientCaptureScreen({ onTestComplete }: PatientCaptureScreenProps) {
  const [patientId, setPatientId] = useState("");
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>("disconnected");
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [samples, setSamples] = useState(0);
  const [bufferUsage, setBufferUsage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Simular conexión del hardware
  useEffect(() => {
    if (patientId) {
      setHardwareStatus("syncing");
      const timeout = setTimeout(() => {
        setHardwareStatus("ready");
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      setHardwareStatus("disconnected");
    }
  }, [patientId]);

  // Cronómetro y simulación de muestras
  useEffect(() => {
    if (isRecording && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        setSamples(prev => prev + Math.floor(Math.random() * 10) + 5);
        setBufferUsage(prev => Math.min(prev + Math.random() * 2, 95));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording, startTime]);

  const handleStartTest = () => {
    const now = new Date();
    setStartTime(now);
    setIsRecording(true);
    setElapsedTime(0);
    setSamples(0);
    setBufferUsage(0);
  };

  const handleEndTest = async () => {
    setIsSaving(true);

    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));

    const endTime = new Date();
    const sessionData = {
      sessionId: `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      patientId,
      startTime: startTime!,
      endTime,
      duration: elapsedTime,
      samples,
    };

    onTestComplete(sessionData);

    // Resetear
    setIsRecording(false);
    setStartTime(null);
    setElapsedTime(0);
    setSamples(0);
    setBufferUsage(0);
    setIsSaving(false);
    setPatientId("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBufferColor = () => {
    if (bufferUsage <= 50) return "bg-[#3B7A57]";
    if (bufferUsage <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusColor = () => {
    switch (hardwareStatus) {
      case "disconnected": return "bg-red-500";
      case "syncing": return "bg-yellow-500";
      case "ready": return "bg-[#3B7A57]";
    }
  };

  const getStatusText = () => {
    switch (hardwareStatus) {
      case "disconnected": return "Desconectado";
      case "syncing": return "Sincronizando...";
      case "ready": return "Listo para Captura";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#2F3E46] mb-2">Prueba de Espiral de Arquímedes</h1>
          <p className="text-lg text-[#2F3E46]/70">Módulo de Captura para Paciente</p>
        </div>

        {/* Patient ID Input */}
        <Card className="p-8 bg-white shadow-lg">
          <div className="space-y-4">
            <Label htmlFor="patientId" className="text-xl text-[#2F3E46]">
              ID o Nombre del Paciente
            </Label>
            <Input
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Ingrese ID del paciente..."
              className="text-xl h-16 px-6"
              disabled={isRecording}
            />
          </div>
        </Card>

        {/* Hardware Status */}
        <Card className="p-8 bg-white shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-8 h-8 rounded-full ${getStatusColor()} ${hardwareStatus === 'syncing' ? 'animate-pulse' : ''}`} />
              <div>
                <p className="text-sm text-[#2F3E46]/60">Estado del ESP32</p>
                <p className="text-2xl font-semibold text-[#2F3E46]">{getStatusText()}</p>
              </div>
            </div>
            <Power className={`w-12 h-12 ${hardwareStatus === 'ready' ? 'text-[#3B7A57]' : 'text-gray-400'}`} />
          </div>
        </Card>

        {/* Start Button */}
        {!isRecording && (
          <Button
            onClick={handleStartTest}
            disabled={hardwareStatus !== "ready" || !patientId}
            className="w-full h-20 text-2xl font-bold bg-[#3B7A57] hover:bg-[#2d5f43] disabled:bg-gray-300 disabled:text-gray-500"
          >
            Iniciar Prueba
          </Button>
        )}

        {/* Recording Interface */}
        {isRecording && (
          <div className="space-y-6">
            {/* Spiral Guide Canvas */}
            <Card className="p-8 bg-white shadow-lg">
              <div className="relative aspect-square max-w-lg mx-auto bg-gradient-to-br from-[#F4F7F5] to-white rounded-lg border-4 border-[#3B7A57] flex items-center justify-center">
                <svg className="absolute w-full h-full opacity-20" viewBox="0 0 200 200">
                  <path
                    d="M100,100 Q100,80 110,80 T120,100 T100,120 T80,100 T100,70 T130,100 T100,130 T70,100 T100,60 T140,100 T100,140 T60,100"
                    fill="none"
                    stroke="#3B7A57"
                    strokeWidth="2"
                  />
                </svg>
                <div className="z-10 text-center">
                  <div className="text-6xl font-bold text-[#3B7A57] mb-2">{formatTime(elapsedTime)}</div>
                  <div className="text-2xl text-[#2F3E46]/70">{samples.toLocaleString()} muestras</div>
                  <div className="mt-4 px-6 py-3 bg-red-500 text-white rounded-full font-semibold text-xl animate-pulse">
                    ● GRABANDO
                  </div>
                </div>
              </div>
            </Card>

            {/* Buffer Usage */}
            <Card className="p-8 bg-white shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xl text-[#2F3E46]">Memoria Buffer del ESP32</Label>
                  <span className="text-2xl font-bold text-[#2F3E46]">{bufferUsage.toFixed(1)}%</span>
                </div>
                <Progress value={bufferUsage} className="h-6" indicatorClassName={getBufferColor()} />

                {bufferUsage > 80 && (
                  <div className={`flex items-center gap-3 p-4 rounded-lg ${bufferUsage > 80 ? 'bg-red-100 animate-pulse' : 'bg-yellow-100'}`}>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-lg font-semibold text-red-700">
                      Riesgo de pérdida de datos por conectividad
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* End Test Button */}
            <Button
              onClick={handleEndTest}
              disabled={isSaving}
              className="w-full h-20 text-2xl font-bold bg-[#E53E3E] hover:bg-[#c53030] disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSaving ? "Guardando y Validando Sesión..." : "Finalizar Prueba"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
