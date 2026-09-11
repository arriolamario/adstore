import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // La sesion (usuario logueado) se guarda en el navegador; los datos viven en Postgres.
  // v2: el shape cambio de { userId } a un usuario completo, por eso la clave es distinta
  // (evita que una sesion vieja en localStorage rompa la app con datos incompletos).
  const [rawUser, setUser] = useLocalStorage('adstore.session.v2', null)
  // Por si en el futuro cambia el shape otra vez: una sesion incompleta se ignora en vez de romper la UI.
  const user = rawUser && rawUser.id && rawUser.name ? rawUser : null

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

  const logout = () => setUser(null)

  const updateProfile = async (patch) => {
    if (!user) return
    const u = await api.users.update(user.id, patch)
    setUser(u)
    return u
  }

  const value = {
    user,
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
