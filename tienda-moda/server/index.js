// Entry point solo para desarrollo/produccion local (npm run dev:api / npm start).
// En Vercel no se usa: api/index.js reexporta server/app.js como funcion serverless.
import app from './app.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`API AdStore escuchando en http://localhost:${PORT}`))
