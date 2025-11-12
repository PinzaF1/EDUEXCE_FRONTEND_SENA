/// <reference types="cypress" />

/**
 * TALLER CYPRESS - ACTIVIDAD PRÁCTICA 1
 * Objetivo: Visitar la página principal y verificar que el texto "Bienvenido" esté visible
 */

describe('Prueba de carga de la página', () => {
  it('verifica que la página carga correctamente', () => {
    // 1. cy.visit() - Visita la página principal
    cy.visit('/')
    
    // 2. cy.contains() - Verifica que el texto de tu landing sea visible
    // Tu landing page tiene "EduExce" y "excelencia educativa"
    cy.contains('EduExce').should('be.visible')
    cy.contains(/excelencia educativa/i).should('be.visible')
  })
  
  it('verifica que la página tiene los botones de navegación', () => {
    cy.visit('/')
    
    // Verificar que existen los botones de login y registro
    cy.contains('Iniciar Sesión').should('be.visible')
    cy.contains('Registrar Institución').should('be.visible')
  })
})

/**
 * EXPLICACIÓN DETALLADA:
 * 
 * cy.visit('/'):
 *   - Navega a la URL base configurada (http://localhost:5173)
 *   - El '/' indica la página principal
 * 
 * cy.contains('Bienvenido'):
 *   - Busca en TODA la página cualquier elemento que contenga el texto "Bienvenido"
 *   - No necesitas saber el selector exacto, solo el texto
 * 
 * .should('be.visible'):
 *   - Verifica que el elemento esté visible en la pantalla
 *   - Si no lo encuentra o no está visible, el test falla
 */
