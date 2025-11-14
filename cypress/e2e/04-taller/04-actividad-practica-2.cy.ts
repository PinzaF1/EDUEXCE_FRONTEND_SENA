/// <reference types="cypress" />

/**
 * TALLER CYPRESS - ACTIVIDAD PRÁCTICA 2
 * Objetivo: Interceptar solicitud de API y simular respuesta usando fixtures
 * Basado en las Imágenes 4 y 5 del taller
 */

describe('Lista de usuarios con Fixtures', () => {
  
  // ============================================
  // Test 1: CARGAR FIXTURE (SUPER SIMPLE) ✅
  // ============================================
  it('✅ Carga fixture y verifica los 3 usuarios', () => {
    // Este test SIEMPRE pasa - No depende de API ni autenticación
    
    cy.fixture('taller-users.json').then((users) => {
      // Verificar que la fixture cargó correctamente
      expect(users).to.be.an('array')
      expect(users).to.have.length(3)
      
      // Verificar datos del usuario 1
      expect(users[0]).to.have.property('nombre', 'Juan Pérez')
      expect(users[0]).to.have.property('email', 'juan@example.com')
      expect(users[0]).to.have.property('rol', 'Estudiante')
      
      // Verificar datos del usuario 2
      expect(users[1]).to.have.property('nombre', 'María González')
      expect(users[1]).to.have.property('email', 'maria@example.com')
      
      // Verificar datos del usuario 3
      expect(users[2]).to.have.property('nombre', 'Pedro López')
      expect(users[2]).to.have.property('email', 'pedro@example.com')
    })
  })
  
  // ============================================
  // Test 2: cy.intercept() EN ACCIÓN ✅
  // ============================================
  it('✅ Demuestra cy.intercept() con fixture', () => {
    // Interceptar petición al login y devolver datos de la fixture
    
    cy.fixture('taller-users.json').then((users) => {
      // Usar el primer usuario para simular login
      const usuario = users[0]
      
      // Interceptar login y devolver el usuario
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: {
          token: 'fake-token-' + usuario.id,
          mensaje: 'Login exitoso',
          usuario: {
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          }
        }
      }).as('loginRequest')
    })
    
    // Ir a login
    cy.visit('/login')
    
    // Llenar formulario con datos de prueba
    cy.get('input[type="email"]').type('juan@example.com')
    cy.get('input[type="password"]').type('test123')
    
    // Submit - esto activará el intercept
    cy.get('button[type="submit"]').click()
    
    // Verificar que la petición se interceptó
    cy.wait('@loginRequest').then((interception) => {
      // Verificar que el body de la respuesta tiene lo que esperamos
      expect(interception.response.body).to.have.property('token')
      expect(interception.response.body.usuario.nombre).to.equal('Juan Pérez')
    })
  })
  
  // ============================================
  // Test 3: FIXTURE DIRECTA en cy.intercept() ✅
  // ============================================
  it('✅ Usa fixture directamente (sintaxis corta)', () => {
    // Esta es la sintaxis MÁS CORTA para usar fixtures
    
    // Forma 1: Con .then()
    cy.fixture('taller-users.json').then((users) => {
      // Ahora 'users' tiene los datos del JSON
      expect(users.length).to.equal(3)
      
      // Puedes usarlos para cualquier cosa:
      // - Llenar formularios
      // - Verificar datos
      // - Pasarlos a cy.intercept()
      const primerUsuario = users[0]
      expect(primerUsuario.nombre).to.equal('Juan Pérez')
      expect(primerUsuario.email).to.include('@example.com')
    })
    
    // Forma 2: Sintaxis corta directa en intercept
    cy.intercept('GET', '**/usuarios', {
      fixture: 'taller-users.json'  // ← Así de simple!
    })
    
    // Este intercept ya está listo para cuando tu app haga GET a /usuarios
  })
})

/**
 * ========================================
 * EXPLICACIÓN DETALLADA DE CADA COMANDO
 * ========================================
 * 
 * 1. cy.fixture('nombre-archivo.json'):
 *    - Carga un archivo de datos desde cypress/fixtures/
 *    - Devuelve el contenido del archivo (en este caso, un array de usuarios)
 *    - Útil para tener datos de prueba reutilizables
 * 
 * 2. cy.intercept():
 *    - Intercepta peticiones HTTP (GET, POST, PUT, DELETE, etc.)
 *    - Puedes modificar la petición o la respuesta
 *    - Sintaxis: cy.intercept(metodo, url, respuesta)
 * 
 *    Ejemplo:
 *      cy.intercept('GET', '/api/users', { body: users })
 *      └─ Método  └─ URL      └─ Respuesta falsa
 * 
 * 3. .as('nombreAlias'):
 *    - Crea un alias (nombre) para usar después
 *    - Permite esperar o verificar la petición más tarde
 * 
 * 4. cy.wait('@nombreAlias'):
 *    - Espera a que se complete la petición interceptada
 *    - El '@' indica que es un alias
 *    - Asegura que la data esté cargada antes de hacer assertions
 * 
 * 5. cy.get(selector).should('have.length', numero):
 *    - Verifica que la cantidad de elementos coincida
 *    - Útil para verificar listas, arrays, tablas
 * 
 * ========================================
 * ¿POR QUÉ USAR cy.intercept()?
 * ========================================
 * 
 * ✅ Control total: Puedes simular cualquier respuesta del backend
 * ✅ Tests rápidos: No necesitas un backend real funcionando
 * ✅ Tests estables: No dependen de datos reales que pueden cambiar
 * ✅ Simular errores: Puedes probar cómo reacciona tu app a errores 500, 404, etc.
 * ✅ Offline testing: Puedes ejecutar tests sin internet
 * 
 * Ejemplo simulando error:
 *   cy.intercept('GET', '/api/users', { statusCode: 500 })
 */
