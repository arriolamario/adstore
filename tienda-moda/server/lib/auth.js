/* Autenticacion real del servidor: JWT firmado en una cookie httpOnly.
   Antes de esto, "admin" era solo una pantalla que el cliente ocultaba —
   cualquiera que conociera la URL de la API podia llamarla sin loguearse.
   Ahora cada ruta sensible verifica el rol en el servidor. */
import jwt from 'jsonwebtoken'
import { fail } from './http.js'

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.error('Falta JWT_SECRET en .env (o en las variables de entorno de Vercel).')
  process.exit(1)
}

export const COOKIE_NAME = 'adstore_token'
const TOKEN_TTL = '7d'
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

// En Vercel se sirve por HTTPS (cookie "secure"); en local es HTTP.
const isProd = !!process.env.VERCEL

export const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: TOKEN_TTL })

export const setAuthCookie = (res, user) => {
  res.cookie(COOKIE_NAME, signToken(user), {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  })
}

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' })
}

/** Exige sesion valida. Deja `req.user = { id, role }` (tal como estaba en el token). */
export const requireAuth = (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return next(fail(401, 'Necesitas iniciar sesion.'))
  try {
    const payload = jwt.verify(token, SECRET)
    req.user = { id: payload.id, role: payload.role }
    next()
  } catch {
    next(fail(401, 'Sesion invalida o vencida.'))
  }
}

/** Exige sesion valida Y rol admin. */
export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err)
    if (req.user.role !== 'admin') return next(fail(403, 'No tenes permisos para esto.'))
    next()
  })
}

/** Exige sesion valida Y (ser el propio usuario del :param, o admin). */
export const requireSelfOrAdmin = (param = 'id') => (req, res, next) => {
  requireAuth(req, res, (err) => {
    if (err) return next(err)
    if (req.user.role !== 'admin' && req.user.id !== req.params[param]) {
      return next(fail(403, 'No tenes permisos para esto.'))
    }
    next()
  })
}
