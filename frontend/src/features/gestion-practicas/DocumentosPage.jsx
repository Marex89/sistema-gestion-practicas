import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../api/client'

const TIPOS_DOCUMENTO = ['INFORME_PRACTICA', 'ACTA_EVALUACION', 'FOTO_ALUMNO', 'OTRO']

const TIPO_LABELS = {
  INFORME_PRACTICA: 'Informe de práctica',
  ACTA_EVALUACION:  'Acta de evaluación',
  FOTO_ALUMNO:      'Foto alumno',
  OTRO:             'Otro',
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

export default function DocumentosPage() {
  const { id: practicaId } = useParams()
  const [docs, setDocs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [tipo, setTipo]     = useState(TIPOS_DOCUMENTO[0])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadOk, setUploadOk] = useState('')
  const fileRef = useRef(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getDocumentosPractica(practicaId)
      setDocs(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [practicaId])

  useEffect(() => { loadDocs() }, [loadDocs])

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    setUploadOk('')
    try {
      await api.uploadDocumento(file, practicaId, tipo)
      fileRef.current.value = ''
      setUploadOk(`"${file.name}" subido correctamente.`)
      await loadDocs()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/practicas/${practicaId}`} className="btn btn--secondary btn--sm">← Volver</Link>
          <div>
            <h2 className="page-title">Documentos</h2>
            <p className="page-subtitle">Archivos asociados a esta práctica</p>
          </div>
        </div>
      </div>

      {/* Subir documento */}
      <div className="tasks-card" style={{ marginBottom: 24 }}>
        <h3>Subir documento</h3>
        <form onSubmit={handleUpload}>
          <div className="form-grid">
            <label>
              Tipo de documento
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                ))}
              </select>
            </label>
            <label>
              Archivo
              <input type="file" ref={fileRef} required />
            </label>
          </div>
          {uploadError && <div className="alert alert--error" style={{ marginBottom: 12 }}>{uploadError}</div>}
          {uploadOk    && <div className="alert alert--info"  style={{ marginBottom: 12 }}>{uploadOk}</div>}
          <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn--primary" disabled={uploading}>
              <UploadIcon />
              {uploading ? 'Subiendo...' : 'Subir archivo'}
            </button>
          </div>
        </form>
      </div>

      {/* Listado */}
      {error && <div className="alert alert--error">{error}</div>}

      <div className="table-card">
        {loading ? (
          <div className="table-empty">Cargando documentos...</div>
        ) : docs.length === 0 ? (
          <div className="table-empty">No hay documentos subidos para esta práctica.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileIcon />
                    {doc.nombre}
                  </td>
                  <td>{TIPO_LABELS[doc.tipo] ?? doc.tipo}</td>
                  <td>{doc.tamanio_kb ? `${doc.tamanio_kb} KB` : '—'}</td>
                  <td>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-CL') : '—'}</td>
                  <td>
                    <a
                      href={api.getDocumentoUrl(doc.id)}
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
