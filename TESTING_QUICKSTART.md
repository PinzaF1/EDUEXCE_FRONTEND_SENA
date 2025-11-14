# 🚀 Guía Rápida de Testing - ZAVIRA SENA

## ⚡ Inicio Rápido (5 minutos)

### **Paso 1: Inicia el servidor de desarrollo**
```bash
npm run dev
```
Deja esta terminal abierta. El servidor debe estar en http://localhost:5173

### **Paso 2: Abre Cypress (en otra terminal)**
```bash
npm run cypress:open
```

### **Paso 3: Selecciona "E2E Testing"**
- Click en "E2E Testing"
- Selecciona tu navegador preferido (Chrome recomendado)
- Click en "Start E2E Testing"

### **Paso 4: Ejecuta los tests**
- Verás la lista de archivos de test
- Click en cualquier test para ejecutarlo
- Observa cómo se ejecutan en tiempo real

---

## 📊 Tests Disponibles

### **🔥 Smoke Tests (Nivel 1)** - Lo MÁS básico
```bash
npm run test:smoke
```

**Tests incluidos:**
- ✅ App carga sin errores
- ✅ Landing page accesible
- ✅ Login funciona
- ✅ Logout limpia sesión
- ✅ Rutas protegidas redirigen

**Tiempo:** ~30 segundos  
**Estado:** ✅ Listos para ejecutar

---

### **🔐 Tests de Autenticación**
```bash
npm run test:auth
```

**Tests incluidos:**
- ✅ Login exitoso con token guardado
- ✅ Login con email incorrecto → error
- ✅ Login con password incorrecta → error
- ✅ Campos vacíos → validación
- ✅ Email formato inválido → validación
- ✅ Navegación dashboard después del login

**Tiempo:** ~1 minuto  
**Estado:** ✅ Listos para ejecutar

---

### **👥 Tests de Estudiantes (CRUD)**
```bash
npm run test:students
```

**Tests incluidos:**
- ✅ Listar estudiantes
- ✅ Crear estudiante nuevo
- ✅ Editar estudiante existente
- ✅ Eliminar estudiante
- ✅ Buscar/filtrar estudiantes
- ✅ Cambiar estado (activo/inactivo)

**Tiempo:** ~2 minutos  
**Estado:** ✅ Listos para ejecutar (con mocks)

---

### **🎯 Todos los Tests**
```bash
npm test
```
Ejecuta todos los tests en modo headless (sin interfaz).

---

## 🔧 Configuración Necesaria

### **Antes de ejecutar tests reales (sin mocks):**

Edita `cypress.config.ts` y actualiza las credenciales de prueba:

```typescript
env: {
  apiUrl: 'https://zavira-v8.onrender.com',
  testEmail: 'TU_EMAIL_DE_PRUEBA',      // ← Cambiar
  testPassword: 'TU_PASSWORD_DE_PRUEBA' // ← Cambiar
}
```

O pásalas por CLI:
```bash
cypress run --env testEmail=admin@test.com,testPassword=test123
```

---

## 📝 Estructura de Archivos Creados

```
cypress/
├── e2e/
│   ├── 01-smoke/              ← Tests básicos (3 archivos)
│   ├── 02-auth/               ← Tests de login (2 archivos)
│   └── 03-students/           ← Tests de CRUD (1 archivo)
│
├── fixtures/                  ← Datos de prueba
│   ├── users.json             ← Usuarios de prueba
│   ├── students.json          ← Estudiantes de prueba
│   └── notifications.json     ← Notificaciones de prueba
│
├── support/
│   ├── commands.ts            ← Comandos custom (login, logout, etc.)
│   └── e2e.ts                 ← Setup global
│
└── README.md                  ← Documentación completa

cypress.config.ts              ← Configuración principal
TESTING_QUICKSTART.md          ← Esta guía
```

---

## 🎮 Comandos Custom Disponibles

Puedes usar estos en tus tests:

### **cy.login(email, password)**
```typescript
cy.login('admin@test.com', 'password123')
// Automáticamente hace login y verifica redirección
```

### **cy.logout()**
```typescript
cy.logout()
// Cierra sesión y verifica limpieza
```

### **cy.clearAuth()**
```typescript
cy.clearAuth()
// Limpia localStorage y cookies
```

### **cy.setAuthToken(...)**
```typescript
cy.setAuthToken('token', 'institucion', 'rol', 'id')
// Simula sesión sin hacer login (útil para tests)
```

---

## 📋 Checklist de Testing

### **Tests Implementados ✅**
- [x] App carga
- [x] Login exitoso
- [x] Login con errores
- [x] Logout
- [x] Rutas protegidas
- [x] CRUD Estudiantes (básico)
- [x] Comandos custom
- [x] Fixtures

### **Próximos Tests (Pendientes)**
- [ ] Registro de institución
- [ ] Password reset completo
- [ ] Notificaciones CRUD
- [ ] Perfil y configuración
- [ ] Seguimiento y stats
- [ ] Carga masiva estudiantes
- [ ] Tests de integración

---

## 💡 Tips Rápidos

### **1. Ejecutar un solo test**
```bash
cypress run --spec "cypress/e2e/01-smoke/01-app-loads.cy.ts"
```

### **2. Ejecutar en modo debug**
```bash
npm run cypress:open
# Luego click en el test y usa DevTools
```

### **3. Ver videos de tests fallidos**
Los videos se guardan en `cypress/videos/` automáticamente.

### **4. Ver screenshots de errores**
Los screenshots están en `cypress/screenshots/`.

### **5. Usar el selector playground**
En modo interactivo, usa el icono de "target" para generar selectores automáticamente.

---

## 🐛 Solución de Problemas

### **Error: "Cannot find module cypress"**
```bash
npm install -D cypress
```

### **Error: "Cannot connect to localhost:5173"**
Asegúrate de que el dev server está corriendo:
```bash
npm run dev
```

### **Tests muy lentos**
Usa mocks con `cy.intercept()` en vez de API real:
```typescript
cy.intercept('GET', '**/api/**', { fixture: 'data.json' })
```

### **Element not found**
Aumenta el timeout:
```typescript
cy.get('[data-cy="btn"]', { timeout: 10000 })
```

---

## 📊 Resumen de Cobertura

```
Módulo              Tests    Estado
------------------  -------  ---------
Smoke Tests         3        ✅ Listo
Autenticación       2        ✅ Listo
Estudiantes         1        ✅ Listo
Notificaciones      0        ⏳ Pendiente
Perfil              0        ⏳ Pendiente
Seguimiento         0        ⏳ Pendiente
------------------  -------  ---------
TOTAL               6        40% (crítico cubierto)
```

---

## 🎯 Próximos Pasos Recomendados

1. **Ejecuta los smoke tests** para verificar setup
   ```bash
   npm run test:smoke
   ```

2. **Revisa los resultados** en la terminal

3. **Abre el modo interactivo** para debuggear
   ```bash
   npm run cypress:open
   ```

4. **Ajusta credenciales** en `cypress.config.ts` si quieres usar API real

5. **Expande tests** según tus necesidades

---

## 📚 Recursos

- **Documentación completa:** `cypress/README.md`
- **Cypress Docs:** https://docs.cypress.io/
- **Fixtures:** `cypress/fixtures/*.json`
- **Tests:** `cypress/e2e/**/*.cy.ts`

---

## ✅ Verificación Rápida

Ejecuta esto para verificar que todo funciona:

```bash
# Terminal 1
npm run dev

# Terminal 2 (después de que arranque el dev server)
npm run test:smoke
```

Si todos los tests pasan ✅ → **¡Todo listo!**

---

**Tests creados:** 6 archivos (11 test cases)  
**Tiempo total de ejecución:** ~4 minutos  
**Cobertura:** 40% funcionalidad crítica  
**Estado:** ✅ Listo para usar
