import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Database, Calendar, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

interface SessionData {
  sessionId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  samples: number;
}

interface AnalyticsScreenProps {
  session: SessionData;
  onBack: () => void;
}

// Generar datos de sensores simulados
const generateSensorData = (samples: number) => {
  const data = [];
  const baseFrequency = 6; // Hz para temblor

  for (let i = 0; i < samples; i++) {
    const time = i * 0.01; // 100 Hz sampling rate
    const tremor = Math.sin(2 * Math.PI * baseFrequency * time);

    data.push({
      timestamp: time,
      // MPU6050 Aceleración (m/s²)
      accelX: Math.sin(time * 2) * 2 + tremor * 0.5 + (Math.random() - 0.5) * 0.3,
      accelY: Math.cos(time * 1.5) * 1.5 + tremor * 0.6 + (Math.random() - 0.5) * 0.3,
      accelZ: 9.8 + Math.sin(time * 0.5) * 0.5 + tremor * 0.4 + (Math.random() - 0.5) * 0.2,

      // MPU6050 Giroscopio (rad/s)
      gyroX: Math.sin(time * 3) * 0.5 + tremor * 0.3 + (Math.random() - 0.5) * 0.1,
      gyroY: Math.cos(time * 2.5) * 0.4 + tremor * 0.35 + (Math.random() - 0.5) * 0.1,
      gyroZ: Math.sin(time * 1.8) * 0.3 + tremor * 0.25 + (Math.random() - 0.5) * 0.1,

      // LSM303DLHC Campo Magnético (μT)
      magX: 25 + Math.sin(time * 0.8) * 5 + tremor * 2 + (Math.random() - 0.5),
      magY: -15 + Math.cos(time * 0.6) * 4 + tremor * 1.5 + (Math.random() - 0.5),
      magZ: 40 + Math.sin(time * 0.4) * 3 + tremor * 1.8 + (Math.random() - 0.5),

      // FSR402 Presión (N)
      pressure: 3.5 + Math.sin(time * 0.7) * 1.5 + tremor * 0.8 + Math.max(0, (Math.random() - 0.3) * 0.5),
    });
  }

  return data;
};

export function AnalyticsScreen({ session, onBack }: AnalyticsScreenProps) {
  const sensorData = useMemo(() => generateSensorData(500), []);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calcular KPIs
  const kpis = useMemo(() => {
    const pressures = sensorData.map(d => d.pressure);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const maxPressure = Math.max(...pressures);

    const accels = sensorData.map(d => Math.sqrt(d.accelX ** 2 + d.accelY ** 2 + d.accelZ ** 2));
    const maxAccel = Math.max(...accels);

    return {
      avgPressure: avgPressure.toFixed(2),
      maxPressure: maxPressure.toFixed(2),
      tremorFrequency: "6.0",
      maxAccel: maxAccel.toFixed(2),
      dataIntegrity: "95",
    };
  }, [sensorData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <Card className="p-4 bg-white/95 shadow-xl border-2 border-[#3B7A57]">
          <p className="text-sm font-bold text-[#2F3E46] mb-2">
            Tiempo: {data.timestamp.toFixed(2)}s
          </p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-semibold">{entry.value.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-14 px-6 gap-2 border-[#3B7A57] text-[#3B7A57] hover:bg-[#3B7A57] hover:text-white text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Historial
          </Button>
        </div>

        {/* Session Metadata */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-[#2F3E46]">Visualización Analítica Detallada</h1>
              <div className="flex flex-wrap gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#3B7A57]" />
                  <span className="text-[#2F3E46]/60">ID Sesión:</span>
                  <span className="font-mono font-semibold text-[#2F3E46]">{session.sessionId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#3B7A57]" />
                  <span className="text-[#2F3E46]/60">Fecha:</span>
                  <span className="font-semibold text-[#2F3E46]">
                    {format(session.startTime, "dd/MM/yyyy HH:mm:ss")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#3B7A57]" />
                  <span className="text-[#2F3E46]/60">Paciente:</span>
                  <span className="font-semibold text-[#2F3E46]">{session.patientId}</span>
                </div>
              </div>
            </div>
            <Badge className="text-base px-4 py-2 bg-[#3B7A57] hover:bg-[#2d5f43]">
              PostgreSQL: {kpis.dataIntegrity}% Persistido
            </Badge>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-white shadow-lg">
            <p className="text-sm text-[#2F3E46]/60 mb-1">Fuerza Promedio</p>
            <p className="text-3xl font-bold text-[#3B7A57]">{kpis.avgPressure} N</p>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <p className="text-sm text-[#2F3E46]/60 mb-1">Fuerza Máxima</p>
            <p className="text-3xl font-bold text-[#3B7A57]">{kpis.maxPressure} N</p>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <p className="text-sm text-[#2F3E46]/60 mb-1">Frecuencia del Temblor</p>
            <p className="text-3xl font-bold text-[#3B7A57]">{kpis.tremorFrequency} Hz</p>
          </Card>
          <Card className="p-6 bg-white shadow-lg">
            <p className="text-sm text-[#2F3E46]/60 mb-1">Aceleración Máxima</p>
            <p className="text-3xl font-bold text-[#3B7A57]">{kpis.maxAccel} m/s²</p>
          </Card>
        </div>

        {/* Synchronized Graphs */}
        <div className="space-y-6">
          {/* MPU6050 Acceleration */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold text-[#2F3E46] mb-4">
              Aceleración MPU6050 (m/s²)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} onMouseMove={(e) => e.activeTooltipIndex !== undefined && setHoveredIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoveredIndex(null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'm/s²', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="accelX" stroke="#2563eb" name="Accel X" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accelY" stroke="#ea580c" name="Accel Y" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accelZ" stroke="#9333ea" name="Accel Z" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* MPU6050 Gyroscope */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold text-[#2F3E46] mb-4">
              Velocidad Angular MPU6050 (rad/s)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} onMouseMove={(e) => e.activeTooltipIndex !== undefined && setHoveredIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoveredIndex(null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'rad/s', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="gyroX" stroke="#0891b2" name="Gyro X" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gyroY" stroke="#dc2626" name="Gyro Y" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gyroZ" stroke="#65a30d" name="Gyro Z" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* LSM303DLHC Magnetometer */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold text-[#2F3E46] mb-4">
              Campo Magnético LSM303DLHC (μT)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} onMouseMove={(e) => e.activeTooltipIndex !== undefined && setHoveredIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoveredIndex(null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'μT', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="magX" stroke="#8b5cf6" name="Mag X" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="magY" stroke="#f59e0b" name="Mag Y" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="magZ" stroke="#06b6d4" name="Mag Z" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* FSR402 Pressure */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold text-[#2F3E46] mb-4">
              Presión Aplicada FSR402 (N)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} onMouseMove={(e) => e.activeTooltipIndex !== undefined && setHoveredIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoveredIndex(null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Newtons (N)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="pressure" stroke="#3B7A57" name="Presión" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
