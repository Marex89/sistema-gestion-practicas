import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import { ESTADO_PRACTICA_LABELS, fullName } from '../../utils/format'

function estadoVariant(e) {
  if (e === 'EN_CURSO')   return 'active'
  if (e === 'FINALIZADA') return 'role'
  if (e === 'CANCELADA')  return 'inactive'
  return 'employer'
}

export default function DocentePracticasPage() {
  const { profile } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true); setError('')
    try {
      const data = await api.getMisPracticasDocente(profile.id)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [profile])

  useEffect(() => { load() }, [load])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Mis Prácticas Asignadas</h2>
          <p className="page-subtitle">Prácticas en las que eres docente guía</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="table-empty">No tienes prácticas asignadas</div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th>Alumno</th><th>Empresa</th><th>Carrera</th><th>Tipo</th>
              <th>Inicio</th><th>Acta 1</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {items.map(({ practica, alumno, centro, carrera, acta1 }) => (
                <tr key={practica.id}>
                  <td>{alumno  ? fullName(alumno)  : '—'}</td>
                  <td>{centro  ? centro.nombre     : '—'}</td>
                  <td>{carrera ? carrera.nombre    : '—'}</td>
                  <td>{practica.tipo === 'LABORAL' ? 'Laboral' : 'Profesional'}</td>
                  <td>{practica.fecha_inicio}</td>
                  <td>
                    {!acta1 ? <Badge variant="employer">Sin acta</Badge>
                      : acta1.aceptada_docente ? <Badge variant="active">Aceptada</Badge>
                      : acta1.completada_alumno ? <Badge variant="role">Pend. revisión</Badge>
                      : <Badge variant="employer">Sin completar</Badge>}
                  </td>
                  <td><Badge variant={estadoVariant(practica.estado)}>{ESTADO_PRACTICA_LABELS[practica.estado] ?? practica.estado}</Badge></td>
                  <td><Link to={`/docente/practicas/${practica.id}`} className="btn btn--secondary btn--sm">Ver detalle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
