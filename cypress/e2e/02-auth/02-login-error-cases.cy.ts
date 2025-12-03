/// <reference types="cypress" />

describe('AUTH: Login - Casos de Error', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.visit('/login')
  })

  it('Login con email incorrecto muestra error', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: {
        message: 'Usuario no encontrado'
      }
    }).as('loginError')

    cy.fixture('users').then((users) => {
      cy.get('[data-cy="input-email"]').type(users.invalidUser.email)
      cy.get('[data-cy="input-password"]').type(users.invalidUser.password)
      cy.get('[data-cy="btn-login-submit"]').click()

      // Esperar la petición y obtener el mensaje del backend
      cy.wait('@loginError').its('response.body.message').then((msg) => {
        // Comprobar que el alert está visible y contiene exactamente el mensaje devuelto
        cy.get('[data-cy="login-alert"]', { timeout: 5000 })
          .should('be.visible')
          .and('contain.text', msg)
      })

      // No debe redirigir
      cy.url().should('include', '/login')

      // No debe guardar token
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null
      })
    })
  })

  it('Login con password incorrecta muestra error', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: {
        message: 'Contraseña incorrecta'
      }
    }).as('loginError')

    cy.get('[data-cy="input-email"]').type('admin@test.com')
    cy.get('[data-cy="input-password"]').type('wrongpassword123')
    cy.get('[data-cy="btn-login-submit"]').click()

    // Esperar la petición y verificar el mensaje renderizado
    cy.wait('@loginError').its('response.body.message').then((msg) => {
      cy.get('[data-cy="login-alert"]', { timeout: 5000 })
        .should('be.visible')
        .and('contain.text', msg)
    })

    cy.url().should('include', '/login')
  })

  it('Login con campos vacíos muestra validación', () => {
    cy.get('[data-cy="btn-login-submit"]').click()

    // HTML5 validation debe prevenir el submit
    cy.get('[data-cy="input-email"]:invalid').should('exist')
    cy.url().should('include', '/login')
  })

  it('Login con email de formato inválido muestra validación', () => {
    cy.get('[data-cy="input-email"]').type('noesunmail')
    cy.get('[data-cy="input-password"]').type('password123')
    cy.get('[data-cy="btn-login-submit"]').click()

    // HTML5 validation para email
    cy.get('[data-cy="input-email"]:invalid').should('exist')
  })

  it('Muestra/oculta password al hacer click en el icono', () => {
    // escribe la contraseña
    cy.get('[data-cy="input-password"]').type('mipassword')

    // click al botón que tiene el icono (usamos data-cy)
    cy.get('[data-cy="btn-toggle-password"]').click()

    // Debería cambiar a type="text"
    cy.get('input[type="text"]').should('have.value', 'mipassword')

    // Volver a ocultar
    cy.get('[data-cy="btn-toggle-password"]').click()
    cy.get('input[type="password"]').should('have.value', 'mipassword')
  })
})
