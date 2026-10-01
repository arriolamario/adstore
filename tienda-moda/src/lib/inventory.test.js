import { describe, it, expect } from 'vitest'
import { totalStock, sizeStock, isSoldOut, availableSizes, hasColors, stockKey, availableColors, imageForColor } from './inventory'

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

const colorProduct = {
  availability: 'stock',
  image: 'remera.jpg',
  sizes: ['M', 'L'],
  colors: [{ name: 'Negro', image: 'negro.jpg' }, { name: 'Blanco', image: '' }],
  stock: { 'M|Negro': 2, 'L|Negro': 0, 'M|Blanco': 3, 'L|Blanco': 1 },
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

describe('productos con color (dimension opcional)', () => {
  it('hasColors distingue productos con y sin variantes de color', () => {
    expect(hasColors(colorProduct)).toBe(true)
    expect(hasColors(stockProduct)).toBe(false)
  })

  it('stockKey combina talle y color solo si se pasa color', () => {
    expect(stockKey('L', 'Negro')).toBe('L|Negro')
    expect(stockKey('L', undefined)).toBe('L')
  })

  it('sizeStock usa la clave talle+color cuando corresponde', () => {
    expect(sizeStock(colorProduct, 'M', 'Negro')).toBe(2)
    expect(sizeStock(colorProduct, 'M', 'Blanco')).toBe(3)
    expect(sizeStock(colorProduct, 'L', 'Negro')).toBe(0)
  })

  it('availableSizes filtra por color', () => {
    expect(availableSizes(colorProduct, 'Negro')).toEqual(['M'])
    expect(availableSizes(colorProduct, 'Blanco')).toEqual(['M', 'L'])
  })

  it('availableColors solo lista colores con algun talle en stock', () => {
    const soldOutBlanco = { ...colorProduct, stock: { 'M|Negro': 2, 'L|Negro': 0, 'M|Blanco': 0, 'L|Blanco': 0 } }
    expect(availableColors(colorProduct)).toEqual(['Negro', 'Blanco'])
    expect(availableColors(soldOutBlanco)).toEqual(['Negro'])
  })

  it('availableColors devuelve vacio si el producto no usa colores', () => {
    expect(availableColors(stockProduct)).toEqual([])
  })

  it('imageForColor usa la foto del color, y cae a la del producto si no tiene', () => {
    expect(imageForColor(colorProduct, 'Negro')).toBe('negro.jpg')
    expect(imageForColor(colorProduct, 'Blanco')).toBe('remera.jpg') // sin foto propia
    expect(imageForColor(stockProduct, undefined)).toBe('') // stockProduct no tiene .image ni colores
  })
})
