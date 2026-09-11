import { Router } from 'express'
import { query, withTransaction } from '../db.js'
import { wrap } from '../lib/http.js'
import { SEED_PRODUCTS } from '../../src/data/products.js'
import { uid } from '../../src/lib/format.js'

export const productsRouter = Router()

productsRouter.get('/', wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows)
}))

productsRouter.post('/', wrap(async (req, res) => {
  const p = req.body
  const id = p.id || `p-${uid()}`
  const { rows } = await query(
    `INSERT INTO products (id, name, brand, category, price, availability, sizes, stock, image, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)
     RETURNING *`,
    [id, p.name, p.brand || '', p.category || '', Number(p.price) || 0, p.availability || 'stock',
      JSON.stringify(p.sizes || []), JSON.stringify(p.stock || {}), p.image || '', p.description || ''],
  )
  res.status(201).json(rows[0])
}))

productsRouter.put('/:id', wrap(async (req, res) => {
  const p = req.body
  const { rows } = await query(
    `UPDATE products SET name=$2, brand=$3, category=$4, price=$5, availability=$6,
       sizes=$7::jsonb, stock=$8::jsonb, image=$9, description=$10, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [req.params.id, p.name, p.brand || '', p.category || '', Number(p.price) || 0, p.availability || 'stock',
      JSON.stringify(p.sizes || []), JSON.stringify(p.stock || {}), p.image || '', p.description || ''],
  )
  if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(rows[0])
}))

productsRouter.delete('/:id', wrap(async (req, res) => {
  await query('DELETE FROM products WHERE id=$1', [req.params.id])
  res.json({ ok: true })
}))

// Restaura el catalogo semilla (borra todos los productos y vuelve a cargarlos).
productsRouter.post('/reset', wrap(async (_req, res) => {
  await withTransaction(async (client) => {
    await client.query('DELETE FROM products')
    for (const p of SEED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, name, brand, category, price, availability, sizes, stock, image, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)`,
        [p.id, p.name, p.brand, p.category, p.price, p.availability,
          JSON.stringify(p.sizes || []), JSON.stringify(p.stock || {}), p.image, p.description || ''],
      )
    }
  })
  const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows)
}))
