import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { Search, Eye, Activity, RefreshCw, PlusCircle, User, ArrowLeft, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getSesiones, getErrorMessage } from "../services/api";

export default function DashboardModern({ onViewDetails, onNewCapture, onBack, patientFilter = null }) {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSesiones();
      const mappedData = data.map(s => ({
        sessionId: s.id,
        patientName: s.patient_name || "Anónimo",
        patientId: s.patient_id || null,
        deviceId: s.device_id,
        sampleRate: s.sample_rate_hz,
        validated: true
      }));
      setSessions(mappedData);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(getErrorMessage(err, "No se pudo cargar el historial de mediciones."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = !patientFilter || session.patientId === patientFilter;
    const matchesSearch =
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-8 font-sans animate-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-white shadow-xl border-b-4 border-b-[#3B7A57]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" className="text-[#3B7A57] p-2 hover:bg-emerald-50">
                  <ArrowLeft size={28} />
              </Button>
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B7A57] to-[#2d5f43] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">
                  {patientFilter ? "Mis Resultados" : "Historial Clínico"}
                </h1>
                <p className="text-lg text-[#3B7A57] font-semibold">
                  {patientFilter ? "Tus mediciones de temblor" : "Todas las mediciones del sistema"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
                {onNewCapture && (
                  <Button
                    onClick={onNewCapture}
                    className="h-14 px-8 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-bold shadow-lg gap-2"
                  >
                    <PlusCircle size={20} /> Nueva Captura
                  </Button>
                )}
                <div className="h-12 w-px bg-gray-200" />
                <div className="text-right">
                    <p className="text-sm font-bold text-[#2F3E46]/40 uppercase tracking-tighter">
                      {patientFilter ? "Mis Mediciones" : "Resumen del Sistema"}
                    </p>
                    <p className="text-xl font-black text-[#3B7A57]">{format(new Date(), "PPP", { locale: es })}</p>
                </div>
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 px-6 py-4 rounded-2xl border border-red-100 font-bold">
            <AlertCircle size={20} className="shrink-0" /> {error}
          </div>
        )}

        {/* Search */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-lg font-bold text-[#2F3E46]">Búsqueda Inteligente</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3B7A57]" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por Nombre, ID de Sesión o Dispositivo..."
                  className="pl-10 h-14 text-lg border-2 focus:ring-[#3B7A57]"
                />
              </div>
              <Button onClick={fetchSessions} variant="outline" className="h-14 px-6 border-2">
                  <RefreshCw className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-6 bg-white shadow-xl overflow-hidden">
          <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F7F5]">
                  <TableHead className="text-lg font-bold text-[#2F3E46] py-4">Paciente</TableHead>
                  <TableHead className="text-lg font-bold text-[#2F3E46]">ID Sesión</TableHead>
                  <TableHead className="text-lg font-bold text-[#2F3E46]">Dispositivo</TableHead>
                  <TableHead className="text-lg font-bold text-[#2F3E46] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-12 w-32 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 font-bold opacity-30 text-2xl">
                        No hay registros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.sessionId} className="hover:bg-emerald-50/50 transition-colors">
                      <TableCell className="py-4 font-bold text-lg">{session.patientName}</TableCell>
                      <TableCell className="font-mono text-[#3B7A57] font-bold">{session.sessionId}</TableCell>
                      <TableCell><Badge variant="outline">{session.deviceId}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => onViewDetails(session.sessionId, session.patientName)}
                          className="h-12 px-6 bg-white border-2 border-[#3B7A57] text-[#3B7A57] hover:bg-[#3B7A57] hover:text-white font-bold"
                        >
                          <Eye size={18} className="mr-2" /> Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
