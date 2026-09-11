import { describe, it, expect } from 'vitest'
import { statusMeta, statusLabel, ORDER_STATUSES } from './orders'

describe('statusMeta', () => {
  it('devuelve los metadatos del estado pedido', () => {
    expect(statusMeta('cancelado')).toEqual(
      expect.objectContaining({ value: 'cancelado', label: 'Cancelado' }),
    )
  })

  it('cae al primer estado (reservado) ante un valor desconocido', () => {
    expect(statusMeta('estado-inexistente')).toEqual(ORDER_STATUSES[0])
  })
})

describe('statusLabel', () => {
  it('distingue "listo para retiro" de "listo para envio"', () => {
    expect(statusLabel({ status: 'listo', fulfillment: 'pickup' })).toBe('Listo para retiro')
    expect(statusLabel({ status: 'listo', fulfillment: 'shipping' })).toBe('Listo para envio')
  })

  it('para el resto de los estados usa la etiqueta generica', () => {
    expect(statusLabel({ status: 'entregado', fulfillment: 'pickup' })).toBe('Entregado')
  })
})
