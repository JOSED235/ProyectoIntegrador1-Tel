import { useEffect, useState } from 'react'
import { getSesiones } from '../services/api'

function SessionList({ onSelect, selectedId }) {
  const [sesiones, setSesiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getSesiones()
        setSesiones(data)
      } catch (err) {
        setError('No se pudo conectar con el backend.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <p className="texto-dim">Cargando sesiones...</p>
  if (error)    return <p className="texto-error">{error}</p>
  if (sesiones.length === 0) return <p className="texto-dim">No hay sesiones registradas. Ejecuta el seed.py</p>

  return (
    <div className="session-list">
      {sesiones.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`session-item ${selectedId === s.id ? 'session-item--active' : ''}`}
        >
          <span className="session-id">{s.id}</span>
          <span className="session-meta">{s.device_id} · {s.sample_rate_hz} Hz</span>
        </button>
      ))}
    </div>
  )
}

export default SessionList