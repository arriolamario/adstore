// @vitest-environment node
//
// Las plantillas son funciones puras (arman HTML a partir de datos), asi
// que se testean sin red y sin base de datos — no dependen de RESEND_API_KEY.
import { describe, it, expect } from 'vitest'
import { welcomeEmailHtml, orderConfirmationHtml, orderStatusEmailHtml } from './email.js'

const order = {
  id: 'ORD-TEST1234',
  status: 'listo',
  fulfillment: 'pickup',
  estimatedReadyAt: '2026-09-20T00:00:00.000Z',
  items: [
    { name: 'Runner Pro Air', size: '40', qty: 2, price: 100 },
    { name: 'Remera Pima', size: 'M', qty: 1, price: 50 },
  ],
}

describe('welcomeEmailHtml', () => {
  it('saluda por el nombre de pila', () => {
    const html = welcomeEmailHtml({ name: 'Maria Lopez', email: 'maria@example.com' })
    expect(html).toContain('Maria')
    expect(html).toContain('Bienvenido')
  })

  it('no deja un link roto si no hay SITE_URL configurada', () => {
    const html = welcomeEmailHtml({ name: 'Maria', email: 'maria@example.com' })
    expect(html).not.toContain('href="undefined')
    expect(html).not.toContain('href="/catalogo"') // no debe armar un link relativo sin dominio
  })
})

describe('orderConfirmationHtml', () => {
  it('incluye el codigo de la reserva y el detalle de items con el subtotal correcto', () => {
    const html = orderConfirmationHtml(order)
    expect(html).toContain('ORD-TEST1234')
    expect(html).toContain('Runner Pro Air')
    expect(html).toContain('Remera Pima')
    // subtotal: 2*100 + 1*50 = 250
    expect(html).toMatch(/250/)
  })
})

describe('orderStatusEmailHtml', () => {
  it('muestra la etiqueta de estado segun la forma de entrega (listo para retiro)', () => {
    const html = orderStatusEmailHtml(order)
    expect(html).toContain('Listo para retiro')
  })

  it('distingue "listo para envio" cuando el fulfillment es shipping', () => {
    const html = orderStatusEmailHtml({ ...order, fulfillment: 'shipping' })
    expect(html).toContain('Listo para envio')
  })
})
