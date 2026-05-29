import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { ArrowLeft, UserPlus, Search, User, FileText, ChevronRight, MessageSquare } from "lucide-react";
import { getPatients, createPatient } from "../services/api";

export default function PatientManagement({ onBack, onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
      name: "",
      age: "",
      gender: "Masculino",
      notes: ""
  });

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error("Error loading patients", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreate = async () => {
      if (!formData.name || !formData.age) return;
      
      const newPatient = {
          id: `pat_${Date.now()}`,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          notes: formData.notes
      };

      try {
          await createPatient(newPatient);
          setIsAddDialogOpen(false);
          setFormData({ name: "", age: "", gender: "Masculino", notes: "" });
          loadPatients();
      } catch (err) {
          alert("Error al crear paciente");
      }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-8 font-sans animate-in">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <Button onClick={onBack} variant="ghost" className="text-[#3B7A57] font-bold">
              <ArrowLeft className="mr-2" /> Volver al Dashboard
            </Button>
            <div>
                <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">Gestión de Pacientes</h1>
                <p className="text-gray-400 font-medium">Administrar pacientes y sus mediciones</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="h-14 px-8 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-bold shadow-lg gap-2"
          >
            <UserPlus size={20} /> Nuevo Paciente
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6 bg-white shadow-lg border-2 border-transparent focus-within:border-[#3B7A57]/20 transition-all">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <Input 
                className="pl-14 h-16 text-xl border-none shadow-none focus-visible:ring-0" 
                placeholder="Buscar por nombre o ID del paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-40 animate-pulse bg-gray-100" />)
          ) : filteredPatients.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-30">
                  <User size={64} className="mx-auto mb-4" />
                  <p className="text-2xl font-bold">No hay pacientes registrados</p>
              </div>
          ) : (
            filteredPatients.map((patient) => (
                <Card 
                    key={patient.id} 
                    className="p-6 hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-[#3B7A57]/10"
                    onClick={() => onSelectPatient(patient)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#3B7A57] group-hover:bg-[#3B7A57] group-hover:text-white transition-colors">
                                <User size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#2F3E46]">{patient.name}</h3>
                                <div className="flex gap-4 mt-1">
                                    <p className="text-gray-400 font-bold text-sm">Edad: <span className="text-[#2F3E46]">{patient.age} años</span></p>
                                    <p className="text-gray-400 font-bold text-sm">ID: <span className="text-mono">{patient.id}</span></p>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-[#3B7A57] transition-colors" />
                    </div>
                </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-[#2F3E46]">Nuevo Registro</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                  <div className="space-y-2">
                      <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Nombre Completo</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-12 border-2 font-bold" 
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Edad</Label>
                        <Input 
                            type="number" 
                            value={formData.age} 
                            onChange={e => setFormData({...formData, age: e.target.value})}
                            className="h-12 border-2 font-bold" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Género</Label>
                        <select 
                            className="w-full h-12 rounded-xl border-2 px-3 font-bold bg-white"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                            <option>Masculino</option>
                            <option>Femenino</option>
                            <option>Otro</option>
                        </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Notas Médicas</Label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-2xl border-2 p-4 font-medium"
                        placeholder="Observaciones iniciales..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                  </div>
              </div>
              <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="h-12 font-bold">Cancelar</Button>
                  <Button onClick={handleCreate} className="h-12 px-8 bg-[#3B7A57] font-bold">Guardar Paciente</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
