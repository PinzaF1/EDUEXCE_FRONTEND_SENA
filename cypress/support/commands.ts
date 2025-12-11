/// <reference types="cypress" />

// ***********************************************
// Custom commands for ZAVIRA SENA testing
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login
       * @example cy.login('email@test.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to clear auth data
       * @example cy.clearAuth()
       */
      clearAuth(): Chainable<void>

      /**
       * Custom command to set auth token
       * @example cy.setAuthToken('token', 'institucion', 'rol', 'id')
       */
      setAuthToken(
        token: string,
        institucion: string,
        rol: string,
        idInstitucion: string
      ): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()

  // Esperar que se guarde el token
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.exist
  })

  // Esperar redirección al dashboard
  cy.url().should('include', '/dashboard')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/cerrar sesión|logout/i).click()
  cy.url().should('include', '/login')
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.be.null
  })
})

// Clear auth command
Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Set auth token command (para bypass login en tests)
Cypress.Commands.add(
  'setAuthToken',
  (token: string, institucion: string, rol: string, idInstitucion: string) => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', token)
      win.localStorage.setItem('nombre_institucion', institucion)
      win.localStorage.setItem('rol', rol)
      win.localStorage.setItem('id_institucion', idInstitucion)
    })
  }
)

// Hacer este archivo un módulo de TS
export {}
