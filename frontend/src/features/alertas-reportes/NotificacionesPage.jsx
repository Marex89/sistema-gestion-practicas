import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import UserSearchSelect from '../../components/ui/UserSearchSelect'

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function AlertaForm({ alumnos }) {
  const [alumnoId, setAlumnoId] = useState('')
  const [asunto, setAsunto]     = useState('')
  const [mensaje, setMensaje]   = useState('')
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!alumnoId) { setError('Selecciona un alumno.'); return }
    setSending(true); setError(''); setOk('')
    try {
      await api.enviarAlertaManual({ alumno_id: alumnoId, asunto, mensaje })
      setOk('Alerta enviada correctamente.')
      setAsunto(''); setMensaje(''); setAlumnoId('')
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  return (
    <div className="tasks-card">
      <h3>Enviar alerta manual</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-grid-full">Alumno
            <UserSearchSelect
              users={alumnos}
              value={alumnoId}
              onChange={setAlumnoId}
              placeholder="Buscar alumno por nombre o RUT..."
              required
            />
          </label>
          <label className="form-grid-full">Asunto
            <input value={asunto} onChange={(e) => setAsunto(e.target.value)} required
              placeholder="Recordatorio de entrega de acta..." />
          </label>
          <label className="form-grid-full">Mensaje
            <textarea rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)}
              required style={{ resize: 'vertical' }} />
          </label>
        </div>
        {error && <div className="alert alert--error" style={{ marginBottom: 12 }}>{error}</div>}
        {ok    && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{ok}</div>}
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="submit" className="btn btn--primary" disabled={sending}>
            <SendIcon />
            {sending ? 'Enviando...' : 'Enviar alerta'}
          </button>
        </div>
      </form>
    </div>
  )
}

function HistorialPanel({ alumnos }) {
  const [alumnoId, setAlumnoId] = useState('')
  const [historial, setHistorial] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Cargar historial automáticamente al seleccionar alumno
  useEffect(() => {
    if (!alumnoId) { setHistorial(null); return }
    setLoading(true); setError('')
    api.getHistorialNotificaciones(alumnoId)
      .then((data) => setHistorial(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [alumnoId])

  return (
    <div className="tasks-card">
      <h3>Historial de notificaciones</h3>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        Alumno
        <UserSearchSelect
          users={alumnos}
          value={alumnoId}
          onChange={setAlumnoId}
          placeholder="Buscar alumno por nombre o RUT..."
        />
      </label>

      {error && <div className="alert alert--error">{error}</div>}
      {loading && <div className="table-empty">Cargando historial...</div>}

      {!loading && historial !== null && (
        historial.length === 0 ? (
          <div className="table-empty">No hay notificaciones para este alumno.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Asunto</th><th>Mensaje</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {historial.map((n) => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 500 }}>{n.asunto ?? n.tipo ?? '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 280 }}>{n.mensaje}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString('es-CL') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {!alumnoId && !loading && (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
          Selecciona un alumno para ver su historial.
        </p>
      )}
    </div>
  )
}

export default function NotificacionesPage() {
  const [alumnos, setAlumnos] = useState([])

  useEffect(() => {
    api.getUsers({ limit: 500 })
      .then((data) => setAlumnos((data.items ?? []).filter((u) => u.rol === 'ALUMNO' && u.is_active)))
      .catch(() => {})
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Alertas y Notificaciones</h2>
          <p className="page-subtitle">Envía alertas manuales a alumnos y consulta su historial</p>
        </div>
      </div>
      <AlertaForm alumnos={alumnos} />
      <div style={{ marginTop: 24 }}>
        <HistorialPanel alumnos={alumnos} />
      </div>
    </div>
  )
}
