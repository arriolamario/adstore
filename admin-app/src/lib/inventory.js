/* Espejo de tienda-moda/src/lib/inventory.js (ver nota en format.js). */
export const totalStock = (product) => {
  if (!product || product.availability !== 'stock') return 0
  return Object.values(product.stock || {}).reduce((n, q) => n + (Number(q) || 0), 0)
}
