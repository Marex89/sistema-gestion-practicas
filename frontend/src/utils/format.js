export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  JEFE_CARRERA: 'Jefe Carrera',
  COORDINADOR: 'Coordinador Carrera',
  DOCENTE: 'Docente',
  ALUMNO: 'Alumno',
  EMPLEADOR: 'Empleador',
}

export const ROLES = Object.keys(ROLE_LABELS)

export function formatRut(rut) {
  if (!rut) return ''
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return rut
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

export function getInitials(nombre, apellido) {
  const first = nombre?.charAt(0) ?? ''
  const last = apellido?.charAt(0) ?? ''
  return `${first}${last}`.toUpperCase()
}

export function fullName(user) {
  if (!user) return ''
  return `${user.nombre} ${user.apellido}`.trim()
}

export const ESTADO_PRACTICA_LABELS = {
  BORRADOR: 'Borrador',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export const TIPO_PRACTICA_LABELS = {
  LABORAL: 'Laboral',
  PROFESIONAL: 'Profesional',
}
