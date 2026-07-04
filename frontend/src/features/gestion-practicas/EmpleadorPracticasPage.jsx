import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { ESTADO_PRACTICA_LABELS, fullName } from '../../utils/format'

const ITEMS_EVALUACION = [
  'Puntualidad y asistencia',
  'Responsabilidad',
  'Calidad del trabajo',
  'Iniciativa',
  'Trabajo en equipo',
  'Comunicación',
  'Adaptación al entorno laboral',
]

function estadoVariant(e) {
  if (e === 'EN_CURSO')   return 'active'
  if (e === 'FINALIZADA') return 'role'
  if (e === 'CANCELADA')  return 'inactive'
  return 'employer'
}

export default function EmpleadorPracticasPage() {
  const { profile } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [evalModal, setEvalModal] = useState(null)
  const [evalItems, setEvalItems] = useState({})
  const [verEvalModal, setVerEvalModal] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true); setError('')
    try {
      const data = await api.getMisPracticasEmpleador(profile.id)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [profile])

  useEffect(() => { load() }, [load])

  const openEval = (practicaId, alumnoNombre) => {
    setEvalItems(Object.fromEntries(ITEMS_EVALUACION.map((n) => [n, ''])))
    setEvalModal({ practicaId, alumnoNombre })
    setError('')
  }

  const openVerEval = async (practicaId, alumnoNombre) => {
    try {
      const lista = await api.getEvaluacionesDesempenoPorPractica(practicaId)
      setVerEvalModal({ practicaId, alumnoNombre, eval: lista?.[0] ?? null })
    } catch {
      setVerEvalModal({ practicaId, alumnoNombre, eval: null })
    }
  }

  const handleEvalSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = ITEMS_EVALUACION.map((nombre) => ({ nombre, nota: parseFloat(evalItems[nombre] || 0) }))
      await api.createEvaluacionDesempenoTracked({
        practica_id:    evalModal.practicaId,
        evaluador_id:   profile.id,
        tipo_evaluador: 'EMPLEADOR',
        items:          payload,
      })
      setEvalModal(null)
      setSuccessMsg('Evaluación de desempeño enviada correctamente.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mis Prácticas</h2>
          <p className="page-subtitle">Alumnos en práctica en tu empresa</p>
        </div>
      </div>

      {error      && !evalModal && <div className="alert alert--error">{error}</div>}
      {successMsg && <div className="alert alert--info">{successMsg}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="table-empty">No hay alumnos en práctica en tu empresa actualmente</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Alumno</th><th>Carrera</th><th>Tipo</th><th>Inicio</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ practica, alumno, carrera }) => (
                <tr key={practica.id}>
                  <td>{alumno  ? fullName(alumno)  : '—'}</td>
                  <td>{carrera ? carrera.nombre    : '—'}</td>
                  <td>{practica.tipo === 'LABORAL' ? 'Laboral' : 'Profesional'}</td>
                  <td>{practica.fecha_inicio}</td>
                  <td>
                    <Badge variant={estadoVariant(practica.estado)}>
                      {ESTADO_PRACTICA_LABELS[practica.estado] ?? practica.estado}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => openEval(practica.id, alumno ? fullName(alumno) : 'Alumno')}
                      >
                        Evaluar
                      </button>
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => openVerEval(practica.id, alumno ? fullName(alumno) : 'Alumno')}
                      >
                        Ver evaluación
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: nueva evaluación */}
      {evalModal && (
        <Modal title={`Evaluación de desempeño — ${evalModal.alumnoNombre}`} onClose={() => setEvalModal(null)} wide>
          <form onSubmit={handleEvalSubmit}>
            {error && <div className="alert alert--error">{error}</div>}
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
              Ingresa una nota del 1.0 al 7.0 para cada criterio.
            </p>
            <div className="form-grid">
              {ITEMS_EVALUACION.map((nombre) => (
                <label key={nombre}>{nombre}
                  <input
                    type="number" min="1" max="7" step="0.1"
                    placeholder="1.0 – 7.0"
                    value={evalItems[nombre]}
                    onChange={(e) => setEvalItems((prev) => ({ ...prev, [nombre]: e.target.value }))}
                    required
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setEvalModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Enviando...' : 'Enviar evaluación'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: ver evaluación existente */}
      {verEvalModal && (
        <Modal title={`Evaluación enviada — ${verEvalModal.alumnoNombre}`} onClose={() => setVerEvalModal(null)}>
          {!verEvalModal.eval ? (
            <p style={{ color: 'var(--text-secondary)' }}>Aún no hay evaluación enviada para este alumno.</p>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <Badge variant={verEvalModal.eval.estado === 'CERRADA' ? 'active' : 'employer'}>
                  {verEvalModal.eval.estado}
                </Badge>
              </div>
              {verEvalModal.eval.items?.map((item) => (
                <div key={item.nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
                  <span>{item.nombre}</span>
                  <strong>{item.nota}</strong>
                </div>
              ))}
              {verEvalModal.eval.nota != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 16 }}>
                  <strong>Nota final</strong>
                  <strong style={{ color: 'var(--primary)' }}>{verEvalModal.eval.nota}</strong>
                </div>
              )}
            </>
          )}
          <div className="modal-actions">
            <button className="btn btn--secondary" onClick={() => setVerEvalModal(null)}>Cerrar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
