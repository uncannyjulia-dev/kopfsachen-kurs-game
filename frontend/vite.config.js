// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
})
