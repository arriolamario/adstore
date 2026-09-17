/* Espejo de tienda-moda/src/lib/orders.js (ver nota en format.js). */
export const ORDER_STATUSES = [
  { value: 'reservado', label: 'Reservado', color: 'brand' },
  { value: 'preparando', label: 'En preparacion', color: 'brand' },
  { value: 'listo', label: 'Listo', color: 'success' },
  { value: 'entregado', label: 'Entregado', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'warning' },
]

export const statusMeta = (value) => ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0]

export const statusLabel = (order) => {
  if (order.status === 'listo') return order.fulfillment === 'pickup' ? 'Listo para retiro' : 'Listo para envio'
  return statusMeta(order.status).label
}
