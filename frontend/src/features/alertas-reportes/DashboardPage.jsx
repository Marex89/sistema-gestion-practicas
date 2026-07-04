import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { ESTADO_PRACTICA_LABELS, TIPO_PRACTICA_LABELS, fullName } from '../../utils/format'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: color + '1a', color }}>
        {icon}
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value ?? 0}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  )
}

function estadoVariant(e) {
  if (e === 'EN_CURSO')   return '#155724'
  if (e === 'FINALIZADA') return '#1a3a5c'
  if (e === 'CANCELADA')  return '#b91c1c'
  return '#92400e'
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats]       = useState(null)
  const [practicas, setPracticas] = useState([])
  const [users, setUsers]         = useState([])
  const [centros, setCentros]     = useState([])
  const [carreras, setCarreras]   = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, p, u, c, car] = await Promise.all([
        api.getDashboardStats(), api.getPracticas(), api.getUsers(), api.getCentros(), api.getCarreras(),
      ])
      setStats(s)
      setPracticas(Array.isArray(p) ? p.slice(0, 6) : [])
      setUsers(u.items ?? [])
      setCentros(Array.isArray(c) ? c : [])
      setCarreras(Array.isArray(car) ? car : [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const userMap    = Object.fromEntries(users.map((u) => [u.id, u]))
  const centroMap  = Object.fromEntries(centros.map((c) => [c.id, c]))
  const carreraMap = Object.fromEntries(carreras.map((c) => [c.id, c]))

  if (loading) return <div className="page"><div className="table-empty">Cargando dashboard...</div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Bienvenido/a, {profile ? fullName(profile) : 'Coordinador'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Prácticas en curso" value={stats?.enCurso} color="#155724"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
        <StatCard label="Total prácticas" value={stats?.total} color="#1a3a5c"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>} />
        <StatCard label="Alumnos activos" value={stats?.alumnos} color="#1e40af"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
        <StatCard label="Empresas registradas" value={stats?.empresas} color="#92400e"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Prácticas recientes</h3>
        <Link to="/practicas" className="btn btn--secondary btn--sm">Ver todas las prácticas</Link>
      </div>

      <div className="table-card">
        {practicas.length === 0 ? (
          <div className="table-empty">No hay prácticas registradas</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Alumno</th><th>Empresa</th><th>Carrera</th><th>Tipo</th><th>Estado</th></tr></thead>
            <tbody>
              {practicas.map((p) => {
                const color = estadoVariant(p.estado)
                return (
                  <tr key={p.id}>
                    <td>{userMap[p.alumno_id]            ? fullName(userMap[p.alumno_id])            : '—'}</td>
                    <td>{centroMap[p.centro_practica_id] ? centroMap[p.centro_practica_id].nombre    : '—'}</td>
                    <td>{carreraMap[p.carrera_id]        ? carreraMap[p.carrera_id].nombre           : '—'}</td>
                    <td>{TIPO_PRACTICA_LABELS[p.tipo] ?? p.tipo}</td>
                    <td>
                      <span className="badge" style={{ background: color + '1a', color }}>
                        {ESTADO_PRACTICA_LABELS[p.estado] ?? p.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
