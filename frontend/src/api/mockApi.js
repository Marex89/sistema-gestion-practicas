import {
  MOCK_COORDINADOR_ID,
  MOCK_ALUMNO_ID,
  MOCK_DOCENTE_ID,
  MOCK_EMPLEADOR_ID,
  initialActas1,
  initialCentros,
  initialCarreras,
  initialSedes,
  initialEvaluaciones,
  initialPracticas,
  initialUsers,
} from './mockData.js'

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms))

// ── Mutable state ──────────────────────────────────────────────────────────
let users     = structuredClone(initialUsers)
let centros   = structuredClone(initialCentros)
let carreras  = structuredClone(initialCarreras)
let sedes     = structuredClone(initialSedes)
let practicas = structuredClone(initialPracticas)
let actas1    = structuredClone(initialActas1)
let evalDesempeno = structuredClone(initialEvaluaciones.desempeno)
let evalInforme   = structuredClone(initialEvaluaciones.informe)
let mockDocumentos = []
let mockAlertas    = []

// ── Helpers ────────────────────────────────────────────────────────────────
const newId = () => crypto.randomUUID()

function createMockToken(userId, role) {
  const payload = btoa(JSON.stringify({ sub: userId, role, exp: Math.floor(Date.now() / 1000) + 86400 }))
  return `mock.${payload}.dev`
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

const DEMO_USERS = {
  COORDINADOR:  MOCK_COORDINADOR_ID,
  ALUMNO:       MOCK_ALUMNO_ID,
  DOCENTE:      MOCK_DOCENTE_ID,
  EMPLEADOR:    MOCK_EMPLEADOR_ID,
  JEFE_CARRERA: 'e5555555-5555-5555-5555-555555555555',
  SUPER_ADMIN:  'f6666666-6666-6666-6666-666666666666',
}

function resolveDemoUser({ demoRole, username } = {}) {
  const normalized = (username ?? '').toLowerCase()
  // Detect role from username text
  for (const [rol, id] of Object.entries(DEMO_USERS)) {
    if (normalized.includes(rol.toLowerCase())) {
      return users.find((u) => u.id === id)
    }
  }
  if (demoRole && DEMO_USERS[demoRole]) {
    return users.find((u) => u.id === DEMO_USERS[demoRole])
  }
  return users.find((u) => u.id === MOCK_COORDINADOR_ID)
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const mockApi = {
  decodeToken,

  async login(credentials = {}) {
    await delay()
    const user = resolveDemoUser(credentials)
    return { access_token: createMockToken(user.id, user.rol), token_type: 'bearer' }
  },

  // ── Users (auth-service /users) ─────────────────────────────────────────
  async getUsers(params = {}) {
    await delay()
    let items = [...users]
    if (params.rol) items = items.filter((u) => u.rol === params.rol)
    return { total: items.length, skip: 0, limit: 200, items }
  },

  async getUser(id) {
    await delay()
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error('Usuario no encontrado')
    return user
  },

  async createUser(data) {
    await delay()
    if (users.find((u) => u.rut === data.rut)) throw new Error(`Ya existe un usuario con RUT ${data.rut}`)
    if (users.find((u) => u.email === data.email)) throw new Error(`Ya existe un usuario con email ${data.email}`)
    const user = { id: newId(), ...data, carrera_id: data.carrera_id ?? null, is_active: true, created_at: new Date().toISOString() }
    users.push(user)
    return user
  },

  async updateUser(id, data) {
    await delay()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado')
    const payload = { ...data }
    if (payload.password !== undefined) delete payload.password // no guardamos en mock
    users[idx] = { ...users[idx], ...payload }
    return users[idx]
  },

  async deactivateUser(id) {
    await delay()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('Usuario no encontrado')
    if (!users[idx].is_active) throw new Error('El usuario ya está inactivo')
    users[idx] = { ...users[idx], is_active: false }
    return users[idx]
  },

  // ── Centros (academic-service /academic/centros) ────────────────────────
  async getCentros() {
    await delay()
    return centros
  },

  async createCentro(data) {
    await delay()
    const centro = { id: newId(), ...data, is_active: true }
    centros.push(centro)
    return centro
  },

  async updateCentro(id, data) {
    await delay()
    const idx = centros.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Empresa no encontrada')
    centros[idx] = { ...centros[idx], ...data }
    return centros[idx]
  },

  // ── Sedes (academic-service /academic/sedes) ─────────────────────────────
  async getSedes() {
    await delay()
    return sedes
  },

  async createSede(data) {
    await delay()
    if (sedes.find((s) => s.nombre.toLowerCase() === data.nombre.toLowerCase())) {
      throw new Error(`Ya existe una sede llamada "${data.nombre}"`)
    }
    const sede = { id: newId(), ...data, is_active: true }
    sedes.push(sede)
    return sede
  },

  async updateSede(id, data) {
    await delay()
    const idx = sedes.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Sede no encontrada')
    sedes[idx] = { ...sedes[idx], ...data }
    return sedes[idx]
  },

  // ── Carreras (academic-service /academic/carreras) ───────────────────────
  async getCarreras() {
    await delay()
    return carreras
  },

  async createCarrera(data) {
    await delay()
    if (!sedes.find((s) => s.id === data.sede_id)) throw new Error('Selecciona una sede válida')
    const carrera = { id: newId(), ...data, is_active: true }
    carreras.push(carrera)
    return carrera
  },

  async updateCarrera(id, data) {
    await delay()
    const idx = carreras.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Carrera no encontrada')
    if (data.sede_id && !sedes.find((s) => s.id === data.sede_id)) {
      throw new Error('Selecciona una sede válida')
    }
    carreras[idx] = { ...carreras[idx], ...data }
    return carreras[idx]
  },

  // ── Prácticas (internship-service /internships) ──────────────────────────
  async getPracticas(params = {}) {
    await delay()
    let result = [...practicas]
    if (params.estado) result = result.filter((p) => p.estado === params.estado)
    if (params.carrera_id) result = result.filter((p) => p.carrera_id === params.carrera_id)
    if (params.tipo) result = result.filter((p) => p.tipo === params.tipo)
    if (params.alumno_id) result = result.filter((p) => p.alumno_id === params.alumno_id)
    if (params.docente_id) result = result.filter((p) => p.docente_id === params.docente_id)
    return result
  },

  async getPractica(id) {
    await delay()
    const practica = practicas.find((p) => p.id === id)
    if (!practica) throw new Error('Práctica no encontrada')
    return {
      practica,
      centro:  centros.find((c) => c.id === practica.centro_practica_id) ?? null,
      carrera: carreras.find((c) => c.id === practica.carrera_id) ?? null,
      docente: users.find((u) => u.id === practica.docente_id) ?? null,
      alumno:  users.find((u) => u.id === practica.alumno_id) ?? null,
      acta1:   actas1[id] ?? null,
    }
  },

  async getMyPractica(alumnoId) {
    await delay()
    const practica = practicas.find((p) => p.alumno_id === alumnoId)
    if (!practica) return null
    return {
      practica,
      centro:  centros.find((c) => c.id === practica.centro_practica_id) ?? null,
      carrera: carreras.find((c) => c.id === practica.carrera_id) ?? null,
      docente: users.find((u) => u.id === practica.docente_id) ?? null,
      acta1:   actas1[practica.id] ?? null,
    }
  },

  async createPractica(data) {
    await delay()
    const practica = {
      id: newId(),
      ...data,
      coordinador_id: MOCK_COORDINADOR_ID,
      docente_id: data.docente_id ?? null,
      estado: 'BORRADOR',
      fecha_termino_calculada: null,
      fecha_termino_confirmada: null,
      created_at: new Date().toISOString(),
    }
    practicas.push(practica)
    // Crear acta1 vacía
    actas1[practica.id] = {
      id: newId(),
      practica_id: practica.id,
      direccion_centro: '', departamento: '', nombre_jefe_directo: '',
      cargo_jefe_directo: '', contacto_correo: '', contacto_telefono: '',
      practica_a_distancia: false, tareas_principales: '', foto_url: null,
      completada_alumno: false, aceptada_docente: false, fecha_limite_alumno: null,
    }
    return practica
  },

  async updatePracticaEstado(id, estado) {
    await delay()
    const idx = practicas.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Práctica no encontrada')
    practicas[idx] = { ...practicas[idx], estado }
    return practicas[idx]
  },

  async asignarDocente(id, docente_id) {
    await delay()
    const idx = practicas.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Práctica no encontrada')
    practicas[idx] = { ...practicas[idx], docente_id }
    return practicas[idx]
  },

  // ── Acta 1 ──────────────────────────────────────────────────────────────
  async getActa1(practicaId) {
    await delay()
    const acta = actas1[practicaId]
    if (!acta) throw new Error('Acta 1 no encontrada')
    return acta
  },

  async updateActa1(practicaId, data) {
    await delay()
    const acta = actas1[practicaId]
    if (!acta) throw new Error('Acta 1 no encontrada')
    actas1[practicaId] = { ...acta, ...data }
    return actas1[practicaId]
  },

  async acceptActa1(practicaId) {
    await delay()
    const acta = actas1[practicaId]
    if (!acta) throw new Error('Acta 1 no encontrada')
    if (!acta.completada_alumno) throw new Error('El alumno aún no ha completado el Acta 1')
    actas1[practicaId] = { ...acta, aceptada_docente: true }
    return actas1[practicaId]
  },

  // ── Evaluaciones (evaluation-service /evaluations) ──────────────────────
  async getEvaluacionDesempeno(id) {
    await delay()
    const ev = evalDesempeno[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    return ev
  },

  async getEvaluacionesDesempenoPorPractica(practicaId) {
    await delay()
    return Object.values(evalDesempeno).filter((e) => e.practica_id === practicaId)
  },

  async createEvaluacionDesempeno(data) {
    await delay()
    const id = newId()
    const ev = { id, ...data, nota: null, estado: 'ABIERTA', created_at: new Date().toISOString() }
    evalDesempeno[id] = ev
    return ev
  },

  async updateEvaluacionDesempeno(id, data) {
    await delay()
    const ev = evalDesempeno[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    if (ev.estado === 'CERRADA') throw new Error('No se puede modificar una evaluación cerrada')
    evalDesempeno[id] = { ...ev, ...data }
    return evalDesempeno[id]
  },

  async cerrarEvaluacionDesempeno(id) {
    await delay()
    const ev = evalDesempeno[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    const nota = ev.items?.length
      ? ev.items.reduce((s, i) => s + (i.nota ?? 0), 0) / ev.items.length
      : null
    evalDesempeno[id] = { ...ev, nota: nota ? Math.round(nota * 10) / 10 : null, estado: 'CERRADA' }
    return evalDesempeno[id]
  },

  async getEvaluacionInforme(id) {
    await delay()
    const ev = evalInforme[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    return ev
  },

  async getEvaluacionesInformePorPractica(practicaId) {
    await delay()
    return Object.values(evalInforme).filter((e) => e.practica_id === practicaId)
  },

  async createEvaluacionInforme(data) {
    await delay()
    const id = newId()
    const ev = { id, ...data, nota: null, estado: 'ABIERTA', created_at: new Date().toISOString() }
    evalInforme[id] = ev
    return ev
  },

  async updateEvaluacionInforme(id, data) {
    await delay()
    const ev = evalInforme[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    if (ev.estado === 'CERRADA') throw new Error('No se puede modificar una evaluación cerrada')
    evalInforme[id] = { ...ev, ...data }
    return evalInforme[id]
  },

  async cerrarEvaluacionInforme(id) {
    await delay()
    const ev = evalInforme[id]
    if (!ev) throw new Error('Evaluación no encontrada')
    const nota = ev.items?.length
      ? ev.items.reduce((s, i) => s + (i.nota ?? 0), 0) / ev.items.length
      : null
    evalInforme[id] = { ...ev, nota: nota ? Math.round(nota * 10) / 10 : null, estado: 'CERRADA' }
    return evalInforme[id]
  },

  // ── Acta final ───────────────────────────────────────────────────────────
  async getActaFinal(practicaId) {
    await delay()
    const evDesempeno = Object.values(evalDesempeno).find((e) => e.practica_id === practicaId && e.estado === 'CERRADA')
    const evInforme   = Object.values(evalInforme).find((e) => e.practica_id === practicaId && e.estado === 'CERRADA')
    return {
      practica_id:       practicaId,
      nota_desempeno:    evDesempeno?.nota ?? null,
      nota_informe:      evInforme?.nota ?? null,
      nota_final:        evDesempeno?.nota && evInforme?.nota
        ? Math.round(((evDesempeno.nota * 0.4) + (evInforme.nota * 0.6)) * 10) / 10
        : null,
      validada:          false,
      validada_en:       null,
    }
  },

  async validarActaFinal(practicaId) {
    await delay()
    const acta = await this.getActaFinal(practicaId)
    if (!acta.nota_final) throw new Error('No se puede validar: faltan evaluaciones cerradas.')
    return { ...acta, validada: true, validada_en: new Date().toISOString() }
  },

  // Versiones con persistencia de ID (misma firma que realApi)
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

  // ── Dashboard stats ──────────────────────────────────────────────────────
  async getDashboardStats() {
    await delay()
    return {
      total:      practicas.length,
      enCurso:    practicas.filter((p) => p.estado === 'EN_CURSO').length,
      borrador:   practicas.filter((p) => p.estado === 'BORRADOR').length,
      finalizada: practicas.filter((p) => p.estado === 'FINALIZADA').length,
      alumnos:    users.filter((u) => u.rol === 'ALUMNO' && u.is_active).length,
      empresas:   centros.filter((c) => c.is_active).length,
    }
  },

  // Docente: prácticas asignadas
  async getMisPracticasDocente(docenteId) {
    await delay()
    const misPracticas = practicas.filter((p) => p.docente_id === docenteId)
    return misPracticas.map((p) => ({
      practica: p,
      alumno:  users.find((u) => u.id === p.alumno_id) ?? null,
      centro:  centros.find((c) => c.id === p.centro_practica_id) ?? null,
      carrera: carreras.find((c) => c.id === p.carrera_id) ?? null,
      acta1:   actas1[p.id] ?? null,
    }))
  },

  // Empleador: prácticas en su empresa
  async getMisPracticasEmpleador(empleadorId) {
    await delay()
    const misCentros = centros.filter((c) => c.correo_contacto === users.find((u) => u.id === empleadorId)?.email)
    const centroIds = misCentros.map((c) => c.id)
    const misPracticas = practicas.filter((p) => centroIds.includes(p.centro_practica_id))
    return misPracticas.map((p) => ({
      practica: p,
      alumno:  users.find((u) => u.id === p.alumno_id) ?? null,
      centro:  centros.find((c) => c.id === p.centro_practica_id) ?? null,
      carrera: carreras.find((c) => c.id === p.carrera_id) ?? null,
    }))
  },

  // ── Deactivate ────────────────────────────────────────────────────────────
  async deactivateCentro(id) {
    await delay()
    const idx = centros.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Centro no encontrado')
    centros[idx] = { ...centros[idx], is_active: false }
    return centros[idx]
  },

  async deactivateSede(id) {
    await delay()
    const idx = sedes.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Sede no encontrada')
    sedes[idx] = { ...sedes[idx], is_active: false }
    return sedes[idx]
  },

  async deactivateCarrera(id) {
    await delay()
    const idx = carreras.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Carrera no encontrada')
    carreras[idx] = { ...carreras[idx], is_active: false }
    return carreras[idx]
  },

  // ── Parámetros de evaluación ──────────────────────────────────────────────
  async getParametros(carreraId) {
    await delay()
    return {
      carrera_id: carreraId,
      peso_desempeno: 0.4,
      peso_informe: 0.6,
      nota_minima_aprobacion: 4.0,
    }
  },

  async updateParametros(carreraId, data) {
    await delay()
    return { carrera_id: carreraId, ...data }
  },

  // ── Documentos ────────────────────────────────────────────────────────────
  async uploadDocumento(file, practicaId, tipo) {
    await delay(500)
    const doc = {
      id: newId(),
      practica_id: practicaId,
      nombre: file.name,
      tipo,
      filename: file.name,
      tamanio_kb: Math.round(file.size / 1024),
      mimetype: file.type,
      subido_por: MOCK_COORDINADOR_ID,
      created_at: new Date().toISOString(),
    }
    mockDocumentos.push(doc)
    return doc
  },

  async getDocumentosPractica(practicaId) {
    await delay()
    return mockDocumentos.filter((d) => d.practica_id === practicaId)
  },

  async uploadMaterialApoyo(file, carreraId, nombre) {
    await delay(500)
    const doc = {
      id: newId(),
      carrera_id: carreraId,
      nombre,
      tipo: 'MATERIAL_APOYO',
      filename: file.name,
      tamanio_kb: Math.round(file.size / 1024),
      mimetype: file.type,
      subido_por: MOCK_COORDINADOR_ID,
      created_at: new Date().toISOString(),
    }
    mockDocumentos.push(doc)
    return doc
  },

  async getMaterialApoyo(carreraId) {
    await delay()
    return mockDocumentos.filter((d) => d.carrera_id === carreraId && d.tipo === 'MATERIAL_APOYO')
  },

  getDocumentoUrl(docId) {
    return `#/documents/${docId}`
  },

  // ── Notificaciones ────────────────────────────────────────────────────────
  async enviarAlertaManual(data) {
    await delay()
    const alerta = {
      id: newId(),
      alumno_id: data.alumno_id,
      coordinador_id: MOCK_COORDINADOR_ID,
      asunto: data.asunto,
      mensaje: data.mensaje,
      created_at: new Date().toISOString(),
    }
    mockAlertas.push(alerta)
    return alerta
  },

  async getHistorialNotificaciones(alumnoId) {
    await delay()
    return mockAlertas
      .filter((a) => a.alumno_id === alumnoId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },
}
