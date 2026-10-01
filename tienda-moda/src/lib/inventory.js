/* Helpers de inventario.
   En productos "stock", product.stock es un objeto { clave: unidades }.
   La clave es el talle solo ("40"), O "talle|color" ("L|Negro") si el
   producto tiene colores cargados (product.colors). El color es opcional
   por producto: uno sin colores funciona exactamente como antes (stock
   por talle, sin mas). En productos "order" (a pedido) no hay limite. */

/** true si el producto maneja variantes de color (no todos los productos las tienen). */
export const hasColors = (product) => !!(product?.colors && product.colors.length > 0)

export const stockKey = (size, color) => (color ? `${size}|${color}` : size)

export const totalStock = (product) => {
  if (!product || product.availability !== 'stock') return 0
  return Object.values(product.stock || {}).reduce((n, q) => n + (Number(q) || 0), 0)
}

/** Unidades disponibles de talle (+ color, si el producto los usa). Infinity si es a pedido. */
export const sizeStock = (product, size, color) => {
  if (!product) return 0
  if (product.availability !== 'stock') return Infinity
  return Number(product.stock?.[stockKey(size, color)] || 0)
}

export const isSoldOut = (product) =>
  product?.availability === 'stock' && totalStock(product) === 0

/** Talles con unidades para el color dado (o en general, si el producto no usa colores). */
export const availableSizes = (product, color) => {
  if (!product) return []
  if (product.availability !== 'stock') return product.sizes || []
  return (product.sizes || []).filter((s) => sizeStock(product, s, color) > 0)
}

/** Colores con al menos un talle disponible. Vacio si el producto no usa colores. */
export const availableColors = (product) => {
  if (!hasColors(product)) return []
  if (product.availability !== 'stock') return product.colors.map((c) => c.name)
  return product.colors.filter((c) => availableSizes(product, c.name).length > 0).map((c) => c.name)
}

/** Imagen a mostrar para un color puntual (o la del producto, si no tiene colores o el color no tiene foto propia). */
export const imageForColor = (product, colorName) => {
  const color = product?.colors?.find((c) => c.name === colorName)
  return color?.image || product?.image || ''
}
