/// <reference types="cypress" />

/**
 * TALLER CYPRESS - Verificar carga de página
 * Basado en la Imagen 1 y 2 del taller
 */

describe('Verificar carga de la página', () => {
  it('La página carga correctamente', () => {
    // Navegar a la página principal
    cy.visit('/')
    
    // Verificar que el texto de tu landing page es visible
    cy.contains('EduExce').should('be.visible')
    cy.contains(/excelencia educativa/i).should('be.visible')
  })
  
  it('La página de login carga correctamente', () => {
    // Navegar a la página de login
    cy.visit('/login')
    
    // Verificar que los elementos del login están presentes
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains(/iniciar sesión|login/i).should('be.visible')
  })
})

/**
 * EXPLICACIÓN DE LOS COMANDOS:
 * 
 * describe('texto', () => {}):
 *   - Agrupa un conjunto de tests relacionados
 *   - El texto describe QUÉ estás probando
 * 
 * it('texto', () => {}):
 *   - Define UNA prueba individual
 *   - El texto describe lo que DEBE pasar
 * 
 * cy.visit('/ruta'):
 *   - Navega a una URL específica
 *   - Funciona como escribir en la barra del navegador
 * 
 * cy.contains('texto'):
 *   - Busca cualquier elemento que contenga ese texto
 *   - Es case-sensitive (distingue mayúsculas/minúsculas)
 * 
 * .should('be.visible'):
 *   - Assertion (afirmación) que verifica que el elemento esté visible
 *   - Si no está visible, el test falla
 */
