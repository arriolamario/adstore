import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // La sesion real vive en una cookie httpOnly que pone el servidor (no la
  // puede leer ni falsificar el JS del navegador). Este estado es solo el
  // usuario que esa cookie representa; se valida contra /api/auth/me al
  // cargar la app en vez de confiar en algo guardado en localStorage.
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const register = async ({ name, email, password }) => {
    const u = await api.auth.register({ name, email, password })
    setUser(u)
    return u
  }

  const login = async ({ email, password }) => {
    const u = await api.auth.login({ email, password })
    setUser(u)
    return u
  }

  const logout = async () => {
    setUser(null)
    try { await api.auth.logout() } catch { /* la cookie igual expira sola */ }
  }

  const updateProfile = async (patch) => {
    if (!user) return
    const u = await api.users.update(user.id, patch)
    setUser(u)
    return u
  }

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
