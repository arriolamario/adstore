/* Helpers de inventario.
   En productos "stock", product.stock es un objeto { talle: unidades }.
   En productos "order" (a pedido) no hay limite de unidades. */

export const totalStock = (product) => {
  if (!product || product.availability !== 'stock') return 0
  return Object.values(product.stock || {}).reduce((n, q) => n + (Number(q) || 0), 0)
}

/** Unidades disponibles de un talle. Infinity para productos a pedido. */
export const sizeStock = (product, size) => {
  if (!product) return 0
  if (product.availability !== 'stock') return Infinity
  return Number(product.stock?.[size] || 0)
}

export const isSoldOut = (product) =>
  product?.availability === 'stock' && totalStock(product) === 0

/** Talles que se pueden reservar (con unidades, o todos si es a pedido). */
export const availableSizes = (product) => {
  if (!product) return []
  if (product.availability !== 'stock') return product.sizes || []
  return (product.sizes || []).filter((s) => sizeStock(product, s) > 0)
}
