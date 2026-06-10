import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { ArrowLeft, UserPlus, Search, User, ChevronRight, AlertCircle } from "lucide-react"
import { getPatients, createPatient, getErrorMessage } from "../services/api"

export default function PatientManagement({ onBack, onSelectPatient }) {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    cedula: "",
    name: "",
    age: "",
    gender: "Masculino",
    notes: "",
  })
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadPatients = async () => {
    setIsLoading(true)
    setLoadError("")
    try {
      const data = await getPatients()
      setPatients(data)
    } catch (err) {
      console.error("Error cargando pacientes", err)
      setLoadError(getErrorMessage(err, "No se pudo cargar la lista de pacientes."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadPatients() }, [])

  const handleCreate = async () => {
    setFormError("")

    const cedula = formData.cedula.trim()
    const name = formData.name.trim()
    const age = formData.age

    if (!cedula || !name || !age) {
      setFormError("Completa cédula, nombre y edad: son campos obligatorios para crear el paciente")
      return
    }
    if (!/^\d{6,12}$/.test(cedula)) {
      setFormError("La cédula debe contener solo números (entre 6 y 12 dígitos)")
      return
    }
    const parsedAge = parseInt(age, 10)
    if (Number.isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      setFormError("La edad debe ser un número entre 1 y 120 años")
      return
    }

    setIsSaving(true)
    try {
      await createPatient({
        id: cedula,    // la cédula es el identificador
        name,
        age: parsedAge,
        gender: formData.gender,
        notes: formData.notes.trim(),
      })
      setIsAddDialogOpen(false)
      setFormData({ cedula: "", name: "", age: "", gender: "Masculino", notes: "" })
      loadPatients()
    } catch (err) {
      setFormError(getErrorMessage(err, "No se pudo crear el paciente. Intenta nuevamente."))
    } finally {
      setIsSaving(false)
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

        {/* Error de carga */}
        {loadError && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 px-6 py-4 rounded-2xl border border-red-100 font-bold">
            <AlertCircle size={20} className="shrink-0" /> {loadError}
          </div>
        )}

        {/* Buscador */}
        <Card className="p-6 bg-white shadow-lg border-2 border-transparent focus-within:border-[#3B7A57]/20 transition-all">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <Input
              className="pl-14 h-16 text-xl border-none shadow-none focus-visible:ring-0"
              placeholder="Buscar por nombre o cédula del paciente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Grid de pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse bg-gray-100" />
            ))
          ) : filteredPatients.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-30">
              <User size={64} className="mx-auto mb-4" />
              <p className="text-2xl font-bold">No hay pacientes registrados</p>
            </div>
          ) : (
            filteredPatients.map(patient => (
              <Card
                key={patient.id}
                className="p-6 hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-[#3B7A57]/10"
                onClick={() => onSelectPatient(patient)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#3B7A57] group-hover:bg-[#3B7A57] group-hover:text-white transition-colors shrink-0">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#2F3E46]">{patient.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <p className="text-gray-400 font-bold text-sm">
                          Edad: <span className="text-[#2F3E46]">{patient.age} años</span>
                        </p>
                        <p className="text-gray-400 font-bold text-sm">
                          Cédula: <span className="font-mono text-[#2F3E46]">{patient.id}</span>
                        </p>
                      </div>
                      {patient.notes && (
                        <p className="text-gray-400 text-xs mt-1 italic line-clamp-1">{patient.notes}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-[#3B7A57] transition-colors" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal nuevo paciente */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setFormError("")
            setFormData({ cedula: "", name: "", age: "", gender: "Masculino", notes: "" })
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-[#2F3E46]">Nuevo Paciente</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Número de Cédula
              </Label>
              <Input
                value={formData.cedula}
                onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="Ej: 1234567890"
                className="h-12 border-2 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Nombre Completo
              </Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="h-12 border-2 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Edad</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="h-12 border-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">Género</Label>
                <select
                  className="w-full h-12 rounded-xl border-2 px-3 font-bold bg-white"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Notas Médicas
              </Label>
              <textarea
                className="w-full min-h-[90px] rounded-2xl border-2 p-4 font-medium resize-none"
                placeholder="Observaciones iniciales..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <div className="bg-emerald-50 p-4 rounded-2xl text-sm text-[#3B7A57] font-medium">
              El paciente podrá activar su cuenta ingresando su cédula en la pantalla de registro.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setFormError("")
                setFormData({ cedula: "", name: "", age: "", gender: "Masculino", notes: "" })
              }}
              className="h-12 font-bold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSaving}
              className="h-12 px-8 bg-[#3B7A57] hover:bg-[#2d5f43] font-bold"
            >
              {isSaving ? "Guardando..." : "Guardar Paciente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
