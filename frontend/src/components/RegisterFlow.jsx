import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Activity, ArrowLeft, Search, CheckCircle, Lock, Mail, AlertCircle, User } from "lucide-react"
import { authCheckCedula, authCompleteRegistration, getErrorMessage } from "../services/api"

const ROLE_LABEL = {
  admin: "Administrador",
  doctor: "Especialista Médico",
  patient: "Paciente",
}

const ROLE_STYLE = {
  admin:   "bg-purple-100 text-purple-700",
  doctor:  "bg-blue-100 text-blue-700",
  patient: "bg-emerald-100 text-emerald-700",
}

export default function RegisterFlow({ onBack, onRegistered }) {
  const [step, setStep] = useState(1)
  const [cedula, setCedula] = useState("")
  const [userData, setUserData] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckCedula = async (e) => {
    e.preventDefault()
    setError("")

    const trimmedCedula = cedula.trim()
    if (!trimmedCedula) {
      setError("Ingresa tu número de cédula para buscar tu registro")
      return
    }
    if (!/^\d{6,12}$/.test(trimmedCedula)) {
      setError("La cédula debe contener solo números (entre 6 y 12 dígitos)")
      return
    }

    setIsLoading(true)
    try {
      const data = await authCheckCedula(trimmedCedula)
      setUserData(data)
      setStep(2)
    } catch (err) {
      setError(getErrorMessage(err, "No se encontró un registro con esa cédula"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteRegistration = async (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password || !confirmPassword) {
      setError("Completa correo y contraseña: todos los campos son obligatorios para crear tu cuenta")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)
    try {
      const data = await authCompleteRegistration(cedula.trim().replace(/\s/g, ""), email.trim(), password)
      onRegistered({ cedula: data.cedula, name: data.name, role: data.role }, data.access_token)
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo completar el registro. Intenta nuevamente."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-6 font-sans">
      <Card className="w-full max-w-md p-10 bg-white shadow-2xl border-t-8 border-t-[#3B7A57] rounded-3xl animate-in">

        {/* Logo + título */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#3B7A57] shadow-inner">
            <Activity size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#2F3E46] tracking-tight">Crear Cuenta</h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sistema Médico de Telemetría</p>
          </div>
        </div>

        {/* Indicadores de paso */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                step > s  ? "bg-[#3B7A57] text-white" :
                step === s ? "bg-[#3B7A57] text-white ring-4 ring-[#3B7A57]/20" :
                "bg-gray-100 text-gray-400"
              }`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 rounded transition-colors ${step > s ? "bg-[#3B7A57]" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Paso 1: buscar cédula ── */}
        {step === 1 && (
          <form onSubmit={handleCheckCedula} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#2F3E46]">Ingresa tu número de cédula</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">
                Buscaremos tu registro en el sistema
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Número de Cédula
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
                <Input
                  type="text"
                  placeholder="Ej: 1234567890"
                  className="pl-12 h-14 border-2 font-bold text-lg"
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading || !cedula.trim()}
              className="w-full h-14 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-black shadow-lg rounded-2xl gap-2"
            >
              {isLoading ? "Buscando..." : <><Search size={20} /> Buscar Registro</>}
            </Button>
            <Button type="button" variant="ghost" onClick={onBack} className="w-full text-gray-400 gap-2">
              <ArrowLeft size={18} /> Volver al inicio de sesión
            </Button>
          </form>
        )}

        {/* ── Paso 2: confirmar identidad ── */}
        {step === 2 && userData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#2F3E46]">Confirma tu identidad</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">¿Estos son tus datos?</p>
            </div>
            <div className="bg-emerald-50 border-2 border-[#3B7A57]/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#3B7A57] rounded-xl flex items-center justify-center text-white shrink-0">
                  <User size={28} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#2F3E46] leading-tight">{userData.name}</p>
                  <p className="text-[#3B7A57] font-bold text-sm">Cédula: {userData.cedula}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#3B7A57]/10">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${ROLE_STYLE[userData.role] || "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABEL[userData.role] || userData.role}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setStep(3)}
              className="w-full h-14 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-black shadow-lg rounded-2xl gap-2"
            >
              <CheckCircle size={20} /> Sí, soy yo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setStep(1); setError(""); setCedula("") }}
              className="w-full border-2 text-gray-500 gap-2"
            >
              <ArrowLeft size={18} /> No soy yo, buscar de nuevo
            </Button>
          </div>
        )}

        {/* ── Paso 3: configurar credenciales ── */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-[#2F3E46]">Configura tus credenciales</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">
                Hola <span className="font-bold text-[#2F3E46]">{userData?.name}</span>, elige tu correo y contraseña
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-12 h-14 border-2 font-bold text-lg"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="pl-12 h-14 border-2 font-bold text-lg"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
                <Input
                  type="password"
                  placeholder="Repite la contraseña"
                  className="pl-12 h-14 border-2 font-bold text-lg"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#3B7A57] hover:bg-[#2d5f43] text-lg font-black shadow-lg rounded-2xl gap-2"
            >
              {isLoading ? "Creando cuenta..." : <><CheckCircle size={20} /> Crear Mi Cuenta</>}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
