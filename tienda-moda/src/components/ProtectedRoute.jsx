import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, redirectTo = '/ingresar' }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Mientras se valida la cookie contra /api/auth/me, no redirigir todavia
  // (evita un parpadeo a /ingresar en cada refresh mientras se confirma la sesion).
  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
