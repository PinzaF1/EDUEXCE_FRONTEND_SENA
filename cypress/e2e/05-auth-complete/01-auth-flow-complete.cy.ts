/**
 * Pruebas E2E completas de autenticación y protección de rutas
 * Verifica que el flujo completo de login/logout funcione correctamente
 */

describe('Autenticación Completa - Flujo de Usuario', () => {
  beforeEach(() => {
    // Limpiar todo antes de cada prueba
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  describe('🔒 Protección de Rutas - Usuario NO autenticado', () => {
    it('debe redirigir a /login cuando intenta acceder a /dashboard', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
      
      // Verificar que se guardó la ruta intentada
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectAfterLogin')
        expect(redirectPath).to.equal('/dashboard')
      })
    })

    it('debe redirigir a /login cuando intenta acceder a /dashboard/estudiantes', () => {
      cy.visit('/dashboard/estudiantes')
      cy.url().should('include', '/login')
      
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectAfterLogin')
        expect(redirectPath).to.equal('/dashboard/estudiantes')
      })
    })

    it('debe redirigir a /login cuando intenta acceder a /dashboard/seguimiento', () => {
      cy.visit('/dashboard/seguimiento')
      cy.url().should('include', '/login')
    })

    it('debe redirigir a /login cuando intenta acceder a /dashboard/notificaciones', () => {
      cy.visit('/dashboard/notificaciones')
      cy.url().should('include', '/login')
    })

    it('debe redirigir a /login cuando intenta acceder a /dashboard/perfil', () => {
      cy.visit('/dashboard/perfil')
      cy.url().should('include', '/login')
    })

    it('debe permitir acceso a rutas públicas sin autenticación', () => {
      // Login page
      cy.visit('/login')
      cy.url().should('include', '/login')
      cy.contains('Iniciar Sesión')

      // Register page
      cy.visit('/registro')
      cy.url().should('include', '/registro')
      cy.contains('Registro')

      // Landing page
      cy.visit('/publicidad')
      cy.url().should('include', '/publicidad')
    })
  })

  describe('✅ Login Exitoso y Redirección', () => {
    it('debe hacer login y redirigir al dashboard por defecto', () => {
      cy.visit('/login')
      
      // Simular login exitoso con datos mock
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token-123')
        win.localStorage.setItem('nombre_institucion', 'Institución Test')
        win.localStorage.setItem('id_institucion', '1')
        win.localStorage.setItem('rol', 'admin')
      })

      // Intentar acceder al dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/login')
    })

    it('debe redirigir a la ruta guardada después del login', () => {
      // Simular que intentó acceder a estudiantes sin autenticación
      cy.visit('/dashboard/estudiantes')
      cy.url().should('include', '/login')

      // Verificar que se guardó la ruta
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectAfterLogin')
        expect(redirectPath).to.equal('/dashboard/estudiantes')
      })

      // Simular login exitoso
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token-456')
        win.localStorage.setItem('nombre_institucion', 'Institución Test')
        win.localStorage.setItem('rol', 'admin')
      })

      // Acceder nuevamente
      cy.visit('/dashboard/estudiantes')
      cy.url().should('include', '/dashboard/estudiantes')
      cy.url().should('not.include', '/login')
    })
  })

  describe('🔓 Usuario Autenticado - Navegación Libre', () => {
    beforeEach(() => {
      // Simular usuario autenticado antes de cada prueba
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'authenticated-token')
        win.localStorage.setItem('nombre_institucion', 'Institución Test')
        win.localStorage.setItem('id_institucion', '1')
        win.localStorage.setItem('rol', 'admin')
      })
    })

    it('debe permitir acceso libre al dashboard principal', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/login')
    })

    it('debe permitir acceso a todas las rutas del dashboard', () => {
      const routes = [
        '/dashboard',
        '/dashboard/estudiantes',
        '/dashboard/seguimiento',
        '/dashboard/notificaciones',
        '/dashboard/perfil',
        '/dashboard/configuracion'
      ]

      routes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', route)
        cy.url().should('not.include', '/login')
      })
    })

    it('debe mantener la sesión al navegar entre rutas', () => {
      cy.visit('/dashboard')
      
      // Verificar que el token persiste
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('authenticated-token')
      })

      cy.visit('/dashboard/estudiantes')
      
      // Token sigue existiendo
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('authenticated-token')
      })
    })
  })

  describe('🚪 Logout y Cierre de Sesión', () => {
    beforeEach(() => {
      // Simular usuario autenticado
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'logout-test-token')
        win.localStorage.setItem('nombre_institucion', 'Institución Test')
        win.localStorage.setItem('rol', 'admin')
      })
    })

    it('debe limpiar sesión después del logout', () => {
      cy.visit('/dashboard')
      
      // Simular logout limpiando localStorage
      cy.window().then((win) => {
        win.localStorage.clear()
      })

      // Intentar acceder de nuevo al dashboard
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
      
      // Verificar que no hay token
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null
      })
    })

    it('debe redirigir a /login después de limpiar la sesión', () => {
      cy.visit('/dashboard')
      
      // Limpiar manualmente
      cy.clearLocalStorage()
      
      // Recargar la página
      cy.reload()
      
      // Debe redirigir a login
      cy.url().should('include', '/login')
    })
  })

  describe('🔑 Verificación de Token', () => {
    it('debe detectar token inválido o vacío', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', '')
      })

      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('debe funcionar con token válido', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'valid-token-xyz')
        win.localStorage.setItem('nombre_institucion', 'Test')
      })

      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')
    })
  })

  describe('🔄 Persistencia de Sesión', () => {
    it('debe mantener la sesión después de recargar la página', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'persistent-token')
        win.localStorage.setItem('nombre_institucion', 'Institución Persistente')
      })

      cy.visit('/dashboard')
      cy.url().should('include', '/dashboard')

      // Recargar
      cy.reload()

      // Debe seguir en dashboard
      cy.url().should('include', '/dashboard')
      
      // Token sigue ahí
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('persistent-token')
      })
    })

    it('debe guardar y restaurar datos de usuario', () => {
      const userData = {
        token: 'user-data-token',
        nombre_institucion: 'Mi Institución',
        id_institucion: '123',
        rol: 'admin'
      }

      cy.window().then((win) => {
        Object.entries(userData).forEach(([key, value]) => {
          win.localStorage.setItem(key, value)
        })
      })

      cy.visit('/dashboard')

      // Verificar que todos los datos persisten
      cy.window().then((win) => {
        Object.entries(userData).forEach(([key, value]) => {
          expect(win.localStorage.getItem(key)).to.equal(value)
        })
      })
    })
  })
})
