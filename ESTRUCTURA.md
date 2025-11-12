# 📁 Estructura del Proyecto - ZAVIRA SENA Frontend

## Estructura de Carpetas

```
src/
├── components/          # Componentes React organizados por feature
│   ├── auth/           # Autenticación (Login, Register, Password)
│   ├── dashboard/      # Páginas del dashboard
│   ├── landing/        # Landing page
│   └── shared/         # Componentes reutilizables (futuro)
│
├── services/           # Servicios de API
│   └── api.ts         # Cliente HTTP centralizado - TODAS las peticiones aquí
│
├── hooks/              # Custom React Hooks
│   └── useAuth.ts     # Hook de autenticación
│
├── types/              # TypeScript types/interfaces
│   └── index.ts       # Tipos centralizados
│
├── utils/              # Utilidades
│   ├── storage.ts     # Abstracción de localStorage
│   └── constants.ts   # Constantes (rutas, mensajes, colores)
│
└── assets/             # Solo archivos estáticos (imágenes, fuentes)
    └── images/
```

## 🔑 Archivos Clave

### **services/api.ts**
- ✅ Cliente HTTP centralizado
- ✅ Todas las peticiones al backend
- ✅ Headers con autenticación y ngrok automáticos
- ✅ Manejo de errores consistente

**Uso:**
```typescript
import { api } from '@/services/api'

// Login
const response = await api.login(email, password)

// Obtener estudiantes
const students = await api.getStudents()

// Crear estudiante
await api.createStudent(data)
```

### **utils/storage.ts**
- ✅ Abstracción de localStorage
- ✅ Keys consistentes
- ✅ Métodos seguros para token y datos de usuario

**Uso:**
```typescript
import { storage } from '@/utils/storage'

// Token
storage.setToken(token)
const token = storage.getToken()

// Usuario
storage.setUser({ nombre_institucion, rol, id_institucion })
const user = storage.getUser()

// Verificar autenticación
if (storage.isAuthenticated()) { ... }

// Cerrar sesión
storage.clearSession()
```

### **hooks/useAuth.ts**
- ✅ Hook para manejo de autenticación
- ✅ Login, logout automáticos
- ✅ Navegación integrada

**Uso:**
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { login, logout, isAuthenticated, user } = useAuth()

  const handleLogin = async () => {
    await login(email, password) // Auto-navega al dashboard
  }
}
```

### **utils/constants.ts**
- ✅ Rutas centralizadas
- ✅ Mensajes de error/éxito
- ✅ Colores de marca
- ✅ Configuración general

**Uso:**
```typescript
import { ROUTES, MESSAGES, BRAND_COLORS } from '@/utils/constants'

navigate(ROUTES.DASHBOARD)
alert(MESSAGES.LOGIN_SUCCESS)
<div style={{ color: BRAND_COLORS.MAIN }} />
```

## 🔧 Configuración

### **.env**
```bash
VITE_API_URL=https://zavira-v8.onrender.com
```

### **Alias de Imports**
Puedes usar `@/` para imports absolutos desde `src/`:

```typescript
// ❌ Antes
import { api } from '../../../utils/api'

// ✅ Ahora
import { api } from '@/services/api'
```

## 📝 Reglas de Desarrollo

### ✅ **DO (Hacer)**
- Usar `api` de `@/services/api` para peticiones HTTP
- Usar `storage` de `@/utils/storage` para localStorage
- Usar `ROUTES` de `@/utils/constants` para navegación
- Usar imports con `@/` para rutas absolutas
- Mantener componentes pequeños y reutilizables

### ❌ **DON'T (No Hacer)**
- ❌ NO hardcodear URLs de API en componentes
- ❌ NO acceder directamente a `localStorage`
- ❌ NO hardcodear rutas como strings
- ❌ NO poner componentes React en `assets/`
- ❌ NO duplicar lógica de API en múltiples archivos

## 🚀 Migraciones Pendientes

Los siguientes archivos están en `assets/` (legacy) pero deberían migrar eventualmente:
- `Islas.tsx`
- `ProgresoPorArea.tsx`
- `RendimientoPorArea.tsx`

Estos componentes pueden moverse cuando sea necesario.

## 🧪 Testing con Cypress

La nueva estructura facilita el testing:

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email, password) => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'fake-token')
  })
})
```

## 📚 Próximos Pasos

1. Migrar componentes legacy restantes
2. Crear componentes reutilizables en `components/shared/`
3. Agregar tests con Cypress
4. Documentar componentes individuales
5. Implementar Context API para estado global

---

**Última actualización:** Nov 11, 2025
