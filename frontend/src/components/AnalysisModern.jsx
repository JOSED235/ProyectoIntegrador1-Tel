import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Database, Calendar, Clock, Activity, TrendingUp, TrendingDown, RefreshCw, User, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { getCaptura, getErrorMessage } from "../services/api";

export default function AnalysisModern({ sessionId, patientName, onBack }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCaptura(sessionId);
      setData(result);
    } catch (err) {
      console.error("Error fetching session details:", err);
      setData(null);
      setError(getErrorMessage(err, "No se pudieron cargar los datos de la sesión."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchDetails();
  }, [sessionId]);

  const chartData = useMemo(() => {
    if (!data || !data.samples || data.samples.length === 0) return [];
    const firstTs = data.samples[0].ts_us;
    return data.samples.map((s) => ({
      time: (s.ts_us - firstTs) / 1000000,
      accelX: s.mpu_ax,
      accelY: s.mpu_ay,
      accelZ: s.mpu_az,
      pressure: s.pressure,
      gyroX: s.mpu_gx,
      gyroY: s.mpu_gy,
      gyroZ: s.mpu_gz,
      lsmAccelX: s.lsm_ax,
      lsmAccelY: s.lsm_ay,
      lsmAccelZ: s.lsm_az,
      magX: s.lsm_mx,
      magY: s.lsm_my,
      magZ: s.lsm_mz,
    }));
  }, [data]);

  const kpis = useMemo(() => {
    if (!chartData.length) return null;
    const pressures = chartData.map(d => d.pressure);
    const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    const maxPressure = Math.max(...pressures);
    const accels = chartData.map(d => Math.sqrt(d.accelX ** 2 + d.accelY ** 2 + d.accelZ ** 2));
    const maxAccel = Math.max(...accels);

    return {
      avgPressure: avgPressure.toFixed(3),
      maxPressure: maxPressure.toFixed(3),
      maxAccel: maxAccel.toFixed(3),
      sampleCount: chartData.length,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const d = payload[0].payload;
      return (
        <Card className="p-4 bg-white/95 shadow-xl border-2 border-[#3B7A57]">
          <p className="text-sm font-bold text-[#2F3E46] mb-2">Tiempo: {d.time.toFixed(3)}s</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry) => (
              <div key={entry.name} className="flex justify-between gap-4">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-semibold">{entry.value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-16 h-16 text-[#3B7A57] animate-spin mx-auto" />
          <h2 className="text-2xl font-black text-[#2F3E46]">Procesando Telemetría</h2>
          <p className="text-[#2F3E46]/60">Sincronizando datos de sensores inerciales...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && data && data.count === 0) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-2 border-amber-100">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#2F3E46]">Sesión sin datos</h2>
          <p className="text-gray-400 font-medium">
            Esta sesión no contiene muestras grabadas. La prueba puede haber sido
            interrumpida antes de que el ESP32 enviara datos al servidor.
          </p>
          <Button variant="outline" onClick={onBack} className="font-bold gap-2 w-full">
            <ArrowLeft size={18} /> Volver al Historial
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-2 border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#2F3E46]">No se pudo cargar la sesión</h2>
          <p className="text-gray-400 font-medium">{error}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={onBack} className="font-bold gap-2">
              <ArrowLeft size={18} /> Volver al Historial
            </Button>
            <Button onClick={fetchDetails} className="bg-[#3B7A57] hover:bg-[#2d5f43] font-bold">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8 font-sans animate-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" className="h-14 px-6 border-2 font-bold text-[#3B7A57] border-[#3B7A57] hover:bg-[#3B7A57] hover:text-white">
            <ArrowLeft className="mr-2" /> Volver al Historial
          </Button>
        </div>

        <Card className="p-6 bg-white shadow-xl border-l-8 border-l-[#3B7A57]">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">Análisis de Movimiento</h1>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <User className="text-[#3B7A57]" size={24} />
                  <div>
                      <p className="text-xs font-bold text-[#3B7A57]/60 uppercase">Paciente</p>
                      <p className="text-xl font-black text-[#2F3E46]">{patientName || "Anónimo"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Database className="text-gray-400" size={24} />
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Sesión ID</p>
                      <p className="text-lg font-mono font-bold text-gray-600">{sessionId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Activity className="text-gray-400" size={24} />
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Muestras</p>
                      <p className="text-lg font-bold text-gray-600">{kpis?.sampleCount}</p>
                  </div>
                </div>
              </div>
            </div>
            <Badge className="bg-[#3B7A57] text-white px-4 py-2 text-sm font-bold">Datos Validados</Badge>
          </div>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white shadow-lg border-b-4 border-b-emerald-500">
            <p className="text-sm font-bold text-gray-400 uppercase mb-1">Presión Promedio</p>
            <p className="text-4xl font-black text-[#3B7A57]">{kpis?.avgPressure} <span className="text-lg font-normal text-gray-400">N</span></p>
          </Card>
          <Card className="p-6 bg-white shadow-lg border-b-4 border-b-emerald-500">
            <p className="text-sm font-bold text-gray-400 uppercase mb-1">Presión Máxima</p>
            <p className="text-4xl font-black text-[#3B7A57]">{kpis?.maxPressure} <span className="text-lg font-normal text-gray-400">N</span></p>
          </Card>
          <Card className="p-6 bg-white shadow-lg border-b-4 border-b-blue-500">
            <p className="text-sm font-bold text-gray-400 uppercase mb-1">Aceleración Pico</p>
            <p className="text-4xl font-black text-blue-600">{kpis?.maxAccel} <span className="text-lg font-normal text-gray-400">g</span></p>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6 pb-10">
          <Card className="p-6 bg-white shadow-xl rounded-3xl overflow-hidden">
            <h3 className="text-xl font-black text-[#2F3E46] mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-500 rounded-full" /> Aceleración Lineal (MPU6050)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="accelX" stroke="#2563eb" name="Eje X" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="accelY" stroke="#ea580c" name="Eje Y" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="accelZ" stroke="#9333ea" name="Eje Z" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white shadow-xl rounded-3xl overflow-hidden">
            <h3 className="text-xl font-black text-[#2F3E46] mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-[#3B7A57] rounded-full" /> Presión de Contacto (FSR402)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="pressure" stroke="#3B7A57" name="Presión (N)" dot={false} strokeWidth={4} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white shadow-xl rounded-3xl overflow-hidden">
            <h3 className="text-xl font-black text-[#2F3E46] mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-amber-500 rounded-full" /> Velocidad Angular (Giroscopio MPU6050)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="gyroX" stroke="#2563eb" name="Eje X" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="gyroY" stroke="#ea580c" name="Eje Y" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="gyroZ" stroke="#9333ea" name="Eje Z" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white shadow-xl rounded-3xl overflow-hidden">
            <h3 className="text-xl font-black text-[#2F3E46] mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-rose-500 rounded-full" /> Aceleración Lineal (LSM303DLHC)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="lsmAccelX" stroke="#2563eb" name="Eje X" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="lsmAccelY" stroke="#ea580c" name="Eje Y" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="lsmAccelZ" stroke="#9333ea" name="Eje Z" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white shadow-xl rounded-3xl overflow-hidden">
            <h3 className="text-xl font-black text-[#2F3E46] mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-cyan-500 rounded-full" /> Campo Magnético / Orientación (LSM303DLHC)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="magX" stroke="#0891b2" name="Eje X" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="magY" stroke="#be123c" name="Eje Y" dot={false} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="magZ" stroke="#65a30d" name="Eje Z" dot={false} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
