import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // 👈 OBLIGATORIO: Permite acceso desde fuera del contenedor (0.0.0.0)
    strictPort: true, // Si el 5173 está ocupado, fallará en lugar de cambiar de puerto
    port: 5173,       // 👈 Alineado con docker-compose
    watch: {
      usePolling: true // 👈 CRÍTICO para que el hot-reload funcione en Windows/Docker
    }
  }
})