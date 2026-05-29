import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ArrowLeft, Calendar, Activity, TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import type { Patient } from "./PatientsScreen";

interface TestSession {
  id: string;
  date: Date;
  duration: number;
  avgPressure: number;
  avgAccel: number;
  tremorFreq: number;
  severity: "bajo" | "moderado" | "alto";
}

interface PatientDetailScreenProps {
  patientId: string;
  onBack: () => void;
}

// Datos de ejemplo
const mockPatient: Patient = {
  id: "PAT-001",
  name: "Juan Pérez García",
  age: 62,
  diagnosis: "Parkinson Temprano",
  createdAt: new Date("2026-04-15"),
  testCount: 8,
};

const mockSessions: TestSession[] = [
  {
    id: "SES-001",
    date: new Date("2026-05-20"),
    duration: 45,
    avgPressure: 4.2,
    avgAccel: 12.5,
    tremorFreq: 6.2,
    severity: "moderado",
  },
  {
    id: "SES-002",
    date: new Date("2026-05-15"),
    duration: 42,
    avgPressure: 3.8,
    avgAccel: 11.8,
    tremorFreq: 5.9,
    severity: "moderado",
  },
  {
    id: "SES-003",
    date: new Date("2026-05-10"),
    duration: 48,
    avgPressure: 4.5,
    avgAccel: 13.2,
    tremorFreq: 6.8,
    severity: "alto",
  },
  {
    id: "SES-004",
    date: new Date("2026-05-05"),
    duration: 40,
    avgPressure: 3.5,
    avgAccel: 10.5,
    tremorFreq: 5.2,
    severity: "bajo",
  },
  {
    id: "SES-005",
    date: new Date("2026-04-28"),
    duration: 43,
    avgPressure: 3.9,
    avgAccel: 11.5,
    tremorFreq: 5.8,
    severity: "moderado",
  },
];

export function PatientDetailScreen({ patientId, onBack }: PatientDetailScreenProps) {
  const [selectedMetric, setSelectedMetric] = useState<"pressure" | "accel" | "tremor">("pressure");

  const chartData = useMemo(() => {
    return mockSessions
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(session => ({
        date: format(session.date, "dd/MM"),
        pressure: session.avgPressure,
        accel: session.avgAccel,
        tremor: session.tremorFreq,
      }));
  }, []);

  const averages = useMemo(() => {
    return {
      pressure: (mockSessions.reduce((sum, s) => sum + s.avgPressure, 0) / mockSessions.length).toFixed(2),
      accel: (mockSessions.reduce((sum, s) => sum + s.avgAccel, 0) / mockSessions.length).toFixed(2),
      tremor: (mockSessions.reduce((sum, s) => sum + s.tremorFreq, 0) / mockSessions.length).toFixed(2),
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "bajo": return "bg-[#3B7A57]";
      case "moderado": return "bg-yellow-500";
      case "alto": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "bajo": return "Bajo";
      case "moderado": return "Moderado";
      case "alto": return "Alto";
      default: return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-14 px-6 gap-2 border-[#3B7A57] text-[#3B7A57] hover:bg-[#3B7A57] hover:text-white text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Pacientes
          </Button>
        </div>

        {/* Patient Info */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2F3E46] mb-2">{mockPatient.name}</h1>
              <div className="flex flex-wrap gap-4 text-lg">
                <Badge className="text-base px-4 py-2 bg-[#3B7A57] hover:bg-[#2d5f43]">
                  {mockPatient.id}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-[#2F3E46]/60">Edad:</span>
                  <span className="font-semibold text-[#2F3E46]">{mockPatient.age} años</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2F3E46]/60">Diagnóstico:</span>
                  <span className="font-semibold text-[#2F3E46]">{mockPatient.diagnosis}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#3B7A57]" />
                  <span className="text-[#2F3E46]/60">Registro:</span>
                  <span className="font-semibold text-[#2F3E46]">
                    {format(mockPatient.createdAt, "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Average KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Presión Promedio</p>
                <p className="text-3xl font-bold text-[#3B7A57]">{averages.pressure} N</p>
              </div>
              <Activity className="w-12 h-12 text-[#3B7A57]" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Aceleración Promedio</p>
                <p className="text-3xl font-bold text-[#3B7A57]">{averages.accel} m/s²</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#3B7A57]" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2F3E46]/60 mb-1">Frecuencia Temblor Promedio</p>
                <p className="text-3xl font-bold text-[#3B7A57]">{averages.tremor} Hz</p>
              </div>
              <TrendingDown className="w-12 h-12 text-[#3B7A57]" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#2F3E46] mb-4">Evolución de Métricas</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedMetric("pressure")}
                variant={selectedMetric === "pressure" ? "default" : "outline"}
                className={selectedMetric === "pressure" ? "bg-[#3B7A57] hover:bg-[#2d5f43]" : ""}
              >
                Presión
              </Button>
              <Button
                onClick={() => setSelectedMetric("accel")}
                variant={selectedMetric === "accel" ? "default" : "outline"}
                className={selectedMetric === "accel" ? "bg-[#3B7A57] hover:bg-[#2d5f43]" : ""}
              >
                Aceleración
              </Button>
              <Button
                onClick={() => setSelectedMetric("tremor")}
                variant={selectedMetric === "tremor" ? "default" : "outline"}
                className={selectedMetric === "tremor" ? "bg-[#3B7A57] hover:bg-[#2d5f43]" : ""}
              >
                Frecuencia Temblor
              </Button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedMetric === "pressure" && (
                <Line type="monotone" dataKey="pressure" stroke="#3B7A57" strokeWidth={3} name="Presión (N)" />
              )}
              {selectedMetric === "accel" && (
                <Line type="monotone" dataKey="accel" stroke="#2563eb" strokeWidth={3} name="Aceleración (m/s²)" />
              )}
              {selectedMetric === "tremor" && (
                <Line type="monotone" dataKey="tremor" stroke="#ea580c" strokeWidth={3} name="Frecuencia (Hz)" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart - Severity Distribution */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-[#2F3E46] mb-4">Distribución de Severidad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { severity: "Bajo", count: mockSessions.filter(s => s.severity === "bajo").length },
                { severity: "Moderado", count: mockSessions.filter(s => s.severity === "moderado").length },
                { severity: "Alto", count: mockSessions.filter(s => s.severity === "alto").length },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B7A57" name="Número de Pruebas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sessions Table */}
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-[#2F3E46] mb-4">Historial de Pruebas</h2>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F7F5]">
                  <TableHead className="text-base font-semibold text-[#2F3E46]">ID Sesión</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Fecha</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Duración</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Presión Prom.</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Aceleración Prom.</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Frecuencia</TableHead>
                  <TableHead className="text-base font-semibold text-[#2F3E46]">Severidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-[#F4F7F5]/50">
                    <TableCell className="font-mono text-base">{session.id}</TableCell>
                    <TableCell className="text-base">{format(session.date, "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell className="text-base">{session.duration}s</TableCell>
                    <TableCell className="text-base font-semibold">{session.avgPressure} N</TableCell>
                    <TableCell className="text-base font-semibold">{session.avgAccel} m/s²</TableCell>
                    <TableCell className="text-base font-semibold">{session.tremorFreq} Hz</TableCell>
                    <TableCell>
                      <Badge className={`text-sm px-3 py-1 ${getSeverityColor(session.severity)}`}>
                        {getSeverityText(session.severity)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
