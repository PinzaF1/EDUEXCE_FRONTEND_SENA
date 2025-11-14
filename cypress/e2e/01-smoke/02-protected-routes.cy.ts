/// <reference types="cypress" />

describe('SMOKE TEST: Rutas Protegidas', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  it('Dashboard sin autenticación redirige a /login', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('Estudiantes sin autenticación redirige a /login', () => {
    cy.visit('/dashboard/estudiantes')
    cy.url().should('include', '/login')
  })

  it('Seguimiento sin autenticación redirige a /login', () => {
    cy.visit('/dashboard/seguimiento')
    cy.url().should('include', '/login')
  })

  it('Notificaciones sin autenticación redirige a /login', () => {
    cy.visit('/dashboard/notificaciones')
    cy.url().should('include', '/login')
  })

  it('Perfil sin autenticación redirige a /login', () => {
    cy.visit('/dashboard/perfil')
    cy.url().should('include', '/login')
  })

  it('Configuración sin autenticación redirige a /login', () => {
    cy.visit('/dashboard/configuracion')
    cy.url().should('include', '/login')
  })
})
