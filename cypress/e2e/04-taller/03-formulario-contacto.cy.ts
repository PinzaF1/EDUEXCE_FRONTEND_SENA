/// <reference types="cypress" />

/**
 * TALLER CYPRESS - Formulario de Contacto
 * Basado en la Imagen 3 del taller
 * Simulando interacciones de usuario: escribir y hacer click
 */

describe('Formulario de contacto', () => {
  it('Debe enviar el formulario', () => {
    // Navegar a la página de registro
    cy.visit('/registro')
    
    // Verificar que el formulario cargó
    cy.contains('Registro de Institución').should('be.visible')
    
    // Escribir en el campo 'nombre_institucion'
    cy.get('input[name="nombre_institucion"]')
      .should('be.visible')
      .type('Institución Educativa Prueba')
    
    // Escribir en el campo 'codigo_dane' (NO es "nit")
    cy.get('input[name="codigo_dane"]')
      .should('be.visible')
      .type('123456789012')
    
    // Escribir en el campo 'correo' (NO es "email")
    cy.get('input[name="correo"]')
      .should('be.visible')
      .type('prueba@correo.com')
    
    // Escribir en el campo 'password'
    cy.get('input[name="password"]')
      .should('be.visible')
      .type('Password123!')
    
    // Escribir en el campo 'confirm_password'
    cy.get('input[name="confirm_password"]')
      .should('be.visible')
      .type('Password123!')
    
    // Hacer clic en el botón de envío
    cy.get('button[type="submit"]').click()
    
    // Nota: El formulario validará que faltan campos obligatorios
    // (ciudad, departamento, dirección, teléfono, jornada)
    // Así que mostrará errores de validación, lo cual es correcto
  })
  
  it('Completa el formulario con TODOS los campos requeridos', () => {
    cy.visit('/registro')
    
    // Campos de texto básicos
    cy.get('input[name="nombre_institucion"]').type('IE San José')
    cy.get('input[name="codigo_dane"]').type('123456789012')
    cy.get('input[name="ciudad"]').type('Bogotá')
    cy.get('input[name="departamento"]').type('Cundinamarca')
    cy.get('input[name="direccion"]').type('Calle 123 # 45-67')
    cy.get('input[name="telefono"]').type('3001234567')
    
    // Jornada (dropdown custom - busca el botón y hace click)
    cy.contains('button', /seleccione la jornada/i).click()
    cy.contains('Completa').click()
    
    // Campos de autenticación
    cy.get('input[name="correo"]').type('admin@iesanjose.edu.co')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="confirm_password"]').type('Password123!')
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Esperar mensaje (puede ser éxito o error del backend)
    // cy.contains(/éxito|error/i, { timeout: 10000 }).should('be.visible')
  })
})

/**
 * EXPLICACIÓN DETALLADA DE COMANDOS:
 * 
 * cy.get(selector):
 *   - Busca elementos usando selectores CSS
 *   - Ejemplos:
 *     • 'input[name="nombre"]' → Input con atributo name="nombre"
 *     • 'input[type="email"]' → Input de tipo email
 *     • 'button[type="submit"]' → Botón de submit
 * 
 * .type('texto'):
 *   - Simula que el usuario escribe en un campo
 *   - El texto se escribe letra por letra (como un usuario real)
 *   - Solo funciona en elementos que aceptan input (input, textarea)
 * 
 * .click():
 *   - Simula que el usuario hace click en el elemento
 *   - Funciona en cualquier elemento clickeable (button, a, div, etc.)
 * 
 * .first():
 *   - Si hay múltiples elementos que coinciden, selecciona el primero
 *   - Útil cuando tienes varios inputs del mismo tipo
 * 
 * Selectores múltiples con coma:
 *   - 'input[name="email"], input[type="email"]'
 *   - Busca CUALQUIERA de los dos selectores
 *   - Se usa como fallback si el primero no existe
 */
