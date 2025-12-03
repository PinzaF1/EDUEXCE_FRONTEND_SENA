/// <reference types="cypress" />

/**
 * TALLER CYPRESS - TODOS LOS COMANDOS BÁSICOS
 * Este archivo demuestra TODOS los comandos básicos de Cypress en un solo lugar
 */

describe('Comandos básicos de Cypress - Demostración completa', () => {
  
  // ============================================
  // 1. cy.visit() - Navegar a páginas
  // ============================================
  it('cy.visit() - Navega a diferentes páginas', () => {
    // Visita la página principal
    cy.visit('/')
    
    // Visita la página de login
    cy.visit('/login')
    
    // Visita la página de registro
    cy.visit('/registro')
    
    // Puedes usar URLs completas también
    // cy.visit('https://example.com')
  })
  
  // ============================================
  // 2. cy.get() - Seleccionar elementos
  // ============================================
  it('cy.get() - Selecciona elementos de diferentes formas', () => {
    cy.visit('/login')
    
    // Por tipo de input (FUNCIONA en tu app)
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    
    // Por tipo de botón
    cy.get('button[type="submit"]').should('exist')
    
    // Por tag (genérico)
    cy.get('button').should('have.length.at.least', 1)
    cy.get('form').should('exist')
    cy.get('h1').should('exist')
    
    // NOTA: Tu app NO usa:
    // - input[name="email"] (usa type, no name)
    // - data-cy attributes (buena práctica para agregar)
    // - IDs específicos en botones
  })
  
  // ============================================
  // 3. cy.contains() - Buscar por texto
  // ============================================
  it('cy.contains() - Busca elementos por su texto', () => {
    cy.visit('/login')
    
    // Busca cualquier elemento que contenga "Iniciar Sesión"
    cy.contains(/iniciar sesión/i).should('be.visible')
    
    // Busca específicamente un botón que contenga "Iniciar"
    cy.contains('button', /iniciar|entrar/i).should('exist')
    
    // Busca link de recuperar contraseña (EXISTE en tu login)
    cy.contains(/olvidó|contraseña/i).should('be.visible')
    
    // NOTA: 'EduExce' NO está en /login, está en la landing
    // Para verlo, hay que ir a la página principal
    cy.visit('/')
    cy.contains(/eduexce/i).should('be.visible')
  })
  
  // ============================================
  // 4. cy.click() - Hacer click
  // ============================================
  it('cy.click() - Simula clicks en elementos', () => {
    cy.visit('/login')
    
    // Click en link de "¿Olvidó su contraseña?"
    cy.contains(/olvidó.*contraseña/i).click()
    
    // Debería redirigir a recuperar contraseña
    cy.url().should('include', '/password')
    
    // Volver a login
    cy.visit('/login')
    
    // Click en botón de submit (sin llenar formulario)
    cy.get('button[type="submit"]').click()
    
    // NOTA: "Registrarse" NO está en /login
    // Para ir a registro, hay que hacerlo desde la landing
  })
  
  // ============================================
  // 5. cy.type() - Escribir texto
  // ============================================
  it('cy.type() - Escribe texto en campos', () => {
    cy.visit('/login')
    
    // Escribir texto simple
    cy.get('input[type="email"]').type('admin@test.com')
    
    // Escribir con delay (más lento, como humano)
    cy.get('input[type="password"]').type('123456', { delay: 100 })
    
    // Limpiar y escribir de nuevo
    cy.get('input[type="email"]').clear().type('nuevo@email.com')
    
    // Teclas especiales - Presionar Enter en password (envía form)
    cy.get('input[type="password"]').clear().type('password{enter}')
    
    // NOTA: cy.get('input') sin especificar encuentra MÚLTIPLES inputs
    // y cy.type() solo funciona con UN elemento
    // Siempre especifica: input[type="email"], input[type="password"], etc.
  })
  
  // ============================================
  // EJEMPLO COMPLETO: Login funcional
  // ============================================
  it('Ejemplo completo: Login con todos los comandos', () => {
    // 1. Navegar a login
    cy.visit('/login')
    
    // 2. Verificar que estamos en la página correcta
    cy.contains(/iniciar sesión|login/i).should('be.visible')
    cy.url().should('include', '/login')
    
    // 3. Llenar el formulario
    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('123456')
    
    // 4. Hacer click en submit
    cy.get('button[type="submit"]').click()
    
    // 5. Verificar redirección (mostrará error si credenciales no son reales)
    // Si las credenciales fueran correctas, redirige a dashboard:
    // cy.url().should('include', '/dashboard')
    
    // NOTA: Este test enviará el formulario al backend real
    // Puede mostrar error si las credenciales no existen
  })
  
  // ============================================
  // ASSERTIONS (.should())
  // ============================================
  it('Assertions - Verificar estados y valores', () => {
    cy.visit('/login')
    
    // Verificar visibilidad
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    
    // Verificar que existe
    cy.get('button[type="submit"]').should('exist')
    
    // Verificar texto en la página
    cy.contains(/iniciar sesión/i).should('exist')
    
    // Verificar valor de input después de escribir
    cy.get('input[type="email"]').clear().type('test@test.com')
    cy.get('input[type="email"]').should('have.value', 'test@test.com')
    
    // Verificar que está habilitado/deshabilitado
    cy.get('button[type="submit"]').should('not.be.disabled')
    
    // Verificar cantidad de inputs (email + password)
    cy.get('input[type="email"], input[type="password"]').should('have.length', 2)
  })
})

/**
 * ========================================
 * RESUMEN DE COMANDOS BÁSICOS
 * ========================================
 * 
 * cy.visit(url)           → Navegar a una página
 * cy.get(selector)        → Seleccionar elementos
 * cy.contains(texto)      → Buscar por texto
 * cy.click()              → Hacer click
 * cy.type(texto)          → Escribir texto
 * cy.clear()              → Limpiar campo
 * .should(assertion)      → Verificar condición
 * cy.url()                → Obtener URL actual
 * cy.wait(ms)             → Esperar X milisegundos
 * cy.reload()             → Recargar página
 * 
 * ========================================
 * SELECTORES MÁS COMUNES
 * ========================================
 * 
 * 'button'                     → Por tag
 * '.clase'                     → Por clase CSS
 * '#id'                        → Por ID
 * '[name="email"]'             → Por atributo name
 * '[type="submit"]'            → Por atributo type
 * '[data-cy="elemento"]'       → Por data attribute (MEJOR)
 * 'button[type="submit"]'      → Combinación
 * 
 * ========================================
 * ASSERTIONS MÁS COMUNES
 * ========================================
 * 
 * .should('be.visible')        → Elemento visible
 * .should('exist')             → Elemento existe en DOM
 * .should('not.exist')         → Elemento NO existe
 * .should('have.value', 'x')   → Input tiene valor
 * .should('contain', 'texto')  → Contiene texto
 * .should('have.length', 3)    → Cantidad de elementos
 * .should('be.disabled')       → Está deshabilitado
 * .should('have.class', 'x')   → Tiene clase CSS
 */
