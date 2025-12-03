import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // Compresión Gzip para reducir tamaño de transferencia
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Comprimir archivos > 10KB
      deleteOriginFile: false
    }),
    
    // Compresión Brotli (mejor que gzip, soportado por CloudFront)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),
    
    // Visualizador de bundle (solo en análisis)
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // Base path para CloudFront/S3 (rutas absolutas)
  base: '/',

  // Optimización para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Aumentar límite de advertencia a 500KB por chunk
    chunkSizeWarningLimit: 500,
    
    // Source maps deshabilitados (reduce tamaño y protege código)
    sourcemap: false,
    
    // Minificación agresiva con esbuild
    minify: 'esbuild',
    target: 'esnext',

    // Code splitting manual optimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (librerías grandes separadas)
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'charts': ['recharts'],
          'icons': ['react-icons', 'lucide-react'],
          'ui': ['framer-motion', 'sweetalert2'],
          'supabase': ['@supabase/supabase-js']
        },
        
        // Nombres con hash para cache infinito en CloudFront
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
    open: false,
    proxy: {
      '/api': {
        target: 'https://gillian-semiluminous-blubberingly.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
          });
        }
      }
    }
  },

  // Preview (build local)
  preview: {
    port: 4173
  }
})
