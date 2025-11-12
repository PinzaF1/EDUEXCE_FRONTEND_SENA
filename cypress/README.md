# 🧪 Testing con Cypress - ZAVIRA SENA

## 📁 Estructura de Tests

```
cypress/
├── e2e/
│   ├── 01-smoke/           ✅ Tests básicos de funcionamiento
│   │   ├── 01-app-loads.cy.ts
│   │   ├── 02-protected-routes.cy.ts
│   │   └── 03-login-logout.cy.ts
│   │
│   ├── 02-auth/            ✅ Tests de autenticación
│   │   ├── 01-login-happy-path.cy.ts
│   │   └── 02-login-error-cases.cy.ts
│   │
│   └── 03-students/        ✅ Tests de estudiantes
│       └── 01-students-crud.cy.ts
│
├── fixtures/               📦 Datos de prueba
│   ├── users.json
│   ├── students.json
│   └── notifications.json
│
└── support/                🛠️ Comandos y configuración
    ├── commands.ts         (Comandos custom)
    └── e2e.ts              (Setup global)
```

---

## 🚀 Cómo Ejecutar los Tests

### **Modo Interactivo (Desarrollo)**
```bash
npm run cypress:open
```
Abre la interfaz gráfica de Cypress para ejecutar y debuggear tests visualmente.

### **Modo Headless (CI/CD)**
```bash
# Todos los tests
npm test

# Solo smoke tests
npm run test:smoke

# Solo tests de auth
npm run test:auth

# Solo tests de estudiantes
npm run test:students
```

---

## 📋 Niveles de Testing Implementados

### **✅ Nivel 1: Smoke Tests (Implementado)**
Tests básicos que verifican que la aplicación funciona:
- App carga sin errores
- Landing page accesible
- Login/Logout básico
- Rutas protegidas redirigen correctamente

**Tiempo estimado:** ~30 segundos

### **✅ Nivel 2: Happy Path - Auth (Implementado)**
Tests de flujos principales de autenticación:
- Login exitoso con validación
- Navegación dashboard
- Casos de error (credenciales incorrectas)
- Validación de formularios

**Tiempo estimado:** ~1 minuto

### **✅ Nivel 3: Happy Path - Students (Implementado)**
Tests CRUD de estudiantes:
- Crear estudiante
- Editar estudiante
- Eliminar estudiante
- Buscar/filtrar
- Cambiar estado

**Tiempo estimado:** ~2 minutos

### **🔜 Pendientes de Implementar**
- Registro de instituciones
- Password reset flow
- Notificaciones CRUD
- Perfil y configuración
- Seguimiento y estadísticas
- Tests de integración completos
- Tests de performance

---

## 🛠️ Comandos Custom Disponibles

### **cy.login(email, password)**
Login completo incluyendo verificación de token y redirección:
```typescript
cy.login('admin@test.com', 'password123')
```

### **cy.logout()**
Logout con verificación de limpieza de sesión:
```typescript
cy.logout()
```

### **cy.clearAuth()**
Limpia localStorage y cookies:
```typescript
cy.clearAuth()
```

### **cy.setAuthToken(token, institucion, rol, id)**
Simula sesión autenticada sin hacer login (útil para tests):
```typescript
cy.setAuthToken('mock-token', 'Institución Test', 'admin', '1')
```

---

## 📦 Fixtures (Datos de Prueba)

### **users.json**
```json
{
  "validUser": { email, password, ... },
  "invalidUser": { ... },
  "newUser": { ... }
}
```

### **students.json**
```json
{
  "validStudent": { identificacion, nombre, apellido, ... },
  "studentToEdit": { ... },
  "invalidStudent": { ... }
}
```

### **notifications.json**
```json
{
  "validNotification": { titulo, mensaje, tipo, ... },
  "warningNotification": { ... },
  "errorNotification": { ... }
}
```

---

## 🔧 Configuración

### **cypress.config.ts**
```typescript
{
  baseUrl: 'http://localhost:5173',
  env: {
    apiUrl: 'https://zavira-v8.onrender.com',
    testEmail: 'test@example.com',
    testPassword: 'test123456'
  }
}
```

### **Variables de entorno personalizadas**
Puedes sobrescribir en CLI:
```bash
cypress run --env apiUrl=https://otra-api.com
```

---

## 🎯 Estrategia de Mocking

Los tests usan `cy.intercept()` para mockear respuestas de la API:

```typescript
cy.intercept('POST', '**/login', {
  statusCode: 200,
  body: { token: 'mock-token', ... }
}).as('loginRequest')

cy.wait('@loginRequest')
```

**Ventajas:**
- ✅ Tests rápidos y estables
- ✅ No dependen del backend
- ✅ Puedes simular errores fácilmente

---

## 📊 Casos de Prueba por Módulo

### **1. Autenticación (8 tests)**
- [x] App carga
- [x] Login exitoso
- [x] Login con error
- [x] Logout
- [x] Rutas protegidas
- [x] Sesión persiste
- [x] Validación de campos
- [ ] Password reset flow

### **2. Estudiantes (6 tests)**
- [x] Listar estudiantes
- [x] Crear estudiante
- [x] Editar estudiante
- [x] Eliminar estudiante
- [x] Buscar estudiante
- [x] Cambiar estado
- [ ] Carga masiva
- [ ] Validaciones avanzadas

### **3. Notificaciones (Pendiente)**
- [ ] Crear notificación
- [ ] Listar notificaciones
- [ ] Marcar como leída
- [ ] Eliminar notificación

### **4. Perfil (Pendiente)**
- [ ] Ver perfil
- [ ] Editar perfil
- [ ] Cambiar password
- [ ] Subir avatar

---

## 🐛 Troubleshooting

### **Error: "baseUrl not found"**
Asegúrate de que el dev server está corriendo:
```bash
npm run dev
```

### **Tests fallan por timeout**
Aumenta los timeouts en `cypress.config.ts`:
```typescript
defaultCommandTimeout: 15000
```

### **No encuentra elementos**
Verifica los selectores en el test. Usa:
```typescript
cy.get('[data-cy="elemento"]')  // Recomendado
cy.contains('texto')             // Alternativa
```

### **API real en vez de mocks**
Verifica que `cy.intercept()` esté antes del `cy.visit()`:
```typescript
cy.intercept('GET', '**/api/**', {...}).as('api')
cy.visit('/page')
cy.wait('@api')
```

---

## 📝 Mejores Prácticas

1. ✅ **Usa data attributes para selectores**
   ```html
   <button data-cy="submit-btn">Submit</button>
   ```
   ```typescript
   cy.get('[data-cy="submit-btn"]').click()
   ```

2. ✅ **Mock APIs para tests estables**
   No dependas del backend en tests E2E

3. ✅ **Usa fixtures para datos**
   Centraliza datos de prueba en `fixtures/`

4. ✅ **Un test, una responsabilidad**
   Tests pequeños y enfocados

5. ✅ **Limpia estado entre tests**
   Usa `beforeEach()` para limpiar localStorage

6. ✅ **Nombra tests descriptivamente**
   Usa "should..." o "debe..."

---

## 🎬 Próximos Pasos

1. **Implementar tests pendientes**
   - Registro
   - Password reset
   - Notificaciones
   - Perfil

2. **Agregar tests de integración**
   - Flujos completos end-to-end
   - Navegación entre módulos

3. **CI/CD**
   - Integrar en GitHub Actions
   - Tests automáticos en PRs

4. **Coverage**
   - Medir cobertura de tests
   - Identificar áreas sin tests

---

## 📚 Referencias

- [Cypress Docs](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Commands](https://docs.cypress.io/api/table-of-contents)

---

**Tests creados:** 11  
**Cobertura estimada:** ~40% de funcionalidad crítica  
**Estado:** ✅ Básicos implementados, listos para ejecutar
