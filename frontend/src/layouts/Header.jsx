import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  SUPER_ADMIN:  'Super Admin',
  JEFE_CARRERA: 'Jefe de Carrera',
  COORDINADOR:  'Coordinador',
  DOCENTE:      'Docente',
  ALUMNO:       'Alumno',
  EMPLEADOR:    'Empleador',
}

function getInitials(nombre = '', apellido = '') {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase()
}

export default function Header() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const initials = profile ? getInitials(profile.nombre, profile.apellido) : '??'
  const name     = profile ? `${profile.nombre} ${profile.apellido}` : 'Usuario'
  const role     = profile ? (ROLE_LABELS[profile.rol] ?? profile.rol) : ''

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <h1 className="header-title">Sistema de Gestión de Prácticas</h1>

      <div className="header-user" ref={ref} style={{ position: 'relative' }}>
        <button type="button" className="header-user-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">{name}</span>
            <span className="header-user-role">{role}</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ width: 15, height: 15, color: 'var(--text-muted)', flexShrink: 0,
              transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="header-dropdown">
            <div className="header-dropdown-user">
              <div className="header-dropdown-avatar">{initials}</div>
              <div>
                <p className="header-dropdown-name">{name}</p>
                <p className="header-dropdown-role">{role}</p>
              </div>
            </div>
            <div className="header-dropdown-divider" />
            <button type="button" className="header-dropdown-item header-dropdown-item--danger" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
