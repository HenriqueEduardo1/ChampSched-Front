import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Escute por requisições que começam com '/api'
      '/api': {
        target: 'http://localhost:8080', // 2. Encaminhe para o seu backend
        changeOrigin: true,
        secure: false,
        
        rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})
