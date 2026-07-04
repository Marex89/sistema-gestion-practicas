import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatRut, fullName, ROLE_LABELS } from '../../utils/format'
import { canManageUser, getAllowedRoles } from '../../utils/routes'

const EMPTY_FORM = {
  rut: '', nombre: '', apellido: '', email: '', password: '', rol: 'ALUMNO',
}

function UserForm({ form, onChange, isEdit, allowedRoles }) {
  return (
    <div className="form-grid">
      <label>RUT
        <input value={form.rut} onChange={(e) => onChange('rut', e.target.value)}
          placeholder="12.345.678-9" required />
      </label>
      <label>Nombre
        <input value={form.nombre} onChange={(e) => onChange('nombre', e.target.value)} required />
      </label>
      <label>Apellido
        <input value={form.apellido} onChange={(e) => onChange('apellido', e.target.value)} required />
      </label>
      <label>Correo Institucional
        <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)}
          placeholder="usuario@usm.cl" required />
      </label>
      <label>Rol
        <select value={form.rol} onChange={(e) => onChange('rol', e.target.value)}>
          {allowedRoles.map((rol) => (
            <option key={rol} value={rol}>{ROLE_LABELS[rol]}</option>
          ))}
        </select>
      </label>
      <label>{isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        <input type="password" value={form.password}
          onChange={(e) => onChange('password', e.target.value)} required={!isEdit} />
      </label>
      {isEdit && (
        <label className="form-checkbox">
          <input type="checkbox" checked={form.is_active ?? true}
            onChange={(e) => onChange('is_active', e.target.checked)} />
          Usuario activo
        </label>
      )}
    </div>
  )
}

export default function AccesosPage() {
  const { profile } = useAuth()
  const myRol = profile?.rol ?? 'COORDINADOR'
  const allowedRoles = getAllowedRoles(myRol)

  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await api.getUsers({ limit: 500 })
      setUsers(data.items ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  // Solo mostrar usuarios que el actor puede gestionar
  const manageable = useMemo(
    () => users.filter((u) => canManageUser(myRol, u.rol)),
    [users, myRol]
  )

  const filtered = useMemo(() => {
    let result = manageable
    if (roleFilter) result = result.filter((u) => u.rol === roleFilter)
    const q = search.toLowerCase().trim()
    if (!q) return result
    return result.filter((u) =>
      fullName(u).toLowerCase().includes(q) ||
      u.rut.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (ROLE_LABELS[u.rol] ?? u.rol).toLowerCase().includes(q)
    )
  }, [manageable, search, roleFilter])

  const openCreate = () => {
    const defaultRol = allowedRoles.includes('ALUMNO') ? 'ALUMNO' : (allowedRoles[0] ?? 'ALUMNO')
    setForm({ ...EMPTY_FORM, rol: defaultRol })
    setError('')
    setModal('create')
  }

  const openEdit = (user) => {
    setForm({
      rut: user.rut, nombre: user.nombre, apellido: user.apellido,
      email: user.email, password: '', rol: user.rol, is_active: user.is_active,
    })
    setError('')
    setModal({ type: 'edit', id: user.id })
  }

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (modal === 'create') {
        await api.createUser(form)
      } else {
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await api.updateUser(modal.id, payload)
      }
      setModal(null)
      await loadUsers()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const roleBadgeVariant = (rol) => rol === 'EMPLEADOR' ? 'employer' : 'role'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Accesos</h2>
          <p className="page-subtitle">Administra los usuarios con acceso al sistema</p>
        </div>
      </div>

      <div className="page-toolbar">
        <SearchInput value={search} onChange={setSearch} />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 14, color: 'var(--text-primary)' }}
        >
          <option value="">Todos los roles</option>
          {allowedRoles.map((rol) => (
            <option key={rol} value={rol}>{ROLE_LABELS[rol]}</option>
          ))}
        </select>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Usuario
        </button>
      </div>

      {error && !modal && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">No se encontraron usuarios</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th><th>RUT</th><th>Correo Institucional</th>
                <th>Rol</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{fullName(user)}</td>
                  <td>{formatRut(user.rut)}</td>
                  <td>{user.email}</td>
                  <td><Badge variant={roleBadgeVariant(user.rol)}>{ROLE_LABELS[user.rol] ?? user.rol}</Badge></td>
                  <td><Badge variant={user.is_active ? 'active' : 'inactive'}>{user.is_active ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td>
                    {canManageUser(myRol, user.rol) ? (
                      <button type="button" className="btn btn--secondary btn--sm" onClick={() => openEdit(user)}>
                        Modificar
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin permiso</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Añadir Usuario' : 'Modificar Usuario'}
          onClose={() => setModal(null)}
          wide
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert--error">{error}</div>}
            <UserForm
              form={form}
              onChange={handleChange}
              isEdit={modal !== 'create'}
              allowedRoles={allowedRoles}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
