import { Router } from 'express'
import { query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapUser } from '../lib/mappers.js'

export const usersRouter = Router()

usersRouter.put('/:id', wrap(async (req, res) => {
  const { name, email, phone, address } = req.body
  const { rows } = await query(
    `UPDATE users SET name=COALESCE($2,name), email=COALESCE($3,email),
       phone=COALESCE($4,phone), address=COALESCE($5,address)
     WHERE id=$1 RETURNING *`,
    [req.params.id, name, email?.toLowerCase(), phone, address],
  )
  if (!rows.length) throw fail(404, 'Usuario no encontrado')
  res.json(mapUser(rows[0]))
}))
