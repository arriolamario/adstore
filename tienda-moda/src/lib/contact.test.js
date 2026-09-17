import { describe, it, expect } from 'vitest'
import { whatsappLinkWithMessage, orderWhatsAppMessage, WHATSAPP_URL } from './contact'

describe('whatsappLinkWithMessage', () => {
  it('arma un link a wa.me con el mensaje codificado', () => {
    const link = whatsappLinkWithMessage('Hola mundo')
    expect(link).toBe(`${WHATSAPP_URL}?text=Hola%20mundo`)
  })
})

describe('orderWhatsAppMessage', () => {
  it('menciona el codigo de la reserva y "retiro en el local" si corresponde', () => {
    const msg = orderWhatsAppMessage({ id: 'ORD-ABC123', fulfillment: 'pickup' })
    expect(msg).toContain('ORD-ABC123')
    expect(msg).toContain('retiro en el local')
  })

  it('menciona "envio a domicilio" cuando el fulfillment es shipping', () => {
    const msg = orderWhatsAppMessage({ id: 'ORD-XYZ789', fulfillment: 'shipping' })
    expect(msg).toContain('envio a domicilio')
  })
})
