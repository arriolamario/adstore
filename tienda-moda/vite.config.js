import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxy = {
  '/api': { target: 'http://localhost:3001', changeOrigin: true },
}

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true, proxy },
  preview: { port: 4173, proxy },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    exclude: ['node_modules/**', 'dist/**', 'server/**'],
  },
})
