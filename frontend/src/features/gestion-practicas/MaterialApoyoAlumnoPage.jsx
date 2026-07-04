import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ width: 15, height: 15, flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export default function MaterialApoyoAlumnoPage() {
  const { profile } = useAuth()
  const [carrera, setCarrera]       = useState(null)
  const [materiales, setMateriales] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    setError('')
    try {
      // Obtener la práctica del alumno para extraer su carrera_id
      const miPractica = await api.getMyPractica(profile.id)
      const carreraId = miPractica?.practica?.carrera_id

      if (!carreraId) {
        setError('No tienes una práctica asignada. El material de apoyo estará disponible una vez que el coordinador te asigne una práctica.')
        return
      }

      // Nombre de la carrera (ya lo tenemos en el objeto compuesto)
      setCarrera(miPractica?.carrera ?? null)

      const data = await api.getMaterialApoyo(carreraId)
      setMateriales(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => { load() }, [load])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Material de Apoyo</h2>
          <p className="page-subtitle">
            {carrera ? `Recursos para la carrera ${carrera.nombre}` : 'Documentos y recursos para tu práctica'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert--info">{error}</div>}

      {loading ? (
        <div className="table-empty">Cargando material...</div>
      ) : !error && materiales.length === 0 ? (
        <div className="table-card">
          <div className="table-empty">
            Aún no hay material de apoyo publicado para tu carrera.
          </div>
        </div>
      ) : !error && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Archivo</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m) => (
                <tr key={m.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileIcon />
                    {m.nombre}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{m.filename}</td>
                  <td>{m.tamanio_kb ? `${m.tamanio_kb} KB` : '—'}</td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString('es-CL') : '—'}</td>
                  <td>
                    <a
                      href={api.getDocumentoUrl(m.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--secondary btn--sm"
                    >
                      Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
