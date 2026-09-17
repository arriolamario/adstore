/* Cliente HTTP para la API de AD Moda & Confort. A diferencia del sitio web
   (que usa una cookie httpOnly), aca no hay cookie jar del navegador — el
   token viaja en el header Authorization y lo guarda quien llama a setToken(). */
import { API_BASE_URL } from './config'

let token = null
export const setToken = (t) => { token = t }

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`)
  return data
}

const body = (payload) => JSON.stringify(payload)

export const api = {
  auth: {
    login: (data) => request('/api/auth/login', { method: 'POST', body: body(data) }),
    me: () => request('/api/auth/me'),
  },
  products: {
    list: () => request('/api/products'),
    create: (data) => request('/api/products', { method: 'POST', body: body(data) }),
    update: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: body(data) }),
    remove: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request('/api/categories'),
    create: (data) => request('/api/categories', { method: 'POST', body: body(data) }),
    update: (id, data) => request(`/api/categories/${id}`, { method: 'PUT', body: body(data) }),
    remove: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  users: {
    list: () => request('/api/users'),
    create: (data) => request('/api/users', { method: 'POST', body: body(data) }),
    update: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: body(data) }),
    remove: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/api/orders'), // admin: trae todas
    setStatus: (id, status) => request(`/api/orders/${id}/status`, { method: 'PATCH', body: body({ status }) }),
    remove: (id) => request(`/api/orders/${id}`, { method: 'DELETE' }),
  },
}
