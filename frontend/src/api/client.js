import { mockApi } from './mockApi.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

function getToken() {
  return localStorage.getItem('access_token')
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const padding = '='.repeat((4 - (payload.length % 4)) % 4)
    return JSON.parse(atob(payload + padding))
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }
  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const detail = typeof data === 'object' ? data.detail : data
    throw new Error(
      typeof detail === 'string' ? detail
        : Array.isArray(detail) ? detail.map((d) => d.msg ?? d).join(', ')
        : 'Error en la solicitud',
    )
  }
  return data
}

function qs(params = {}) {
  const q = new URLSearchParams(params).toString()
  return q ? `?${q}` : ''
}

const realApi = {
  decodeToken,

  // ── Auth ──────────────────────────────────────────────────────────────────
  // AuthContext siempre invoca api.login(credentials) con un único objeto,
  // tanto para login normal ({ username, password }) como para el acceso
  // rápido demo ({ demoRole }). El backend real solo sabe autenticar con
  // RUT + contraseña, así que el modo demo no está disponible aquí.
  login({ username, password, demoRole } = {}) {
    if (!username && demoRole) {
      return Promise.reject(
        new Error('El acceso rápido demo no está disponible: ingresa RUT y contraseña.'),
      )
    }
    const body = new URLSearchParams({ username, password })
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then(async (r) => {
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail ?? 'RUT o contraseña incorrectos')
      return data
    })
  },

  // ── Users  →  /users ──────────────────────────────────────────────────────
  getUsers(params = {})       { return request(`/users${qs(params)}`) },
  getUser(id)                 { return request(`/users/${id}`) },
  createUser(data)            { return request('/users', { method: 'POST', body: data }) },
  updateUser(id, data)        { return request(`/users/${id}`, { method: 'PATCH', body: data }) },
  deactivateUser(id)          { return request(`/users/${id}/deactivate`, { method: 'PATCH' }) },

  // ── Centros  →  /academic/centros ─────────────────────────────────────────
  getCentros(params = {})     { return request(`/academic/centros${qs(params)}`) },
  createCentro(data)          { return request('/academic/centros', { method: 'POST', body: data }) },
  updateCentro(id, data)      { return request(`/academic/centros/${id}`, { method: 'PATCH', body: data }) },
  deactivateCentro(id)        { return request(`/academic/centros/${id}/deactivate`, { method: 'PATCH' }) },

  // ── Sedes  →  /academic/sedes ─────────────────────────────────────────────
  getSedes()                  { return request('/academic/sedes') },
  createSede(data)            { return request('/academic/sedes', { method: 'POST', body: data }) },
  updateSede(id, data)        { return request(`/academic/sedes/${id}`, { method: 'PATCH', body: data }) },
  deactivateSede(id)          { return request(`/academic/sedes/${id}/deactivate`, { method: 'PATCH' }) },

  // ── Carreras  →  /academic/carreras ───────────────────────────────────────
  getCarreras()               { return request('/academic/carreras') },
  createCarrera(data)         { return request('/academic/carreras', { method: 'POST', body: data }) },
  updateCarrera(id, data)     { return request(`/academic/carreras/${id}`, { method: 'PATCH', body: data }) },
  deactivateCarrera(id)       { return request(`/academic/carreras/${id}/deactivate`, { method: 'PATCH' }) },

  // ── Prácticas  →  /internships ────────────────────────────────────────────
  getPracticas(params = {})        { return request(`/internships${qs(params)}`) },
  createPractica(data)             { return request('/internships', { method: 'POST', body: data }) },
  updatePracticaEstado(id, estado) { return request(`/internships/${id}/estado`, { method: 'PATCH', body: { estado } }) },
  asignarDocente(id, docente_id)   { return request(`/internships/${id}/docente`, { method: 'PATCH', body: { docente_id } }) },

  // ── Acta 1 ────────────────────────────────────────────────────────────────
  getActa1(practicaId)              { return request(`/internships/${practicaId}/acta1`) },
  updateActa1(practicaId, data)     { return request(`/internships/${practicaId}/acta1`, { method: 'PATCH', body: data }) },
  acceptActa1(practicaId)           { return request(`/internships/${practicaId}/acta1/accept`, { method: 'POST' }) },

  // ── Evaluaciones  →  /evaluations ─────────────────────────────────────────
  createEvaluacionDesempeno(data)       { return request('/evaluations/desempeno', { method: 'POST', body: data }) },
  getEvaluacionDesempeno(id)            { return request(`/evaluations/desempeno/${id}`) },
  updateEvaluacionDesempeno(id, data)   { return request(`/evaluations/desempeno/${id}`, { method: 'PATCH', body: data }) },
  cerrarEvaluacionDesempeno(id)         { return request(`/evaluations/desempeno/${id}/cerrar`, { method: 'POST' }) },

  createEvaluacionInforme(data)         { return request('/evaluations/informe', { method: 'POST', body: data }) },
  getEvaluacionInforme(id)              { return request(`/evaluations/informe/${id}`) },
  updateEvaluacionInforme(id, data)     { return request(`/evaluations/informe/${id}`, { method: 'PATCH', body: data }) },
  cerrarEvaluacionInforme(id)           { return request(`/evaluations/informe/${id}/cerrar`, { method: 'POST' }) },

  getActaFinal(practicaId)              { return request(`/evaluations/acta-final/${practicaId}`) },
  validarActaFinal(practicaId)          { return request(`/evaluations/acta-final/${practicaId}/validar`, { method: 'POST' }) },

  // ── Parámetros de evaluación ──────────────────────────────────────────────
  // Backend: PUT /evaluations/parametros/{carrera_id}
  // Campos: pct_informe (0–1), pct_empleador (0–1)
  getParametros(carreraId)              { return request(`/evaluations/parametros/${carreraId}`) },
  updateParametros(carreraId, data)     { return request(`/evaluations/parametros/${carreraId}`, { method: 'PUT', body: data }) },

  // ── Documentos  →  /documents ─────────────────────────────────────────────
  uploadDocumento(file, practicaId, tipo) {
    const form = new FormData()
    form.append('file', file)
    if (practicaId) form.append('practica_id', practicaId)
    form.append('tipo', tipo)
    return request('/documents/upload', { method: 'POST', body: form })
  },
  getDocumentosPractica(practicaId)     { return request(`/documents/practica/${practicaId}`) },
  uploadMaterialApoyo(file, carreraId, nombre) {
    const form = new FormData()
    form.append('file', file)
    if (carreraId) form.append('carrera_id', carreraId)
    form.append('nombre', nombre)
    return request('/documents/material-apoyo', { method: 'POST', body: form })
  },
  getMaterialApoyo(carreraId)           { return request(`/documents/material-apoyo/${carreraId}`) },
  getDocumentoUrl(docId)                { return `${API_BASE}/documents/${docId}` },

  // ── Notificaciones  →  /notifications ────────────────────────────────────
  enviarAlertaManual(data)              { return request('/notifications/manual-alert', { method: 'POST', body: data }) },
  getHistorialNotificaciones(alumnoId)  { return request(`/notifications/history/${alumnoId}`) },

  // ── Helpers compuestos ────────────────────────────────────────────────────

  // Arma el objeto enriquecido { practica, alumno, centro, carrera, docente, acta1 }
  // que el frontend espera en PracticaDetailPage y DocentePracticaDetailPage.
  // El backend no devuelve estos datos en una sola llamada, hay que componerlos.
  async getPractica(id) {
    const practica = await this.getPracticas({ id })
      .then((list) => (Array.isArray(list) ? list : []).find((p) => p.id === id))
    if (!practica) throw new Error('Práctica no encontrada')

    const [centroRes, carreraRes, alumnoRes, docenteRes, acta1Res] = await Promise.allSettled([
      practica.centro_practica_id ? this.getCentros().then((list) => list.find((c) => c.id === practica.centro_practica_id)) : Promise.resolve(null),
      this.getCarreras().then((list) => list.find((c) => c.id === practica.carrera_id)),
      this.getUser(practica.alumno_id),
      practica.docente_id ? this.getUser(practica.docente_id) : Promise.resolve(null),
      this.getActa1(id),
    ])

    return {
      practica,
      centro:  centroRes.status  === 'fulfilled' ? centroRes.value  : null,
      carrera: carreraRes.status === 'fulfilled' ? carreraRes.value : null,
      alumno:  alumnoRes.status  === 'fulfilled' ? alumnoRes.value  : null,
      docente: docenteRes.status === 'fulfilled' ? docenteRes.value : null,
      acta1:   acta1Res.status   === 'fulfilled' ? acta1Res.value   : null,
    }
  },

  // Práctica del alumno (usa filter por alumno_id)
  async getMyPractica(alumnoId) {
    const list = await this.getPracticas({ alumno_id: alumnoId })
    const practica = Array.isArray(list) ? list[0] : null
    if (!practica) return null

    const [centroRes, carreraRes, docenteRes, acta1Res] = await Promise.allSettled([
      practica.centro_practica_id ? this.getCentros().then((l) => l.find((c) => c.id === practica.centro_practica_id)) : Promise.resolve(null),
      this.getCarreras().then((l) => l.find((c) => c.id === practica.carrera_id)),
      practica.docente_id ? this.getUser(practica.docente_id) : Promise.resolve(null),
      this.getActa1(practica.id),
    ])

    return {
      practica,
      centro:  centroRes.status  === 'fulfilled' ? centroRes.value  : null,
      carrera: carreraRes.status === 'fulfilled' ? carreraRes.value : null,
      docente: docenteRes.status === 'fulfilled' ? docenteRes.value : null,
      acta1:   acta1Res.status   === 'fulfilled' ? acta1Res.value   : null,
    }
  },

  // Prácticas asignadas al docente (filter por docente_id)
  async getMisPracticasDocente(docenteId) {
    const list = await this.getPracticas({ docente_id: docenteId })
    const practicas = Array.isArray(list) ? list : []

    return Promise.all(practicas.map(async (practica) => {
      const [centroRes, carreraRes, alumnoRes, acta1Res] = await Promise.allSettled([
        practica.centro_practica_id ? this.getCentros().then((l) => l.find((c) => c.id === practica.centro_practica_id)) : Promise.resolve(null),
        this.getCarreras().then((l) => l.find((c) => c.id === practica.carrera_id)),
        this.getUser(practica.alumno_id),
        this.getActa1(practica.id),
      ])
      return {
        practica,
        centro:  centroRes.status  === 'fulfilled' ? centroRes.value  : null,
        carrera: carreraRes.status === 'fulfilled' ? carreraRes.value : null,
        alumno:  alumnoRes.status  === 'fulfilled' ? alumnoRes.value  : null,
        acta1:   acta1Res.status   === 'fulfilled' ? acta1Res.value   : null,
      }
    }))
  },

  // Prácticas del empleador: el backend no filtra por empleador_id.
  // Se resuelve obteniendo los centros cuyo correo_contacto coincide
  // con el email del empleador autenticado, y filtrando prácticas por esos centros.
  async getMisPracticasEmpleador(empleadorId) {
    const [empleador, centrosData, practicasData] = await Promise.all([
      this.getUser(empleadorId),
      this.getCentros(),
      this.getPracticas(),
    ])

    const centros = Array.isArray(centrosData) ? centrosData : []
    const practicas = Array.isArray(practicasData) ? practicasData : []

    // Relacionar empleador ↔ centro por correo_contacto
    const misCentroIds = new Set(
      centros
        .filter((c) => c.correo_contacto && c.correo_contacto === empleador?.email)
        .map((c) => c.id)
    )

    const misPracticas = practicas.filter(
      (p) => p.centro_practica_id && misCentroIds.has(p.centro_practica_id)
    )

    return Promise.all(misPracticas.map(async (practica) => {
      const [alumnoRes, carreraRes] = await Promise.allSettled([
        this.getUser(practica.alumno_id),
        this.getCarreras().then((l) => l.find((c) => c.id === practica.carrera_id)),
      ])
      return {
        practica,
        alumno:  alumnoRes.status  === 'fulfilled' ? alumnoRes.value  : null,
        carrera: carreraRes.status === 'fulfilled' ? carreraRes.value : null,
        centro:  centros.find((c) => c.id === practica.centro_practica_id) ?? null,
      }
    }))
  },

  // El backend no tiene GET /evaluations/desempeno?practica_id=X.
  // Se usa el acta final (que sí existe) para obtener las notas,
  // y el ID de la evaluación se guarda en sessionStorage cuando se crea.
  async getEvaluacionesDesempenoPorPractica(practicaId) {
    const storedId = sessionStorage.getItem(`eval_desempeno_${practicaId}`)
    if (storedId) {
      try {
        const ev = await this.getEvaluacionDesempeno(storedId)
        return [ev]
      } catch { /* ID guardado puede ser inválido */ }
    }
    // Fallback: leer del acta final (solo nota, sin ítems)
    try {
      const acta = await this.getActaFinal(practicaId)
      if (acta.nota_empleador != null) {
        return [{ id: null, practica_id: practicaId, nota: acta.nota_empleador, estado: 'CERRADA', items: [] }]
      }
    } catch { /* práctica sin acta aún */ }
    return []
  },

  async getEvaluacionesInformePorPractica(practicaId) {
    const storedId = sessionStorage.getItem(`eval_informe_${practicaId}`)
    if (storedId) {
      try {
        const ev = await this.getEvaluacionInforme(storedId)
        return [ev]
      } catch { /* ID guardado puede ser inválido */ }
    }
    try {
      const acta = await this.getActaFinal(practicaId)
      if (acta.nota_informe != null) {
        return [{ id: null, practica_id: practicaId, nota: acta.nota_informe, estado: 'CERRADA', items: [] }]
      }
    } catch { /* práctica sin acta aún */ }
    return []
  },

  // Versiones con persistencia de ID en sessionStorage
  async createEvaluacionDesempenoTracked(data) {
    const ev = await this.createEvaluacionDesempeno(data)
    sessionStorage.setItem(`eval_desempeno_${data.practica_id}`, ev.id)
    return ev
  },

  async createEvaluacionInformeTracked(data) {
    const ev = await this.createEvaluacionInforme(data)
    sessionStorage.setItem(`eval_informe_${data.practica_id}`, ev.id)
    return ev
  },

  // Stats para el dashboard (compuesto en el front)
  async getDashboardStats() {
    const [practicasData, usersData, centrosData] = await Promise.all([
      this.getPracticas(),
      this.getUsers(),
      this.getCentros(),
    ])
    const p = Array.isArray(practicasData) ? practicasData : []
    const u = usersData?.items ?? []
    const c = Array.isArray(centrosData) ? centrosData : []
    return {
      total:      p.length,
      enCurso:    p.filter((x) => x.estado === 'EN_CURSO').length,
      borrador:   p.filter((x) => x.estado === 'BORRADOR').length,
      finalizada: p.filter((x) => x.estado === 'FINALIZADA').length,
      alumnos:    u.filter((u) => u.rol === 'ALUMNO' && u.is_active).length,
      empresas:   c.filter((c) => c.is_active).length,
    }
  },
}

export const api = USE_MOCK ? mockApi : realApi
export const isMockMode = USE_MOCK
