import { NavLink } from 'react-router-dom'
import UniversityLogo from './UniversityLogo'
import { useAuth } from '../context/AuthContext'
import { getNavForRole } from '../utils/navigation'

export default function Sidebar() {
  const { profile } = useAuth()
  const navItems = getNavForRole(profile?.rol)

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <UniversityLogo variant="blanco" className="sidebar-logo-img" />
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
