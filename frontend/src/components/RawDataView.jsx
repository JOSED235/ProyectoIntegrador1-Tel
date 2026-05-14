import { useEffect, useState } from 'react'
import { getCaptura } from '../services/api'

function RawDataView({ sessionId }) {
  const [data, setData]       = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!sessionId) return

    const cargar = async () => {
      setCargando(true)
      setError(null)
      setData(null)
      try {
        const result = await getCaptura(sessionId)
        setData(result)
      } catch (err) {
        setError('No se pudieron cargar los datos de esta sesión.')
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [sessionId])  // se re-ejecuta cada vez que cambia la sesión seleccionada

  // Sin sesión seleccionada
  if (!sessionId) {
    return (
      <div className="raw-placeholder">
        <span className="raw-placeholder__icon">&#x2197;</span>
        <p>Selecciona una sesión para ver sus datos</p>
      </div>
    )
  }

  // Cargando
  if (cargando) {
    return (
      <div className="raw-placeholder">
        <p className="texto-dim">Consultando {sessionId}...</p>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="raw-placeholder">
        <p className="texto-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="raw-view">
      {/* Header con metadata */}
      <div className="raw-view__header">
        <div className="raw-meta">
          <span className="raw-meta__label">SESSION</span>
          <span className="raw-meta__value">{data?.session_id}</span>
        </div>
        <div className="raw-meta">
          <span className="raw-meta__label">MUESTRAS</span>
          <span className="raw-meta__value raw-meta__value--accent">{data?.count}</span>
        </div>
      </div>

      {/* JSON crudo */}
      <pre className="raw-view__json">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default RawDataView