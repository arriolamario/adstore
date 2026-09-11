import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapUser } from '../lib/mappers.js'

export const usersRouter = Router()

// Listado para el panel de administracion (CRUD de usuarios).
usersRouter.get('/', wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC')
  res.json(rows.map(mapUser))
}))

usersRouter.get('/:id', wrap(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.params.id])
  if (!rows.length) throw fail(404, 'Usuario no encontrado')
  res.json(mapUser(rows[0]))
}))

// Alta manual desde el admin (permite elegir el rol; /api/auth/register siempre crea "customer").
usersRouter.post('/', wrap(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body
  if (!name || !email || !password) throw fail(400, 'Faltan datos')
  const hash = bcrypt.hashSync(password, 10)
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, role, phone, address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email.toLowerCase(), hash, role === 'admin' ? 'admin' : 'customer', phone || '', address || ''],
    )
    res.status(201).json(mapUser(rows[0]))
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una cuenta con ese email.')
    throw err
  }
}))

// Edicion de perfil (propia o, desde el admin, de cualquier usuario). `password` es opcional:
// si viene, se actualiza; si no, se deja la existente.
usersRouter.put('/:id', wrap(async (req, res) => {
  const { name, email, phone, address, role, password } = req.body
  const passwordHash = password ? bcrypt.hashSync(password, 10) : null
  try {
    const { rows } = await query(
      `UPDATE users SET name=COALESCE($2,name), email=COALESCE($3,email),
         phone=COALESCE($4,phone), address=COALESCE($5,address),
         role=COALESCE($6,role), password=COALESCE($7,password)
       WHERE id=$1 RETURNING *`,
      [req.params.id, name, email?.toLowerCase(), phone, address, role, passwordHash],
    )
    if (!rows.length) throw fail(404, 'Usuario no encontrado')
    res.json(mapUser(rows[0]))
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una cuenta con ese email.')
    throw err
  }
}))

usersRouter.delete('/:id', wrap(async (req, res) => {
  const { rows } = await query('DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id])
  if (!rows.length) throw fail(404, 'Usuario no encontrado')
  res.json({ ok: true })
}))
