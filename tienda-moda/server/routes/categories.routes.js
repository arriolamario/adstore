import { Router } from 'express'
import { query, withTransaction } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { requireAdmin } from '../lib/auth.js'
import { slugify, uid } from '../../src/lib/format.js'

export const categoriesRouter = Router()

const mapCategory = (r) => ({ id: r.id, name: r.name, createdAt: r.created_at })

// Publico: el catalogo y sus filtros necesitan la lista sin loguearse.
categoriesRouter.get('/', wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM categories ORDER BY name')
  res.json(rows.map(mapCategory))
}))

categoriesRouter.post('/', requireAdmin, wrap(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) throw fail(400, 'El nombre es obligatorio')
  const id = slugify(name) || `categoria-${uid()}`
  try {
    const { rows } = await query('INSERT INTO categories (id, name) VALUES ($1,$2) RETURNING *', [id, name])
    res.status(201).json(mapCategory(rows[0]))
  } catch (err) {
    if (err.code === '23505') throw fail(409, 'Ya existe una categoria con ese nombre.')
    throw err
  }
}))

// Renombrar una categoria actualiza tambien products.category de los
// productos que tenian el nombre viejo, en la misma transaccion (products.category
// es texto libre, no una FK — ver la nota en schema.sql).
categoriesRouter.put('/:id', requireAdmin, wrap(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) throw fail(400, 'El nombre es obligatorio')

  const updated = await withTransaction(async (client) => {
    const current = await client.query('SELECT * FROM categories WHERE id=$1', [req.params.id])
    if (!current.rows.length) throw fail(404, 'Categoria no encontrada')
    const oldName = current.rows[0].name

    let row
    try {
      const upd = await client.query('UPDATE categories SET name=$2 WHERE id=$1 RETURNING *', [req.params.id, name])
      row = upd.rows[0]
    } catch (err) {
      if (err.code === '23505') throw fail(409, 'Ya existe una categoria con ese nombre.')
      throw err
    }

    if (oldName !== name) {
      await client.query('UPDATE products SET category=$1, updated_at=now() WHERE category=$2', [name, oldName])
    }
    return row
  })

  res.json(mapCategory(updated))
}))

// No se puede eliminar una categoria en uso: evita dejar productos con una
// categoria que ya no existe en la lista administrable.
categoriesRouter.delete('/:id', requireAdmin, wrap(async (req, res) => {
  const { rows } = await query('SELECT * FROM categories WHERE id=$1', [req.params.id])
  if (!rows.length) throw fail(404, 'Categoria no encontrada')

  const { rows: usage } = await query('SELECT count(*)::int AS n FROM products WHERE category=$1', [rows[0].name])
  if (usage[0].n > 0) {
    throw fail(409, `Hay ${usage[0].n} producto(s) usando "${rows[0].name}". Reasignalos antes de eliminarla.`)
  }

  await query('DELETE FROM categories WHERE id=$1', [req.params.id])
  res.json({ ok: true })
}))
