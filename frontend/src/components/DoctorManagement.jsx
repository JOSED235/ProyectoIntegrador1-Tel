import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { ArrowLeft, UserPlus, Search, Stethoscope, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { getDoctors, createDoctor, getErrorMessage } from "../services/api"

export default function DoctorManagement({ onBack }) {
  const [doctors, setDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ cedula: "", name: "" })
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState("")

  const loadDoctors = async () => {
    setIsLoading(true)
    setLoadError("")
    try {
      const data = await getDoctors()
      setDoctors(data)
    } catch (err) {
      console.error("Error cargando doctores", err)
      setLoadError(getErrorMessage(err, "No se pudo cargar la lista de especialistas."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadDoctors() }, [])

  const handleCreate = async () => {
    setFormError("")
    const cedula = formData.cedula.trim()
    const name = formData.name.trim()
    if (!cedula || !name) {
      setFormError("Completa cédula y nombre: ambos campos son obligatorios para registrar al especialista")
      return
    }
    if (!/^\d{6,12}$/.test(cedula)) {
      setFormError("La cédula debe contener solo números (entre 6 y 12 dígitos)")
      return
    }
    setIsSaving(true)
    try {
      await createDoctor(cedula, name)
      setIsDialogOpen(false)
      setFormData({ cedula: "", name: "" })
      loadDoctors()
    } catch (err) {
      setFormError(getErrorMessage(err, "No se pudo registrar al especialista. Intenta nuevamente."))
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.cedula.includes(searchTerm)
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
              <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">Gestión de Doctores</h1>
              <p className="text-gray-400 font-medium">Registrar especialistas médicos en el sistema</p>
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-14 px-8 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-bold shadow-lg gap-2"
          >
            <UserPlus size={20} /> Nuevo Doctor
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
              placeholder="Buscar por nombre o número de cédula..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Estadística rápida */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-[#2F3E46]">{doctors.length}</p>
              <p className="text-gray-400 text-sm font-bold">Doctores registrados</p>
            </div>
          </Card>
          <Card className="p-4 bg-white shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-[#3B7A57]">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-[#2F3E46]">{doctors.filter(d => d.is_registered).length}</p>
              <p className="text-gray-400 text-sm font-bold">Con cuenta activa</p>
            </div>
          </Card>
        </div>

        {/* Lista de doctores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-gray-100" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-30">
              <Stethoscope size={64} className="mx-auto mb-4" />
              <p className="text-2xl font-bold">No hay doctores registrados</p>
            </div>
          ) : (
            filtered.map(doctor => (
              <Card
                key={doctor.cedula}
                className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                      <Stethoscope size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#2F3E46]">{doctor.name}</h3>
                      <p className="text-gray-400 font-bold text-sm">Cédula: {doctor.cedula}</p>
                      {doctor.email && (
                        <p className="text-gray-400 text-xs mt-1">{doctor.email}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={doctor.is_registered ? "bg-emerald-500" : "bg-amber-400"}>
                    {doctor.is_registered
                      ? <><CheckCircle size={12} className="mr-1" /> Activo</>
                      : <><Clock size={12} className="mr-1" /> Pendiente</>
                    }
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal crear doctor */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          setFormError("")
          setFormData({ cedula: "", name: "" })
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-[#2F3E46]">Nuevo Doctor</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
                placeholder="Nombre del especialista"
                className="h-12 border-2 font-bold"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-700 font-medium">
              El doctor podrá activar su cuenta ingresando su cédula en la pantalla de registro.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setFormError("")
                setFormData({ cedula: "", name: "" })
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
              {isSaving ? "Registrando..." : "Registrar Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
