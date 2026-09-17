/* Espejo de tienda-moda/src/lib/format.js (solo lo que usa la app).
   Duplicado a proposito: Metro (el bundler de RN) no resuelve facil fuera de
   esta carpeta. Si diverge del original, es al copiar un cambio, no un bug. */
export const currency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value || 0)

export const formatDate = (iso) =>
  iso ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—'
