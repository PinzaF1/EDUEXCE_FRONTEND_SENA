# 🔧 Configuración del Proxy de Vite para ngrok

## 🛡️ GARANTÍA DE ESTABILIDAD

Esta configuración está diseñada para ser **100% estable y a prueba de fallos**:

✅ **Scripts de validación automática** - Verifica la configuración antes de cada inicio  
✅ **Scripts de auto-reparación** - Corrige problemas automáticamente  
✅ **Configuración bloqueada** - Archivos .env protegidos contra cambios accidentales  
✅ **Documentación clara** - Instrucciones precisas para cada escenario  

## 🔐 Protecciones Implementadas

### 1. Validación Automática
Cada vez que ejecutas `npm run dev`, se valida automáticamente:
- ✅ Variables de entorno correctas
- ✅ Proxy configurado correctamente
- ✅ Sin URLs hardcodeadas

### 2. Scripts de Recuperación
Si algo falla, ejecuta:
```bash
npm run dev:safe
```
Este comando:
1. Corrige automáticamente los archivos .env
2. Limpia el cache de Vite
3. Inicia el servidor correctamente

### 3. Validación Manual
Para verificar la configuración en cualquier momento:
```bash
npm run validate
```

## 📋 Configuración Actual

### Variables de Entorno

**`.env`** y **`.env.development`**:
```bash
VITE_API_URL=/api
VITE_ENV=development
```

**`.env.production`**:
```bash
VITE_API_URL=https://churnable-nimbly-norbert.ngrok-free.dev
VITE_ENV=production
```

### Proxy en `vite.config.ts`

```typescript
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'https://gillian-semiluminous-blubberingly.ngrok-free.dev',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        });
      }
    }
  }
}
```

## 🚀 Cómo Funciona

1. **Frontend hace petición**: `/api/admin/login`
2. **Proxy intercepta**: Vite detecta el path `/api`
3. **Reescribe la URL**: Elimina `/api` → `/admin/login`
4. **Envía a ngrok**: `https://gillian-semiluminous-blubberingly.ngrok-free.dev/admin/login`
5. **Sin problemas CORS**: El navegador ve todo como mismo origen

## 🔄 Cambiar URL de ngrok

Cuando cambies la URL de ngrok, actualiza **SOLO** `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'https://TU-NUEVA-URL.ngrok-free.dev',  // ← Cambiar aquí
    // ... resto igual
  }
}
```

**NO TOQUES** `.env` ni `.env.development` (deben seguir con `/api`)

## 🛠️ Scripts Disponibles

### Desarrollo Normal
```bash
npm run dev
```

### Desarrollo con Limpieza de Cache
```bash
npm run dev:clean
```

Usa este cuando:
- Los cambios no se reflejan
- El navegador sigue usando código viejo
- Cambias variables de entorno

## 🐛 Solución de Problemas

### Problema: Sigue yendo directo a ngrok

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Ejecuta: `npm run dev:clean`
3. Hard refresh en navegador: `Ctrl + Shift + R`

### Problema: Error de CORS

**Causas posibles:**
1. ✅ **El proxy NO está funcionando** → Verifica que las peticiones vayan a `/api/...`
2. ❌ **El backend no tiene CORS configurado** → Pide al backend agregar headers

**Verificar en consola del navegador:**
```javascript
🔧 API_URL configurada: /api
📡 Petición a: /api/admin/login  // ✅ CORRECTO
📡 Petición a: https://...        // ❌ INCORRECTO
```

### Problema: Puerto 5174 ocupado

El servidor automáticamente usará el siguiente puerto disponible (5175, 5176, etc.)

Para forzar el puerto 5173:
```typescript
// vite.config.ts
server: {
  port: 5173,
  strictPort: true  // ← Falla si el puerto está ocupado
}
```

## 📝 Checklist de Desarrollo

Antes de empezar a trabajar:

- [ ] Verifica que `VITE_API_URL=/api` en `.env.development`
- [ ] Actualiza `target` en `vite.config.ts` si cambió la URL de ngrok
- [ ] Ejecuta `npm run dev:clean` si es la primera vez del día
- [ ] Hard refresh en el navegador después de cambios

## 🚨 IMPORTANTE

**NUNCA cambies** `VITE_API_URL` en `.env` o `.env.development` a una URL completa de ngrok.

✅ **CORRECTO**:
```bash
VITE_API_URL=/api
```

❌ **INCORRECTO**:
```bash
VITE_API_URL=https://algo.ngrok-free.dev
```

## 📞 Contacto Backend

Si el proxy funciona pero sigues teniendo errores de CORS, el backend necesita agregar:

```
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning, cache-control
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```
