import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '..'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': 'http://127.0.0.1:5717',
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, '../../dist/web'),
    emptyOutDir: true,
  },
})
