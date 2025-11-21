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
      cy.get('input[type="email"]').type(users.invalidUser.email)
      cy.get('input[type="password"]').type(users.invalidUser.password)
      cy.get('button[type="submit"]').click()

      cy.wait('@loginError')

      // Verificar mensaje de error
      cy.contains(/error|incorrecto|no encontrado|inválido/i, { timeout: 5000 }).should('be.visible')

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

    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('wrongpassword123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginError')

    cy.contains(/error|incorrecto|inválid/i, { timeout: 5000 }).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('Login con campos vacíos muestra validación', () => {
    cy.get('button[type="submit"]').click()

    // HTML5 validation debe prevenir el submit
    cy.get('input[type="email"]:invalid').should('exist')
    cy.url().should('include', '/login')
  })

  it('Login con email de formato inválido muestra validación', () => {
    cy.get('input[type="email"]').type('noesunmail')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // HTML5 validation para email
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('Muestra/oculta password al hacer click en el icono', () => {
    cy.get('input[type="password"]').type('mipassword')

    // Buscar botón de toggle password (puede ser un icono de ojo)
    cy.get('button, [role="button"]').contains(/(ver|mostrar|show)/i).click()

    // Debería cambiar a type="text"
    cy.get('input[type="text"]').should('have.value', 'mipassword')
  })
})
