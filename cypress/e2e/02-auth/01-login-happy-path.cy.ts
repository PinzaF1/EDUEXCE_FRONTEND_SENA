/// <reference types="cypress" />

describe('AUTH: Login - Happy Path', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.visit('/login')
  })

  it('Formulario de login tiene todos los campos necesarios', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
    
    // Links de registro y password reset
    cy.contains(/registr|crear cuenta/i).should('be.visible')
    cy.contains(/olvidaste|recuperar|restablecer/i).should('be.visible')
  })

  it('Login exitoso redirige al dashboard con token guardado', () => {
    // Mock de la API de login para test estable
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token-123',
        nombre_institucion: 'Institución Test',
        rol: 'admin',
        id_institucion: '1'
      }
    }).as('loginRequest')

    cy.fixture('users').then((users) => {
      cy.get('input[type="email"]').type(users.validUser.email)
      cy.get('input[type="password"]').type(users.validUser.password)
      cy.get('button[type="submit"]').click()

      // Esperar la petición
      cy.wait('@loginRequest')

      // Verificar redirección
      cy.url().should('include', '/dashboard')

      // Verificar localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('mock-jwt-token-123')
        expect(win.localStorage.getItem('nombre_institucion')).to.equal('Institución Test')
        expect(win.localStorage.getItem('rol')).to.equal('admin')
      })
    })
  })

  it('Dashboard muestra información del usuario después del login', () => {
    cy.fixture('users').then((users) => {
      cy.setAuthToken(
        'mock-token',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )

      cy.visit('/dashboard')
      
      // Verificar que muestra el nombre de la institución
      cy.contains(users.validUser.nombre_institucion).should('be.visible')
    })
  })

  it('Navegación entre secciones del dashboard funciona', () => {
    cy.fixture('users').then((users) => {
      cy.setAuthToken(
        'mock-token',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )

      cy.visit('/dashboard')

      // Navegar a Estudiantes
      cy.contains(/estudiantes/i).click()
      cy.url().should('include', '/estudiantes')

      // Navegar a Seguimiento
      cy.contains(/seguimiento/i).click()
      cy.url().should('include', '/seguimiento')

      // Navegar a Notificaciones
      cy.contains(/notificaciones/i).click()
      cy.url().should('include', '/notificaciones')

      // Navegar a Perfil
      cy.contains(/perfil/i).click()
      cy.url().should('include', '/perfil')
    })
  })
})
