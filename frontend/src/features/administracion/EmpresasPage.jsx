import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const EMPTY_FORM = {
  nombre: '',
  giro: '',
  nombre_gerente: '',
  telefono: '',
  correo: '',
  nombre_contacto: '',
  correo_contacto: '',
  direccion: '',
}

function CentroForm({ form, onChange, isEdit }) {
  return (
    <div className="form-grid">
      <label>
        Nombre
        <input
          value={form.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          required
        />
      </label>
      <label>
        Giro
        <input value={form.giro} onChange={(e) => onChange('giro', e.target.value)} />
      </label>
      <label>
        Gerente
        <input
          value={form.nombre_gerente}
          onChange={(e) => onChange('nombre_gerente', e.target.value)}
        />
      </label>
      <label>
        Teléfono
        <input value={form.telefono} onChange={(e) => onChange('telefono', e.target.value)} />
      </label>
      <label>
        Correo
        <input
          type="email"
          value={form.correo}
          onChange={(e) => onChange('correo', e.target.value)}
        />
      </label>
      <label>
        Contacto
        <input
          value={form.nombre_contacto}
          onChange={(e) => onChange('nombre_contacto', e.target.value)}
        />
      </label>
      <label>
        Correo contacto
        <input
          type="email"
          value={form.correo_contacto}
          onChange={(e) => onChange('correo_contacto', e.target.value)}
        />
      </label>
      <label className="form-grid-full">
        Dirección
        <input value={form.direccion} onChange={(e) => onChange('direccion', e.target.value)} />
      </label>
      {isEdit && (
        <label className="form-checkbox form-grid-full">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => onChange('is_active', e.target.checked)}
          />
          Empresa activa
        </label>
      )}
    </div>
  )
}

export default function EmpresasPage() {
  const [centros, setCentros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadCentros = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getCentros({ limit: 200 })
      setCentros(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCentros()
  }, [loadCentros])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return centros
    return centros.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.giro ?? '').toLowerCase().includes(q) ||
        (c.correo ?? '').toLowerCase().includes(q) ||
        (c.nombre_contacto ?? '').toLowerCase().includes(q),
    )
  }, [centros, search])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setModal('create')
  }

  const openEdit = (centro) => {
    setForm({
      nombre: centro.nombre,
      giro: centro.giro ?? '',
      nombre_gerente: centro.nombre_gerente ?? '',
      telefono: centro.telefono ?? '',
      correo: centro.correo ?? '',
      nombre_contacto: centro.nombre_contacto ?? '',
      correo_contacto: centro.correo_contacto ?? '',
      direccion: centro.direccion ?? '',
      is_active: centro.is_active,
    })
    setModal({ type: 'edit', id: centro.id })
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Desactivar este centro de práctica?')) return
    try {
      await api.deactivateCentro(id)
      await loadCentros()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modal === 'create') {
        await api.createCentro(form)
      } else {
        await api.updateCentro(modal.id, form)
      }
      setModal(null)
      await loadCentros()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Empresas</h2>
          <p className="page-subtitle">Administra los centros de práctica registrados</p>
        </div>
      </div>

      <div className="page-toolbar">
        <SearchInput value={search} onChange={setSearch} />
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Empresa
        </button>
      </div>

      {error && !modal && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando empresas...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">No se encontraron empresas</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Giro</th>
                <th>Contacto</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((centro) => (
                <tr key={centro.id}>
                  <td>{centro.nombre}</td>
                  <td>{centro.giro ?? '—'}</td>
                  <td>{centro.nombre_contacto ?? '—'}</td>
                  <td>{centro.correo ?? '—'}</td>
                  <td>
                    <Badge variant={centro.is_active ? 'active' : 'inactive'}>
                      {centro.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => openEdit(centro)}
                    >
                      Modificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Añadir Empresa' : 'Modificar Empresa'}
          onClose={() => setModal(null)}
          wide
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert--error">{error}</div>}
            <CentroForm form={form} onChange={handleChange} isEdit={modal !== 'create'} />
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
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
