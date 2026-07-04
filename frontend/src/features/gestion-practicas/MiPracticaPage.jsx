import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import {
  ESTADO_PRACTICA_LABELS,
  TIPO_PRACTICA_LABELS,
  fullName,
} from '../../utils/format'

export default function MiPracticaPage() {
  const { profile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [acta, setActa] = useState(null)

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    setError('')
    try {
      const result = await api.getMyPractica(profile.id)
      setData(result)
      if (result?.practica?.id) {
        api.getActaFinal(result.practica.id).then(setActa).catch(() => {})
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <div className="page"><div className="table-empty">Cargando tu práctica...</div></div>
  }

  if (error) {
    return <div className="page"><div className="alert alert--error">{error}</div></div>
  }

  if (!data?.practica) {
    return (
      <div className="page">
        <div className="page-header">
          <h2 className="page-title">Mi Práctica</h2>
          <p className="page-subtitle">Aún no tienes una práctica registrada</p>
        </div>
        <div className="empty-state">Contacta al coordinador de tu carrera para iniciar el proceso.</div>
      </div>
    )
  }

  const { practica, centro, carrera, docente, acta1 } = data
  const actaPendiente = acta1 && !acta1.completada_alumno

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mi Práctica</h2>
          <p className="page-subtitle">Resumen de tu práctica profesional</p>
        </div>
        <Badge variant={practica.estado === 'EN_CURSO' ? 'active' : 'role'}>
          {ESTADO_PRACTICA_LABELS[practica.estado] ?? practica.estado}
        </Badge>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>Información general</h3>
          <dl className="info-list">
            <div>
              <dt>Carrera</dt>
              <dd>{carrera?.nombre ?? '—'}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{TIPO_PRACTICA_LABELS[practica.tipo] ?? practica.tipo}</dd>
            </div>
            <div>
              <dt>Fecha de inicio</dt>
              <dd>{practica.fecha_inicio}</dd>
            </div>
            <div>
              <dt>Término estimado</dt>
              <dd>{practica.fecha_termino_calculada ?? 'Por calcular'}</dd>
            </div>
          </dl>
        </div>

        <div className="info-card">
          <h3>Centro de práctica</h3>
          <dl className="info-list">
            <div>
              <dt>Empresa</dt>
              <dd>{centro?.nombre ?? '—'}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{centro?.direccion ?? '—'}</dd>
            </div>
            <div>
              <dt>Contacto</dt>
              <dd>{centro?.nombre_contacto ?? '—'}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{centro?.correo_contacto ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="info-card">
          <h3>Docente guía</h3>
          <dl className="info-list">
            <div>
              <dt>Nombre</dt>
              <dd>{docente ? fullName(docente) : 'Sin asignar'}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{docente?.email ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {acta && (acta.nota_final != null || acta.nota_desempeno != null || acta.nota_informe != null) && (
        <div className="tasks-card" style={{ marginTop: 16 }}>
          <h3>Mi resultado</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {acta.nota_desempeno != null && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Nota desempeño (empleador)</p>
                <strong style={{ fontSize: 20 }}>{acta.nota_desempeno}</strong>
              </div>
            )}
            {acta.nota_informe != null && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Nota informe (docente)</p>
                <strong style={{ fontSize: 20 }}>{acta.nota_informe}</strong>
              </div>
            )}
            {acta.nota_final != null && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Nota final</p>
                <strong style={{ fontSize: 32, color: acta.nota_final >= 4 ? 'var(--primary)' : '#dc2626' }}>
                  {acta.nota_final}
                </strong>
              </div>
            )}
            <div>
              <Badge variant={acta.validada ? 'active' : 'employer'}>
                {acta.validada ? 'Acta validada' : 'Pendiente de validación'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-card">
        <h3>Pendientes</h3>
        <ul className="tasks-list">
          <li className={actaPendiente ? 'tasks-item tasks-item--pending' : 'tasks-item tasks-item--done'}>
            <span className="tasks-status">{actaPendiente ? 'Pendiente' : 'Completado'}</span>
            <div>
              <strong>Acta 1 — Datos del centro de práctica</strong>
              {acta1?.fecha_limite_alumno && (
                <p>Fecha límite: {acta1.fecha_limite_alumno}</p>
              )}
            </div>
            {actaPendiente && (
              <Link to="/acta1" className="btn btn--primary btn--sm">
                Completar
              </Link>
            )}
          </li>
          <li className="tasks-item tasks-item--pending">
            <span className="tasks-status">Pendiente</span>
            <div>
              <strong>Informes de avance</strong>
              <p>Disponible próximamente</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
