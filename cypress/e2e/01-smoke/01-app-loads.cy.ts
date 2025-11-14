/// <reference types="cypress" />

describe('SMOKE TEST: Aplicación Carga Correctamente', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  it('La aplicación carga sin errores de consola críticos', () => {
    cy.visit('/')
    cy.url().should('exist')
  })

  it('El título de la página es correcto', () => {
    cy.visit('/')
    cy.title().should('include', 'EduExce')
  })

  it('Landing page (/publicidad) es accesible', () => {
    cy.visit('/publicidad')
    cy.url().should('include', '/publicidad')
    cy.contains(/eduexce|zavira/i).should('be.visible')
  })

  it('La página de login existe y es accesible', () => {
    cy.visit('/login')
    cy.url().should('include', '/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('No hay errores 404 en rutas principales', () => {
    const routes = ['/login', '/registro', '/password', '/publicidad']
    
    routes.forEach(route => {
      cy.visit(route)
      cy.contains('404').should('not.exist')
      cy.contains('Not Found').should('not.exist')
    })
  })
})
