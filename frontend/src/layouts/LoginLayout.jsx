import UniversityLogo from './UniversityLogo'

export function GraduationIcon() {
  return (
    <div className="login-hero-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3L2 8.5L12 14L22 8.5L12 3Z" strokeLinejoin="round" />
        <path d="M6 11V16.5C6 16.5 8.5 19 12 19C15.5 19 18 16.5 18 16.5V11" strokeLinecap="round" />
        <path d="M22 8.5V14" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function LoginLayout({ children }) {
  return (
    <div className="login-page">
      <header className="login-page-header">
        <UniversityLogo variant="negro" />
      </header>

      <main className="login-page-main">
        <div className="login-hero">
          <GraduationIcon />
          <h1 className="login-hero-title">Sistemas de Gestión de Prácticas</h1>
        </div>
        {children}
      </main>
    </div>
  )
}
