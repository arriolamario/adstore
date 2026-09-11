import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env')
  process.exit(1)
}

// node-postgres no soporta channel binding SCRAM; lo quitamos de la cadena.
const url = new URL(process.env.DATABASE_URL)
url.searchParams.delete('channel_binding')

// Postgres local (dev/test) no tiene SSL configurado; Neon (produccion) lo exige.
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)

export const pool = new Pool({
  connectionString: url.toString(),
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
  max: 5,
})

export const query = (text, params) => pool.query(text, params)

/** Ejecuta fn dentro de una transaccion, con rollback ante error. */
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
