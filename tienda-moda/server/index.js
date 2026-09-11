import 'dotenv/config'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'
import bcrypt from 'bcryptjs'
import { pool, query, withTransaction } from './db.js'
import { SEED_PRODUCTS } from '../src/data/products.js'
import { addBusinessDays, uid } from '../src/lib/format.js'

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '12mb' })) // imagenes en base64

const ORDER_LEAD_DAYS = 5

/* ---------- mappers DB -> shape del frontend ---------- */
const mapUser = (r) => ({
  id: r.id, name: r.name, email: r.email, role: r.role,
  phone: r.phone || '', address: r.address || '',
})
const mapOrder = (r) => ({
  id: r.id, userId: r.user_id, status: r.status, fulfillment: r.fulfillment,
  customer: r.customer || {}, items: r.items || [], subtotal: r.subtotal,
  estimatedReadyAt: r.estimated_ready_at, createdAt: r.created_at,
})

const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno' })
})
const fail = (status, message) => Object.assign(new Error(message), { status })

/* ===================== PRODUCTOS ===================== */
app.get('/api/products', wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows)
}))

app.post('/api/products', wrap(async (req, res) => {
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

app.put('/api/products/:id', wrap(async (req, res) => {
  const p = req.body
  const { rows } = await query(
    `UPDATE products SET name=$2, brand=$3, category=$4, price=$5, availability=$6,
       sizes=$7::jsonb, stock=$8::jsonb, image=$9, description=$10, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [req.params.id, p.name, p.brand || '', p.category || '', Number(p.price) || 0, p.availability || 'stock',
      JSON.stringify(p.sizes || []), JSON.stringify(p.stock || {}), p.image || '', p.description || ''],
  )
  if (!rows.length) throw fail(404, 'Producto no encontrado')
  res.json(rows[0])
}))

app.delete('/api/products/:id', wrap(async (req, res) => {
  await query('DELETE FROM products WHERE id=$1', [req.params.id])
  res.json({ ok: true })
}))

// Restaura el catalogo semilla (borra todos los productos y vuelve a cargarlos).
app.post('/api/products/reset', wrap(async (_req, res) => {
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

/* ===================== AUTH / USUARIOS ===================== */
app.post('/api/auth/register', wrap(async (req, res) => {
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

app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [String(email || '').toLowerCase()])
  const user = rows[0]
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    throw fail(401, 'Email o contrasena incorrectos.')
  }
  res.json(mapUser(user))
}))

app.put('/api/users/:id', wrap(async (req, res) => {
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

/* ===================== RESERVAS ===================== */
app.get('/api/orders', wrap(async (req, res) => {
  const { userId } = req.query
  const { rows } = userId
    ? await query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId])
    : await query('SELECT * FROM orders ORDER BY created_at DESC')
  res.json(rows.map(mapOrder))
}))

// Crea la reserva y descuenta stock por talle (transaccional).
app.post('/api/orders', wrap(async (req, res) => {
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
app.patch('/api/orders/:id/status', wrap(async (req, res) => {
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

/* ===================== ESTATICOS (build de produccion) ===================== */
const distDir = path.join(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => console.log(`API AdStore escuchando en http://localhost:${PORT}`))

process.on('SIGTERM', () => pool.end())
