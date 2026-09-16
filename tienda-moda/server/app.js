import 'dotenv/config'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import { pool } from './db.js'
import { productsRouter } from './routes/products.routes.js'
import { categoriesRouter } from './routes/categories.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { usersRouter } from './routes/users.routes.js'
import { ordersRouter } from './routes/orders.routes.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: '12mb' })) // imagenes en base64
app.use(cookieParser())

app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/orders', ordersRouter)

/* ===================== ESTATICOS (solo para "npm start" local) =====================
   En Vercel el build estatico de /dist se sirve aparte; esta app solo atiende /api/*. */
if (!process.env.VERCEL) {
  const distDir = path.join(__dirname, '..', 'dist')
  if (existsSync(distDir)) {
    app.use(express.static(distDir))
    app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
  }
}

// Maneja los errores que los middlewares de auth (requireAuth/requireAdmin/
// requireSelfOrAdmin, ver server/lib/auth.js) pasan con next(err) — los
// handlers async ya se resuelven solos via wrap() en server/lib/http.js.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (!err) return res.status(500).json({ error: 'Error interno' })
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Error interno' })
})

process.on('SIGTERM', () => pool.end())

export default app
