import { Router } from 'express'
import { withTransaction, query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapOrder } from '../lib/mappers.js'
import { addBusinessDays, uid } from '../../src/lib/format.js'

export const ordersRouter = Router()

const ORDER_LEAD_DAYS = 5

ordersRouter.get('/', wrap(async (req, res) => {
  const { userId } = req.query
  const { rows } = userId
    ? await query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM orders ORDER BY created_at DESC')
  res.json(rows.map(mapOrder))
}))

// Crea la reserva y descuenta stock por talle (transaccional).
ordersRouter.post('/', wrap(async (req, res) => {
  const { userId, fulfillment, customer, items } = req.body
  if (!Array.isArray(items) || items.length === 0) throw fail(400, 'La reserva no tiene items')

  const order = await withTransaction(async (client) => {
    for (const it of items.filter((i) => i.availability === 'stock')) {
      const { rows } = await client.query('SELECT stock FROM products WHERE id=$1 FOR UPDATE', [it.productId])
      if (!rows.length) throw fail(409, `El producto "${it.name}" ya no existe`)
      const stock = rows[0].stock || {}
      const current = Number(stock[it.size] || 0)
      if (current < it.qty) throw fail(409, `Sin stock suficiente de "${it.name}" (talle ${it.size})`)
      stock[it.size] = current - it.qty
      await client.query('UPDATE products SET stock=$1::jsonb, updated_at=now() WHERE id=$2',
        [JSON.stringify(stock), it.productId])
    }

    const id = `ORD-${uid().toUpperCase()}`
    const subtotal = items.reduce((n, i) => n + Number(i.price) * Number(i.qty), 0)
    const hasOrderItems = items.some((i) => i.availability === 'order')
    const estimated = addBusinessDays(new Date(), hasOrderItems ? ORDER_LEAD_DAYS : 1)

    const { rows } = await client.query(
      `INSERT INTO orders (id, user_id, status, fulfillment, customer, items, subtotal, estimated_ready_at)
       VALUES ($1,$2,'reservado',$3,$4::jsonb,$5::jsonb,$6,$7)
       RETURNING *`,
      [id, userId || null, fulfillment || 'pickup', JSON.stringify(customer || {}),
        JSON.stringify(items), subtotal, estimated.toISOString()],
    )
    return rows[0]
  })

  res.status(201).json(mapOrder(order))
}))

// Cambia el estado. Al cancelar repone stock; al reactivar una cancelada lo vuelve a descontar.
ordersRouter.patch('/:id/status', wrap(async (req, res) => {
  const { status } = req.body
  const order = await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id])
    if (!rows.length) throw fail(404, 'Reserva no encontrada')
    const prev = rows[0].status
    const items = rows[0].items || []

    const adjust = (sign) => Promise.all(
      items.filter((i) => i.availability === 'stock').map(async (it) => {
        const r = await client.query('SELECT stock FROM products WHERE id=$1 FOR UPDATE', [it.productId])
        if (!r.rows.length) return
        const stock = r.rows[0].stock || {}
        stock[it.size] = Math.max(0, Number(stock[it.size] || 0) + sign * Number(it.qty))
        await client.query('UPDATE products SET stock=$1::jsonb, updated_at=now() WHERE id=$2',
          [JSON.stringify(stock), it.productId])
      }),
    )

    if (status === 'cancelado' && prev !== 'cancelado') await adjust(+1)
    if (prev === 'cancelado' && status !== 'cancelado') await adjust(-1)

    const upd = await client.query('UPDATE orders SET status=$2 WHERE id=$1 RETURNING *', [req.params.id, status])
    return upd.rows[0]
  })
  res.json(mapOrder(order))
}))
