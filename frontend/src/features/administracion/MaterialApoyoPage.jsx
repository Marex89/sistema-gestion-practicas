import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export default function MaterialApoyoPage() {
  const [carreras, setCarreras]   = useState([])
  const [carreraId, setCarreraId] = useState('')
  const [materiales, setMateriales] = useState([])
  const [loading, setLoading]     = useState(false)
  const [nombre, setNombre]       = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadOk, setUploadOk]   = useState('')
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    api.getCarreras()
      .then((data) => {
        const activas = (Array.isArray(data) ? data : []).filter((c) => c.is_active !== false)
        setCarreras(activas)
        if (activas.length) setCarreraId(activas[0].id)
      })
      .catch(() => {})
  }, [])

  const loadMateriales = useCallback(async () => {
    if (!carreraId) return
    setLoading(true)
    try {
      const data = await api.getMaterialApoyo(carreraId)
      setMateriales(Array.isArray(data) ? data : [])
    } catch {
      setMateriales([])
    } finally {
      setLoading(false)
    }
  }, [carreraId])

  useEffect(() => { loadMateriales() }, [loadMateriales])

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file || !carreraId) return
    setUploading(true); setUploadOk(''); setUploadErr('')
    try {
      await api.uploadMaterialApoyo(file, carreraId, nombre || file.name)
      fileRef.current.value = ''
      setNombre('')
      setUploadOk(`"${nombre || file.name}" subido correctamente.`)
      await loadMateriales()
    } catch (err) {
      setUploadErr(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Material de Apoyo</h2>
          <p className="page-subtitle">Documentos y recursos de apoyo para los alumnos, organizados por carrera</p>
        </div>
      </div>

      {/* Selector de carrera */}
      <div className="tasks-card" style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Carrera</span>
          <select
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', fontSize: 14 }}
          >
            {carreras.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Subir material */}
      <div className="tasks-card" style={{ marginBottom: 24 }}>
        <h3>Subir material</h3>
        <form onSubmit={handleUpload}>
          <div className="form-grid">
            <label>
              Nombre del documento
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Guía de práctica profesional..."
              />
            </label>
            <label>
              Archivo
              <input type="file" ref={fileRef} required />
            </label>
          </div>
          {uploadErr && <div className="alert alert--error" style={{ marginBottom: 12 }}>{uploadErr}</div>}
          {uploadOk  && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{uploadOk}</div>}
          <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn--primary" disabled={uploading || !carreraId}>
              <UploadIcon />
              {uploading ? 'Subiendo...' : 'Subir documento'}
            </button>
          </div>
        </form>
      </div>

      {/* Listado */}
      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando material...</div>
        ) : materiales.length === 0 ? (
          <div className="table-empty">No hay material de apoyo subido para esta carrera aún.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Archivo</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m) => (
                <tr key={m.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileIcon />
                    {m.nombre}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{m.filename}</td>
                  <td>{m.tamanio_kb ? `${m.tamanio_kb} KB` : '—'}</td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString('es-CL') : '—'}</td>
                  <td>
                    <a
                      href={api.getDocumentoUrl(m.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--secondary btn--sm"
                    >
                      Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
