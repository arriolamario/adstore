/* Traducen filas de Postgres (snake_case) al shape que consume el frontend (camelCase). */

export const mapUser = (r) => ({
  id: r.id, name: r.name, email: r.email, role: r.role,
  phone: r.phone || '', address: r.address || '', createdAt: r.created_at,
})

export const mapOrder = (r) => ({
  id: r.id, userId: r.user_id, status: r.status, fulfillment: r.fulfillment,
  customer: r.customer || {}, items: r.items || [], subtotal: r.subtotal,
  estimatedReadyAt: r.estimated_ready_at, createdAt: r.created_at,
})
