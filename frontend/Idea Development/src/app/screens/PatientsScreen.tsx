import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { ArrowLeft, Plus, Eye, Trash2, User, FileText } from "lucide-react";
import { format } from "date-fns";

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  createdAt: Date;
  testCount: number;
}

interface PatientsScreenProps {
  onBack: () => void;
  onViewPatient: (patientId: string) => void;
}

export function PatientsScreen({ onBack, onViewPatient }: PatientsScreenProps) {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "PAT-001",
      name: "Juan Pérez García",
      age: 62,
      diagnosis: "Parkinson Temprano",
      createdAt: new Date("2026-04-15"),
      testCount: 8,
    },
    {
      id: "PAT-002",
      name: "María López Ruiz",
      age: 58,
      diagnosis: "Temblor Esencial",
      createdAt: new Date("2026-05-10"),
      testCount: 5,
    },
    {
      id: "PAT-003",
      name: "Carlos Ramírez Soto",
      age: 71,
      diagnosis: "Parkinson Avanzado",
      createdAt: new Date("2026-03-22"),
      testCount: 12,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    diagnosis: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.diagnosis) {
      return;
    }

    const patient: Patient = {
      id: `PAT-${String(patients.length + 1).padStart(3, '0')}`,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      diagnosis: newPatient.diagnosis,
      createdAt: new Date(),
      testCount: 0,
    };

    setPatients(prev => [patient, ...prev]);
    setIsAddDialogOpen(false);
    setNewPatient({ name: "", age: "", diagnosis: "" });
  };

  const handleDeletePatient = (patientId: string) => {
    if (confirm("¿Está seguro de eliminar este paciente? Esta acción no se puede deshacer.")) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="h-14 px-6 gap-2 border-[#3B7A57] text-[#3B7A57] hover:bg-[#3B7A57] hover:text-white text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </Button>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="h-14 px-8 gap-3 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg"
          >
            <Plus className="w-6 h-6" />
            Agregar Paciente
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-lg text-[#2F3E46]">
              Buscar Paciente
            </Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, ID o diagnóstico..."
              className="h-14 text-lg"
            />
          </div>
        </Card>

        {/* Patients Count */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2F3E46]">Gestión de Pacientes</h2>
              <p className="text-lg text-[#2F3E46]/70">
                Total de pacientes registrados: {filteredPatients.length}
              </p>
            </div>
          </div>
        </Card>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#3B7A57] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2F3E46]">{patient.name}</h3>
                      <Badge className="mt-1 bg-[#3B7A57] hover:bg-[#2d5f43]">
                        {patient.id}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-base">
                  <div className="flex justify-between">
                    <span className="text-[#2F3E46]/60">Edad:</span>
                    <span className="font-semibold text-[#2F3E46]">{patient.age} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2F3E46]/60">Diagnóstico:</span>
                    <span className="font-semibold text-[#2F3E46]">{patient.diagnosis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2F3E46]/60">Pruebas:</span>
                    <span className="font-semibold text-[#3B7A57]">{patient.testCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2F3E46]/60">Registro:</span>
                    <span className="font-semibold text-[#2F3E46]">
                      {format(patient.createdAt, "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-2">
                  <Button
                    onClick={() => onViewPatient(patient.id)}
                    className="flex-1 h-12 gap-2 bg-[#3B7A57] hover:bg-[#2d5f43]"
                  >
                    <FileText className="w-4 h-4" />
                    Ver Historial
                  </Button>
                  <Button
                    onClick={() => handleDeletePatient(patient.id)}
                    variant="destructive"
                    className="h-12 px-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="p-12 bg-white shadow-lg">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-[#2F3E46]/30" />
              <h3 className="text-2xl font-bold text-[#2F3E46] mb-2">
                No se encontraron pacientes
              </h3>
              <p className="text-lg text-[#2F3E46]/70">
                {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer paciente"}
              </p>
            </div>
          </Card>
        )}

        {/* Add Patient Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#2F3E46]">
                Agregar Nuevo Paciente
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-lg text-[#2F3E46]">
                  Nombre Completo
                </Label>
                <Input
                  id="patientName"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Pérez García"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientAge" className="text-lg text-[#2F3E46]">
                  Edad
                </Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Ej: 62"
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientDiagnosis" className="text-lg text-[#2F3E46]">
                  Diagnóstico
                </Label>
                <Input
                  id="patientDiagnosis"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Ej: Parkinson Temprano"
                  className="h-12 text-lg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                variant="outline"
                className="h-12 px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddPatient}
                className="h-12 px-6 bg-[#3B7A57] hover:bg-[#2d5f43]"
                disabled={!newPatient.name || !newPatient.age || !newPatient.diagnosis}
              >
                Agregar Paciente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
