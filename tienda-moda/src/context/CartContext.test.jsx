import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const stockProduct = {
  id: 'p-001', name: 'Runner Pro Air', brand: 'Vellon', price: 100,
  image: '', availability: 'stock', sizes: ['40'], stock: { 40: 2 },
}

const orderProduct = {
  id: 'p-003', name: 'Trail Storm GTX', brand: 'Kova', price: 200,
  image: '', availability: 'order', sizes: ['41'], stock: {},
}

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

beforeEach(() => {
  window.localStorage.clear()
})

describe('CartContext', () => {
  it('agrega un producto nuevo al carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(stockProduct, '40'))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toMatchObject({ productId: 'p-001', size: '40', qty: 1 })
    expect(result.current.count).toBe(1)
    expect(result.current.subtotal).toBe(100)
  })

  it('no deja reservar mas unidades que el stock disponible del talle', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(stockProduct, '40', 5)) // stock real: 2
    expect(result.current.items[0].qty).toBe(2)

    act(() => result.current.setQty(result.current.items[0].key, 10))
    expect(result.current.items[0].qty).toBe(2)
  })

  it('no agrega nada si el talle no tiene stock', () => {
    const soldOut = { ...stockProduct, stock: { 40: 0 } }
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(soldOut, '40'))

    expect(result.current.items).toHaveLength(0)
  })

  it('los productos a pedido no tienen tope de cantidad', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(orderProduct, '41', 50))

    expect(result.current.items[0].qty).toBe(50)
  })

  it('setQty a 0 quita el producto del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(stockProduct, '40'))
    act(() => result.current.setQty(result.current.items[0].key, 0))

    expect(result.current.items).toHaveLength(0)
  })

  it('marca hasOrderItems cuando hay algun producto a pedido en el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(orderProduct, '41'))

    expect(result.current.hasOrderItems).toBe(true)
  })
})
