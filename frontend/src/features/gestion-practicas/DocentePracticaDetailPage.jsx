import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import { ESTADO_PRACTICA_LABELS, TIPO_PRACTICA_LABELS, fullName } from '../../utils/format'

const ITEMS_INFORME = [
  'Presentación y redacción del informe',
  'Descripción de la empresa y área de trabajo',
  'Descripción de actividades realizadas',
  'Aplicación de conocimientos teóricos',
  'Análisis y conclusiones',
  'Cumplimiento de plazos',
]

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

function EvaluacionInformeCard({ practicaId, docenteId, onUpdated }) {
  const [evalExistente, setEvalExistente] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [items, setItems]       = useState(Object.fromEntries(ITEMS_INFORME.map((n) => [n, ''])))
  const [saving, setSaving]     = useState(false)
  const [cerrando, setCerrando] = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState('')

  const loadEval = useCallback(async () => {
    setLoading(true)
    try {
      const lista = await api.getEvaluacionesInformePorPractica(practicaId)
      const ev = lista?.[0] ?? null
      setEvalExistente(ev)
      if (ev?.items?.length) {
        const map = Object.fromEntries(ev.items.map((i) => [i.nombre, i.nota]))
        setItems((prev) => ({ ...prev, ...map }))
      }
    } catch {
      // sin evaluación aún
    } finally {
      setLoading(false)
    }
  }, [practicaId])

  useEffect(() => { loadEval() }, [loadEval])

  const handleCrearOActualizar = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setOk('')
    try {
      const itemsArr = ITEMS_INFORME.map((nombre) => ({ nombre, nota: parseFloat(items[nombre] || 0) }))
      if (!evalExistente) {
        await api.createEvaluacionInformeTracked({ practica_id: practicaId, docente_id: docenteId, items: itemsArr })
      } else {
        await api.updateEvaluacionInforme(evalExistente.id, { items: itemsArr })
      }
      setOk('Evaluación guardada correctamente.')
      await loadEval()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCerrar = async () => {
    if (!evalExistente) return
    if (!window.confirm('¿Cerrar la evaluación? Una vez cerrada no podrá modificarse.')) return
    setCerrando(true); setError(''); setOk('')
    try {
      await api.cerrarEvaluacionInforme(evalExistente.id)
      setOk('Evaluación cerrada. La nota quedó registrada.')
      await loadEval()
      onUpdated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setCerrando(false)
    }
  }

  if (loading) return <div className="tasks-card"><p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cargando evaluación...</p></div>

  const cerrada = evalExistente?.estado === 'CERRADA'

  return (
    <div className="tasks-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Evaluación del informe</h3>
        {evalExistente && (
          <Badge variant={cerrada ? 'active' : 'employer'}>
            {cerrada ? `Cerrada · Nota ${evalExistente.nota ?? '—'}` : 'En borrador'}
          </Badge>
        )}
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 12 }}>{error}</div>}
      {ok    && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{ok}</div>}

      {cerrada ? (
        <div className="info-list">
          {evalExistente.items?.map((item) => (
            <div key={item.nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 14 }}>{item.nombre}</span>
              <strong style={{ fontSize: 14 }}>{item.nota}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 4 }}>
            <strong>Nota final</strong>
            <strong style={{ color: 'var(--primary)', fontSize: 18 }}>{evalExistente.nota ?? '—'}</strong>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCrearOActualizar}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0, marginBottom: 16 }}>
            Ingresa una nota del 1.0 al 7.0 para cada criterio. Guarda el borrador y ciérrala cuando esté lista.
          </p>
          <div className="form-grid">
            {ITEMS_INFORME.map((nombre) => (
              <label key={nombre}>{nombre}
                <input
                  type="number" min="1" max="7" step="0.1"
                  placeholder="1.0 – 7.0"
                  value={items[nombre]}
                  onChange={(e) => setItems((prev) => ({ ...prev, [nombre]: e.target.value }))}
                  required
                />
              </label>
            ))}
          </div>
          <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : evalExistente ? 'Actualizar borrador' : 'Crear evaluación'}
            </button>
            {evalExistente && (
              <button type="button" className="btn btn--secondary" onClick={handleCerrar} disabled={cerrando}>
                {cerrando ? 'Cerrando...' : 'Cerrar y registrar nota'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default function DocentePracticaDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [accepting, setAccepting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await api.getPractica(id)
      setData(result)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleAceptarActa1 = async () => {
    setAccepting(true); setError(''); setSuccessMsg('')
    try {
      await api.acceptActa1(id)
      setSuccessMsg('Acta 1 aceptada correctamente.')
      await load()
    } catch (e) { setError(e.message) }
    finally { setAccepting(false) }
  }

  if (loading) return <div className="page"><div className="table-empty">Cargando...</div></div>
  if (error && !data) return <div className="page"><div className="alert alert--error">{error}</div></div>
  if (!data) return null

  const { practica, centro, carrera, alumno, acta1 } = data

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/docente/practicas" className="btn btn--secondary btn--sm">← Volver</Link>
          <div>
            <h2 className="page-title">Detalle de Práctica</h2>
            <p className="page-subtitle">{alumno ? fullName(alumno) : '—'} · {TIPO_PRACTICA_LABELS[practica.tipo] ?? practica.tipo}</p>
          </div>
        </div>
        <Badge variant={practica.estado === 'EN_CURSO' ? 'active' : practica.estado === 'FINALIZADA' ? 'role' : 'employer'}>
          {ESTADO_PRACTICA_LABELS[practica.estado] ?? practica.estado}
        </Badge>
      </div>

      {error      && <div className="alert alert--error">{error}</div>}
      {successMsg && <div className="alert alert--info">{successMsg}</div>}

      <div className="info-grid">
        <InfoCard title="Alumno" rows={[['Nombre', alumno ? fullName(alumno) : null], ['RUT', alumno?.rut], ['Correo', alumno?.email]]} />
        <InfoCard title="Información general" rows={[
          ['Carrera', carrera?.nombre], ['Tipo', TIPO_PRACTICA_LABELS[practica.tipo] ?? practica.tipo],
          ['Fecha inicio', practica.fecha_inicio], ['Término estimado', practica.fecha_termino_calculada],
        ]} />
        <InfoCard title="Centro de práctica" rows={[
          ['Empresa', centro?.nombre], ['Dirección', centro?.direccion], ['Giro', centro?.giro],
        ]} />
      </div>

      {/* Acta 1 */}
      <div className="tasks-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Acta 1</h3>
          {acta1?.completada_alumno && !acta1.aceptada_docente && (
            <button className="btn btn--primary btn--sm" onClick={handleAceptarActa1} disabled={accepting}>
              {accepting ? 'Aceptando...' : 'Aceptar Acta 1'}
            </button>
          )}
        </div>
        {!acta1 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay acta 1 registrada.</p>
        ) : (
          <>
            <dl className="info-list">
              <div><dt>Dirección del centro</dt><dd>{acta1.direccion_centro || '—'}</dd></div>
              <div><dt>Departamento</dt><dd>{acta1.departamento || '—'}</dd></div>
              <div><dt>Jefe directo</dt><dd>{acta1.nombre_jefe_directo || '—'}</dd></div>
              <div><dt>Cargo</dt><dd>{acta1.cargo_jefe_directo || '—'}</dd></div>
              <div><dt>Correo contacto</dt><dd>{acta1.contacto_correo || '—'}</dd></div>
              <div><dt>Teléfono contacto</dt><dd>{acta1.contacto_telefono || '—'}</dd></div>
              <div><dt>A distancia</dt><dd>{acta1.practica_a_distancia ? 'Sí' : 'No'}</dd></div>
            </dl>
            {acta1.tareas_principales && (
              <p style={{ marginTop: 12, fontSize: 14 }}><strong>Tareas:</strong> {acta1.tareas_principales}</p>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Badge variant={acta1.completada_alumno ? 'active' : 'employer'}>
                {acta1.completada_alumno ? 'Completada por alumno' : 'Pendiente alumno'}
              </Badge>
              <Badge variant={acta1.aceptada_docente ? 'active' : 'employer'}>
                {acta1.aceptada_docente ? 'Aceptada por docente' : 'Pendiente aprobación'}
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Evaluación del informe */}
      <EvaluacionInformeCard practicaId={practica.id} docenteId={profile?.id} onUpdated={load} />
    </div>
  )
}
