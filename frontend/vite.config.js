// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // Kein Framework-Plugin nötig – reines Vanilla JS
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
})
