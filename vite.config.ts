import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // Optimización para producción
  build: {
    // Aumentar límite de advertencia a 1MB (temporal)
    chunkSizeWarningLimit: 1000,
    
    // Source maps solo para desarrollo
    sourcemap: false,
    
    // Minificación (esbuild es más rápido que terser)
    minify: 'esbuild',

    // Code splitting manual
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (librerías grandes separadas)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'icons': ['react-icons'],
          'ui': ['framer-motion', 'sweetalert2']
        },
        
        // Nombres de archivos consistentes
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },

  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },

  // Servidor de desarrollo
  server: {
    port: 5173,
    strictPort: false,
    open: false
  },

  // Preview (build local)
  preview: {
    port: 4173
  }
})
