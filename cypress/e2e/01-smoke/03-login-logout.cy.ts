/// <reference types="cypress" />

describe('SMOKE TEST: Login y Logout Básico', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  it('Login exitoso con credenciales válidas', () => {
    cy.fixture('users').then((users) => {
      cy.setAuthToken(
        'fake-token-123',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )
      cy.visit('/dashboard')
      cy.window().then(win => {
        expect(win.localStorage.getItem('token')).to.equal('fake-token-123')
      })
      cy.url().should('include', '/dashboard')
    })
  })

  it('Login fallido muestra mensaje de error', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('wrong@test.com')
    cy.get('input[type="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()

    cy.get('[role="alert"]', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Credenciales incorrectas')
  })

  it('Logout limpia la sesión correctamente', () => {
    cy.fixture('users').then(users => {
      cy.setAuthToken(
        'fake-token-123',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )
      cy.visit('/dashboard')
      cy.get('[data-cy="logout-btn"]').click()
      cy.url().should('include', '/login')
      cy.window().then(win => expect(win.localStorage.getItem('token')).to.be.null)
    })
  })

  it('La sesión persiste después de refrescar la página', () => {
    cy.fixture('users').then(users => {
      cy.setAuthToken(
        'fake-token-123',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.reload()
      cy.url().should('include', '/dashboard')
    })
  })
})


