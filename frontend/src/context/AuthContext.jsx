import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => localStorage.getItem('access_token'))
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('access_token'))

  const claims = useMemo(() => (token ? api.decodeToken(token) : null), [token])

  const loadProfile = useCallback(async () => {
    if (!token || !claims?.sub) { setProfile(null); setLoading(false); return }
    try {
      const user = await api.getUser(claims.sub)
      setProfile(user)
    } catch {
      localStorage.removeItem('access_token')
      setToken(null); setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [token, claims?.sub])

  useEffect(() => { loadProfile() }, [loadProfile])

  const persistSession = (accessToken) => {
    localStorage.setItem('access_token', accessToken)
    setToken(accessToken)
    setLoading(true)
  }

  const login = async (username, password) => {
    const data = await api.login({ username, password })
    persistSession(data.access_token)
  }

  const loginAsRole = async (demoRole) => {
    const data = await api.login({ demoRole })
    persistSession(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null); setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ token, claims, profile, loading, isAuthenticated: !!token, login, loginAsRole, logout, refreshProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
