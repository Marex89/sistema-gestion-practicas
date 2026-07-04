import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

// ────────────────────────────────────────────────────────────────────────────
// Sedes
// ────────────────────────────────────────────────────────────────────────────

const EMPTY_SEDE = { nombre: '' }

function SedeForm({ form, onChange, isEdit }) {
  return (
    <div className="form-grid">
      <label className="form-grid-full">
        Nombre de la sede
        <input
          value={form.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          placeholder="Casa Central Valparaíso"
          required
        />
      </label>
      {isEdit && (
        <label className="form-checkbox form-grid-full">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => onChange('is_active', e.target.checked)}
          />
          Sede activa
        </label>
      )}
    </div>
  )
}

function SedesSection({ sedes, loading, error, search, onSearch, onReload }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_SEDE)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return sedes
    return sedes.filter((s) => s.nombre.toLowerCase().includes(q))
  }, [sedes, search])

  const openCreate = () => {
    setForm(EMPTY_SEDE)
    setFormError('')
    setModal('create')
  }

  const openEdit = (sede) => {
    setForm({ nombre: sede.nombre, is_active: sede.is_active })
    setFormError('')
    setModal({ type: 'edit', id: sede.id })
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (modal === 'create') {
        await api.createSede(form)
      } else {
        await api.updateSede(modal.id, form)
      }
      setModal(null)
      await onReload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="page-toolbar">
        <SearchInput value={search} onChange={onSearch} placeholder="Buscar sede..." />
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Sede
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando sedes...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">No se encontraron sedes</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Sede</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sede) => (
                <tr key={sede.id}>
                  <td>{sede.nombre}</td>
                  <td>
                    <Badge variant={sede.is_active ? 'active' : 'inactive'}>
                      {sede.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => openEdit(sede)}
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
          title={modal === 'create' ? 'Añadir Sede' : 'Modificar Sede'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSave}>
            {formError && <div className="alert alert--error">{formError}</div>}
            <SedeForm form={form} onChange={handleChange} isEdit={modal !== 'create'} />
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
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Carreras
// ────────────────────────────────────────────────────────────────────────────

function buildEmptyCarrera(sedes) {
  return {
    nombre: '',
    sede_id: sedes[0]?.id ?? '',
    horas_laboral: 240,
    horas_profesional: 360,
  }
}

function CarreraForm({ form, onChange, sedes, isEdit }) {
  return (
    <div className="form-grid">
      <label className="form-grid-full">
        Nombre de la carrera
        <input
          value={form.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          placeholder="Ingeniería Civil Informática"
          required
        />
      </label>
      <label className="form-grid-full">
        Sede
        <select value={form.sede_id} onChange={(e) => onChange('sede_id', e.target.value)} required>
          <option value="" disabled>Selecciona una sede</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Horas práctica laboral
        <input
          type="number"
          min="0"
          value={form.horas_laboral}
          onChange={(e) => onChange('horas_laboral', Number(e.target.value))}
          required
        />
      </label>
      <label>
        Horas práctica profesional
        <input
          type="number"
          min="0"
          value={form.horas_profesional}
          onChange={(e) => onChange('horas_profesional', Number(e.target.value))}
          required
        />
      </label>
      {isEdit && (
        <label className="form-checkbox form-grid-full">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => onChange('is_active', e.target.checked)}
          />
          Carrera activa
        </label>
      )}
    </div>
  )
}

function CarrerasSection({ sedes }) {
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(buildEmptyCarrera(sedes))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadCarreras = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getCarreras()
      setCarreras(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCarreras()
  }, [loadCarreras])

  const sedeMap = useMemo(() => Object.fromEntries(sedes.map((s) => [s.id, s])), [sedes])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return carreras
    return carreras.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (sedeMap[c.sede_id]?.nombre ?? '').toLowerCase().includes(q),
    )
  }, [carreras, search, sedeMap])

  const openCreate = () => {
    setForm(buildEmptyCarrera(sedes))
    setFormError('')
    setModal('create')
  }

  const openEdit = (carrera) => {
    setForm({
      nombre: carrera.nombre,
      sede_id: carrera.sede_id,
      horas_laboral: carrera.horas_laboral,
      horas_profesional: carrera.horas_profesional,
      is_active: carrera.is_active,
    })
    setFormError('')
    setModal({ type: 'edit', id: carrera.id })
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (modal === 'create') {
        await api.createCarrera(form)
      } else {
        await api.updateCarrera(modal.id, form)
      }
      setModal(null)
      await loadCarreras()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const noSedes = sedes.length === 0

  return (
    <section className="page-section">
      <div className="page-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar carrera..." />
        <button type="button" className="btn btn--primary" onClick={openCreate} disabled={noSedes}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Carrera
        </button>
      </div>

      {noSedes && (
        <div className="alert alert--info">Crea al menos una sede antes de registrar carreras.</div>
      )}
      {error && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando carreras...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">No se encontraron carreras</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Carrera</th>
                <th>Sede</th>
                <th>Hrs. Laboral</th>
                <th>Hrs. Profesional</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((carrera) => (
                <tr key={carrera.id}>
                  <td>{carrera.nombre}</td>
                  <td>{sedeMap[carrera.sede_id]?.nombre ?? '—'}</td>
                  <td>{carrera.horas_laboral}</td>
                  <td>{carrera.horas_profesional}</td>
                  <td>
                    <Badge variant={carrera.is_active ? 'active' : 'inactive'}>
                      {carrera.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => openEdit(carrera)}
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
          title={modal === 'create' ? 'Añadir Carrera' : 'Modificar Carrera'}
          onClose={() => setModal(null)}
          wide
        >
          <form onSubmit={handleSave}>
            {formError && <div className="alert alert--error">{formError}</div>}
            <CarreraForm form={form} onChange={handleChange} sedes={sedes} isEdit={modal !== 'create'} />
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
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Página principal — caso de uso "Administrar Sedes y Carreras"
// ────────────────────────────────────────────────────────────────────────────

export default function SedesCarrerasPage() {
  const [tab, setTab] = useState('carreras')
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const loadSedes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getSedes()
      setSedes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSedes()
  }, [loadSedes])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Carreras y Sedes</h2>
          <p className="page-subtitle">
            Administra las carreras académicas y las sedes institucionales asociadas
          </p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'carreras'}
          className={`tab${tab === 'carreras' ? ' tab--active' : ''}`}
          onClick={() => setTab('carreras')}
        >
          Carreras
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sedes'}
          className={`tab${tab === 'sedes' ? ' tab--active' : ''}`}
          onClick={() => setTab('sedes')}
        >
          Sedes
        </button>
      </div>

      {tab === 'sedes' ? (
        <SedesSection
          sedes={sedes}
          loading={loading}
          error={error}
          search={search}
          onSearch={setSearch}
          onReload={loadSedes}
        />
      ) : (
        <CarrerasSection sedes={sedes} />
      )}
    </div>
  )
}
