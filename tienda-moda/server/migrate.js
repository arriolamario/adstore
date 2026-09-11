import { readFileSync } from 'node:fs'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { SEED_PRODUCTS } from '../src/data/products.js'

// --env=test carga .env.test (base local de tests) en vez de .env (base local de desarrollo).
// db.js hace su propio `import 'dotenv/config'`, que no pisa variables ya definidas,
// por eso cargamos el archivo correcto ANTES de importarlo (import dinamico, no hoisteado).
const useTest = process.argv.includes('--env=test')
dotenv.config({ path: useTest ? '.env.test' : '.env', override: true })

const { pool } = await import('./db.js')

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')

const ADMIN = {
  name: 'Equipo AD Moda & Confort',
  email: 'admin@adstore.com',
  password: 'admin123',
  role: 'admin',
}

async function main() {
  console.log(`→ Conectando a la base (${useTest ? 'test' : 'local'})…`)
  const client = await pool.connect()
  try {
    console.log('→ Borrando y recreando tablas…')
    await client.query(schema)

    console.log(`→ Sembrando ${SEED_PRODUCTS.length} productos…`)
    for (const p of SEED_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, name, brand, category, price, availability, sizes, stock, image, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)`,
        [
          p.id, p.name, p.brand, p.category, p.price, p.availability,
          JSON.stringify(p.sizes || []), JSON.stringify(p.stock || {}),
          p.image, p.description || '',
        ],
      )
    }

    console.log('→ Creando usuario admin…')
    const hash = bcrypt.hashSync(ADMIN.password, 10)
    await client.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)`,
      [ADMIN.name, ADMIN.email, hash, ADMIN.role],
    )

    const { rows: [{ products }] } = await client.query('SELECT count(*)::int AS products FROM products')
    console.log(`\n✔ Listo. ${products} productos, 1 admin (${ADMIN.email} / ${ADMIN.password}).`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error('\n✖ Error en la migracion:', err.message)
  process.exit(1)
})
