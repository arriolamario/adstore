import { defineConfig } from 'vitest/config'

// Config separada para los tests de integracion del backend (server/*.test.js).
// Vive aparte de vite.config.js porque esos tests necesitan Node (no jsdom) y
// una base de datos local levantada (.env.test) — no deben correr con `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**'],
    hookTimeout: 20000,
    testTimeout: 20000,
  },
})
