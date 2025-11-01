# 🔧 Cambios Realizados - Fix ngrok Header

## ✅ ARCHIVOS CREADOS

### **1. `src/utils/api.ts`** (NUEVO)
Archivo centralizado para todas las peticiones HTTP con:
- ✅ Header `ngrok-skip-browser-warning: true` en TODAS las peticiones
- ✅ Funciones helper: `apiUrl()`, `baseHeaders()`, `authHeaders()`
- ✅ Helpers de peticiones: `getJSON()`, `postJSON()`, `putJSON()`, `deleteJSON()`
- ✅ Gestión de autenticación: `isAuthenticated()`, `logout()`

**Beneficios:**
- Código más limpio y mantenible
- No más URLs hardcodeadas
- Un solo lugar para cambiar la configuración

---

## ✅ ARCHIVOS MODIFICADOS (3 CRÍTICOS)

### **2. `src/assets/RestContra.tsx`** (Recuperación de contraseña)
**ANTES (❌):**
```typescript
const res = await fetch(
  'https://gillian-semiluminous-blubberingly.ngrok-free.dev/auth/recovery/admin/enviar',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
  }
)
```

**DESPUÉS (✅):**
```typescript
import { apiUrl, baseHeaders } from '../utils/api'

const res = await fetch(
  apiUrl('/auth/recovery/admin/enviar'),
  {
    method: 'POST',
    headers: baseHeaders(), // ← Incluye header de ngrok
    body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
  }
)
```

---

### **3. `src/assets/LoginAdm.tsx`** (Login admin)
**ANTES (❌):**
```typescript
const res = await fetch('https://gillian-semiluminous-blubberingly.ngrok-free.dev/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ correo: correo.trim(), password }),
})
```

**DESPUÉS (✅):**
```typescript
import { apiUrl, baseHeaders } from '../utils/api'

const res = await fetch(apiUrl('/admin/login'), {
  method: 'POST',
  headers: baseHeaders(), // ← Incluye header de ngrok
  body: JSON.stringify({ correo: correo.trim(), password }),
})
```

---

### **4. `src/assets/RegistroAdm.tsx`** (Registro instituciones)
**ANTES (❌):**
```typescript
const res = await fetch('https://gillian-semiluminous-blubberingly.ngrok-free.dev/instituciones/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
```

**DESPUÉS (✅):**
```typescript
import { apiUrl, baseHeaders } from '../utils/api'

const res = await fetch(apiUrl('/instituciones/registro'), {
  method: 'POST',
  headers: baseHeaders(), // ← Incluye header de ngrok
  body: JSON.stringify(form),
})
```

---

## 📋 HEADERS INCLUIDOS AHORA

La función `baseHeaders()` incluye:
```typescript
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true"  // ← CRÍTICO para evitar la página de verificación
}
```

La función `authHeaders()` incluye lo mismo + el token JWT:
```typescript
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "ngrok-skip-browser-warning": "true",
  "Authorization": "Bearer <token>"  // ← Si existe en localStorage
}
```

---

## 🚀 CÓMO USAR (Para futuros componentes)

### **Para peticiones públicas (sin autenticación):**
```typescript
import { apiUrl, baseHeaders } from '../utils/api'

const res = await fetch(apiUrl('/auth/recovery/admin/enviar'), {
  method: 'POST',
  headers: baseHeaders(),
  body: JSON.stringify({ correo: 'test@test.com' }),
})
```

### **Para peticiones con autenticación:**
```typescript
import { apiUrl, authHeaders } from '../utils/api'

const res = await fetch(apiUrl('/admin/estudiantes'), {
  method: 'GET',
  headers: authHeaders(), // ← Incluye token automáticamente
})
```

### **Usando los helpers (más simple):**
```typescript
import { getJSON, postJSON } from '../utils/api'

// GET con autenticación
const estudiantes = await getJSON('/admin/estudiantes')

// POST público
const result = await postJSON('/auth/recovery/admin/enviar', 
  { correo: 'test@test.com' }, 
  { requiresAuth: false }
)
```

---

## 📊 ARCHIVOS QUE TODAVÍA TIENEN LA URL HARDCODEADA (Pero funcionan)

Estos archivos YA incluyen el header de ngrok, solo necesitan refactoring para usar `api.ts`:

- ✅ `Inicio.tsx` - Ya tiene el header, usa `authHeaders()`
- ✅ `Dashboard.tsx` - Ya tiene el header
- ✅ `Estudiantes.tsx` - Ya tiene el header
- ✅ `Seguimiento.tsx` - Ya tiene el header
- ✅ `Notificaciones.tsx` - Ya tiene el header
- ✅ `perfil.tsx` - Ya tiene el header
- ✅ `Configuracion.tsx` - Ya tiene el header

**Estos NO necesitan cambios urgentes**, pero sería bueno refactorizarlos para usar `api.ts` en el futuro.

---

## ⚠️ IMPORTANTE

**ANTES de probar el frontend:**
1. ✅ Asegúrate de que tu compañero reconstruyó Docker correctamente
2. ✅ Verifica que el backend responda (prueba con curl o Postman)
3. ✅ Reinicia el servidor de desarrollo del frontend:
   ```bash
   npm run dev
   ```

---

## 🧪 CÓMO VERIFICAR QUE FUNCIONÓ

### **Test 1: Login Admin**
1. Abre http://localhost:5173/login
2. Intenta hacer login
3. Abre la consola del navegador (F12) → pestaña "Network"
4. Busca la petición `POST /admin/login`
5. En "Request Headers" debe aparecer:
   ```
   ngrok-skip-browser-warning: true
   ```
6. La respuesta debe ser JSON (no HTML de ngrok)

### **Test 2: Recuperación de contraseña**
1. Abre http://localhost:5173/password
2. Ingresa un correo
3. Abre la consola → pestaña "Network"
4. Busca la petición `POST /auth/recovery/admin/enviar`
5. Verifica el header `ngrok-skip-browser-warning: true`
6. La respuesta debe ser:
   - ✅ `{"ok":true}` si el correo existe
   - ✅ `{"error":"Correo no registrado"}` si no existe

---

## 📈 PRÓXIMOS PASOS (Opcional)

Si quieres limpiar más el código:

1. Refactorizar `Inicio.tsx` para usar `import { authHeaders, apiUrl } from '../utils/api'`
2. Refactorizar `Dashboard.tsx` para usar `import { authHeaders, apiUrl } from '../utils/api'`
3. Refactorizar `Estudiantes.tsx` para usar `import { authHeaders, apiUrl } from '../utils/api'`
4. Crear una variable de entorno `.env` con:
   ```
   VITE_API_URL=https://gillian-semiluminous-blubberingly.ngrok-free.dev
   ```
5. Así cuando cambies de ngrok, solo cambias el `.env`

---

**Fecha:** 31/10/2024  
**Archivos modificados:** 4 (1 nuevo + 3 actualizados)  
**Problema resuelto:** Header de ngrok faltante en peticiones críticas

