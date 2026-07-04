// IDs fijos para usuarios demo
export const MOCK_COORDINADOR_ID  = 'a1111111-1111-1111-1111-111111111111'
export const MOCK_ALUMNO_ID       = 'b2222222-2222-2222-2222-222222222222'
export const MOCK_DOCENTE_ID      = 'c3333333-3333-3333-3333-333333333333'
export const MOCK_EMPLEADOR_ID    = 'd4444444-4444-4444-4444-444444444444'
export const MOCK_JEFE_ID         = 'e5555555-5555-5555-5555-555555555555'
export const MOCK_SUPER_ID        = 'f6666666-6666-6666-6666-666666666666'
export const MOCK_ALUMNO2_ID      = 'a7777777-7777-7777-7777-777777777777'

// Alias legacy
export const MOCK_USER_ID         = MOCK_COORDINADOR_ID
export const MOCK_PRACTICA_ALUMNO_ID = 'p1111111-1111-1111-1111-111111111111'

export const initialUsers = [
  {
    id: MOCK_COORDINADOR_ID,
    rut: '12345678-9',
    nombre: 'Carmen',
    apellido: 'Silva',
    email: 'carmen.silva@usm.cl',
    rol: 'COORDINADOR',
    carrera_id: null,
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: MOCK_ALUMNO_ID,
    rut: '20456789-2',
    nombre: 'Tomás',
    apellido: 'Rojas',
    email: 'tomas.rojas.2021@usm.cl',
    rol: 'ALUMNO',
    carrera_id: 'c8888888-8888-8888-8888-888888888888',
    is_active: true,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: MOCK_DOCENTE_ID,
    rut: '18234567-K',
    nombre: 'Isabella',
    apellido: 'Morales',
    email: 'isabella.morales@usm.cl',
    rol: 'DOCENTE',
    carrera_id: 'c8888888-8888-8888-8888-888888888888',
    is_active: true,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: MOCK_EMPLEADOR_ID,
    rut: '19876543-0',
    nombre: 'Roberto',
    apellido: 'Fuentes',
    email: 'roberto.fuentes@techsolutions.cl',
    rol: 'EMPLEADOR',
    carrera_id: null,
    is_active: true,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: MOCK_JEFE_ID,
    rut: '17654321-9',
    nombre: 'Andrés',
    apellido: 'Castillo',
    email: 'andres.castillo@usm.cl',
    rol: 'JEFE_CARRERA',
    carrera_id: 'c8888888-8888-8888-8888-888888888888',
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: MOCK_SUPER_ID,
    rut: '11111111-1',
    nombre: 'Super',
    apellido: 'Admin',
    email: 'admin@usm.cl',
    rol: 'SUPER_ADMIN',
    carrera_id: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: MOCK_ALUMNO2_ID,
    rut: '20999888-7',
    nombre: 'Sofía',
    apellido: 'Vargas',
    email: 'sofia.vargas.2022@usm.cl',
    rol: 'ALUMNO',
    carrera_id: 'c9999999-9999-9999-9999-999999999999',
    is_active: true,
    created_at: '2026-02-15T10:00:00Z',
  },
]

export const mockProfile = initialUsers[0]

export const initialCentros = [
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    nombre: 'Tech Solutions SpA',
    giro: 'Tecnología',
    nombre_gerente: 'Ana Pérez',
    telefono: '+56912345678',
    correo: 'contacto@techsolutions.cl',
    nombre_contacto: 'Roberto Fuentes',
    correo_contacto: 'roberto.fuentes@techsolutions.cl',
    direccion: 'Av. Apoquindo 1234, Santiago',
    is_active: true,
  },
  {
    id: 'f7777777-7777-7777-7777-777777777777',
    nombre: 'Industrias del Sur Ltda.',
    giro: 'Manufactura',
    nombre_gerente: 'Luis Torres',
    telefono: '+56987654321',
    correo: 'info@industriasursur.cl',
    nombre_contacto: 'María López',
    correo_contacto: 'maria@industriasursur.cl',
    direccion: 'Camino a Melipilla Km 12, Maipú',
    is_active: true,
  },
]

export const initialSedes = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    nombre: 'Casa Central Valparaíso',
    is_active: true,
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    nombre: 'Sede Santiago San Joaquín',
    is_active: true,
  },
]

export const initialCarreras = [
  {
    id: 'c8888888-8888-8888-8888-888888888888',
    nombre: 'Ingeniería Civil Informática',
    sede_id: 's1111111-1111-1111-1111-111111111111',
    horas_laboral: 240,
    horas_profesional: 360,
    is_active: true,
  },
  {
    id: 'c9999999-9999-9999-9999-999999999999',
    nombre: 'Ingeniería Civil Industrial',
    sede_id: 's1111111-1111-1111-1111-111111111111',
    horas_laboral: 240,
    horas_profesional: 360,
    is_active: true,
  },
]

export const initialPracticas = [
  {
    id: MOCK_PRACTICA_ALUMNO_ID,
    alumno_id: MOCK_ALUMNO_ID,
    coordinador_id: MOCK_COORDINADOR_ID,
    docente_id: MOCK_DOCENTE_ID,
    carrera_id: 'c8888888-8888-8888-8888-888888888888',
    centro_practica_id: 'f6666666-6666-6666-6666-666666666666',
    tipo: 'LABORAL',
    estado: 'EN_CURSO',
    fecha_inicio: '2026-03-01',
    fecha_termino_calculada: '2026-08-01',
    fecha_termino_confirmada: null,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    alumno_id: MOCK_ALUMNO2_ID,
    coordinador_id: MOCK_COORDINADOR_ID,
    docente_id: MOCK_DOCENTE_ID,
    carrera_id: 'c9999999-9999-9999-9999-999999999999',
    centro_practica_id: 'f7777777-7777-7777-7777-777777777777',
    tipo: 'PROFESIONAL',
    estado: 'BORRADOR',
    fecha_inicio: '2026-06-01',
    fecha_termino_calculada: null,
    fecha_termino_confirmada: null,
    created_at: '2026-03-01T10:00:00Z',
  },
]

export const initialActas1 = {
  [MOCK_PRACTICA_ALUMNO_ID]: {
    id: 'acta1111-1111-1111-1111-111111111111',
    practica_id: MOCK_PRACTICA_ALUMNO_ID,
    direccion_centro: 'Av. Apoquindo 1234, Of. 501',
    departamento: 'Desarrollo de Software',
    nombre_jefe_directo: 'Carlos Mendoza',
    cargo_jefe_directo: 'Tech Lead',
    contacto_correo: 'carlos.mendoza@techsolutions.cl',
    contacto_telefono: '+56911223344',
    practica_a_distancia: false,
    tareas_principales: 'Desarrollo de APIs REST con FastAPI, revisión de pull requests y participación en reuniones de equipo.',
    foto_url: null,
    completada_alumno: true,
    aceptada_docente: false,
    fecha_limite_alumno: '2026-04-15',
  },
  'p2222222-2222-2222-2222-222222222222': {
    id: 'acta2222-2222-2222-2222-222222222222',
    practica_id: 'p2222222-2222-2222-2222-222222222222',
    direccion_centro: '',
    departamento: '',
    nombre_jefe_directo: '',
    cargo_jefe_directo: '',
    contacto_correo: '',
    contacto_telefono: '',
    practica_a_distancia: false,
    tareas_principales: '',
    foto_url: null,
    completada_alumno: false,
    aceptada_docente: false,
    fecha_limite_alumno: '2026-07-01',
  },
}

// Evaluaciones mock
export const initialEvaluaciones = {
  // Para la práctica del alumno demo
  desempeno: {
    'ev-des-1111': {
      id: 'ev-des-1111',
      practica_id: MOCK_PRACTICA_ALUMNO_ID,
      evaluador_id: MOCK_EMPLEADOR_ID,
      tipo_evaluador: 'EMPLEADOR',
      items: [
        { nombre: 'Puntualidad', nota: 6.5 },
        { nombre: 'Trabajo en equipo', nota: 7.0 },
        { nombre: 'Calidad del trabajo', nota: 6.8 },
      ],
      nota: 6.77,
      estado: 'ABIERTA',
      created_at: '2026-04-01T10:00:00Z',
    },
  },
  informe: {
    'ev-inf-1111': {
      id: 'ev-inf-1111',
      practica_id: MOCK_PRACTICA_ALUMNO_ID,
      docente_id: MOCK_DOCENTE_ID,
      items: [],
      nota: null,
      estado: 'ABIERTA',
      created_at: '2026-04-01T10:00:00Z',
    },
  },
}
