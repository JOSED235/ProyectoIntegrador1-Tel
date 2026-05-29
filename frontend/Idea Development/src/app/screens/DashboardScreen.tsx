import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Activity, Users, Wifi, WifiOff, LogOut, Power, Thermometer, Gauge } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Sensor {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "syncing";
  lastUpdate: Date;
  battery?: number;
}

interface DashboardScreenProps {
  onNavigateToPatients: () => void;
  onNavigateToSensor: (sensorId: string) => void;
  onLogout: () => void;
}

export function DashboardScreen({ onNavigateToPatients, onNavigateToSensor, onLogout }: DashboardScreenProps) {
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: "ESP32-001",
      name: "MPU6050 - Acelerómetro/Giroscopio",
      type: "Sensor Inercial",
      status: "online",
      lastUpdate: new Date(),
      battery: 85,
    },
    {
      id: "ESP32-002",
      name: "LSM303DLHC - Magnetómetro",
      type: "Sensor Magnético",
      status: "online",
      lastUpdate: new Date(),
      battery: 92,
    },
    {
      id: "ESP32-003",
      name: "FSR402 - Sensor de Presión",
      type: "Sensor de Fuerza",
      status: "syncing",
      lastUpdate: new Date(Date.now() - 5000),
      battery: 78,
    },
  ]);

  // Simular actualizaciones de estado de sensores
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        lastUpdate: sensor.status === "online" ? new Date() : sensor.lastUpdate,
        battery: sensor.battery ? Math.max(sensor.battery - Math.random() * 0.1, 0) : undefined,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-[#3B7A57]";
      case "offline": return "bg-red-500";
      case "syncing": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online": return "En Línea";
      case "offline": return "Desconectado";
      case "syncing": return "Sincronizando";
      default: return "Desconocido";
    }
  };

  const onlineCount = sensors.filter(s => s.status === "online").length;
  const offlineCount = sensors.filter(s => s.status === "offline").length;

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#3B7A57] rounded-full flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2F3E46]">Panel de Administración</h1>
                <p className="text-lg text-[#2F3E46]/70">Sistema Médico IoT</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#2F3E46]/60">Administrador</p>
                <p className="text-lg font-semibold text-[#3B7A57]">
                  {format(new Date(), "PPP", { locale: es })}
                </p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="h-12 px-6 gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                Salir
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Sensores en Línea</p>
                <p className="text-4xl font-bold text-[#3B7A57]">{onlineCount}</p>
              </div>
              <Wifi className="w-12 h-12 text-[#3B7A57]" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Sensores Desconectados</p>
                <p className="text-4xl font-bold text-red-500">{offlineCount}</p>
              </div>
              <WifiOff className="w-12 h-12 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Total de Sensores</p>
                <p className="text-4xl font-bold text-[#2F3E46]">{sensors.length}</p>
              </div>
              <Gauge className="w-12 h-12 text-[#2F3E46]" />
            </div>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            onClick={onNavigateToPatients}
            className="h-32 text-2xl font-bold bg-[#3B7A57] hover:bg-[#2d5f43] flex items-center justify-center gap-4"
          >
            <Users className="w-10 h-10" />
            Gestionar Pacientes
          </Button>

          <Card className="p-6 bg-gradient-to-br from-[#3B7A57] to-[#2d5f43] text-white cursor-pointer hover:opacity-90 transition-opacity">
            <div className="text-center h-full flex flex-col justify-center">
              <Thermometer className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">Ver Estado de Sensores</h3>
              <p className="text-lg opacity-90">Monitoreo en tiempo real</p>
            </div>
          </Card>
        </div>

        {/* Sensors List */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-[#2F3E46] mb-6">Estado de Dispositivos ESP32</h2>

          <div className="space-y-4">
            {sensors.map((sensor) => (
              <Card
                key={sensor.id}
                className="p-6 bg-[#F4F7F5] hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onNavigateToSensor(sensor.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className={`w-6 h-6 rounded-full ${getStatusColor(sensor.status)} ${sensor.status === 'syncing' ? 'animate-pulse' : ''}`} />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#2F3E46]">{sensor.name}</h3>
                        <Badge className="text-sm px-3 py-1 bg-[#3B7A57] hover:bg-[#2d5f43]">
                          {sensor.id}
                        </Badge>
                      </div>
                      <p className="text-base text-[#2F3E46]/70">{sensor.type}</p>
                      <p className="text-sm text-[#2F3E46]/50 mt-1">
                        Última actualización: {format(sensor.lastUpdate, "HH:mm:ss")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {sensor.battery !== undefined && (
                      <div className="text-center">
                        <Power className={`w-8 h-8 mx-auto mb-1 ${sensor.battery > 20 ? 'text-[#3B7A57]' : 'text-red-500'}`} />
                        <p className="text-lg font-semibold text-[#2F3E46]">{sensor.battery.toFixed(0)}%</p>
                      </div>
                    )}

                    <div className="text-right">
                      <Badge
                        variant={sensor.status === "online" ? "default" : "destructive"}
                        className={`text-base px-4 py-2 ${sensor.status === "online" ? 'bg-[#3B7A57] hover:bg-[#2d5f43]' : ''}`}
                      >
                        {getStatusText(sensor.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
