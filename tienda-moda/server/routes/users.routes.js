import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapUser } from '../lib/mappers.js'
import { requireAdmin, requireSelfOrAdmin } from '../lib/auth.js'
import { sendWelcomeEmail } from '../lib/email.js'

export const usersRouter = Router()

// Listado completo: solo el admin (expone PII de todos los usuarios).
usersRouter.get('/', requireAdmin, wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC')
  res.json(rows.map(mapUser))
}))

// Ver un usuario puntual: el propio dueno o un admin.
usersRouter.get('/:id', requireSelfOrAdmin(), wrap(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.params.id])
  if (!rows.length) throw fail(404, 'Usuario no encontrado')
  res.json(mapUser(rows[0]))
}))

// Alta manual desde el admin (permite elegir el rol; /api/auth/register siempre crea "customer").
usersRouter.post('/', requireAdmin, wrap(async (req, res) => {
  const { name, email, password, role, phone, address } = req.body
  if (!name || !email || !password) throw fail(400, 'Faltan datos')
  const hash = bcrypt.hashSync(password, 10)
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, role, phone, address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email.toLowerCase(), hash, role === 'admin' ? 'admin' : 'customer', phone || '', address || ''],
    )
    const user = mapUser(rows[0])
    await sendWelcomeEmail(user) // nunca tira: el alta ya se hizo igual
    res.status(201).json(user)
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una cuenta con ese email.')
    throw err
  }
}))

// Edicion de perfil: el propio dueno o un admin. Un usuario normal NUNCA
// puede cambiarse el rol a si mismo, aunque lo mande en el body — solo un
// admin editando a otro usuario puede tocar ese campo.
usersRouter.put('/:id', requireSelfOrAdmin(), wrap(async (req, res) => {
  const { name, email, phone, address, password } = req.body
  const role = req.user.role === 'admin' ? req.body.role : undefined
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

// Baja: solo admin, y nunca de la propia cuenta con la que se esta logueado
// (evita quedarse afuera del panel).
usersRouter.delete('/:id', requireAdmin, wrap(async (req, res) => {
  if (req.params.id === req.user.id) throw fail(400, 'No podes eliminar tu propia cuenta.')
  const { rows } = await query('DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id])
  if (!rows.length) throw fail(404, 'Usuario no encontrado')
  res.json({ ok: true })
}))
