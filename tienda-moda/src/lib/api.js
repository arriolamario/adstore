/* Cliente HTTP minimalista para la API de AD Moda & Confort.
   En dev, Vite proxea /api -> http://localhost:3001 (ver vite.config.js).
   La sesion viaja en una cookie httpOnly (la pone el servidor en login/registro),
   por eso todas las llamadas van con credentials para que el navegador la mande. */

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
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
    // userId solo tiene efecto si quien pregunta es admin; un comprador
    // siempre recibe unicamente sus propias reservas (lo filtra el servidor).
    list: (userId) => request('/api/orders' + (userId ? `?userId=${userId}` : '')),
    create: (data) => request('/api/orders', { method: 'POST', body: body(data) }),
    setStatus: (id, status) =>
      request(`/api/orders/${id}/status`, { method: 'PATCH', body: body({ status }) }),
  },
  auth: {
    register: (data) => request('/api/auth/register', { method: 'POST', body: body(data) }),
    login: (data) => request('/api/auth/login', { method: 'POST', body: body(data) }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
  },
  users: {
    list: () => request('/api/users'),
    get: (id) => request(`/api/users/${id}`),
    create: (data) => request('/api/users', { method: 'POST', body: body(data) }),
    update: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: body(data) }),
    remove: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  },
}
