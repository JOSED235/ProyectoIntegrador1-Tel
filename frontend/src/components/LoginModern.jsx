import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Activity, Lock, User, LogIn, AlertCircle } from "lucide-react";

export default function LoginModern({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulación de delay para realismo
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        onLogin();
      } else {
        setError("Credenciales incorrectas. Intente con admin/admin.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-6 font-sans">
      <Card className="w-full max-w-md p-10 bg-white shadow-2xl border-t-8 border-t-[#3B7A57] rounded-3xl animate-in">
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
            <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest ml-1">Usuario</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
              <Input
                type="text"
                placeholder="Nombre de usuario"
                className="pl-12 h-14 border-2 font-bold text-lg focus:ring-[#3B7A57]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-500 uppercase text-xs tracking-widest ml-1">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3B7A57]" size={20} />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-12 h-14 border-2 font-bold text-lg focus:ring-[#3B7A57]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-sm font-bold animate-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 bg-[#3B7A57] hover:bg-[#2d5f43] text-xl font-black shadow-xl rounded-2xl transition-all active:scale-95 gap-3"
          >
            {isLoading ? "Iniciando..." : <><LogIn size={24} /> Entrar al Sistema</>}
          </Button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm font-medium">Uso restringido para personal médico autorizado</p>
        </div>
      </Card>
    </div>
  );
}
