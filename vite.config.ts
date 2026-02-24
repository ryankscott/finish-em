import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.pnpm-store/**'],
  },
})

export default config
