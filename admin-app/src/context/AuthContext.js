import { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { api, setToken } from '../lib/api'

const TOKEN_KEY = 'adstore.admin.token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Al abrir la app, si hay un token guardado se valida contra /api/auth/me
  // (no basta con que exista: puede haber vencido o el usuario fue borrado).
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY)
        if (!saved) return
        setToken(saved)
        const me = await api.auth.me()
        if (me.role !== 'admin') throw new Error('No admin')
        setUser(me)
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {})
        setToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async ({ email, password }) => {
    const res = await api.auth.login({ email, password })
    if (res.role !== 'admin') {
      throw new Error('Esta cuenta no es de administrador.')
    }
    setToken(res.token)
    await SecureStore.setItemAsync(TOKEN_KEY, res.token)
    setUser(res)
    return res
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
