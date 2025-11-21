# 🎓 CÓMO USAR EL TALLER - GUÍA RÁPIDA

## 🚀 Inicio Rápido (3 pasos)

### **Paso 1: Inicia tu app**
```bash
npm run dev
```
Deja esta terminal abierta.

---

### **Paso 2: Abre Cypress**
En OTRA terminal:
```bash
npm run cypress:open
```

---

### **Paso 3: Ejecuta los tests del taller**
1. Se abre la ventana de Cypress
2. Click en "E2E Testing"
3. Selecciona Chrome
4. Navega a la carpeta **"04-taller"**
5. Click en cualquier archivo para ejecutarlo

---

## 📁 Archivos del Taller

```
cypress/e2e/04-taller/
│
├── 📄 01-actividad-practica-1.cy.ts
│   └── ✅ ACTIVIDAD 1: Verificar que página carga y muestra "Bienvenido"
│
├── 📄 02-verificar-carga.cy.ts
│   └── Ejemplos básicos de cy.visit() y cy.contains()
│
├── 📄 03-formulario-contacto.cy.ts
│   └── Ejemplos de cy.get(), cy.type(), cy.click()
│
├── 📄 04-actividad-practica-2.cy.ts
│   └── ✅ ACTIVIDAD 2: Fixtures y cy.intercept()
│
└── 📄 05-comandos-basicos-completo.cy.ts
    └── TODOS los comandos explicados con ejemplos
```

---

## 🎯 Qué Contiene Cada Archivo

### **01-actividad-practica-1.cy.ts**
```typescript
// Actividad 1 del taller
- Visita la página principal
- Verifica que "Bienvenido" esté visible
```
**Tiempo:** 5 segundos  
**Comandos:** `cy.visit()`, `cy.contains()`, `.should()`

---

### **02-verificar-carga.cy.ts**
```typescript
// Práctica de navegación
- Verificar carga de página principal
- Verificar carga de página de login
- Verificar elementos visibles
```
**Tiempo:** 10 segundos  
**Comandos:** `cy.visit()`, `cy.get()`, `cy.contains()`

---

### **03-formulario-contacto.cy.ts**
```typescript
// Práctica de interacciones
- Navegar a formulario
- Escribir en campos
- Hacer click en botón
```
**Tiempo:** 15 segundos  
**Comandos:** `cy.get()`, `cy.type()`, `cy.click()`

---

### **04-actividad-practica-2.cy.ts** ⭐
```typescript
// Actividad 2 del taller (LA MÁS IMPORTANTE)
- Cargar datos desde fixture (JSON)
- Interceptar API con cy.intercept()
- Verificar que datos se muestran
```
**Tiempo:** 20 segundos  
**Comandos:** `cy.fixture()`, `cy.intercept()`, `cy.wait()`

**Fixture usado:** `cypress/fixtures/taller-users.json`

---

### **05-comandos-basicos-completo.cy.ts** 📚
```typescript
// REFERENCIA COMPLETA
- cy.visit() explicado con ejemplos
- cy.get() explicado con ejemplos
- cy.contains() explicado con ejemplos
- cy.click() explicado con ejemplos
- cy.type() explicado con ejemplos
- Assertions (.should())
- Ejemplo completo de login
```
**Tiempo:** 1 minuto  
**Comandos:** TODOS los básicos

---

## 💻 Comandos de Ejecución

### **Modo Interactivo (Recomendado para aprender)**
```bash
npm run cypress:open
```
- Ves los tests ejecutándose en tiempo real
- Puedes pausar y debuggear
- Ves cada paso que hace Cypress

---

### **Modo Headless (Rápido)**
```bash
# Solo tests del taller
npm run test:taller

# Un archivo específico
cypress run --spec "cypress/e2e/04-taller/01-actividad-practica-1.cy.ts"

# Todos los tests
npm test
```

---

## 📊 Respuestas del Taller

Todas las respuestas explicadas en detalle en:
```
cypress/TALLER_RESUELTO.md
```

Incluye:
- ✅ Explicación de cada comando
- ✅ Actividad 1 resuelta
- ✅ Actividad 2 resuelta
- ✅ Ejemplos completos
- ✅ Buenas prácticas

---

## 🎓 Orden Recomendado para Aprender

### **1. Empieza por los comandos básicos**
```bash
cypress/e2e/04-taller/05-comandos-basicos-completo.cy.ts
```
Este archivo tiene TODO explicado con comentarios.

### **2. Luego las actividades**
```bash
# Actividad 1 (fácil)
cypress/e2e/04-taller/01-actividad-practica-1.cy.ts

# Actividad 2 (medio)
cypress/e2e/04-taller/04-actividad-practica-2.cy.ts
```

### **3. Experimenta con los ejemplos**
```bash
cypress/e2e/04-taller/02-verificar-carga.cy.ts
cypress/e2e/04-taller/03-formulario-contacto.cy.ts
```

---

## 🔍 Cómo Leer los Archivos

Todos los archivos tienen:

1. **Comentarios explicativos** → Qué hace cada línea
2. **Ejemplos prácticos** → Código funcional
3. **Bloques de explicación** → Al final de cada archivo

**Formato:**
```typescript
// Comentario de qué hace
cy.visit('/login')

/**
 * EXPLICACIÓN DETALLADA:
 * cy.visit() navega a la página...
 */
```

---

## 💡 Tips para Aprender

### **1. Ejecuta y observa**
No solo leas el código, **ejecútalo** en modo interactivo:
```bash
npm run cypress:open
```
Verás cada paso en tiempo real.

---

### **2. Modifica y experimenta**
Cambia valores y ve qué pasa:
```typescript
// Original
cy.contains('Bienvenido')

// Prueba esto
cy.contains('Login')
cy.contains('Estudiantes')
```

---

### **3. Lee los comentarios**
Cada archivo tiene comentarios explicativos. Léelos con calma.

---

### **4. Usa la documentación**
```
cypress/TALLER_RESUELTO.md  ← Respuestas completas
cypress/README.md            ← Documentación general
TESTING_QUICKSTART.md        ← Guía de inicio
```

---

## ❓ Preguntas Frecuentes

### **¿Qué archivo abro primero?**
`05-comandos-basicos-completo.cy.ts` → Tiene TODO explicado.

### **¿Los tests funcionan con mi app real?**
Algunos sí, otros usan **mocks** (datos falsos) para no depender del backend.

### **¿Qué es un "mock"?**
Es simular una respuesta del servidor sin llamar al servidor real:
```typescript
cy.intercept('GET', '/api/users', { body: [{ nombre: 'Juan' }] })
```

### **¿Por qué algunos tests fallan?**
Porque tu app puede no tener exactamente los mismos elementos o textos. Puedes modificar los selectores.

### **¿Puedo modificar los tests?**
¡SÍ! De hecho, es la mejor forma de aprender. Cámbialos y experimenta.

---

## ✅ Checklist de Uso

- [ ] Leí `cypress/TALLER_RESUELTO.md`
- [ ] Ejecuté `npm run dev` (app corriendo)
- [ ] Ejecuté `npm run cypress:open`
- [ ] Vi la carpeta `04-taller/`
- [ ] Ejecuté `05-comandos-basicos-completo.cy.ts`
- [ ] Ejecuté `01-actividad-practica-1.cy.ts`
- [ ] Ejecuté `04-actividad-practica-2.cy.ts`
- [ ] Leí los comentarios en cada archivo
- [ ] Experimenté modificando valores
- [ ] Entendí cómo funcionan los comandos básicos

---

## 🎉 Siguiente Paso

Una vez domines el taller, puedes:

1. **Crear tus propios tests** en `cypress/e2e/`
2. **Agregar más fixtures** en `cypress/fixtures/`
3. **Usar comandos custom** en `cypress/support/commands.ts`
4. **Ejecutar tests automáticos** con `npm test`

---

**¡Éxito con el taller! 🚀**

Si tienes dudas, revisa `cypress/TALLER_RESUELTO.md`
