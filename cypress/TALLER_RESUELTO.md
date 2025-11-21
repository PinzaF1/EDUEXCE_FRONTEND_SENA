# 📚 TALLER CYPRESS END-TO-END - RESUELTO

**Fecha:** 11 Nov 2025  
**Proyecto:** ZAVIRA SENA Frontend  
**Archivos creados:** 5 tests + 1 fixture  

---

## 📋 Índice de Contenido

1. [Comandos Básicos Explicados](#comandos-básicos)
2. [Actividad Práctica 1 - Resuelta](#actividad-1)
3. [Actividad Práctica 2 - Resuelta](#actividad-2)
4. [Ejemplos Completos](#ejemplos)
5. [Buenas Prácticas](#buenas-prácticas)

---

## 🎯 Comandos Básicos Explicados {#comandos-básicos}

### **cy.visit()**
**Función:** Navega a una URL específica

**Sintaxis:**
```typescript
cy.visit('/ruta')
cy.visit('https://ejemplo.com')
```

**¿Qué hace?**
- Abre la página en el navegador de Cypress
- Es como escribir una URL en la barra de direcciones
- Espera a que la página cargue completamente

**Ejemplo en tu proyecto:**
```typescript
cy.visit('/login')        // Va a http://localhost:5173/login
cy.visit('/dashboard')    // Va al dashboard
cy.visit('/')             // Va a la página principal
```

---

### **cy.get()**
**Función:** Selecciona elementos del DOM usando selectores CSS

**Sintaxis:**
```typescript
cy.get('selector')
```

**¿Qué hace?**
- Busca elementos en la página usando selectores CSS
- Devuelve el/los elementos encontrados
- Si no encuentra nada, el test falla

**Ejemplos:**
```typescript
// Por tipo
cy.get('input[type="email"]')
cy.get('button[type="submit"]')

// Por nombre
cy.get('input[name="password"]')

// Por clase
cy.get('.btn-primary')

// Por ID
cy.get('#login-button')

// Por data attribute (RECOMENDADO)
cy.get('[data-cy="email-input"]')

// Múltiples selectores (busca cualquiera)
cy.get('input[name="email"], input[type="email"]')
```

---

### **cy.contains()**
**Función:** Busca elementos que contengan un texto específico

**Sintaxis:**
```typescript
cy.contains('texto')
cy.contains('selector', 'texto')
```

**¿Qué hace?**
- Busca en TODA la página elementos con ese texto
- No necesitas saber el selector exacto
- Útil cuando no tienes IDs o clases específicas

**Ejemplos:**
```typescript
// Busca cualquier elemento con "Bienvenido"
cy.contains('Bienvenido')

// Busca específicamente un botón con "Login"
cy.contains('button', 'Login')

// Case insensitive (ignora mayúsculas)
cy.contains(/bienvenido/i)

// Texto parcial
cy.contains('Iniciar')  // Encuentra "Iniciar Sesión"
```

---

### **cy.click()**
**Función:** Simula un click del usuario en un elemento

**Sintaxis:**
```typescript
cy.get('selector').click()
```

**¿Qué hace?**
- Hace click en el elemento seleccionado
- Simula el comportamiento real del usuario
- Dispara todos los eventos (mousedown, mouseup, click)

**Ejemplos:**
```typescript
// Click en botón
cy.get('button[type="submit"]').click()

// Click en link
cy.contains('Registrarse').click()

// Click en cualquier elemento
cy.get('.card').click()

// Doble click
cy.get('#elemento').dblclick()

// Click derecho
cy.get('#elemento').rightclick()
```

---

### **cy.type()**
**Función:** Escribe texto en un campo de input

**Sintaxis:**
```typescript
cy.get('input').type('texto')
```

**¿Qué hace?**
- Simula que el usuario escribe letra por letra
- Solo funciona en elementos que aceptan texto (input, textarea)
- Dispara eventos de teclado (keydown, keyup, etc.)

**Ejemplos:**
```typescript
// Escribir texto simple
cy.get('input[type="email"]').type('admin@test.com')

// Escribir con delay (más lento)
cy.get('input').type('texto', { delay: 100 })

// Teclas especiales
cy.get('input').type('texto{enter}')      // Presiona Enter
cy.get('input').type('texto{esc}')        // Presiona Escape
cy.get('input').type('texto{backspace}')  // Borra último carácter
cy.get('input').type('{selectall}')       // Selecciona todo

// Limpiar antes de escribir
cy.get('input').clear().type('nuevo texto')
```

---

## ✅ Actividad Práctica 1 - Resuelta {#actividad-1}

### **Enunciado:**
Visitar la página principal y verificar que el texto "Bienvenido" esté visible.

### **Solución:**

**Archivo:** `cypress/e2e/04-taller/01-actividad-practica-1.cy.ts`

```typescript
describe('Prueba de carga de la página', () => {
  it('verifica que la página carga correctamente', () => {
    // 1. Visitar la página principal
    cy.visit('/')
    
    // 2. Verificar que el texto "Bienvenido" sea visible
    cy.contains('Bienvenido').should('be.visible')
  })
})
```

### **Explicación paso a paso:**

1. **`describe('Prueba de carga de la página', () => {})`**
   - Agrupa tests relacionados
   - El texto describe QUÉ estás probando

2. **`it('verifica que la página carga correctamente', () => {})`**
   - Define UNA prueba específica
   - El texto describe lo que DEBE pasar

3. **`cy.visit('/')`**
   - Navega a la URL base (http://localhost:5173)
   - Espera a que la página cargue completamente

4. **`cy.contains('Bienvenido')`**
   - Busca en toda la página el texto "Bienvenido"
   - No importa en qué elemento esté

5. **`.should('be.visible')`**
   - Verifica que el elemento esté visible
   - Si no está visible o no existe, el test falla

### **Cómo ejecutarlo:**
```bash
# Modo interactivo
npm run cypress:open
# Luego click en: 04-taller/01-actividad-practica-1.cy.ts

# Modo headless
cypress run --spec "cypress/e2e/04-taller/01-actividad-practica-1.cy.ts"
```

---

## ✅ Actividad Práctica 2 - Resuelta {#actividad-2}

### **Enunciado:**
Interceptar la llamada a la API `/api/users`, responder con un archivo JSON con 3 usuarios, y verificar que se muestren correctamente.

### **Solución:**

**Fixture:** `cypress/fixtures/taller-users.json`
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "Estudiante"
  },
  {
    "id": 2,
    "nombre": "María González",
    "email": "maria@example.com",
    "rol": "Profesor"
  },
  {
    "id": 3,
    "nombre": "Pedro López",
    "email": "pedro@example.com",
    "rol": "Administrador"
  }
]
```

**Test:** `cypress/e2e/04-taller/04-actividad-practica-2.cy.ts`
```typescript
describe('Lista de usuarios', () => {
  it('Muestra los usuarios desde la fixture', () => {
    // 1. Cargar fixture
    cy.fixture('taller-users.json').then((users) => {
      
      // 2. Interceptar API
      cy.intercept('GET', '/api/users', { body: users }).as('getUsers')
      
      // 3. Visitar página
      cy.visit('/dashboard/estudiantes')
      
      // 4. Esperar petición
      cy.wait('@getUsers')
      
      // 5. Verificar cantidad
      cy.get('[data-cy="usuario-item"]').should('have.length', 3)
    })
  })
})
```

### **Explicación detallada:**

#### **1. cy.fixture('nombre-archivo.json')**
```typescript
cy.fixture('taller-users.json').then((users) => {
  // 'users' contiene el contenido del JSON
})
```
- Carga archivos desde `cypress/fixtures/`
- Devuelve el contenido parseado (array de usuarios)
- Útil para datos de prueba reutilizables

#### **2. cy.intercept()**
```typescript
cy.intercept('GET', '/api/users', { body: users }).as('getUsers')
           └─┬──┘  └─────┬─────┘  └──────┬──────┘    └─────┬─────┘
          Método      URL         Respuesta         Alias
```
**¿Qué hace?**
- **Intercepta** peticiones HTTP antes de que lleguen al servidor
- **Método:** GET, POST, PUT, DELETE, etc.
- **URL:** Ruta que quieres interceptar (puede usar wildcards *)
- **Respuesta:** Objeto con { body, statusCode, headers }
- **Alias:** Nombre para referenciar después

**Ventajas:**
- ✅ No necesitas backend funcionando
- ✅ Tests más rápidos
- ✅ Puedes simular errores
- ✅ Datos consistentes

**Ejemplos adicionales:**
```typescript
// Interceptar POST
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { token: 'abc123' }
})

// Simular error 500
cy.intercept('GET', '/api/users', {
  statusCode: 500,
  body: { error: 'Internal Server Error' }
})

// Usar fixture directamente
cy.intercept('GET', '/api/users', { fixture: 'taller-users.json' })

// Interceptar cualquier llamada
cy.intercept('GET', '/api/**').as('anyApiCall')
```

#### **3. .as('nombreAlias')**
```typescript
.as('getUsers')
```
- Crea un **alias** (apodo) para la petición
- Permite referenciarla después con `@nombreAlias`
- Útil para esperar o verificar la petición

#### **4. cy.wait('@alias')**
```typescript
cy.wait('@getUsers')
```
- **Espera** a que se complete la petición interceptada
- El `@` indica que es un alias
- Asegura que los datos estén disponibles antes de continuar

**Sin wait:** El test puede correr antes de que los datos carguen ❌
**Con wait:** El test espera a que los datos estén listos ✅

#### **5. Verificación**
```typescript
cy.get('[data-cy="usuario-item"]').should('have.length', 3)
```
- Verifica que hay exactamente 3 elementos
- `should('have.length', numero)` es una assertion
- Si hay más o menos, el test falla

---

## 📚 Ejemplos Completos {#ejemplos}

### **Ejemplo 1: Login Completo**
```typescript
it('Usuario puede hacer login', () => {
  // Interceptar la API de login
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: {
      token: 'fake-token-123',
      usuario: 'Admin Test'
    }
  }).as('login')

  // Navegar a login
  cy.visit('/login')

  // Llenar formulario
  cy.get('input[type="email"]').type('admin@test.com')
  cy.get('input[type="password"]').type('123456')

  // Submit
  cy.get('button[type="submit"]').click()

  // Esperar respuesta
  cy.wait('@login')

  // Verificar redirección
  cy.url().should('include', '/dashboard')

  // Verificar que guarda token
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.equal('fake-token-123')
  })
})
```

---

### **Ejemplo 2: Crear Estudiante**
```typescript
it('Puede crear un estudiante nuevo', () => {
  // Mock de crear
  cy.intercept('POST', '**/estudiantes', {
    statusCode: 201,
    body: {
      message: 'Estudiante creado',
      estudiante: { id: 123, nombre: 'Juan Pérez' }
    }
  }).as('createStudent')

  // Mock de listar
  cy.intercept('GET', '**/estudiantes', {
    statusCode: 200,
    body: {
      estudiantes: [
        { id: 123, nombre: 'Juan Pérez', email: 'juan@test.com' }
      ]
    }
  }).as('getStudents')

  // Simular sesión autenticada
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'fake-token')
  })

  // Ir a estudiantes
  cy.visit('/dashboard/estudiantes')

  // Abrir formulario
  cy.contains(/nuevo|crear estudiante/i).click()

  // Llenar datos
  cy.get('input[name="nombre"]').type('Juan Pérez')
  cy.get('input[name="email"]').type('juan@test.com')
  cy.get('input[name="identificacion"]').type('1234567890')

  // Guardar
  cy.get('button[type="submit"]').click()

  // Esperar respuesta
  cy.wait('@createStudent')

  // Verificar mensaje de éxito
  cy.contains(/éxito|creado/i).should('be.visible')

  // Verificar que aparece en lista
  cy.wait('@getStudents')
  cy.contains('Juan Pérez').should('be.visible')
})
```

---

## 🎯 Buenas Prácticas {#buenas-prácticas}

### **1. Usa data attributes para selectores**
```html
<!-- ❌ MAL - Depende de clases CSS que pueden cambiar -->
<button class="btn btn-primary submit-btn">Login</button>

<!-- ✅ BIEN - Data attribute específico para tests -->
<button data-cy="login-button" class="btn btn-primary">Login</button>
```

```typescript
// Selector robusto
cy.get('[data-cy="login-button"]').click()
```

---

### **2. Agrupa tests relacionados**
```typescript
// ✅ BIEN
describe('Autenticación', () => {
  describe('Login', () => {
    it('exitoso con credenciales válidas', () => {})
    it('falla con email incorrecto', () => {})
    it('falla con password incorrecta', () => {})
  })
  
  describe('Logout', () => {
    it('limpia la sesión', () => {})
    it('redirige a login', () => {})
  })
})
```

---

### **3. Usa beforeEach para setup común**
```typescript
describe('Tests de Dashboard', () => {
  beforeEach(() => {
    // Setup que se ejecuta ANTES de cada test
    cy.visit('/dashboard')
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token')
    })
  })

  it('muestra estadísticas', () => {
    // Ya estás en dashboard con token
    cy.contains('Estadísticas').should('be.visible')
  })

  it('muestra lista de estudiantes', () => {
    // También aquí estás en dashboard con token
    cy.contains('Estudiantes').click()
  })
})
```

---

### **4. Intercepta ANTES de visitar**
```typescript
// ✅ BIEN - Intercept ANTES de visit
it('carga usuarios', () => {
  cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('users')
  cy.visit('/usuarios')  // ← Ahora cuando visite, el intercept está listo
  cy.wait('@users')
})

// ❌ MAL - Visit antes de intercept
it('carga usuarios', () => {
  cy.visit('/usuarios')  // ← Ya hizo la petición, no la interceptará
  cy.intercept('GET', '/api/users', { fixture: 'users.json' })  // ← Tarde
})
```

---

### **5. Usa comandos custom para acciones repetitivas**
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="submit"]').click()
})

// En tus tests
it('usuario autenticado puede ver dashboard', () => {
  cy.login('admin@test.com', '123456')
  cy.url().should('include', '/dashboard')
})
```

---

### **6. Nombra tests descriptivamente**
```typescript
// ❌ MAL
it('test 1', () => {})
it('funciona', () => {})

// ✅ BIEN
it('usuario puede hacer login con credenciales válidas', () => {})
it('muestra error cuando el email está vacío', () => {})
it('redirige a dashboard después de login exitoso', () => {})
```

---

## 📊 Resumen de Archivos Creados

```
cypress/
├── e2e/04-taller/
│   ├── 01-actividad-practica-1.cy.ts           ← Actividad 1
│   ├── 02-verificar-carga.cy.ts                ← Ejemplos básicos
│   ├── 03-formulario-contacto.cy.ts            ← Interacciones
│   ├── 04-actividad-practica-2.cy.ts           ← Actividad 2 (fixtures)
│   └── 05-comandos-basicos-completo.cy.ts      ← Todos los comandos
│
└── fixtures/
    └── taller-users.json                        ← Datos de prueba
```

---

## 🚀 Cómo Ejecutar los Tests del Taller

### **Todos los tests del taller:**
```bash
npm run cypress:open
# Luego navega a la carpeta 04-taller/
```

### **Un test específico:**
```bash
cypress run --spec "cypress/e2e/04-taller/01-actividad-practica-1.cy.ts"
```

### **Todos en headless:**
```bash
cypress run --spec "cypress/e2e/04-taller/**"
```

---

## ✅ Checklist de Aprendizaje

- [x] Entiendo qué es Cypress y para qué sirve
- [x] Sé usar `cy.visit()` para navegar
- [x] Sé usar `cy.get()` para seleccionar elementos
- [x] Sé usar `cy.contains()` para buscar por texto
- [x] Sé usar `cy.click()` para hacer clicks
- [x] Sé usar `cy.type()` para escribir
- [x] Entiendo qué son las fixtures
- [x] Sé usar `cy.intercept()` para mockear APIs
- [x] Sé usar `cy.wait()` para esperar peticiones
- [x] Puedo escribir un test E2E completo

---

**¡Taller Completado! 🎉**

Todos los archivos están en `cypress/e2e/04-taller/` listos para ejecutar.
