import { Router } from 'express'
import { withTransaction, query } from '../db.js'
import { wrap, fail } from '../lib/http.js'
import { mapOrder } from '../lib/mappers.js'
import { requireAuth, requireAdmin } from '../lib/auth.js'
import { adjustStockForItems } from '../lib/stock.js'
import { addBusinessDays, uid } from '../../src/lib/format.js'

export const ordersRouter = Router()

const ORDER_LEAD_DAYS = 5

// Un comprador solo ve sus propias reservas; el admin puede pedir todas o
// filtrar por cualquier userId. El query param se ignora si no sos admin.
ordersRouter.get('/', requireAuth, wrap(async (req, res) => {
  const userId = req.user.role === 'admin' ? (req.query.userId || null) : req.user.id
  const { rows } = userId
    ? await query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM orders ORDER BY created_at DESC')
  res.json(rows.map(mapOrder))
}))

// Crea la reserva y descuenta stock por talle (transaccional). El dueno de
// la reserva es siempre el usuario de la sesion, nunca lo que mande el body
// (evita que alguien cree una reserva a nombre de otro usuario).
ordersRouter.post('/', requireAuth, wrap(async (req, res) => {
  const { fulfillment, customer, items } = req.body
  const userId = req.user.id
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
      [id, userId, fulfillment || 'pickup', JSON.stringify(customer || {}),
        JSON.stringify(items), subtotal, estimated.toISOString()],
    )
    return rows[0]
  })

  res.status(201).json(mapOrder(order))
}))

// Cambia el estado. Al cancelar repone stock; al reactivar una cancelada lo vuelve a descontar.
ordersRouter.patch('/:id/status', requireAdmin, wrap(async (req, res) => {
  const { status } = req.body
  const order = await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id])
    if (!rows.length) throw fail(404, 'Reserva no encontrada')
    const prev = rows[0].status
    const items = rows[0].items || []

    if (status === 'cancelado' && prev !== 'cancelado') await adjustStockForItems(client, items, +1)
    if (prev === 'cancelado' && status !== 'cancelado') await adjustStockForItems(client, items, -1)

    const upd = await client.query('UPDATE orders SET status=$2 WHERE id=$1 RETURNING *', [req.params.id, status])
    return upd.rows[0]
  })
  res.json(mapOrder(order))
}))

// Elimina la reserva. Si el stock seguia "tomado" por ella (cualquier estado
// salvo cancelado -ya repuesto- o entregado -ya salio del local-), se repone
// antes de borrar, para no perder unidades.
ordersRouter.delete('/:id', requireAdmin, wrap(async (req, res) => {
  await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id])
    if (!rows.length) throw fail(404, 'Reserva no encontrada')
    const { status, items } = rows[0]

    if (status !== 'cancelado' && status !== 'entregado') {
      await adjustStockForItems(client, items || [], +1)
    }

    await client.query('DELETE FROM orders WHERE id=$1', [req.params.id])
  })
  res.json({ ok: true })
}))
