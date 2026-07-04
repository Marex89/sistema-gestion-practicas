import { useEffect, useRef, useState } from 'react'
import { fullName } from '../../utils/format'

/**
 * Buscador de usuario con autocompletado tipo dropdown.
 * Props:
 *   users      — array completo de usuarios
 *   value      — id seleccionado (string)
 *   onChange   — (id) => void
 *   placeholder
 *   required
 *   filterFn   — (user) => bool  para pre-filtrar (por rol, etc.)
 */
export default function UserSearchSelect({
  users = [],
  value,
  onChange,
  placeholder = 'Buscar...',
  required = false,
  filterFn,
}) {
  const pool     = filterFn ? users.filter(filterFn) : users
  const selected = pool.find((u) => u.id === value) ?? null

  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const suggestions = query.trim()
    ? pool.filter((u) => {
        const hay = `${fullName(u)} ${u.rut} ${u.email}`.toLowerCase()
        return hay.includes(query.toLowerCase())
      }).slice(0, 8)
    : pool.slice(0, 8)

  const handleSelect = (user) => { onChange(user.id); setQuery(''); setOpen(false) }
  const handleClear  = ()     => { onChange('');     setQuery('') }

  return (
    <div className="user-search" ref={ref}>
      {selected ? (
        <div className="user-search-selected">
          <span className="user-search-selected-name">{fullName(selected)}</span>
          <span className="user-search-selected-rut">{selected.rut}</span>
          <button type="button" className="user-search-clear" onClick={handleClear} aria-label="Quitar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <input
          className="user-search-input"
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        />
      )}

      {open && !selected && (
        <ul className="user-search-dropdown">
          {suggestions.length === 0 ? (
            <li className="user-search-empty">Sin resultados</li>
          ) : (
            suggestions.map((u) => (
              <li key={u.id} className="user-search-option"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(u) }}>
                <span className="user-search-option-name">{fullName(u)}</span>
                <span className="user-search-option-sub">{u.rut} · {u.email}</span>
              </li>
            ))
          )}
          {pool.length > 8 && query.trim() === '' && (
            <li className="user-search-hint">Escribe para filtrar ({pool.length} usuarios)</li>
          )}
        </ul>
      )}

      {/* Campo oculto para validación nativa */}
      <input type="hidden" value={value ?? ''} required={required} />
    </div>
  )
}
