/* Utilidades HTTP compartidas por los routers de server/routes/. */

/** Envuelve un handler async: cualquier rechazo cae en una respuesta JSON de error. */
export const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno' })
})

/** Crea un error con status HTTP explicito, para usar con throw dentro de un handler wrap(). */
export const fail = (status, message) => Object.assign(new Error(message), { status })
