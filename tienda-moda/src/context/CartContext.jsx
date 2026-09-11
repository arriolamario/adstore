import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sizeStock } from '../lib/inventory'
import { api } from '../lib/api'

const CartContext = createContext(null)

const lineKey = (productId, size) => `${productId}::${size || 'u'}`

export function CartProvider({ children }) {
  // El carrito es un borrador local; las reservas confirmadas viven en Postgres.
  const [items, setItems] = useLocalStorage('adstore.cart', [])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const addItem = useCallback((product, size, qty = 1) => {
    const finalSize = size || 'Unico'
    const units = sizeStock(product, finalSize) // Infinity si es a pedido
    if (units <= 0) return
    const max = Number.isFinite(units) ? units : null
    setItems((prev) => {
      const key = lineKey(product.id, finalSize)
      const found = prev.find((i) => i.key === key)
      if (found) {
        const capped = max ? Math.min(found.qty + qty, max) : found.qty + qty
        return prev.map((i) => (i.key === key ? { ...i, qty: capped, max } : i))
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
          availability: product.availability,
          size: finalSize,
          qty: max ? Math.min(qty, max) : qty,
          max,
        },
      ]
    })
    setDrawerOpen(true)
  }, [setItems])

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: i.max ? Math.min(qty, i.max) : qty } : i)),
    )
  }, [setItems])

  const removeItem = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), [setItems])
  const clearCart = useCallback(() => setItems([]), [setItems])

  const totals = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0)
    const hasOrderItems = items.some((i) => i.availability === 'order')
    return { count, subtotal, hasOrderItems }
  }, [items])

  const loadOrders = useCallback(async (userId) => {
    setOrdersLoading(true)
    try {
      setOrders(await api.orders.list(userId))
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  const createOrder = useCallback(async ({ userId, fulfillment, customer }) => {
    const order = await api.orders.create({
      userId,
      fulfillment,
      customer,
      items: items.map(({ key, max, ...rest }) => rest),
    })
    setOrders((prev) => [order, ...prev])
    setItems([])
    return order
  }, [items, setItems])

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const updated = await api.orders.setStatus(orderId, status)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    return updated
  }, [])

  const ordersForUser = useCallback(
    (userId) => orders.filter((o) => o.userId === userId),
    [orders],
  )

  const value = {
    items,
    orders,
    ordersLoading,
    ordersForUser,
    loadOrders,
    ...totals,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem,
    setQty,
    removeItem,
    clearCart,
    createOrder,
    updateOrderStatus,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
