import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'

const EMPTY_FORM = {
  direccion_centro: '',
  departamento: '',
  nombre_jefe_directo: '',
  cargo_jefe_directo: '',
  contacto_correo: '',
  contacto_telefono: '',
  practica_a_distancia: false,
  tareas_principales: '',
}

export default function Acta1Page() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [practicaId, setPracticaId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [completada, setCompletada] = useState(false)
  const [aceptada, setAceptada] = useState(false)
  const [fechaLimite, setFechaLimite] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    setError('')
    try {
      const myPractica = await api.getMyPractica(profile.id)
      if (!myPractica?.practica) {
        setError('No tienes una práctica asignada')
        return
      }
      setPracticaId(myPractica.practica.id)
      const acta = await api.getActa1(myPractica.practica.id)
      setForm({
        direccion_centro: acta.direccion_centro ?? '',
        departamento: acta.departamento ?? '',
        nombre_jefe_directo: acta.nombre_jefe_directo ?? '',
        cargo_jefe_directo: acta.cargo_jefe_directo ?? '',
        contacto_correo: acta.contacto_correo ?? '',
        contacto_telefono: acta.contacto_telefono ?? '',
        practica_a_distancia: acta.practica_a_distancia ?? false,
        tareas_principales: acta.tareas_principales ?? '',
      })
      setCompletada(acta.completada_alumno)
      setAceptada(acta.aceptada_docente)
      setFechaLimite(acta.fecha_limite_alumno ?? '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    load()
  }, [load])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!practicaId) return
    setSaving(true)
    setError('')
    try {
      await api.updateActa1(practicaId, { ...form, completada_alumno: true })
      navigate('/mi-practica')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="page"><div className="table-empty">Cargando Acta 1...</div></div>
  }

  const readOnly = completada || aceptada

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Acta 1</h2>
          <p className="page-subtitle">Completa los datos de tu centro de práctica</p>
        </div>
        {completada && (
          <Badge variant={aceptada ? 'active' : 'role'}>
            {aceptada ? 'Aceptada por docente' : 'En revisión'}
          </Badge>
        )}
      </div>

      {fechaLimite && !completada && (
        <div className="alert alert--info">Fecha límite para completar: {fechaLimite}</div>
      )}

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-grid-full">
            Dirección del centro
            <input
              value={form.direccion_centro}
              onChange={(e) => handleChange('direccion_centro', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label>
            Departamento / área
            <input
              value={form.departamento}
              onChange={(e) => handleChange('departamento', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label>
            Nombre jefe directo
            <input
              value={form.nombre_jefe_directo}
              onChange={(e) => handleChange('nombre_jefe_directo', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label>
            Cargo jefe directo
            <input
              value={form.cargo_jefe_directo}
              onChange={(e) => handleChange('cargo_jefe_directo', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label>
            Correo de contacto
            <input
              type="email"
              value={form.contacto_correo}
              onChange={(e) => handleChange('contacto_correo', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label>
            Teléfono de contacto
            <input
              value={form.contacto_telefono}
              onChange={(e) => handleChange('contacto_telefono', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
          <label className="form-checkbox form-grid-full">
            <input
              type="checkbox"
              checked={form.practica_a_distancia}
              onChange={(e) => handleChange('practica_a_distancia', e.target.checked)}
              disabled={readOnly}
            />
            Práctica a distancia
          </label>
          <label className="form-grid-full">
            Tareas principales
            <textarea
              rows={4}
              value={form.tareas_principales}
              onChange={(e) => handleChange('tareas_principales', e.target.value)}
              required
              disabled={readOnly}
            />
          </label>
        </div>

        {!readOnly && (
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Enviar Acta 1'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
