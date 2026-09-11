/* Estados de una reserva. El admin los cambia desde /admin/reservas. */

export const ORDER_STATUSES = [
  { value: 'reservado',  label: 'Reservado',       tone: 'brand'  },
  { value: 'preparando', label: 'En preparacion',  tone: 'brand'  },
  { value: 'listo',      label: 'Listo',           tone: 'stock'  },
  { value: 'entregado',  label: 'Entregado',       tone: 'stock'  },
  { value: 'cancelado',  label: 'Cancelado',       tone: 'order'  },
]

export const statusMeta = (value) =>
  ORDER_STATUSES.find((s) => s.value === value) || ORDER_STATUSES[0]

/** Etiqueta de "listo" segun la forma de entrega. */
export const statusLabel = (order) => {
  const meta = statusMeta(order.status)
  if (order.status === 'listo') {
    return order.fulfillment === 'pickup' ? 'Listo para retiro' : 'Listo para envio'
  }
  return meta.label
}
