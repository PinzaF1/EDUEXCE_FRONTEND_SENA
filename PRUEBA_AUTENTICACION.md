# Prueba Manual de Autenticación

## Flujo de Autenticación Completo

### ✅ Verificaciones Implementadas:

1. **ProtectedRoute Component** (`src/components/auth/ProtectedRoute.tsx`)
   - ✓ Verifica `storage.isAuthenticated()` 
   - ✓ Guarda ruta intentada en sessionStorage
   - ✓ Redirige a /login si no autenticado

2. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - ✓ Guarda token y datos de usuario en login
   - ✓ Redirige a ruta guardada o dashboard después del login
   - ✓ Limpia sesión en logout

3. **Dashboard Component** (`src/components/dashboard/Dashboard.tsx`)
   - ✓ Verifica token en useEffect
   - ✓ Carga perfil del usuario autenticado
   - ⚠️ Doble verificación (ProtectedRoute + Dashboard)

4. **Storage Utility** (`src/utils/storage.ts`)
   - ✓ `isAuthenticated()`: Verifica existencia de token
   - ✓ `getToken()`: Retorna token o null
   - ✓ `clearSession()`: Limpia localStorage

---

## 🧪 Casos de Prueba

### 1. Usuario NO autenticado intenta acceder al dashboard
```
RUTA: http://localhost:5174/dashboard
ESPERADO: Redirige a /login
SESSIONSTORAGE: Guarda "/dashboard" en "redirectAfterLogin"
```

### 2. Usuario NO autenticado intenta acceder a ruta específica
```
RUTA: http://localhost:5174/dashboard/estudiantes
ESPERADO: Redirige a /login
SESSIONSTORAGE: Guarda "/dashboard/estudiantes" en "redirectAfterLogin"
```

### 3. Usuario hace login exitoso SIN ruta guardada
```
ACCIÓN: Login con credenciales correctas
ESPERADO: Redirige a /dashboard
SESSIONSTORAGE: No hay "redirectAfterLogin"
```

### 4. Usuario hace login exitoso CON ruta guardada
```
ESTADO PREVIO: sessionStorage tiene "/dashboard/estudiantes"
ACCIÓN: Login con credenciales correctas
ESPERADO: Redirige a /dashboard/estudiantes
SESSIONSSTORAGE: Limpia "redirectAfterLogin"
```

### 5. Usuario autenticado navega libremente
```
ESTADO: Token existe en localStorage
ACCIÓN: Navega por /dashboard, /dashboard/estudiantes, etc.
ESPERADO: Acceso permitido, sin redirecciones
```

### 6. Usuario autenticado hace logout
```
ACCIÓN: Click en logout
ESPERADO: 
  - Limpia localStorage
  - Redirige a /login
  - No puede acceder a rutas protegidas
```

### 7. Token expirado o inválido
```
ESTADO: Token existe pero API retorna 401
ESPERADO: Dashboard detecta 401 y limpia sesión
```

---

## 🔍 Comandos de Verificación

### Verificar en DevTools (F12)

```javascript
// Ver token
localStorage.getItem('token')

// Ver datos de usuario
localStorage.getItem('nombre_institucion')
localStorage.getItem('id_institucion')
localStorage.getItem('rol')

// Ver ruta guardada
sessionStorage.getItem('redirectAfterLogin')

// Simular usuario autenticado
localStorage.setItem('token', 'fake-token-123')
localStorage.setItem('nombre_institucion', 'Institución Test')
localStorage.setItem('rol', 'admin')

// Limpiar sesión
localStorage.clear()
sessionStorage.clear()
```

---

## 🚨 Problemas Potenciales Detectados

### 1. Doble Verificación en Dashboard
**Ubicación**: `Dashboard.tsx` línea 54-58
```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/", { replace: true }); // ⚠️ Redirige a "/" en vez de "/login"
    return;
  }
```
**Problema**: 
- ProtectedRoute ya redirige a /login
- Dashboard hace otra verificación innecesaria
- Dashboard redirige a "/" en vez de "/login"

**Solución**: La verificación en Dashboard es redundante pero no rompe el flujo porque ProtectedRoute actúa primero.

### 2. Navegación inconsistente en 401
**Ubicación**: `Dashboard.tsx` línea 75-78
```typescript
if (res.status === 401) {
  localStorage.clear();
  navigate("/", { replace: true }); // ⚠️ Debería ser "/login"
  return;
}
```

---

## ✅ Recomendaciones

1. **Mantener la doble verificación** (defensa en profundidad)
2. **Corregir navegación** en Dashboard para usar ROUTES.LOGIN
3. **Agregar tests E2E** con Cypress para estos flujos
4. **Considerar refresh token** para sesiones largas

---

## 📝 Pasos para Probar Manualmente

1. **Abrir navegador en modo incógnito**
2. **Ir a**: http://localhost:5174/dashboard/estudiantes
3. **Verificar**: Redirige a /login
4. **Abrir DevTools** → Application → Session Storage
5. **Verificar**: Existe "redirectAfterLogin" con valor "/dashboard/estudiantes"
6. **Hacer login** con credenciales válidas
7. **Verificar**: Redirige a /dashboard/estudiantes
8. **Verificar**: "redirectAfterLogin" fue eliminado de sessionStorage
9. **Navegar** a otras rutas del dashboard
10. **Verificar**: Acceso permitido sin redirecciones
11. **Hacer logout**
12. **Verificar**: localStorage vacío y redirige a /login
