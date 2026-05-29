import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Activity, Lock, User } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña");
      return;
    }

    // Simular autenticación (admin/admin123)
    if (username === "admin" && password === "admin123") {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 800);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-8">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#3B7A57] rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#2F3E46] mb-2">
            Sistema Médico IoT
          </h1>
          <p className="text-lg text-[#2F3E46]/70">
            Evaluación de Temblor - Espiral de Arquímedes
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-lg text-[#2F3E46]">
              Usuario
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2F3E46]/50" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese su usuario"
                className="pl-10 h-14 text-lg"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg text-[#2F3E46]">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2F3E46]/50" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese su contraseña"
                className="pl-10 h-14 text-lg"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-center font-semibold">{error}</p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-14 text-xl font-bold bg-[#3B7A57] hover:bg-[#2d5f43] disabled:bg-gray-300"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-center text-[#2F3E46]/60">
              Credenciales de prueba:
            </p>
            <p className="text-sm text-center text-[#3B7A57] font-mono font-semibold">
              admin / admin123
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
