const LOGOS = {
  negro: '/logo-usm-negro.png',
  blanco: '/logo-usm-blanco.png',
}

export default function UniversityLogo({ variant = 'negro', className = '' }) {
  return (
    <img
      src={LOGOS[variant]}
      alt="Universidad Técnica Federico Santa María"
      className={`university-logo-img university-logo-img--${variant}${className ? ` ${className}` : ''}`}
    />
  )
}
