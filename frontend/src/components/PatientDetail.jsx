import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, User, Calendar, FileText, PlusCircle, ChevronRight, Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getPatient, getErrorMessage } from "../services/api";

export default function PatientDetail({ patientId, onBack, onViewSession, onNewCapture }) {
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPatient = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatient(patientId);
      setPatient(data);
    } catch (err) {
      console.error("Error loading patient details", err);
      setPatient(null);
      setError(getErrorMessage(err, "No se pudo cargar la información del paciente."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) loadPatient();
  }, [patientId]);

  if (isLoading) return <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center font-black">Cargando perfil...</div>;
  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-2 border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#2F3E46]">No se pudo cargar el paciente</h2>
          <p className="text-gray-400 font-medium">{error || "Paciente no encontrado"}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={onBack} className="font-bold gap-2">
              <ArrowLeft size={18} /> Volver
            </Button>
            <Button onClick={loadPatient} className="bg-[#3B7A57] hover:bg-[#2d5f43] font-bold">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-8 font-sans animate-in">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <Button onClick={onBack} variant="ghost" className="text-[#3B7A57] font-bold">
              <ArrowLeft className="mr-2" /> Volver a Gestión
            </Button>
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-[#3B7A57] rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <User size={48} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">{patient.name}</h1>
                    <div className="flex gap-4 mt-2">
                        <Badge className="bg-emerald-50 text-[#3B7A57] border-[#3B7A57]/20 font-bold text-lg px-4 py-1">
                            ID: {patient.id}
                        </Badge>
                        <p className="text-gray-400 font-bold text-lg">Edad: <span className="text-[#2F3E46]">{patient.age} años</span></p>
                        <p className="text-gray-400 font-bold text-lg">Género: <span className="text-[#2F3E46]">{patient.gender}</span></p>
                    </div>
                </div>
            </div>
          </div>
          {onNewCapture && (
            <Button
              onClick={() => onNewCapture()}
              className="h-16 px-10 bg-[#3B7A57] hover:bg-[#2d5f43] text-xl font-black shadow-xl gap-3 rounded-2xl"
            >
              <PlusCircle size={24} /> Nueva Medición
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Notes Column */}
            <div className="md:col-span-1 space-y-6">
                <Card className="p-6 bg-white shadow-lg border-t-4 border-t-blue-500 h-full">
                    <h3 className="text-xl font-black text-[#2F3E46] mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" /> Notas Médicas
                    </h3>
                    <p className="text-gray-600 font-medium leading-relaxed bg-blue-50/50 p-4 rounded-2xl min-h-[200px]">
                        {patient.notes || "No hay observaciones registradas."}
                    </p>
                </Card>
            </div>

            {/* History Column */}
            <div className="md:col-span-2 space-y-6">
                <Card className="p-6 bg-white shadow-xl overflow-hidden h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-[#2F3E46] flex items-center gap-2">
                            <Activity size={24} className="text-[#3B7A57]" /> Historial de Pruebas
                        </h3>
                        <Badge variant="outline" className="font-bold">{patient.sessions?.length || 0} sesiones</Badge>
                    </div>

                    <div className="rounded-2xl border-2 border-gray-50 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-bold text-[#2F3E46] py-4">Fecha</TableHead>
                                    <TableHead className="font-bold text-[#2F3E46]">ID Sesión</TableHead>
                                    <TableHead className="font-bold text-[#2F3E46] text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!patient.sessions || patient.sessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10 opacity-30 font-bold">
                                            Sin mediciones previas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    patient.sessions.map((session) => (
                                        <TableRow key={session.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <TableCell className="font-bold text-gray-600">
                                                {session.created_at
                                                  ? format(new Date(session.created_at), "dd/MM/yyyy HH:mm")
                                                  : "Sin fecha"}
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-[#3B7A57]">
                                                {session.id}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => onViewSession(session.id, patient.name)}
                                                    className="font-bold text-[#3B7A57] hover:text-[#2d5f43] gap-1"
                                                >
                                                    Ver Gráficas <ChevronRight size={16} />
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
      </div>
    </div>
  );
}
