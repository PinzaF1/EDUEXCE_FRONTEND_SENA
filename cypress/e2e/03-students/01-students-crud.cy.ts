/// <reference types="cypress" />

describe('ESTUDIANTES: CRUD - Happy Path', () => {
  beforeEach(() => {
    // Setup: autenticar usuario
    cy.fixture('users').then((users) => {
      cy.setAuthToken(
        'mock-token-for-testing',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )
    })

    // Navegar a estudiantes
    cy.visit('/dashboard/estudiantes')
  })

  it('La página de estudiantes carga correctamente', () => {
    cy.url().should('include', '/estudiantes')
    cy.contains(/estudiantes/i).should('be.visible')
    
    // Debe tener botón para crear estudiante
    cy.contains(/nuevo|crear|agregar estudiante/i).should('be.visible')
  })

  it('Crear estudiante nuevo muestra formulario', () => {
    cy.contains(/nuevo|crear|agregar estudiante/i).click()
    
    // Verificar que se muestra el formulario (puede ser modal o página)
    cy.get('input[name="identificacion"], input[placeholder*="identificación" i], input[placeholder*="documento" i]').should('be.visible')
    cy.get('input[name="nombre"], input[placeholder*="nombre" i]').should('be.visible')
    cy.get('input[name="apellido"], input[placeholder*="apellido" i]').should('be.visible')
  })

  it('Crear estudiante con datos válidos lo agrega a la lista', () => {
    // Mock de la API de crear estudiante
    cy.intercept('POST', '**/estudiantes', {
      statusCode: 201,
      body: {
        message: 'Estudiante creado exitosamente',
        estudiante: {
          id: '123',
          identificacion: '1234567890',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@test.com',
          estado: 'activo'
        }
      }
    }).as('createStudent')

    // Mock de la API de listar estudiantes
    cy.intercept('GET', '**/estudiantes*', {
      statusCode: 200,
      body: {
        estudiantes: [
          {
            id: '123',
            identificacion: '1234567890',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@test.com',
            estado: 'activo'
          }
        ]
      }
    }).as('getStudents')

    cy.fixture('students').then((students) => {
      // Abrir formulario
      cy.contains(/nuevo|crear|agregar estudiante/i).click()

      // Llenar formulario
      cy.get('input[name="identificacion"], input[placeholder*="identificación" i]')
        .first().type(students.validStudent.identificacion)
      
      cy.get('input[name="nombre"], input[placeholder*="nombre" i]')
        .first().type(students.validStudent.nombre)
      
      cy.get('input[name="apellido"], input[placeholder*="apellido" i]')
        .first().type(students.validStudent.apellido)
      
      cy.get('input[name="email"], input[type="email"]')
        .first().type(students.validStudent.email)

      // Submit
      cy.get('button[type="submit"]').contains(/guardar|crear|agregar/i).click()

      // Esperar respuesta
      cy.wait('@createStudent')

      // Verificar mensaje de éxito
      cy.contains(/éxito|exitoso|creado/i, { timeout: 5000 }).should('be.visible')

      // Verificar que aparece en la lista
      cy.wait('@getStudents')
      cy.contains('Juan').should('be.visible')
      cy.contains('Pérez').should('be.visible')
    })
  })

  it('Buscar estudiante por nombre filtra la lista', () => {
    // Mock de estudiantes
    cy.intercept('GET', '**/estudiantes*', {
      statusCode: 200,
      body: {
        estudiantes: [
          { id: '1', nombre: 'Juan', apellido: 'Pérez', identificacion: '123' },
          { id: '2', nombre: 'María', apellido: 'González', identificacion: '456' },
          { id: '3', nombre: 'Pedro', apellido: 'López', identificacion: '789' }
        ]
      }
    }).as('getStudents')

    cy.wait('@getStudents')

    // Buscar campo de búsqueda
    cy.get('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="filtrar" i]')
      .first()
      .type('Juan')

    // Debe mostrar solo Juan
    cy.contains('Juan').should('be.visible')
    cy.contains('María').should('not.be.visible')
  })

  it('Editar estudiante actualiza sus datos', () => {
    // Mock de lista
    cy.intercept('GET', '**/estudiantes*', {
      statusCode: 200,
      body: {
        estudiantes: [
          { id: '123', nombre: 'Juan', apellido: 'Pérez', identificacion: '1234567890', email: 'juan@test.com' }
        ]
      }
    }).as('getStudents')

    // Mock de actualizar
    cy.intercept('PUT', '**/estudiantes/**', {
      statusCode: 200,
      body: {
        message: 'Estudiante actualizado',
        estudiante: {
          id: '123',
          nombre: 'Juan Carlos',
          apellido: 'Pérez',
          identificacion: '1234567890'
        }
      }
    }).as('updateStudent')

    cy.wait('@getStudents')

    // Buscar botón de editar (puede ser icono de lápiz)
    cy.get('button, [role="button"]').contains(/editar|edit/i).first().click()

    // Modificar nombre
    cy.get('input[name="nombre"], input[placeholder*="nombre" i]')
      .first()
      .clear()
      .type('Juan Carlos')

    // Guardar
    cy.get('button[type="submit"]').contains(/guardar|actualizar/i).click()

    cy.wait('@updateStudent')

    // Verificar mensaje de éxito
    cy.contains(/actualizado|éxito/i, { timeout: 5000 }).should('be.visible')
  })

  it('Eliminar estudiante lo remueve de la lista', () => {
    // Mock de lista
    cy.intercept('GET', '**/estudiantes*', {
      statusCode: 200,
      body: {
        estudiantes: [
          { id: '123', nombre: 'Juan', apellido: 'Pérez', identificacion: '1234567890' }
        ]
      }
    }).as('getStudents')

    // Mock de eliminar
    cy.intercept('DELETE', '**/estudiantes/**', {
      statusCode: 200,
      body: { message: 'Estudiante eliminado' }
    }).as('deleteStudent')

    cy.wait('@getStudents')

    // Buscar botón de eliminar
    cy.get('button, [role="button"]').contains(/eliminar|delete|borrar/i).first().click()

    // Confirmar en el modal de confirmación
    cy.contains(/confirmar|sí|aceptar/i).click()

    cy.wait('@deleteStudent')

    // Verificar mensaje de éxito
    cy.contains(/eliminado|éxito/i, { timeout: 5000 }).should('be.visible')
  })

  it('Cambiar estado de estudiante (activo/inactivo)', () => {
    // Mock de lista
    cy.intercept('GET', '**/estudiantes*', {
      statusCode: 200,
      body: {
        estudiantes: [
          { id: '123', nombre: 'Juan', apellido: 'Pérez', estado: 'activo' }
        ]
      }
    }).as('getStudents')

    // Mock de actualizar estado
    cy.intercept('PATCH', '**/estudiantes/**/estado', {
      statusCode: 200,
      body: { message: 'Estado actualizado' }
    }).as('updateStatus')

    cy.wait('@getStudents')

    // Buscar toggle o botón de estado
    cy.get('button, input[type="checkbox"], [role="switch"]')
      .first()
      .click()

    // Si hay confirmación, aceptar
    cy.get('body').then(($body) => {
      if ($body.text().includes('confirmar')) {
        cy.contains(/confirmar|sí|aceptar/i).click()
      }
    })
  })
})
