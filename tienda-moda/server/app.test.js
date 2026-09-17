// @vitest-environment node
//
// Test de integracion: levanta la app Express real contra una base de
// Postgres LOCAL de test (.env.test, ver TESTING.md) y pega peticiones HTTP
// de verdad con supertest. No corre con `npm test` (que es solo unitario y
// no necesita una base levantada) — usar `npm run test:integration`.
import { readFileSync } from 'node:fs'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, afterAll, describe, it, expect } from 'vitest'

dotenv.config({ path: '.env.test', override: true })

let app
let pool

// Un admin ya cargado en la base (simulando el que siembra migrate.js) y un
// comprador registrado por la API. Cada uno con su propio "agent" de
// supertest, que persiste la cookie de sesion entre requests — asi se
// prueba el flujo real (login una vez, despues cada pedido va autenticado).
let adminAgent
let customerAgent
let customerId

beforeAll(async () => {
  ;({ pool } = await import('./db.js'))
  const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(schema) // DROP + CREATE: cada corrida arranca de una base limpia
  ;({ default: app } = await import('./app.js'))

  // Un admin no se puede crear via API (a proposito): se siembra directo en
  // la base, igual que hace server/migrate.js en un entorno real.
  const hash = bcrypt.hashSync('admin123', 10)
  await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'admin')`,
    ['Admin Test', 'admin@test.local', hash],
  )
  adminAgent = request.agent(app)
  await adminAgent.post('/api/auth/login').send({ email: 'admin@test.local', password: 'admin123' })

  customerAgent = request.agent(app)
  const custEmail = `cliente-${Date.now()}@example.com`
  const reg = await customerAgent.post('/api/auth/register').send({ name: 'Cliente Test', email: custEmail, password: 'secret123' })
  customerId = reg.body.id
})

afterAll(async () => {
  await pool.end()
})

describe('Auth: sesion via cookie', () => {
  it('login/registro dejan una sesion valida (GET /me funciona)', async () => {
    const me = await customerAgent.get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.id).toBe(customerId)
  })

  it('sin cookie, /me devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('logout invalida la sesion (siguiente /me da 401)', async () => {
    const agent = request.agent(app)
    const email = `logout-${Date.now()}@example.com`
    await agent.post('/api/auth/register').send({ name: 'Logout Test', email, password: 'secret123' })
    expect((await agent.get('/api/auth/me')).status).toBe(200)

    await agent.post('/api/auth/logout')
    expect((await agent.get('/api/auth/me')).status).toBe(401)
  })

  it('rechaza un registro con email duplicado', async () => {
    const email = `dup-${Date.now()}@example.com`
    await request(app).post('/api/auth/register').send({ name: 'A', email, password: 'secret123' })
    const dup = await request(app).post('/api/auth/register').send({ name: 'B', email, password: 'otra123' })
    expect(dup.status).toBe(409)
  })

  it('rechaza login con contrasena incorrecta', async () => {
    const email = `wrongpass-${Date.now()}@example.com`
    await request(app).post('/api/auth/register').send({ name: 'C', email, password: 'correcta1' })
    const login = await request(app).post('/api/auth/login').send({ email, password: 'incorrecta' })
    expect(login.status).toBe(401)
  })

  it('login devuelve un token, y ese token funciona como header Authorization: Bearer (sin cookie) — lo usa la app movil', async () => {
    const email = `bearer-${Date.now()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({ name: 'Bearer Test', email, password: 'secret123' })
    expect(reg.body.token).toBeTruthy()

    // request(app) sin agent: no manda la cookie de la registracion anterior.
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`)
    expect(me.status).toBe(200)
    expect(me.body.email).toBe(email)
  })

  it('un Bearer token invalido da 401 igual que sin sesion', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-falso')
    expect(res.status).toBe(401)
  })
})

describe('API productos: lectura publica, escritura solo admin', () => {
  it('GET es publico, no requiere sesion', async () => {
    const list = await request(app).get('/api/products')
    expect(list.status).toBe(200)
  })

  it('POST sin sesion -> 401', async () => {
    const res = await request(app).post('/api/products').send({ name: 'X', price: 1 })
    expect(res.status).toBe(401)
  })

  it('POST con sesion de comprador (no admin) -> 403', async () => {
    const res = await customerAgent.post('/api/products').send({ name: 'X', price: 1 })
    expect(res.status).toBe(403)
  })

  it('POST/PUT/DELETE con sesion de admin funcionan', async () => {
    const create = await adminAgent.post('/api/products').send({
      name: 'Test Shoe', brand: 'Test', category: 'Zapatillas', price: 1000,
      availability: 'stock', sizes: ['40'], stock: { 40: 3 }, image: '', description: '',
    })
    expect(create.status).toBe(201)

    const update = await adminAgent.put(`/api/products/${create.body.id}`).send({ ...create.body, price: 1200 })
    expect(update.status).toBe(200)
    expect(update.body.price).toBe(1200)

    const del = await adminAgent.delete(`/api/products/${create.body.id}`)
    expect(del.status).toBe(200)
  })
})

describe('API categorias: lectura publica, escritura solo admin', () => {
  it('GET es publico, no requiere sesion', async () => {
    const list = await request(app).get('/api/categories')
    expect(list.status).toBe(200)
  })

  it('POST sin sesion -> 401, con sesion de comprador -> 403', async () => {
    expect((await request(app).post('/api/categories').send({ name: 'X' })).status).toBe(401)
    expect((await customerAgent.post('/api/categories').send({ name: 'X' })).status).toBe(403)
  })

  it('un admin crea, lista y elimina una categoria', async () => {
    const create = await adminAgent.post('/api/categories').send({ name: `Deportiva ${Date.now()}` })
    expect(create.status).toBe(201)
    expect(create.body.id).toBeTruthy() // se genero un slug como id

    const list = await request(app).get('/api/categories')
    expect(list.body.some((c) => c.id === create.body.id)).toBe(true)

    const del = await adminAgent.delete(`/api/categories/${create.body.id}`)
    expect(del.status).toBe(200)
  })

  it('rechaza crear dos categorias con el mismo nombre', async () => {
    const name = `Unica ${Date.now()}`
    await adminAgent.post('/api/categories').send({ name })
    const dup = await adminAgent.post('/api/categories').send({ name })
    expect(dup.status).toBe(409)
  })

  it('renombrar una categoria actualiza los productos que la usaban', async () => {
    const oldName = `Vieja ${Date.now()}`
    const newName = `Nueva ${Date.now()}`
    const cat = await adminAgent.post('/api/categories').send({ name: oldName })

    const product = await adminAgent.post('/api/products').send({
      name: 'Producto de la categoria', brand: 'Test', category: oldName, price: 100,
      availability: 'stock', sizes: [], stock: {}, image: '', description: '',
    })

    const rename = await adminAgent.put(`/api/categories/${cat.body.id}`).send({ name: newName })
    expect(rename.status).toBe(200)
    expect(rename.body.name).toBe(newName)

    const refreshed = await request(app).get('/api/products')
    const updated = refreshed.body.find((p) => p.id === product.body.id)
    expect(updated.category).toBe(newName)
  })

  it('no deja eliminar una categoria que tiene productos', async () => {
    const name = `En uso ${Date.now()}`
    const cat = await adminAgent.post('/api/categories').send({ name })
    await adminAgent.post('/api/products').send({
      name: 'Ocupa la categoria', brand: 'Test', category: name, price: 100,
      availability: 'stock', sizes: [], stock: {}, image: '', description: '',
    })

    const del = await adminAgent.delete(`/api/categories/${cat.body.id}`)
    expect(del.status).toBe(409)
  })
})

describe('API usuarios: CRUD admin + acceso a datos propios', () => {
  it('listar todos los usuarios requiere admin', async () => {
    expect((await request(app).get('/api/users')).status).toBe(401)
    expect((await customerAgent.get('/api/users')).status).toBe(403)
    expect((await adminAgent.get('/api/users')).status).toBe(200)
  })

  it('un comprador puede ver y editar su propio perfil', async () => {
    const get = await customerAgent.get(`/api/users/${customerId}`)
    expect(get.status).toBe(200)

    const update = await customerAgent.put(`/api/users/${customerId}`).send({ phone: '1155555555' })
    expect(update.status).toBe(200)
    expect(update.body.phone).toBe('1155555555')
  })

  it('un comprador NO puede ver el perfil de otro usuario', async () => {
    const res = await customerAgent.get('/api/users/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(403)
  })

  it('un comprador que manda role:"admin" en su propio perfil NO se auto-promueve', async () => {
    const before = await customerAgent.get(`/api/users/${customerId}`)
    expect(before.body.role).toBe('customer')

    const update = await customerAgent.put(`/api/users/${customerId}`).send({ role: 'admin' })
    expect(update.status).toBe(200)
    expect(update.body.role).toBe('customer') // el intento se ignora

    const after = await customerAgent.get(`/api/users/${customerId}`)
    expect(after.body.role).toBe('customer')
  })

  it('un admin si puede cambiar el rol de otro usuario', async () => {
    const create = await adminAgent.post('/api/users').send({
      name: 'Promovible', email: `promo-${Date.now()}@example.com`, password: 'secret123', role: 'customer',
    })
    const update = await adminAgent.put(`/api/users/${create.body.id}`).send({ role: 'admin' })
    expect(update.body.role).toBe('admin')
  })

  it('cambiar la contrasena permite loguearse con la nueva y no con la vieja', async () => {
    const email = `crud-pass-${Date.now()}@example.com`
    const create = await adminAgent.post('/api/users').send({ name: 'Pass', email, password: 'original1' })
    await adminAgent.put(`/api/users/${create.body.id}`).send({ password: 'nueva1234' })

    expect((await request(app).post('/api/auth/login').send({ email, password: 'original1' })).status).toBe(401)
    expect((await request(app).post('/api/auth/login').send({ email, password: 'nueva1234' })).status).toBe(200)
  })

  it('un admin no puede eliminar su propia cuenta', async () => {
    const res = await adminAgent.delete(`/api/users/${(await adminAgent.get('/api/auth/me')).body.id}`)
    expect(res.status).toBe(400)
  })

  it('un admin puede eliminar la cuenta de otro usuario', async () => {
    const create = await adminAgent.post('/api/users').send({
      name: 'Borrame', email: `del-${Date.now()}@example.com`, password: 'secret123',
    })
    const del = await adminAgent.delete(`/api/users/${create.body.id}`)
    expect(del.status).toBe(200)
    expect((await adminAgent.get(`/api/users/${create.body.id}`)).status).toBe(404)
  })
})

describe('API reservas: dueno de sesion, no del body; stock transaccional', () => {
  let productId
  let orderId

  beforeAll(async () => {
    const create = await adminAgent.post('/api/products').send({
      name: 'Stock Test Shoe', brand: 'Test', category: 'Zapatillas', price: 500,
      availability: 'stock', sizes: ['40'], stock: { 40: 2 }, image: '', description: '',
    })
    productId = create.body.id
  })

  const currentStock = async () => {
    const list = await request(app).get('/api/products')
    return list.body.find((p) => p.id === productId).stock['40']
  }

  it('crear una reserva sin sesion -> 401', async () => {
    const res = await request(app).post('/api/orders').send({ fulfillment: 'pickup', items: [] })
    expect(res.status).toBe(401)
  })

  it('la reserva queda a nombre del usuario de la sesion, no del body', async () => {
    const order = await customerAgent.post('/api/orders').send({
      userId: '00000000-0000-0000-0000-000000000000', // intento de spoofear otro dueno
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 1 }],
    })
    expect(order.status).toBe(201)
    expect(order.body.userId).toBe(customerId) // se ignoro el userId del body
    orderId = order.body.id
  })

  it('descuenta stock por talle al confirmar la reserva', async () => {
    expect(await currentStock()).toBe(1) // ya bajo 1 por la reserva anterior
  })

  it('rechaza la reserva si no hay stock suficiente (409) y no descuenta nada', async () => {
    const before = await currentStock()
    const order = await customerAgent.post('/api/orders').send({
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 99 }],
    })
    expect(order.status).toBe(409)
    expect(await currentStock()).toBe(before)
  })

  it('un comprador solo ve sus propias reservas', async () => {
    const mine = await customerAgent.get('/api/orders')
    expect(mine.status).toBe(200)
    expect(mine.body.every((o) => o.userId === customerId)).toBe(true)
    expect(mine.body.some((o) => o.id === orderId)).toBe(true)
  })

  it('el admin ve todas las reservas', async () => {
    const all = await adminAgent.get('/api/orders')
    expect(all.status).toBe(200)
    expect(all.body.some((o) => o.id === orderId)).toBe(true)
  })

  it('un comprador no puede cambiar el estado de una reserva (solo admin)', async () => {
    const res = await customerAgent.patch(`/api/orders/${orderId}/status`).send({ status: 'cancelado' })
    expect(res.status).toBe(403)
  })

  it('cancelar la reserva (admin) repone el stock', async () => {
    const before = await currentStock()
    const cancel = await adminAgent.patch(`/api/orders/${orderId}/status`).send({ status: 'cancelado' })
    expect(cancel.status).toBe(200)
    expect(cancel.body.status).toBe('cancelado')
    expect(await currentStock()).toBe(before + 1)
  })

  it('reactivar una reserva cancelada vuelve a descontar el stock', async () => {
    const before = await currentStock()
    const reactivate = await adminAgent.patch(`/api/orders/${orderId}/status`).send({ status: 'reservado' })
    expect(reactivate.status).toBe(200)
    expect(await currentStock()).toBe(before - 1)
  })

  it('eliminar una reserva sin sesion -> 401, como comprador -> 403', async () => {
    expect((await request(app).delete(`/api/orders/${orderId}`)).status).toBe(401)
    expect((await customerAgent.delete(`/api/orders/${orderId}`)).status).toBe(403)
  })

  it('el admin elimina una reserva activa y se repone el stock', async () => {
    const before = await currentStock()
    const del = await adminAgent.delete(`/api/orders/${orderId}`)
    expect(del.status).toBe(200)
    expect(await currentStock()).toBe(before + 1)

    const stillThere = await adminAgent.get('/api/orders')
    expect(stillThere.body.some((o) => o.id === orderId)).toBe(false)
  })

  it('eliminar una reserva ya entregada no repone stock (ya salio del local)', async () => {
    const order = await customerAgent.post('/api/orders').send({
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 1 }],
    })
    await adminAgent.patch(`/api/orders/${order.body.id}/status`).send({ status: 'entregado' })

    const before = await currentStock()
    const del = await adminAgent.delete(`/api/orders/${order.body.id}`)
    expect(del.status).toBe(200)
    expect(await currentStock()).toBe(before) // sin cambios
  })

  it('eliminar una reserva ya cancelada no vuelve a reponer stock (ya se habia repuesto)', async () => {
    const order = await customerAgent.post('/api/orders').send({
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 1 }],
    })
    await adminAgent.patch(`/api/orders/${order.body.id}/status`).send({ status: 'cancelado' })

    const before = await currentStock()
    const del = await adminAgent.delete(`/api/orders/${order.body.id}`)
    expect(del.status).toBe(200)
    expect(await currentStock()).toBe(before) // sin cambios, no se duplica la reposicion
  })
})
