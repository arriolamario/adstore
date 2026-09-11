/* Cliente HTTP minimalista para la API de AD Moda & Confort.
   En dev, Vite proxea /api -> http://localhost:3001 (ver vite.config.js). */

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`)
  return data
}

const body = (payload) => JSON.stringify(payload)

export const api = {
  products: {
    list: () => request('/api/products'),
    create: (data) => request('/api/products', { method: 'POST', body: body(data) }),
    update: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: body(data) }),
    remove: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
    reset: () => request('/api/products/reset', { method: 'POST' }),
  },
  orders: {
    list: (userId) => request('/api/orders' + (userId ? `?userId=${userId}` : '')),
    create: (data) => request('/api/orders', { method: 'POST', body: body(data) }),
    setStatus: (id, status) =>
      request(`/api/orders/${id}/status`, { method: 'PATCH', body: body({ status }) }),
  },
  auth: {
    register: (data) => request('/api/auth/register', { method: 'POST', body: body(data) }),
    login: (data) => request('/api/auth/login', { method: 'POST', body: body(data) }),
  },
  users: {
    update: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: body(data) }),
  },
}
