import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapUser } from '../lib/mappers.js'

export const authRouter = Router()

authRouter.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) throw fail(400, 'Faltan datos')
  const hash = bcrypt.hashSync(password, 10)
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *`,
      [name, email.toLowerCase(), hash],
    )
    res.status(201).json(mapUser(rows[0]))
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una cuenta con ese email.')
    throw err
  }
}))

authRouter.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [String(email || '').toLowerCase()])
  const user = rows[0]
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    throw fail(401, 'Email o contrasena incorrectos.')
  }
  res.json(mapUser(user))
}))
