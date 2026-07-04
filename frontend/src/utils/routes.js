export const COORDINATOR_ROLES = ['COORDINADOR', 'JEFE_CARRERA', 'SUPER_ADMIN']

export function isCoordinator(rol) {
  return COORDINATOR_ROLES.includes(rol)
}

export function getHomePath(rol) {
  if (rol === 'ALUMNO')    return '/mi-practica'
  if (rol === 'DOCENTE')   return '/docente/practicas'
  if (rol === 'EMPLEADOR') return '/empleador/practicas'
  return '/dashboard'
}

// Jerarquía de poder: qué roles puede gestionar cada rol
// Un rol solo puede crear/editar/desactivar usuarios de menor o igual rango
// La regla: no puedes tocar a alguien del mismo nivel o superior (salvo SUPER_ADMIN)
const ROLE_POWER = {
  SUPER_ADMIN:  5,
  JEFE_CARRERA: 4,
  COORDINADOR:  3,
  DOCENTE:      2,
  EMPLEADOR:    2,
  ALUMNO:       1,
}

export function getRolePower(rol) {
  return ROLE_POWER[rol] ?? 0
}

// Retorna true si `actorRol` puede crear/editar/desactivar un usuario con `targetRol`
export function canManageUser(actorRol, targetRol) {
  if (actorRol === 'SUPER_ADMIN') return true
  return getRolePower(actorRol) > getRolePower(targetRol)
}

// Retorna los roles que puede asignar el actor al crear/editar usuarios
export function getAllowedRoles(actorRol) {
  const myPower = getRolePower(actorRol)
  return Object.entries(ROLE_POWER)
    .filter(([, power]) => power < myPower)
    .map(([rol]) => rol)
}
