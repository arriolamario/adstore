// @vitest-environment node
//
// Test de integracion: levanta la app Express real contra una base de
// Postgres LOCAL de test (.env.test, ver TESTING.md) y pega peticiones HTTP
// de verdad con supertest. No corre con `npm test` (que es solo unitario y
// no necesita una base levantada) — usar `npm run test:integration`.
import { readFileSync } from 'node:fs'
import dotenv from 'dotenv'
import request from 'supertest'
import { beforeAll, afterAll, describe, it, expect } from 'vitest'

dotenv.config({ path: '.env.test', override: true })

let app
let pool

beforeAll(async () => {
  ;({ pool } = await import('./db.js'))
  const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(schema) // DROP + CREATE: cada corrida arranca de una base limpia
  ;({ default: app } = await import('./app.js'))
})

afterAll(async () => {
  await pool.end()
})

describe('API productos', () => {
  it('POST crea un producto y GET lo devuelve en el listado', async () => {
    const create = await request(app).post('/api/products').send({
      name: 'Test Shoe', brand: 'Test', category: 'Zapatillas', price: 1000,
      availability: 'stock', sizes: ['40'], stock: { 40: 3 }, image: '', description: '',
    })
    expect(create.status).toBe(201)
    expect(create.body.name).toBe('Test Shoe')

    const list = await request(app).get('/api/products')
    expect(list.status).toBe(200)
    expect(list.body.some((p) => p.id === create.body.id)).toBe(true)
  })

  it('DELETE elimina el producto', async () => {
    const create = await request(app).post('/api/products').send({
      name: 'Borrame', brand: 'Test', category: 'Ropa', price: 1, availability: 'stock', sizes: [], stock: {},
    })
    const del = await request(app).delete(`/api/products/${create.body.id}`)
    expect(del.status).toBe(200)

    const list = await request(app).get('/api/products')
    expect(list.body.some((p) => p.id === create.body.id)).toBe(false)
  })
})

describe('API auth', () => {
  it('registra y loguea un usuario nuevo', async () => {
    const email = `test-${Date.now()}@example.com`
    const reg = await request(app).post('/api/auth/register').send({ name: 'Test User', email, password: 'secret123' })
    expect(reg.status).toBe(201)
    expect(reg.body.password).toBeUndefined() // nunca se devuelve el hash

    const login = await request(app).post('/api/auth/login').send({ email, password: 'secret123' })
    expect(login.status).toBe(200)
    expect(login.body.email).toBe(email)
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
})

describe('API reservas: stock transaccional', () => {
  let productId
  let orderId

  beforeAll(async () => {
    const create = await request(app).post('/api/products').send({
      name: 'Stock Test Shoe', brand: 'Test', category: 'Zapatillas', price: 500,
      availability: 'stock', sizes: ['40'], stock: { 40: 2 }, image: '', description: '',
    })
    productId = create.body.id
  })

  const currentStock = async () => {
    const list = await request(app).get('/api/products')
    return list.body.find((p) => p.id === productId).stock['40']
  }

  it('descuenta stock por talle al confirmar la reserva', async () => {
    expect(await currentStock()).toBe(2)

    const order = await request(app).post('/api/orders').send({
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 1 }],
    })
    expect(order.status).toBe(201)
    expect(order.body.status).toBe('reservado')
    orderId = order.body.id

    expect(await currentStock()).toBe(1)
  })

  it('rechaza la reserva si no hay stock suficiente (409) y no descuenta nada', async () => {
    const before = await currentStock()
    const order = await request(app).post('/api/orders').send({
      fulfillment: 'pickup',
      customer: { name: 'Cliente', phone: '1155555555', email: 'cliente@example.com' },
      items: [{ productId, name: 'Stock Test Shoe', brand: 'Test', price: 500, image: '', availability: 'stock', size: '40', qty: 99 }],
    })
    expect(order.status).toBe(409)
    expect(await currentStock()).toBe(before)
  })

  it('cancelar la reserva repone el stock', async () => {
    const before = await currentStock()
    const cancel = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'cancelado' })
    expect(cancel.status).toBe(200)
    expect(cancel.body.status).toBe('cancelado')
    expect(await currentStock()).toBe(before + 1)
  })

  it('reactivar una reserva cancelada vuelve a descontar el stock', async () => {
    const before = await currentStock()
    const reactivate = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'reservado' })
    expect(reactivate.status).toBe(200)
    expect(await currentStock()).toBe(before - 1)
  })
})
