import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import UserSearchSelect from '../../components/ui/UserSearchSelect'
import { ESTADO_PRACTICA_LABELS, TIPO_PRACTICA_LABELS, fullName } from '../../utils/format'

const EMPTY_FORM = { alumno_id: '', carrera_id: '', centro_practica_id: '', tipo: 'LABORAL', fecha_inicio: '', docente_id: '' }

function estadoVariant(estado) {
  if (estado === 'EN_CURSO')   return 'active'
  if (estado === 'FINALIZADA') return 'role'
  if (estado === 'CANCELADA')  return 'inactive'
  return 'employer'
}

export default function PracticasPage() {
  const [practicas, setPracticas] = useState([])
  const [users, setUsers]         = useState([])
  const [centros, setCentros]     = useState([])
  const [carreras, setCarreras]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [p, u, c, car] = await Promise.all([
        api.getPracticas(), api.getUsers(), api.getCentros(), api.getCarreras(),
      ])
      setPracticas(Array.isArray(p) ? p : [])
      setUsers(u.items ?? [])
      setCentros(Array.isArray(c) ? c : [])
      setCarreras(Array.isArray(car) ? car : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const userMap    = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])
  const centroMap  = useMemo(() => Object.fromEntries(centros.map((c) => [c.id, c])), [centros])
  const carreraMap = useMemo(() => Object.fromEntries(carreras.map((c) => [c.id, c])), [carreras])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return practicas
    return practicas.filter((p) => {
      const hay = [
        userMap[p.alumno_id]           ? fullName(userMap[p.alumno_id])       : '',
        centroMap[p.centro_practica_id] ? centroMap[p.centro_practica_id].nombre : '',
        carreraMap[p.carrera_id]        ? carreraMap[p.carrera_id].nombre       : '',
        p.tipo, p.estado,
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [practicas, search, userMap, centroMap, carreraMap])

  const set      = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await api.createPractica({
        alumno_id:        form.alumno_id,
        carrera_id:       form.carrera_id,
        centro_practica_id: form.centro_practica_id || null,
        tipo:             form.tipo,
        fecha_inicio:     form.fecha_inicio,
        docente_id:       form.docente_id || null,
      })
      setModal(false)
      await load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Prácticas</h2>
          <p className="page-subtitle">Gestiona las prácticas registradas</p>
        </div>
      </div>

      <div className="page-toolbar">
        <SearchInput value={search} onChange={setSearch} />
        <button className="btn btn--primary" onClick={() => { setForm(EMPTY_FORM); setError(''); setModal(true) }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Práctica
        </button>
      </div>

      {error && !modal && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? <div className="table-empty">Cargando...</div>
          : filtered.length === 0 ? <div className="table-empty">No se encontraron prácticas</div>
          : (
          <table className="data-table">
            <thead><tr>
              <th>Alumno</th><th>Empresa</th><th>Carrera</th><th>Tipo</th><th>Inicio</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{userMap[p.alumno_id]            ? fullName(userMap[p.alumno_id])            : '—'}</td>
                  <td>{centroMap[p.centro_practica_id] ? centroMap[p.centro_practica_id].nombre    : '—'}</td>
                  <td>{carreraMap[p.carrera_id]        ? carreraMap[p.carrera_id].nombre           : '—'}</td>
                  <td><Badge variant="role">{TIPO_PRACTICA_LABELS[p.tipo] ?? p.tipo}</Badge></td>
                  <td>{p.fecha_inicio}</td>
                  <td><Badge variant={estadoVariant(p.estado)}>{ESTADO_PRACTICA_LABELS[p.estado] ?? p.estado}</Badge></td>
                  <td><Link to={`/practicas/${p.id}`} className="btn btn--secondary btn--sm">Ver detalle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Nueva Práctica" onClose={() => setModal(false)} wide>
          <form onSubmit={handleSave}>
            {error && <div className="alert alert--error">{error}</div>}
            <div className="form-grid">
              <label>Alumno
                <UserSearchSelect
                  users={users}
                  value={form.alumno_id}
                  onChange={(id) => set('alumno_id', id)}
                  placeholder="Buscar alumno por nombre o RUT..."
                  filterFn={(u) => u.rol === 'ALUMNO' && u.is_active}
                  required
                />
              </label>
              <label>Carrera
                <select value={form.carrera_id} onChange={(e) => set('carrera_id', e.target.value)} required>
                  <option value="">Seleccionar carrera...</option>
                  {carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </label>
              <label>Empresa / Centro
                <select value={form.centro_practica_id} onChange={(e) => set('centro_practica_id', e.target.value)}>
                  <option value="">Sin asignar</option>
                  {centros.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </label>
              <label>Tipo
                <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                  <option value="LABORAL">Laboral</option>
                  <option value="PROFESIONAL">Profesional</option>
                </select>
              </label>
              <label>Fecha de inicio
                <input type="date" value={form.fecha_inicio} onChange={(e) => set('fecha_inicio', e.target.value)} required />
              </label>
              <label>Docente guía
                <UserSearchSelect
                  users={users}
                  value={form.docente_id}
                  onChange={(id) => set('docente_id', id)}
                  placeholder="Buscar docente por nombre o RUT..."
                  filterFn={(u) => u.rol === 'DOCENTE' && u.is_active}
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear práctica'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
