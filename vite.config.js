import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Configurado para dominio raíz https://sellyourcarrnow.com/
  server: {
    port: 3000,
    host: '0.0.0.0', // Permite conexiones desde cualquier IP (necesario para ngrok)
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost'
    ], // Permite hosts de ngrok
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})


