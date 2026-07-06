import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginLayout from '../../layouts/LoginLayout'
import InputField from '../../components/ui/InputField'
import { getHomePath } from '../../utils/routes'
import { isMockMode } from '../../api/client'

const DEMO_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Administrador',
    name: 'Roberto Vega',
    description: 'Acceso completo al sistema',
  },
  {
    role: 'JEFE_CARRERA',
    label: 'Jefe de Carrera',
    name: 'Andrea Mora',
    description: 'Sedes, carreras, prácticas y reportes',
  },
  {
    role: 'COORDINADOR',
    label: 'Coordinador',
    name: 'Carmen Silva',
    description: 'Gestión de accesos, empresas y prácticas',
  },
  {
    role: 'DOCENTE',
    label: 'Docente',
    name: 'Luis Contreras',
    description: 'Revisión de actas y evaluación de informes',
  },
  {
    role: 'EMPLEADOR',
    label: 'Empleador',
    name: 'Empresa Demo SpA',
    description: 'Evaluación de desempeño del alumno',
  },
  {
    role: 'ALUMNO',
    label: 'Alumno',
    name: 'Tomás Rojas',
    description: 'Mi práctica y Acta 1',
  },
]

export default function LoginPage() {
  const { login, loginAsRole, isAuthenticated, loading, profile } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated && profile) {
    return <Navigate to={getHomePath(profile.rol)} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemo = async (role) => {
    setError('')
    setSubmitting(true)
    try {
      await loginAsRole(role)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LoginLayout>
      <div className="login-card">
        <div className="login-card-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert--error">{error}</div>}

          <InputField
            label="Correo electrónico o usuario"
            icon="user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario@universidad.cl"
            autoComplete="username"
          />

          <InputField
            label="Contraseña"
            icon="lock"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="contraseña"
            autoComplete="current-password"
          />

          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {isMockMode && (
          <div className="login-demo">
            <p className="login-demo-title">Acceso rápido demo</p>
            <div className="login-demo-grid">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="login-demo-card"
                  onClick={() => handleDemo(account.role)}
                  disabled={submitting}
                >
                  <span className="login-demo-role">{account.label}</span>
                  <strong>{account.name}</strong>
                  <span className="login-demo-desc">{account.description}</span>
                </button>
              ))}
            </div>
            <p className="login-demo-note">
              También puedes escribir &quot;alumno&quot; en el usuario para ingresar como alumno
            </p>
          </div>
        )}
      </div>
    </LoginLayout>
  )
}
