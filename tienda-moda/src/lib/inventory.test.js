import { describe, it, expect } from 'vitest'
import { totalStock, sizeStock, isSoldOut, availableSizes } from './inventory'

const stockProduct = {
  availability: 'stock',
  sizes: ['38', '39', '40'],
  stock: { 38: 0, 39: 2, 40: 1 },
}

const orderProduct = {
  availability: 'order',
  sizes: ['38', '39', '40'],
  stock: {},
}

describe('totalStock', () => {
  it('suma las unidades de todos los talles', () => {
    expect(totalStock(stockProduct)).toBe(3)
  })

  it('devuelve 0 para productos a pedido', () => {
    expect(totalStock(orderProduct)).toBe(0)
  })

  it('devuelve 0 si el producto no existe', () => {
    expect(totalStock(null)).toBe(0)
  })
})

describe('sizeStock', () => {
  it('devuelve las unidades de un talle puntual', () => {
    expect(sizeStock(stockProduct, '39')).toBe(2)
  })

  it('devuelve 0 para un talle sin stock cargado', () => {
    expect(sizeStock(stockProduct, '38')).toBe(0)
    expect(sizeStock(stockProduct, '41')).toBe(0)
  })

  it('un producto a pedido no tiene limite de unidades (Infinity)', () => {
    expect(sizeStock(orderProduct, '38')).toBe(Infinity)
  })
})

describe('isSoldOut', () => {
  it('false si al menos un talle tiene stock', () => {
    expect(isSoldOut(stockProduct)).toBe(false)
  })

  it('true si el total de stock es 0', () => {
    expect(isSoldOut({ ...stockProduct, stock: { 38: 0, 39: 0, 40: 0 } })).toBe(true)
  })

  it('un producto a pedido nunca esta "agotado"', () => {
    expect(isSoldOut(orderProduct)).toBe(false)
  })
})

describe('availableSizes', () => {
  it('filtra los talles sin stock en productos "stock"', () => {
    expect(availableSizes(stockProduct)).toEqual(['39', '40'])
  })

  it('devuelve todos los talles declarados en productos "order"', () => {
    expect(availableSizes(orderProduct)).toEqual(['38', '39', '40'])
  })
})
