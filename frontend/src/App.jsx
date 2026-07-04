import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'

// Login
import LoginPage from './features/auth/LoginPage'

// Usuarios (gestión de accesos)
import AccesosPage from './features/usuarios/AccesosPage'

// Administración (sedes, carreras, centros de práctica / empresas)
import SedesCarrerasPage  from './features/administracion/SedesCarrerasPage'
import EmpresasPage       from './features/administracion/EmpresasPage'
import MaterialApoyoPage  from './features/administracion/MaterialApoyoPage'

// Gestión de prácticas (actas, evaluación, informes) — todos los roles
import DashboardPracticasPage   from './features/gestion-practicas/PracticasPage'
import PracticaDetailPage       from './features/gestion-practicas/PracticaDetailPage'
import DocumentosPage           from './features/gestion-practicas/DocumentosPage'
import MiPracticaPage           from './features/gestion-practicas/MiPracticaPage'
import Acta1Page                from './features/gestion-practicas/Acta1Page'
import MaterialApoyoAlumnoPage  from './features/gestion-practicas/MaterialApoyoAlumnoPage'
import DocentePracticasPage      from './features/gestion-practicas/DocentePracticasPage'
import DocentePracticaDetailPage from './features/gestion-practicas/DocentePracticaDetailPage'
import EmpleadorPracticasPage    from './features/gestion-practicas/EmpleadorPracticasPage'

// Alertas y reportes
import DashboardPage       from './features/alertas-reportes/DashboardPage'
import NotificacionesPage  from './features/alertas-reportes/NotificacionesPage'

import { getHomePath } from './utils/routes'

function LoadingScreen() {
  return <div className="loading-screen"><div className="loading-spinner" /></div>
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function RoleRoute({ roles }) {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!profile) return <Navigate to="/login" replace />
  if (!roles.includes(profile.rol)) return <Navigate to={getHomePath(profile.rol)} replace />
  return <Outlet />
}

function RoleHomeRedirect() {
  const { profile, loading } = useAuth()
  if (loading || !profile) return <LoadingScreen />
  return <Navigate to={getHomePath(profile.rol)} replace />
}

// Roles que comparten las vistas de gestión administrativa
const GESTION_ROLES = ['COORDINADOR', 'JEFE_CARRERA', 'SUPER_ADMIN']

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<RoleHomeRedirect />} />

              {/* Gestión administrativa — vistas compartidas por múltiples roles */}
              <Route element={<RoleRoute roles={GESTION_ROLES} />}>
                <Route path="dashboard"       element={<DashboardPage />} />
                <Route path="notificaciones"  element={<NotificacionesPage />} />
                <Route path="accesos"         element={<AccesosPage />} />
                <Route path="sedes-carreras"  element={<SedesCarrerasPage />} />
                <Route path="empresas"        element={<EmpresasPage />} />
                <Route path="material-apoyo"  element={<MaterialApoyoPage />} />
                <Route path="practicas"       element={<DashboardPracticasPage />} />
                <Route path="practicas/:id"   element={<PracticaDetailPage />} />
                <Route path="practicas/:id/documentos" element={<DocumentosPage />} />
              </Route>

              {/* Alumno */}
              <Route element={<RoleRoute roles={['ALUMNO']} />}>
                <Route path="mi-practica"    element={<MiPracticaPage />} />
                <Route path="acta1"          element={<Acta1Page />} />
                <Route path="material-apoyo" element={<MaterialApoyoAlumnoPage />} />
              </Route>

              {/* Docente */}
              <Route element={<RoleRoute roles={['DOCENTE']} />}>
                <Route path="docente/practicas"     element={<DocentePracticasPage />} />
                <Route path="docente/practicas/:id" element={<DocentePracticaDetailPage />} />
              </Route>

              {/* Empleador */}
              <Route element={<RoleRoute roles={['EMPLEADOR']} />}>
                <Route path="empleador/practicas" element={<EmpleadorPracticasPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
