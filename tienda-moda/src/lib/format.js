export const currency = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value || 0)

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))

/** Suma dias habiles (lun-vie) a una fecha. */
export const addBusinessDays = (from, days) => {
  const date = new Date(from)
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return date
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
