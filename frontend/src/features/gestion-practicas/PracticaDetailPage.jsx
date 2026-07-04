import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { ESTADO_PRACTICA_LABELS, TIPO_PRACTICA_LABELS, fullName } from '../../utils/format'
import UserSearchSelect from '../../components/ui/UserSearchSelect'
import { useAuth } from '../../context/AuthContext'
import { isCoordinator } from '../../utils/routes'

const ESTADOS = ['BORRADOR', 'EN_CURSO', 'FINALIZADA', 'CANCELADA']

function InfoCard({ title, rows }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <dl className="info-list">
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>
        ))}
      </dl>
    </div>
  )
}

function estadoVariant(e) {
  if (e === 'EN_CURSO')   return 'active'
  if (e === 'FINALIZADA') return 'role'
  if (e === 'CANCELADA')  return 'inactive'
  return 'employer'
}

function EvaluacionesActaCard({ practicaId }) {
  const [evDesempeno, setEvDesempeno] = useState([])
  const [evInforme, setEvInforme]     = useState([])
  const [acta, setActa]               = useState(null)
  const [validando, setValidando]     = useState(false)
  const [ok, setOk]                   = useState('')
  const [error, setError]             = useState('')

  const load = useCallback(async () => {
    try {
      const [d, i, a] = await Promise.all([
        api.getEvaluacionesDesempenoPorPractica(practicaId),
        api.getEvaluacionesInformePorPractica(practicaId),
        api.getActaFinal(practicaId),
      ])
      setEvDesempeno(Array.isArray(d) ? d : [])
      setEvInforme(Array.isArray(i) ? i : [])
      setActa(a)
    } catch { /* sin data aún */ }
  }, [practicaId])

  useEffect(() => { load() }, [load])

  const handleValidar = async () => {
    setValidando(true); setError(''); setOk('')
    try {
      const result = await api.validarActaFinal(practicaId)
      setActa(result)
      setOk('Acta final validada correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setValidando(false)
    }
  }

  const notaColor = (nota) => nota >= 4 ? 'var(--success, #1f9d63)' : '#dc2626'

  return (
    <div className="tasks-card" style={{ marginTop: 24 }}>
      <h3>Evaluaciones y Acta Final</h3>

      {error && <div className="alert alert--error" style={{ marginBottom: 12 }}>{error}</div>}
      {ok    && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{ok}</div>}

      <div className="info-grid" style={{ marginBottom: 16 }}>
        <div className="info-card">
          <h3>Evaluación de desempeño (empleador)</h3>
          {evDesempeno.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Sin evaluación registrada.</p>
          ) : evDesempeno.map((ev) => (
            <div key={ev.id}>
              <Badge variant={ev.estado === 'CERRADA' ? 'active' : 'employer'}>{ev.estado}</Badge>
              {ev.nota != null && (
                <p style={{ marginTop: 8, fontWeight: 700, fontSize: 20, color: notaColor(ev.nota) }}>{ev.nota}</p>
              )}
            </div>
          ))}
        </div>
        <div className="info-card">
          <h3>Evaluación de informe (docente)</h3>
          {evInforme.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Sin evaluación registrada.</p>
          ) : evInforme.map((ev) => (
            <div key={ev.id}>
              <Badge variant={ev.estado === 'CERRADA' ? 'active' : 'employer'}>{ev.estado}</Badge>
              {ev.nota != null && (
                <p style={{ marginTop: 8, fontWeight: 700, fontSize: 20, color: notaColor(ev.nota) }}>{ev.nota}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {acta && (
        <div style={{ padding: '14px 16px', background: 'var(--border-light)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Nota desempeño</span><br /><strong>{acta.nota_desempeno ?? '—'}</strong></div>
          <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Nota informe</span><br /><strong>{acta.nota_informe ?? '—'}</strong></div>
          <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Nota final</span><br /><strong style={{ fontSize: 22, color: acta.nota_final ? notaColor(acta.nota_final) : 'inherit' }}>{acta.nota_final ?? '—'}</strong></div>
          <div><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Estado</span><br /><Badge variant={acta.validada ? 'active' : 'employer'}>{acta.validada ? 'Validada' : 'Sin validar'}</Badge></div>
          {!acta.validada && (
            <button className="btn btn--primary btn--sm" onClick={handleValidar} disabled={validando || !acta.nota_final}>
              {validando ? 'Validando...' : 'Validar acta final'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ParametrosCard({ carreraId, carreraNombre }) {
  const [params, setParams] = useState(null)
  const [saving, setSaving] = useState(false)
  const [ok, setOk]         = useState('')
  const [error, setError]   = useState('')

  useEffect(() => {
    api.getParametros(carreraId).then(setParams).catch(() => {})
  }, [carreraId])

  const set = (field, value) => setParams((prev) => ({ ...prev, [field]: value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setOk(''); setError('')
    try {
      const updated = await api.updateParametros(carreraId, {
        peso_desempeno: Number(params.peso_desempeno),
        peso_informe:   Number(params.peso_informe),
        nota_minima_aprobacion: Number(params.nota_minima_aprobacion),
      })
      setParams(updated)
      setOk('Parámetros actualizados correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!params) return null

  return (
    <div className="tasks-card" style={{ marginTop: 24 }}>
      <h3>Parámetros de evaluación — {carreraNombre}</h3>
      <form onSubmit={handleSave}>
        <div className="form-grid">
          <label>
            Peso evaluación empleador (0–1)
            <input
              type="number" min="0" max="1" step="0.05"
              value={params.peso_desempeno}
              onChange={(e) => set('peso_desempeno', e.target.value)}
            />
          </label>
          <label>
            Peso evaluación informe (0–1)
            <input
              type="number" min="0" max="1" step="0.05"
              value={params.peso_informe}
              onChange={(e) => set('peso_informe', e.target.value)}
            />
          </label>
          <label>
            Nota mínima de aprobación
            <input
              type="number" min="1" max="7" step="0.1"
              value={params.nota_minima_aprobacion}
              onChange={(e) => set('nota_minima_aprobacion', e.target.value)}
            />
          </label>
        </div>
        {error && <div className="alert alert--error" style={{ marginBottom: 12 }}>{error}</div>}
        {ok    && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{ok}</div>}
        <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar parámetros'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PracticaDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const esCoordinador = isCoordinator(profile?.rol)
  const [data, setData]         = useState(null)
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [estadoModal, setEstadoModal] = useState(false)
  const [docenteModal, setDocenteModal] = useState(false)
  const [nuevoEstado, setNuevoEstado]   = useState('')
  const [nuevoDocente, setNuevoDocente] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [result, usersData] = await Promise.all([api.getPractica(id), api.getUsers()])
      setData(result)
      setNuevoEstado(result.practica.estado)
      setNuevoDocente(result.practica.docente_id ?? '')
      setUsers(usersData.items ?? [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])


  const handleEstado = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await api.updatePracticaEstado(id, nuevoEstado); setEstadoModal(false); await load() }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDocente = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await api.asignarDocente(id, nuevoDocente || null); setDocenteModal(false); await load() }
    catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page"><div className="table-empty">Cargando...</div></div>
  if (error && !data) return <div className="page"><div className="alert alert--error">{error}</div></div>
  if (!data) return null

  const { practica, centro, carrera, docente, alumno, acta1 } = data

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/practicas" className="btn btn--secondary btn--sm">← Volver</Link>
          <div>
            <h2 className="page-title">Detalle de Práctica</h2>
            <p className="page-subtitle">{alumno ? fullName(alumno) : '—'} · {TIPO_PRACTICA_LABELS[practica.tipo] ?? practica.tipo}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge variant={estadoVariant(practica.estado)}>{ESTADO_PRACTICA_LABELS[practica.estado] ?? practica.estado}</Badge>
          <button className="btn btn--secondary btn--sm" onClick={() => setEstadoModal(true)}>Cambiar estado</button>
          <button className="btn btn--secondary btn--sm" onClick={() => setDocenteModal(true)}>Asignar docente</button>
          <Link to={`/practicas/${id}/documentos`} className="btn btn--secondary btn--sm">Documentos</Link>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="info-grid">
        <InfoCard title="Alumno" rows={[
          ['Nombre', alumno ? fullName(alumno) : null],
          ['RUT', alumno?.rut],
          ['Correo', alumno?.email],
        ]} />
        <InfoCard title="Información general" rows={[
          ['Carrera', carrera?.nombre],
          ['Tipo', TIPO_PRACTICA_LABELS[practica.tipo] ?? practica.tipo],
          ['Fecha inicio', practica.fecha_inicio],
          ['Término estimado', practica.fecha_termino_calculada],
          ['Término confirmado', practica.fecha_termino_confirmada],
        ]} />
        <InfoCard title="Centro de práctica" rows={[
          ['Empresa', centro?.nombre],
          ['Dirección', centro?.direccion],
          ['Giro', centro?.giro],
          ['Contacto', centro?.nombre_contacto],
          ['Correo contacto', centro?.correo_contacto],
        ]} />
        <InfoCard title="Docente guía" rows={[
          ['Nombre', docente ? fullName(docente) : 'Sin asignar'],
          ['Correo', docente?.email],
        ]} />
      </div>

      {/* Acta 1 */}
      <div className="tasks-card">
        <h3>Acta 1 — Estado</h3>
        {!acta1 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay acta 1 registrada.</p>
        ) : (
          <ul className="tasks-list">
            <li className={`tasks-item tasks-item--${acta1.completada_alumno ? 'done' : 'pending'}`}>
              <span className="tasks-status">{acta1.completada_alumno ? 'Completada' : 'Pendiente'}</span>
              <div><strong>Completada por alumno</strong>
                {acta1.fecha_limite_alumno && <p>Fecha límite: {acta1.fecha_limite_alumno}</p>}
              </div>
            </li>
            <li className={`tasks-item tasks-item--${acta1.aceptada_docente ? 'done' : 'pending'}`}>
              <span className="tasks-status">{acta1.aceptada_docente ? 'Aceptada' : 'Pendiente'}</span>
              <div><strong>Aprobada por docente</strong></div>
            </li>
          </ul>
        )}
        {acta1?.tareas_principales && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tareas principales</p>
            <p style={{ margin: 0, fontSize: 14 }}>{acta1.tareas_principales}</p>
          </div>
        )}
      </div>

      {/* Parámetros de evaluación — solo coordinadores */}
      {esCoordinador && carrera && (
        <ParametrosCard carreraId={carrera.id} carreraNombre={carrera.nombre} />
      )}

      {/* Evaluaciones y acta final — solo coordinadores */}
      {esCoordinador && (
        <EvaluacionesActaCard practicaId={practica.id} />
      )}

      {/* Cambiar estado */}
      {estadoModal && (
        <Modal title="Cambiar estado" onClose={() => setEstadoModal(false)}>
          <form onSubmit={handleEstado}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <label>Estado
                <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  {ESTADOS.map((s) => <option key={s} value={s}>{ESTADO_PRACTICA_LABELS[s] ?? s}</option>)}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setEstadoModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Confirmar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Asignar docente */}
      {docenteModal && (
        <Modal title="Asignar docente guía" onClose={() => setDocenteModal(false)}>
          <form onSubmit={handleDocente}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <label>Docente
                <UserSearchSelect
                  users={users}
                  value={nuevoDocente}
                  onChange={setNuevoDocente}
                  placeholder="Buscar docente por nombre o RUT..."
                  filterFn={(u) => u.rol === 'DOCENTE' && u.is_active}
                />
                {nuevoDocente && (
                  <button type="button" className="btn btn--secondary btn--sm"
                    style={{ marginTop: 6, width: 'fit-content' }}
                    onClick={() => setNuevoDocente('')}>
                    Quitar docente asignado
                  </button>
                )}
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setDocenteModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Confirmar'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
