import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog"
import {
  Users, History, PlusCircle, Activity, Cpu, Magnet, Zap,
  Stethoscope, ClipboardList, LogOut, Gauge, Compass,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const SENSOR_INFO = {
  MPU6050: {
    fullName: "MPU6050 — IMU de 6 ejes (InvenSense)",
    icon: <Activity />,
    summary: "Unidad de medición inercial que combina acelerómetro y giroscopio en un solo chip.",
    specs: [
      { label: "Tipo", value: "Acelerómetro + Giroscopio (IMU 6 DOF)" },
      { label: "Interfaz", value: "I2C" },
      { label: "Rango acelerómetro", value: "±2g / ±4g / ±8g / ±16g" },
      { label: "Rango giroscopio", value: "±250 / ±500 / ±1000 / ±2000 °/s" },
    ],
    role: "Captura la aceleración lineal y la velocidad angular de la mano del paciente mientras realiza la prueba de la espiral de Arquímedes — es la fuente principal para cuantificar el temblor.",
    fields: ["mpu_ax, mpu_ay, mpu_az — aceleración (3 ejes)", "mpu_gx, mpu_gy, mpu_gz — velocidad angular (3 ejes)"],
  },
  LSM303DLHC: {
    fullName: "LSM303DLHC — Acelerómetro + Magnetómetro (STMicroelectronics)",
    icon: <Compass />,
    summary: "Sensor de orientación que combina un acelerómetro lineal con un magnetómetro de 3 ejes (brújula electrónica).",
    specs: [
      { label: "Tipo", value: "Acelerómetro + Magnetómetro" },
      { label: "Interfaz", value: "I2C" },
      { label: "Salida acelerómetro", value: "Aceleración lineal en X, Y, Z" },
      { label: "Salida magnetómetro", value: "Campo magnético / orientación en X, Y, Z" },
    ],
    role: "Aporta una segunda medición de aceleración (para contrastar con el MPU6050) y datos de orientación magnética, ayudando a caracterizar la dirección y estabilidad del movimiento de la mano.",
    fields: ["lsm_ax, lsm_ay, lsm_az — aceleración (3 ejes)", "lsm_mx, lsm_my, lsm_mz — campo magnético / orientación (3 ejes)"],
  },
  FSR402: {
    fullName: "FSR402 — Sensor de Fuerza Resistivo",
    icon: <Gauge />,
    summary: "Sensor analógico cuya resistencia varía según la fuerza aplicada sobre su superficie.",
    specs: [
      { label: "Tipo", value: "Sensor de presión/fuerza (FSR analógico)" },
      { label: "Interfaz", value: "Entrada analógica (ADC del ESP32)" },
      { label: "Mide", value: "Fuerza de contacto aplicada por el paciente" },
    ],
    role: "Registra la presión que ejerce el paciente sobre el lápiz/stylus mientras dibuja la espiral — un indicador clínico relevante de la severidad del temblor y del control motor fino.",
    fields: ["pressure — presión / fuerza de contacto"],
  },
  ESP32: {
    fullName: "ESP32 DevKit — Microcontrolador Principal",
    icon: <Cpu />,
    summary: "Microcontrolador de doble núcleo con WiFi y Bluetooth que orquesta todo el sistema de adquisición.",
    specs: [
      { label: "Tipo", value: "Microcontrolador (Xtensa LX6 doble núcleo)" },
      { label: "Conectividad", value: "WiFi 802.11 b/g/n, Bluetooth" },
      { label: "Transmisión", value: "MQTT (broker.emqx.io) y HTTP POST a /captura" },
      { label: "Control", value: "Botón físico de inicio/fin de prueba" },
    ],
    role: "Lee simultáneamente los tres sensores (MPU6050, LSM303DLHC y FSR402), arma los lotes de muestras, gestiona el estado de grabación y los transmite en tiempo real al backend para su almacenamiento y análisis.",
    fields: ["session_id, device_id, patient_name — metadatos de sesión", "sample_rate_hz — frecuencia de muestreo", "samples[] — lote de muestras de los 3 sensores"],
  },
}

const ROLE_LABEL = {
  admin:   "Administrador",
  doctor:  "Especialista Médico",
  patient: "Paciente",
}

const ROLE_STYLE = {
  admin:   "bg-purple-100 text-purple-700",
  doctor:  "bg-blue-100 text-blue-700",
  patient: "bg-emerald-100 text-emerald-700",
}

export default function MainHub({ onNavigate }) {
  const { user, logout } = useAuth()
  const [selectedSensor, setSelectedSensor] = useState(null)
  const sensorInfo = selectedSensor ? SENSOR_INFO[selectedSensor] : null

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-8 font-sans animate-in">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black text-[#2F3E46] tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xl text-[#3B7A57] font-bold">Bienvenido, {user?.name}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${ROLE_STYLE[user?.role] || "bg-gray-100 text-gray-600"}`}>
                {ROLE_LABEL[user?.role] || user?.role}
              </span>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="h-12 px-6 border-red-200 text-red-500 hover:bg-red-50 font-bold gap-2"
          >
            <LogOut size={18} /> Cerrar Sesión
          </Button>
        </div>

        {/* Accesos según rol */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Admin ── */}
          {user?.role === "admin" && (
            <>
              <HubCard
                color="border-l-purple-500"
                bg="bg-purple-50"
                text="text-purple-500"
                icon={<Stethoscope size={40} />}
                title="Gestión de Doctores"
                desc="Registrar especialistas médicos"
                onClick={() => onNavigate("doctors")}
              />
              <HubCard
                color="border-l-amber-500"
                bg="bg-amber-50"
                text="text-amber-500"
                icon={<History size={40} />}
                title="Historial de Pruebas"
                desc="Ver todas las mediciones"
                onClick={() => onNavigate("history")}
              />
            </>
          )}

          {/* ── Doctor ── */}
          {user?.role === "doctor" && (
            <>
              <HubCard
                color="border-l-blue-500"
                bg="bg-blue-50"
                text="text-blue-500"
                icon={<Users size={40} />}
                title="Gestión de Pacientes"
                desc="Crear y administrar pacientes"
                onClick={() => onNavigate("patients")}
              />
              <HubCard
                color="border-l-amber-500"
                bg="bg-amber-50"
                text="text-amber-500"
                icon={<History size={40} />}
                title="Historial de Pruebas"
                desc="Ver todas las mediciones"
                onClick={() => onNavigate("history")}
              />
              <HubCard
                color="border-l-[#3B7A57]"
                bg="bg-emerald-50"
                text="text-[#3B7A57]"
                icon={<PlusCircle size={40} />}
                title="Nueva Prueba"
                desc="Iniciar captura de datos"
                onClick={() => onNavigate("capture")}
              />
            </>
          )}

          {/* ── Paciente ── */}
          {user?.role === "patient" && (
            <HubCard
              color="border-l-amber-500"
              bg="bg-amber-50"
              text="text-amber-500"
              icon={<ClipboardList size={40} />}
              title="Mis Resultados"
              desc="Ver mis mediciones de temblor"
              onClick={() => onNavigate("history")}
            />
          )}
        </div>

        {/* Sensores del sistema — solo admin y doctor */}
        {(user?.role === "admin" || user?.role === "doctor") && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#2F3E46] flex items-center gap-3">
              <Zap className="text-[#3B7A57]" fill="currentColor" /> Sensores del Sistema
            </h2>
            <p className="text-gray-400 font-medium">Dispositivos conectados al ESP32</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <SensorCard name="MPU6050"    type="Acelerómetro/Giroscopio" desc="Mide aceleración y velocidad angular en 3 ejes" icon={<Activity />} onClick={() => setSelectedSensor("MPU6050")} />
              <SensorCard name="LSM303DLHC" type="Magnetómetro"            desc="Sensor de campo magnético y orientación"       icon={<Magnet />}   onClick={() => setSelectedSensor("LSM303DLHC")} />
              <SensorCard name="FSR402"     type="Sensor de Presión"       desc="Mide la presión aplicada durante la prueba"   icon={<Zap />}      onClick={() => setSelectedSensor("FSR402")} />
              <SensorCard name="ESP32"      type="Controlador Principal"   desc="Microcontrolador con WiFi y transmisión"      icon={<Cpu />}      onClick={() => setSelectedSensor("ESP32")} />
            </div>
          </div>
        )}
      </div>

      {/* Modal de información completa del sensor */}
      <Dialog open={!!selectedSensor} onOpenChange={(open) => !open && setSelectedSensor(null)}>
        <DialogContent className="sm:max-w-2xl">
          {sensorInfo && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#3B7A57]">
                    {sensorInfo.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-[#2F3E46]">{sensorInfo.fullName}</DialogTitle>
                    <Badge className="bg-emerald-500 mt-1">Activo</Badge>
                  </div>
                </div>
                <DialogDescription className="text-base text-[#2F3E46]/70 font-medium">
                  {sensorInfo.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-black text-[#3B7A57] uppercase tracking-wider mb-2">Especificaciones</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sensorInfo.specs.map((s) => (
                      <div key={s.label} className="bg-[#F4F7F5] rounded-xl px-4 py-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase">{s.label}</p>
                        <p className="text-sm font-bold text-[#2F3E46]">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#3B7A57] uppercase tracking-wider mb-2">Función en el sistema</h4>
                  <p className="text-sm text-[#2F3E46]/80 font-medium leading-relaxed">{sensorInfo.role}</p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#3B7A57] uppercase tracking-wider mb-2">Datos que aporta a cada captura</h4>
                  <ul className="space-y-1">
                    {sensorInfo.fields.map((f) => (
                      <li key={f} className="text-sm font-mono text-[#2F3E46]/70 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HubCard({ color, bg, text, icon, title, desc, onClick }) {
  return (
    <Card
      className={`p-8 hover:shadow-2xl transition-all cursor-pointer border-l-8 ${color} group`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-20 h-20 ${bg} rounded-3xl flex items-center justify-center ${text} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#2F3E46]">{title}</h3>
          <p className="text-gray-400 font-medium">{desc}</p>
        </div>
      </div>
    </Card>
  )
}

function SensorCard({ name, type, desc, icon, onClick }) {
  return (
    <Card
      className="p-6 hover:border-[#3B7A57] hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-gray-50 rounded-xl text-[#3B7A57] group-hover:scale-110 transition-transform">{icon}</div>
          <Badge className="bg-emerald-500">Activo</Badge>
        </div>
        <div>
          <h4 className="text-xl font-black text-[#2F3E46]">{name}</h4>
          <p className="text-[#3B7A57] font-bold text-sm mb-2">{type}</p>
          <p className="text-gray-400 text-sm font-medium leading-tight">{desc}</p>
          <p className="text-[#3B7A57] text-xs font-black mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click para ver información completa →</p>
        </div>
      </div>
    </Card>
  )
}
