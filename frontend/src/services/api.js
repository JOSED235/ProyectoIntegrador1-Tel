import axios from 'axios'

// /api → Vite proxy en desarrollo | Nginx proxy_pass en Docker
const api = axios.create({
  baseURL: '/api',
})

// Adjunta el token JWT a cada petición automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Cuando el token expira (401) limpia la sesión y recarga la página → pantalla de login
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

// Traduce cualquier error de axios/FastAPI a un mensaje legible para el usuario.
// FastAPI responde los errores de negocio con `detail` como texto, pero los
// errores de validación (422) los responde como una lista de objetos: si se
// renderiza esa lista directamente en el JSX, React revienta con
// "Objects are not valid as a React child". Esta función cubre ambos casos
// además de los errores de red (cuando el backend no respondió nada).
export const getErrorMessage = (err, fallback = "Ocurrió un error inesperado") => {
  if (!err?.response) {
    return "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo."
  }
  const detail = err.response.data?.detail
  if (typeof detail === "string" && detail.trim()) {
    return detail
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map(d => d?.msg || JSON.stringify(d)).join(". ")
  }
  return fallback
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authLogin = async (identifier, password) => {
  const res = await api.post('/auth/login', { identifier, password })
  return res.data
}

export const authCheckCedula = async (cedula) => {
  const res = await api.post('/auth/check-cedula', { cedula })
  return res.data
}

export const authCompleteRegistration = async (cedula, email, password) => {
  const res = await api.post('/auth/complete-registration', { cedula, email, password })
  return res.data
}

// ─── Doctores ─────────────────────────────────────────────────────────────────

export const createDoctor = async (cedula, name) => {
  const res = await api.post('/users/doctors', { cedula, name })
  return res.data
}

export const getDoctors = async () => {
  const res = await api.get('/users/doctors')
  return res.data
}

// ─── Pacientes ────────────────────────────────────────────────────────────────

export const getPatients = async () => {
  const res = await api.get('/patients')
  return res.data
}

export const getPatient = async (id) => {
  const res = await api.get(`/patients/${id}`)
  return res.data
}

export const createPatient = async (patient) => {
  const res = await api.post('/patients', patient)
  return res.data
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────

export const getSesiones = async () => {
  const res = await api.get('/sesiones')
  return res.data
}

export const getCaptura = async (sessionId) => {
  const res = await api.get(`/captura/${sessionId}`)
  return res.data
}
