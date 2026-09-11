import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapUser } from '../lib/mappers.js'
import { setAuthCookie, clearAuthCookie, requireAuth } from '../lib/auth.js'

export const authRouter = Router()

authRouter.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) throw fail(400, 'Faltan datos')
  const hash = bcrypt.hashSync(password, 10)
  try {
    // role no se toma del body: el auto-registro siempre crea "customer"
    // (el default de la columna). Convertirse en admin requiere que otro
    // admin lo haga desde /admin/usuarios.
    const { rows } = await query(
      `INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *`,
      [name, email.toLowerCase(), hash],
    )
    const user = mapUser(rows[0])
    setAuthCookie(res, user)
    res.status(201).json(user)
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una cuenta con ese email.')
    throw err
  }
}))

authRouter.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [String(email || '').toLowerCase()])
  const row = rows[0]
  if (!row || !bcrypt.compareSync(password || '', row.password)) {
    throw fail(401, 'Email o contrasena incorrectos.')
  }
  const user = mapUser(row)
  setAuthCookie(res, user)
  res.json(user)
}))

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

// Sesion actual: el frontend la usa al cargar la app para saber si la cookie
// sigue siendo valida (y traer datos frescos, ej. si un admin te cambio el rol).
authRouter.get('/me', requireAuth, wrap(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.user.id])
  if (!rows.length) throw fail(401, 'Sesion invalida.')
  res.json(mapUser(rows[0]))
}))
