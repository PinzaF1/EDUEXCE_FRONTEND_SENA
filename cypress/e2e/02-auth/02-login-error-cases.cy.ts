describe('Login error cases', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/login')
  })

  it('Login con email incorrecto muestra mensaje de error genérico', () => {
    cy.get('[data-cy="input-email"]').type('wrong@test.com')
    cy.get('[data-cy="input-password"]').type('wrongpassword')
    cy.get('[data-cy="btn-login-submit"]').click()

    // Esperar a que el alert aparezca
    cy.get('[data-cy="login-alert"]', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Credenciales incorrectas') // mensaje genérico
  })

  it('Login con password incorrecta muestra mensaje de error genérico', () => {
    cy.get('[data-cy="input-email"]').type('admin@test.com')
    cy.get('[data-cy="input-password"]').type('wrongpassword123')
    cy.get('[data-cy="btn-login-submit"]').click()

    cy.get('[data-cy="login-alert"]', { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Credenciales incorrectas') // mensaje genérico
  })

  it('No debe redirigir al dashboard cuando hay error', () => {
    cy.url().should('include', '/login')
  })
})
