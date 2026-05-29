import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, History, PlusCircle, Activity, Cpu, Magnet, Zap } from "lucide-react";

export default function MainHub({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#F8FAFB] p-8 font-sans animate-in">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black text-[#2F3E46] tracking-tight">Dashboard</h1>
            <p className="text-xl text-[#3B7A57] font-bold">Bienvenido, admin</p>
          </div>
          <Button variant="outline" className="h-12 px-6 border-red-200 text-red-500 hover:bg-red-50 font-bold">
            Cerrar Sesión
          </Button>
        </div>

        {/* Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card 
            className="p-8 hover:shadow-2xl transition-all cursor-pointer border-l-8 border-l-blue-500 group"
            onClick={() => onNavigate('patients')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Users size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#2F3E46]">Gestión de Pacientes</h3>
                <p className="text-gray-400 font-medium">Crear y administrar pacientes</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-2xl transition-all cursor-pointer border-l-8 border-l-amber-500 group"
            onClick={() => onNavigate('history')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <History size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#2F3E46]">Historial de Pruebas</h3>
                <p className="text-gray-400 font-medium">Ver todas las mediciones</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-2xl transition-all cursor-pointer border-l-8 border-l-[#3B7A57] group"
            onClick={() => onNavigate('capture')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#3B7A57] group-hover:scale-110 transition-transform">
                <PlusCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#2F3E46]">Nueva Prueba</h3>
                <p className="text-gray-400 font-medium">Iniciar captura de datos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* System Sensors */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-[#2F3E46] flex items-center gap-3">
            <Zap className="text-[#3B7A57]" fill="currentColor" /> Sensores del Sistema
          </h2>
          <p className="text-gray-400 font-medium">Haz clic en un sensor para ver información detallada</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SensorCard 
                name="MPU6050" 
                type="Acelerómetro/Giroscopio" 
                desc="Mide aceleración y velocidad angular en 3 ejes" 
                icon={<Activity />} 
            />
            <SensorCard 
                name="LSM303DLHC" 
                type="Magnetómetro" 
                desc="Sensor de campo magnético y orientación" 
                icon={<Magnet />} 
            />
            <SensorCard 
                name="FSR402" 
                type="Sensor de Presión" 
                desc="Mide la presión aplicada durante la prueba" 
                icon={<Zap />} 
            />
            <SensorCard 
                name="ESP32" 
                type="Controlador Principal" 
                desc="Microcontrolador con WiFi y transmisión de datos" 
                icon={<Cpu />} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorCard({ name, type, desc, icon }) {
    return (
        <Card className="p-6 hover:border-[#3B7A57] transition-colors group">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-gray-50 rounded-xl text-[#3B7A57]">
                        {icon}
                    </div>
                    <Badge className="bg-emerald-500">Activo</Badge>
                </div>
                <div>
                    <h4 className="text-xl font-black text-[#2F3E46]">{name}</h4>
                    <p className="text-[#3B7A57] font-bold text-sm mb-2">{type}</p>
                    <p className="text-gray-400 text-sm font-medium leading-tight">{desc}</p>
                </div>
            </div>
        </Card>
    );
}
