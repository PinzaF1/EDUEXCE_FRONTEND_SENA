# 🚀 Guía de Producción - ZAVIRA SENA

## 📦 Build Optimizado

### **Configuración Actual**

#### **vite.config.ts**
```typescript
✅ Code-splitting activado (chunks separados):
   - react-vendor: React + React DOM + Router
   - charts: Recharts
   - icons: React Icons
   - ui: Framer Motion + SweetAlert2

✅ Minificación: Terser (elimina console.log)
✅ Source maps: Desactivados en producción
✅ Assets organizados: /assets/js/, /assets/css/, /assets/svg/
```

---

## 🔧 Variables de Entorno

### **Archivos creados:**

**`.env.development`** (para `npm run dev`)
```bash
VITE_API_URL=https://gillian-semiluminous-blubberingly.ngrok-free.dev
VITE_ENV=development
```

**`.env.production`** (para `npm run build`)
```bash
VITE_API_URL=https://zavira-v8.onrender.com
VITE_ENV=production
```

**Importante:** Vite carga automáticamente:
- `npm run dev` → `.env.development`
- `npm run build` → `.env.production`

---

## 📊 Análisis del Bundle

### **Antes de la optimización:**
```
dist/assets/
└── index-DJy66d2c.js    785 KB ⚠️ (Todo en un archivo)
```

### **Después de la optimización (esperado):**
```
dist/assets/js/
├── index-[hash].js          ~200 KB  (Código de la app)
├── react-vendor-[hash].js   ~150 KB  (React core)
├── charts-[hash].js         ~100 KB  (Recharts)
├── icons-[hash].js          ~250 KB  (React Icons)
└── ui-[hash].js             ~85 KB   (Framer + SweetAlert)
```

**Ventajas del code-splitting:**
- ⚡ Carga inicial más rápida (solo index.js)
- 💾 Cache efectivo (vendor no cambia frecuentemente)
- 📦 Lazy loading posible en el futuro

---

## 🚀 Comandos de Build

### **Desarrollo**
```bash
npm run dev
# Usa .env.development
# Puerto: 5173
```

### **Producción (build)**
```bash
npm run build
# Usa .env.production
# Output: dist/
# Optimizado y minificado
```

### **Preview local (simular producción)**
```bash
npm run preview
# Sirve la carpeta dist/
# Puerto: 4173
# Útil para probar antes de deploy
```

---

## 📁 Estructura de `dist/` Optimizada

```
dist/
├── index.html                    # HTML principal
│
├── assets/
│   ├── js/                       # JavaScript chunks
│   │   ├── index-[hash].js
│   │   ├── react-vendor-[hash].js
│   │   ├── charts-[hash].js
│   │   ├── icons-[hash].js
│   │   └── ui-[hash].js
│   │
│   ├── css/                      # Estilos
│   │   └── index-[hash].css
│   │
│   └── svg/                      # Logos e íconos
│       ├── eduexce-icon-only.svg
│       ├── eduexce-logo.svg
│       └── zavira-logo.svg
```

---

## 🌐 Deploy en Plataformas

### **Netlify / Vercel / Render**

1. **Conectar repositorio Git**
2. **Configurar build:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. **Variables de entorno:**
   ```
   VITE_API_URL=https://zavira-v8.onrender.com
   ```

### **Manual (servidor propio)**

```bash
# 1. Build
npm run build

# 2. Subir carpeta dist/ al servidor
scp -r dist/* user@server:/var/www/zavira/

# 3. Configurar Nginx/Apache para SPA
# (necesario para React Router)
```

---

## ⚙️ Configuración de Servidor (Nginx)

Para que funcione React Router en producción:

```nginx
server {
    listen 80;
    server_name zavira.example.com;
    root /var/www/zavira;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # ← IMPORTANTE para SPA
    }

    # Cache para assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## ✅ Checklist Pre-Deploy

Antes de hacer deploy a producción:

- [ ] ✅ Build exitoso (`npm run build`)
- [ ] ✅ Preview local funciona (`npm run preview`)
- [ ] ✅ Variable `VITE_API_URL` apunta a producción
- [ ] ✅ Console.logs eliminados (automático con Terser)
- [ ] ✅ Source maps desactivados
- [ ] ✅ Todas las rutas funcionan
- [ ] ✅ Login/logout funcionan
- [ ] ✅ CRUD de estudiantes funciona
- [ ] ✅ API responde correctamente

---

## 🐛 Troubleshooting

### **Error: "Cannot find module '@/...' "**
**Causa:** Alias `@/` no resuelve en producción  
**Solución:** Ya configurado en `vite.config.ts` y `tsconfig.app.json`

### **Error: "404 en rutas (ej: /dashboard)"**
**Causa:** Servidor no soporta SPA  
**Solución:** Configurar rewrite a `index.html` (ver config Nginx arriba)

### **Error: "API URL no funciona"**
**Causa:** `.env.production` no se carga  
**Solución:** 
```bash
# Verificar que exista
ls -la .env.production

# Force production build
NODE_ENV=production npm run build
```

### **Bundle muy grande (>1MB)**
**Causa:** Code-splitting no aplicó  
**Solución:** Ya configurado en `vite.config.ts`, rebuild:
```bash
rm -rf dist
npm run build
```

---

## 📈 Optimizaciones Futuras

### **Nivel 1 (Fácil)**
- [ ] Implementar lazy loading de rutas
- [ ] Comprimir con Brotli/Gzip en servidor
- [ ] CDN para assets estáticos

### **Nivel 2 (Medio)**
- [ ] Service Worker (PWA)
- [ ] Preload de rutas críticas
- [ ] Image optimization (WebP)

### **Nivel 3 (Avanzado)**
- [ ] Server-Side Rendering (SSR)
- [ ] Prefetching inteligente
- [ ] Bundle analyzer (visualizador)

---

## 🔍 Verificar Bundle

Para analizar el tamaño del bundle:

```bash
# Instalar analyzer
npm install -D rollup-plugin-visualizer

# Agregar a vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
  react(),
  visualizer({ open: true })
]

# Build
npm run build
# Se abre stats.html con visualización
```

---

## 📚 Recursos

- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Router SPA Config](https://reactrouter.com/en/main/guides/deploying)
- [Render Deploy Guide](https://render.com/docs/deploy-react-app)

---

**Última actualización:** Nov 11, 2025
