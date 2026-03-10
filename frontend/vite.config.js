// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/kopfsachen-kurs-game/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
})
