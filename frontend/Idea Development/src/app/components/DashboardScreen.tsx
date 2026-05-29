import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { Search, Eye, Activity } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SessionData {
  sessionId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  samples: number;
  validated?: boolean;
}

interface DashboardScreenProps {
  sessions: SessionData[];
  onViewDetails: (sessionId: string) => void;
}

export function DashboardScreen({ sessions, onViewDetails }: DashboardScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simular carga de datos
  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter ||
      format(session.startTime, 'yyyy-MM-dd') === dateFilter;

    return matchesSearch && matchesDate;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3B7A57] rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2F3E46]">Dashboard Médico</h1>
                <p className="text-lg text-[#2F3E46]/70">Historial de Sesiones Clínicas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#2F3E46]/60">Dr. Usuario Activo</p>
              <p className="text-lg font-semibold text-[#3B7A57]">{format(new Date(), "PPP", { locale: es })}</p>
            </div>
          </div>
        </Card>

        {/* Search and Filters */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="search" className="text-lg text-[#2F3E46]">
                Búsqueda Global
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2F3E46]/50" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por ID de Sesión o Paciente..."
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-6 bg-[#3B7A57] hover:bg-[#2d5f43]">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFilter" className="text-lg text-[#2F3E46]">
                Filtrar por Fecha
              </Label>
              <Input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
          </div>
        </Card>

        {/* Sessions Table */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#2F3E46]">Historial Clínico</h2>
            <p className="text-[#2F3E46]/70">Total de sesiones: {filteredSessions.length}</p>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F7F5]">
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">ID de Sesión</TableHead>
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">ID Paciente</TableHead>
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">Fecha y Hora</TableHead>
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">Duración</TableHead>
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">Estado</TableHead>
                  <TableHead className="text-lg font-semibold text-[#2F3E46]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-xl text-[#2F3E46]/60">No se encontraron sesiones</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.sessionId} className="hover:bg-[#F4F7F5]/50">
                      <TableCell className="font-mono text-base">{session.sessionId.substring(0, 20)}...</TableCell>
                      <TableCell className="text-base font-semibold">{session.patientId}</TableCell>
                      <TableCell className="text-base">
                        {format(session.startTime, "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-base">{formatDuration(session.duration)}</TableCell>
                      <TableCell>
                        {session.validated === false ? (
                          <Badge variant="destructive" className="text-sm px-3 py-1">
                            Muestra Corrupta
                          </Badge>
                        ) : (
                          <Badge className="text-sm px-3 py-1 bg-[#3B7A57] hover:bg-[#2d5f43]">
                            JSON Válido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => onViewDetails(session.sessionId)}
                          variant="outline"
                          className="h-12 px-6 gap-2 border-[#3B7A57] text-[#3B7A57] hover:bg-[#3B7A57] hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
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
