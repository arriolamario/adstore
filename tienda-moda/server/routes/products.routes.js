import { Router } from 'express'
import { query, withTransaction } from '../db.js'
import { wrap } from '../lib/http.js'
import { requireAdmin, getOptionalUser } from '../lib/auth.js'
import { SEED_PRODUCTS } from '../../src/data/products.js'
import { uid } from '../../src/lib/format.js'

export const productsRouter = Router()

// El catalogo es publico (cualquiera puede navegarlo sin loguearse), y por
// defecto excluye los productos ocultos. Un admin autenticado puede pedir
// ?all=true para verlos tambien (gestion/preview) — si quien pide ?all=true
// no es admin, se ignora el parametro y se filtra igual.
productsRouter.get('/', wrap(async (req, res) => {
  const user = getOptionalUser(req)
  const includeHidden = req.query.all === 'true' && user?.role === 'admin'
  const { rows } = includeHidden
    ? await query('SELECT * FROM products ORDER BY created_at DESC')
    : await query('SELECT * FROM products WHERE hidden = false ORDER BY created_at DESC')
  res.json(rows)
}))

// Todo lo que modifica el catalogo requiere ser admin.
productsRouter.post('/', requireAdmin, wrap(async (req, res) => {
  const p = req.body
  const id = p.id || `p-${uid()}`
  const { rows } = await query(
    `INSERT INTO products (id, name, brand, category, price, availability, sizes, colors, stock, image, description, hidden)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12)
     RETURNING *`,
    [id, p.name, p.brand || '', p.category || '', Number(p.price) || 0, p.availability || 'stock',
      JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), JSON.stringify(p.stock || {}),
      p.image || '', p.description || '', !!p.hidden],
  )
  res.status(201).json(rows[0])
}))

productsRouter.put('/:id', requireAdmin, wrap(async (req, res) => {
  const p = req.body
  const { rows } = await query(
    `UPDATE products SET name=$2, brand=$3, category=$4, price=$5, availability=$6,
       sizes=$7::jsonb, colors=$8::jsonb, stock=$9::jsonb, image=$10, description=$11, hidden=$12, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [req.params.id, p.name, p.brand || '', p.category || '', Number(p.price) || 0, p.availability || 'stock',
      JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), JSON.stringify(p.stock || {}),
      p.image || '', p.description || '', !!p.hidden],
  )
  if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(rows[0])
}))

productsRouter.delete('/:id', requireAdmin, wrap(async (req, res) => {
  await query('DELETE FROM products WHERE id=$1', [req.params.id])
  res.json({ ok: true })
}))

// Restaura el catalogo semilla (borra todos los productos y vuelve a cargarlos).
productsRouter.post('/reset', requireAdmin, wrap(async (_req, res) => {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM products')
    for (const p of SEED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, name, brand, category, price, availability, sizes, colors, stock, image, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11)`,
        [p.id, p.name, p.brand, p.category, p.price, p.availability,
          JSON.stringify(p.sizes || []), JSON.stringify(p.colors || []), JSON.stringify(p.stock || {}),
          p.image, p.description || ''],
      )
    }
  })
  const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows)
}))
