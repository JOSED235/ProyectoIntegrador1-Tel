import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Activity, Lock, User, LogIn, AlertCircle, UserPlus } from "lucide-react"
import { authLogin, getErrorMessage } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import RegisterFlow from "./RegisterFlow"

export default function LoginModern() {
  const { login } = useAuth()
  const [mode, setMode] = useState("login") // "login" | "register"
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!identifier.trim() || !password) {
      setError("Ingresa tu correo o cédula y tu contraseña para continuar")
      return
    }

    setIsLoading(true)
    try {
      const data = await authLogin(identifier.trim(), password)
      login({ cedula: data.cedula, name: data.name, role: data.role }, data.access_token)
    } catch (err) {
      setError(getErrorMessage(err, "Credenciales incorrectas"))
    } finally {
      setIsLoading(false)
    }
  }

  if (mode === "register") {
    return (
      <RegisterFlow
        onBack={() => setMode("login")}
        onRegistered={(userData, token) => login(userData, token)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-6 font-sans">
      <Card className="w-full max-w-md p-10 bg-white shadow-2xl border-t-8 border-t-[#3B7A57] rounded-3xl animate-in">

        {/* Logo + título */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#3B7A57] shadow-inner">
            <Activity size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#2F3E46] tracking-tight">Bienvenido</h1>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Sistema Médico de Telemetría</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest ml-1">
              Correo o Número de Cédula
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
              <Input
                type="text"
                placeholder="correo@ejemplo.com  ó  1234567890"
                className="pl-12 h-14 border-2 font-bold text-lg focus:ring-[#3B7A57]"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest ml-1">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-12 h-14 border-2 font-bold text-lg focus:ring-[#3B7A57]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold animate-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-[#3B7A57] hover:bg-[#2d5f43] text-xl font-black shadow-xl rounded-2xl transition-all active:scale-95 gap-3"
          >
            {isLoading ? "Iniciando..." : <><LogIn size={24} /> Iniciar Sesión</>}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">¿Sin cuenta?</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => { setMode("register"); setError("") }}
          className="w-full h-14 border-2 border-[#3B7A57] text-[#3B7A57] hover:bg-emerald-50 font-bold text-lg gap-2"
        >
          <UserPlus size={20} /> Crear Cuenta
        </Button>

        <p className="mt-8 text-center text-gray-400 text-sm font-medium">
          Acceso para personal médico y pacientes registrados
        </p>
      </Card>
    </div>
  )
}
