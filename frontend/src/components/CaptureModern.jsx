import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, Power, Play, Square, Activity, User, ArrowLeft } from "lucide-react";
import client from "../services/mqttService";

export default function CaptureModern({ onBack, mqttStatus, isRecordingFromHardware, patientInitialId }) {
  const [patientId, setPatientId] = useState(patientInitialId || "");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [samples, setSamples] = useState(0);
  const [bufferUsage, setBufferUsage] = useState(0);

  // El estado de grabación ahora viene del Hardware vía MQTT para estar sincronizados
  const isRecording = isRecordingFromHardware;

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
    if (!patientId) return;
    const payload = JSON.stringify({
      comando: "START",
      paciente: patientId,
      ts: Date.now()
    });
    client.publish("icesi/jose/esp32/control", payload);
    // Nota: isRecording cambiará cuando el ESP32 responda con su status
  };

  const handleStop = () => {
    const payload = JSON.stringify({
      comando: "STOP",
      ts: Date.now()
    });
    client.publish("icesi/jose/esp32/control", payload);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (mqttStatus) {
      case "Conectado": return "bg-emerald-500";
      case "Error": return "bg-red-500";
      default: return "bg-amber-500";
    }
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
          <Card className="p-6 bg-white shadow-xl border-t-4 border-t-[#3B7A57]">
            <Label htmlFor="patientId" className="text-lg font-black text-[#2F3E46] mb-2 block">
              Paciente a Evaluar
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Ingresa el nombre aquí..."
                className="pl-10 h-14 text-xl font-bold border-2 focus:ring-[#3B7A57]"
                disabled={isRecording}
              />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-[#2F3E46]/40 uppercase tracking-widest">Enlace MQTT</p>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse shadow-lg`} />
                <span className="text-2xl font-black text-[#2F3E46]">{mqttStatus}</span>
              </div>
            </div>
            <Power size={48} className={mqttStatus === "Conectado" ? "text-emerald-500" : "text-gray-200"} />
          </Card>
        </div>

        <Card className="p-10 bg-white shadow-2xl border-2 border-[#3B7A57]/10 relative overflow-hidden rounded-3xl">
            {isRecording && (
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
            )}
            
            <div className="text-center space-y-8">
                {!isRecording ? (
                    <div className="space-y-6">
                        <div className="w-40 h-40 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-[#3B7A57]/30">
                            <Activity size={80} className="text-[#3B7A57]/40" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-[#2F3E46]">¿Preparado para la prueba?</h2>
                            <p className="text-[#2F3E46]/60 text-lg font-medium max-w-md mx-auto">
                                Presiona el botón o usa el interruptor físico del ESP32 para iniciar.
                            </p>
                        </div>
                        <Button 
                            onClick={handleStart} 
                            disabled={!patientId || mqttStatus !== "Conectado"}
                            className="w-full h-24 text-3xl font-black bg-[#3B7A57] hover:bg-[#2d5f43] shadow-xl hover:scale-[1.01] active:scale-95 transition-all gap-4 rounded-2xl"
                        >
                            <Play size={36} fill="currentColor" /> INICIAR CAPTURA
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in duration-500">
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
                                <span className="text-sm font-bold text-gray-400">{patientId}</span>
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
                            className="w-full h-24 text-3xl font-black bg-red-600 hover:bg-red-700 shadow-2xl gap-4 rounded-2xl hover:scale-[1.01] active:scale-95 transition-all"
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
