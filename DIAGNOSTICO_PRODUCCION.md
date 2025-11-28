# 🔍 Diagnóstico - Pantalla en Blanco en Producción

## ✅ Verificaciones Completadas

### 1. Build Local
- ✅ `npm run build` exitoso
- ✅ 847 módulos transformados
- ✅ Bundle generado correctamente

### 2. Variable de Entorno
- ✅ `.env.production` configurado con `VITE_API_URL=/api`
- ✅ Código compilado contiene: `VITE_API_URL:"/api"`
- ✅ Fallback implementado en `src/utils/api.ts`

### 3. Configuración Vercel
- ✅ `vercel.json` con rewrites correctos:
  - `/api/*` → `https://eduexce.duckdns.org`
  - `/*` → `/index.html` (SPA fallback)
- ✅ `base: '/'` en `vite.config.ts`

## 🔍 Posibles Causas

### Causa 1: Error de JavaScript en el navegador
**Diagnóstico:** Abre la consola del navegador (F12) y busca errores rojos.

**Errores comunes:**
```
- Uncaught Error: Failed to fetch
- Uncaught SyntaxError: Unexpected token
- Module not found
- Network error
```

### Causa 2: Caché del navegador
**Solución:**
1. Presiona `Ctrl + Shift + R` (hard refresh)
2. O ve a DevTools → Network → Disable cache
3. Recarga la página

### Causa 3: Backend no responde
**Diagnóstico:**
Abre la consola y ejecuta:
```javascript
fetch('https://zavira-sena-frontend.vercel.app/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ correo: 'test@test.com', password: '123456' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Causa 4: Problema con React Router
**Diagnóstico:** Verifica que `index.html` se cargue correctamente:
```
Ver en Network tab si index.html retorna 200 OK
```

## 🛠️ Soluciones Rápidas

### Solución 1: Forzar redeploy limpio en Vercel
```bash
# En el Dashboard de Vercel:
Deployments → ... → Redeploy → Clear cache and redeploy
```

### Solución 2: Verificar variable de entorno en Vercel
```
Settings → Environment Variables
Debe tener: VITE_API_URL = /api
```

### Solución 3: Probar build localmente
```powershell
npm run build
npm run preview
# Abre http://localhost:4173
```

## 📋 Checklist de Verificación

- [ ] Abrir DevTools (F12)
- [ ] Ver consola (Console tab)
- [ ] Ver peticiones de red (Network tab)
- [ ] Hard refresh (Ctrl + Shift + R)
- [ ] Verificar que `index.html` cargue
- [ ] Verificar errores en consola
- [ ] Verificar peticiones a `/api`
- [ ] Probar en modo incógnito
- [ ] Probar en otro navegador

## 🔗 URLs para Verificar

- **Frontend:** https://zavira-sena-frontend.vercel.app
- **API directa:** https://eduexce.duckdns.org
- **API proxeada:** https://zavira-sena-frontend.vercel.app/api

## 📞 Siguiente Paso

**Por favor, comparte lo siguiente:**
1. Captura de pantalla de la consola del navegador (F12 → Console)
2. Captura de pantalla del Network tab mostrando las peticiones
3. ¿Qué navegador estás usando?
4. ¿Ves algo de texto o solo pantalla blanca completa?
