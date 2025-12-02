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
    port: 5174,
    strictPort: false,
    open: false,
    proxy: {
      '/api': {
        // NOTE: quitar la barra final del target para evitar '//' en la URL
        target: 'https://eduexce-backend.ddns.net', // URL de backend para pruebas
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            // set ngrok header and log mapping
            proxyReq.setHeader && proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            // eslint-disable-next-line no-console
            console.log('[vite-proxy] proxyReq:', { incoming: req && req.url, proxiedPath: proxyReq.path || proxyReq.getHeader && proxyReq.getHeader('path') });
          });

          proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
            // eslint-disable-next-line no-console
            console.log('[vite-proxy] proxyRes:', { incoming: req && req.url, status: proxyRes && proxyRes.statusCode });
          });

          // Log de errores del proxy para depuración local
          proxy.on('error', (err: any, req: any, res: any) => {
            // eslint-disable-next-line no-console
            console.error('[vite-proxy] error forwarding', err && err.message, 'req.url=', req && req.url);
            try {
              if (res && !res.headersSent) {
                res.writeHead && res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end && res.end(JSON.stringify({ error: 'Proxy error', message: err && err.message }));
              }
            } catch (e) {
              // ignore
            }
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
