/// <reference types="cypress" />

describe('ESTUDIANTES: CRUD - Happy Path', () => {
  beforeEach(() => {
    // Fixture users -> set token + localStorage keys
    cy.fixture('users').then((users) => {
      cy.setAuthToken(
        'mock-token-for-testing',
        users.validUser.nombre_institucion,
        users.validUser.rol,
        users.validUser.id_institucion
      )
    })

    // Intercept perfil y notificaciones para que no haya 401 al montar
    cy.intercept('GET', '**/admin/perfil', {
      statusCode: 200,
      body: { usuario: { nombre: 'Admin Test', id: 1, id_institucion: '42' } }
    }).as('getPerfil')

    cy.intercept('GET', '**/admin/notificaciones', {
      statusCode: 200,
      body: { notificaciones: [] }
    }).as('getNotificaciones')

    // Intercept inicial: devuelve ARRAY con Andrés y otros registros
    cy.intercept('GET', '**/admin/estudiantes*', (req) => {
      req.reply({
        statusCode: 200,
        body: [
          { id_usuario: 301, nombre: 'Andrés', apellido: 'Torres', numero_documento: '321', tipo_documento: 'CC', correo: 'andres.torres@test.com', grado: '11', curso: 'B', jornada: 'mañana', direccion: 'C/10', is_active: true },
          { id_usuario: 302, nombre: 'Ana',    apellido: 'Pineda',  numero_documento: '1001', tipo_documento: 'CC', correo: 'ana.pineda@test.com',    grado: '10', curso: 'A', jornada: 'mañana', direccion: 'C/1',  is_active: true },
          { id_usuario: 303, nombre: 'Pedro',  apellido: 'Santos',  numero_documento: '1002', tipo_documento: 'CC', correo: 'pedro.santos@test.com',  grado: '10', curso: 'B', jornada: 'tarde',  direccion: 'C/2',  is_active: true },
          { id_usuario: 304, nombre: 'María',  apellido: 'López',   numero_documento: '1003', tipo_documento: 'TI', correo: 'maria.lopez@test.com',   grado: '11', curso: 'A', jornada: 'mañana', direccion: 'C/3',  is_active: true },
          { id_usuario: 305, nombre: 'Carla',  apellido: 'Rojas',   numero_documento: '1004', tipo_documento: 'CC', correo: 'carla.rojas@test.com',   grado: '10', curso: 'A', jornada: 'mañana', direccion: 'C/5',  is_active: true }
        ]
      })
    }).as('getStudentsInit')

    // Navegar a la página después de setear intercepts y auth
    cy.visit('/dashboard/estudiantes')

    // Esperar peticiones iniciales (la app hace varias llamadas; asegurar que la pantalla esté lista)
    cy.wait(['@getPerfil', '@getNotificaciones'])
    // esperar que la tabla esté presente
    cy.get('[data-cy="student-list"]', { timeout: 10000 }).should('exist')
  })

  it('La página de estudiantes carga correctamente ', () => {
    cy.url().should('include', '/estudiantes')
    cy.contains(/estudiantes/i).should('be.visible')
    cy.get('[data-cy="btn-add-student"]').should('be.visible')
    // Verificar que Andrés está en la lista inicial
    cy.contains('Andrés').should('be.visible')
  })

  it('Crear estudiante nuevo muestra formulario', () => {
    cy.get('[data-cy="btn-add-student"]').click()
    cy.get('[data-cy="input-document"]').should('be.visible')
    cy.get('[data-cy="input-nombre"]').should('be.visible')
    cy.get('[data-cy="input-apellido"]').should('be.visible')
    cy.get('[data-cy="input-correo"]').should('be.visible')
    // cerrar modal
    cy.get('button').contains(/cancelar|✕/i).click({ force: true })
  })

  it('Crear estudiante con datos válidos lo agrega a la lista', () => {
    // Intercept POST -> responde 201 con objeto estudiante
    cy.intercept('POST', '**/admin/estudiantes', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          message: 'Estudiante creado exitosamente',
          estudiante: {
            id_usuario: 999,
            numero_documento: '9876543210',
            nombre: 'Carlos',
            apellido: 'Ramírez',
            tipo_documento: 'CC',
            grado: '10',
            curso: 'A',
            jornada: 'mañana',
            direccion: 'Calle Falsa 123',
            correo: 'carlos.ramirez@test.com',
            is_active: true
          }
        }
      })
    }).as('createStudent')

    // Intercept GET posterior -> devolver array con el nuevo estudiante
    cy.intercept('GET', '**/admin/estudiantes*', {
      statusCode: 200,
      body: [
        {
          id_usuario: 999,
          nombre: 'Carlos',
          apellido: 'Ramírez',
          numero_documento: '9876543210',
          tipo_documento: 'CC',
          grado: '10',
          curso: 'A',
          jornada: 'mañana',
          direccion: 'Calle Falsa 123',
          correo: 'carlos.ramirez@test.com',
          is_active: true
        }
      ]
    }).as('getStudentsAfterCreate')

    // Abrir modal y llenar
    cy.get('[data-cy="btn-add-student"]').click()
    cy.get('[data-cy="input-document"]').clear().type('9876543210')
    cy.get('[data-cy="input-nombre"]').clear().type('Carlos')
    cy.get('[data-cy="input-apellido"]').clear().type('Ramírez')
    cy.get('[data-cy="input-correo"]').clear().type('carlos.ramirez@test.com')
    cy.get('[data-cy="input-direccion"]').clear().type('Calle Falsa 123')
    cy.get('[data-cy="select-tipo-documento"]').select('CC')
    cy.get('[data-cy="select-grado"]').select('10')
    cy.get('[data-cy="select-curso"]').select('A')
    cy.get('[data-cy="select-jornada"]').select('mañana')
    cy.get('[data-cy="btn-registrar"]').click()

    // Verificar que se hizo la petición POST y que su body contiene lo esperado
    cy.wait('@createStudent').its('request.body').should((body: any) => {
      expect(body.nombre).to.equal('Carlos')
      expect(body.apellido).to.equal('Ramírez')
      expect(body.tipo_documento).to.equal('CC')
      expect(body.numero_documento || body.numeroDocumento || body.documento).to.equal('9876543210')
    })

    // Esperar a que la UI recargue la tabla (GET) y mostrar el nuevo registro
    cy.wait('@getStudentsAfterCreate')
    cy.contains('Carlos').should('be.visible')
    cy.contains('Ramírez').should('be.visible')
    cy.get('[data-cy="modal-add-student"]').should('not.exist')
  })

  it('Registra estudiantes de manera individual', () => {
    const nuevos = [
      { id_usuario: 201, numero_documento: '2001', nombre: 'Ana',   apellido: 'Pineda',   tipo_documento: 'CC', grado: '10', curso: 'A', jornada: 'mañana', direccion: 'C/1', correo: 'ana.pineda@test.com' },
      { id_usuario: 202, numero_documento: '2002', nombre: 'Pedro', apellido: 'Santos',   tipo_documento: 'CC', grado: '10', curso: 'B', jornada: 'tarde',   direccion: 'C/2', correo: 'pedro.santos@test.com' },
      { id_usuario: 203, numero_documento: '2003', nombre: 'María', apellido: 'López',    tipo_documento: 'TI', grado: '11', curso: 'A', jornada: 'mañana', direccion: 'C/3', correo: 'maria.lopez@test.com' },
      { id_usuario: 204, numero_documento: '2004', nombre: 'Luis',  apellido: 'Martínez', tipo_documento: 'CE', grado: '11', curso: 'C', jornada: 'tarde',   direccion: 'C/4', correo: 'luis.martinez@test.com' },
      { id_usuario: 205, numero_documento: '2005', nombre: 'Carla', apellido: 'Rojas',    tipo_documento: 'CC', grado: '10', curso: 'A', jornada: 'mañana', direccion: 'C/5', correo: 'carla.rojas@test.com' },
      { id_usuario: 206, numero_documento: '2006', nombre: 'Jorge', apellido: 'Vargas',   tipo_documento: 'CC', grado: '11', curso: 'B', jornada: 'tarde',   direccion: 'C/6', correo: 'jorge.vargas@test.com' }
    ]

    // acumulado simulado en el test para devolver la lista actualizada en cada iteración
    const acumulado: any[] = []

    nuevos.forEach((s, i) => {
      // intercept POST para crear
      cy.intercept('POST', '**/admin/estudiantes', (req) => {
        expect(req.body).to.exist
        req.reply({ statusCode: 201, body: { message: 'Estudiante creado exitosamente', estudiante: s } })
      }).as(`createOne${i}`)

      // añadir a acumulado y mockear GET para devolver la lista actualizada (array)
      acumulado.push(s)
      cy.intercept('GET', '**/admin/estudiantes*', (req) => {
        req.reply({ statusCode: 200, body: [...acumulado] })
      }).as(`getAfterCreate${i}`)

      // abrir modal y enviar
      cy.get('[data-cy="btn-add-student"]').click()
      cy.get('[data-cy="input-document"]').clear().type(s.numero_documento)
      cy.get('[data-cy="input-nombre"]').clear().type(s.nombre)
      cy.get('[data-cy="input-apellido"]').clear().type(s.apellido)
      cy.get('[data-cy="input-correo"]').clear().type(s.correo)
      cy.get('[data-cy="input-direccion"]').clear().type(s.direccion)
      cy.get('[data-cy="select-tipo-documento"]').select(s.tipo_documento)
      cy.get('[data-cy="select-grado"]').select(s.grado)
      cy.get('[data-cy="select-curso"]').select(s.curso)
      cy.get('[data-cy="select-jornada"]').select(s.jornada)
      cy.get('[data-cy="btn-registrar"]').click()

      cy.wait(`@createOne${i}`)
      cy.wait(`@getAfterCreate${i}`)

      // Verificar que se ve el creado
      cy.contains(s.nombre).should('be.visible')
      cy.contains(s.apellido).should('be.visible')
      cy.contains(s.numero_documento).should('be.visible')
    })

    // Al final todos visibles
    nuevos.forEach((s) => {
      cy.contains(s.nombre).should('be.visible')
    })
  })

  it('Buscar estudiante por nombre filtra la lista', () => {
    // Mock GET para búsqueda: devolver un array con varios
    cy.intercept('GET', '**/admin/estudiantes*', {
      statusCode: 200,
      body: [
        { id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', numero_documento: '123' },
        { id_usuario: 2, nombre: 'María', apellido: 'González', numero_documento: '456' },
        { id_usuario: 3, nombre: 'Pedro', apellido: 'López', numero_documento: '789' }
      ]
    }).as('getStudentsForSearch')

    // Forzar recarga
    cy.get('[data-cy="btn-search"]').click()
    cy.wait('@getStudentsForSearch')

    cy.get('[data-cy="input-search"]').clear().type('Juan')
    cy.wait(200)
    cy.contains('Juan').should('be.visible')
    cy.contains('María').should('not.exist')
  })

  it('Editar estudiante actualiza sus datos', () => {
    // Mock GET inicial con un estudiante (array)
    cy.intercept('GET', '**/admin/estudiantes*', {
      statusCode: 200,
      body: [
        { id_usuario: 123, nombre: 'Juan', apellido: 'Pérez', numero_documento: '1234567890', correo: 'juan@test.com', tipo_documento: 'CC', grado: '10', curso: 'A', jornada: 'mañana' }
      ]
    }).as('getStudentsForEdit')

    // Mock PUT actualizar
    cy.intercept('PUT', '**/admin/estudiantes/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          message: 'Estudiante actualizado',
          estudiante: { id_usuario: 123, nombre: 'Juan Carlos', apellido: 'Pérez', numero_documento: '1234567890' }
        }
      })
    }).as('updateStudent')

    // Mock GET posterior (array con el nombre actualizado)
    cy.intercept('GET', '**/admin/estudiantes*', {
      statusCode: 200,
      body: [
        { id_usuario: 123, nombre: 'Juan Carlos', apellido: 'Pérez', numero_documento: '1234567890', correo: 'juan@test.com' }
      ]
    }).as('getStudentsAfterUpdate')

    // Forzar recarga de la lista (botón Buscar) y asegurarnos que la tabla esté renderizada
    cy.get('[data-cy="btn-search"]').click()
    cy.get('[data-cy="student-list"]').should('exist')
    cy.contains('Juan').should('be.visible')

    // Abrir editar desde la fila (más robusto que buscar botones globales)
    cy.contains('Juan').closest('tr').within(() => {
      // botón editar tiene clase text-blue-600 en tu componente
      cy.get('button.text-blue-600').first().click({ force: true })
    })

    // Esperar modal y editar campos
    cy.get('[data-cy="input-nombre-edit"]').should('be.visible').clear().type('Juan Carlos')
    cy.get('[data-cy="input-apellido-edit"]').should('be.visible').clear().type('Pérez')

    // Guardar
    cy.get('button').contains(/guardar|actualizar|save/i).click()

    // Esperar respuesta y que la UI muestre el nuevo nombre
    cy.wait('@updateStudent')
    cy.wait('@getStudentsAfterUpdate')
    cy.contains('Juan Carlos').should('be.visible')
  })

  it('Eliminar estudiante lo remueve de la lista', () => {
  // 1) Intercept GET que devuelve la lista CON Ana (solo esta intercept)
  cy.intercept({ method: 'GET', url: '**/admin/estudiantes*', times: 1 }, {
    statusCode: 200,
    body: [
      { id_usuario: 301, nombre: 'Andrés', apellido: 'Torres', numero_documento: '321', tipo_documento: 'CC', correo: 'andres.torres@test.com', grado: '11', curso: 'B', jornada: 'mañana', direccion: 'C/10', is_active: true },
      { id_usuario: 302, nombre: 'Ana',    apellido: 'Pineda',  numero_documento: '1001', tipo_documento: 'CC', correo: 'ana.pineda@test.com',    grado: '10', curso: 'A', jornada: 'mañana', direccion: 'C/1',  is_active: true },
      { id_usuario: 303, nombre: 'Pedro',  apellido: 'Santos',  numero_documento: '1002', tipo_documento: 'CC', correo: 'pedro.santos@test.com',  grado: '10', curso: 'B', jornada: 'tarde',  direccion: 'C/2',  is_active: true }
    ]
  }).as('getStudentsWithAna')

  // 2) Intercept DELETE para el id de Ana (ruta exacta)
  cy.intercept({ method: 'DELETE', url: '**/admin/estudiantes/302', times: 1 }, {
    statusCode: 200,
    body: { message: 'Estudiante eliminado' }
  }).as('deleteAna')

  // 3) Intercept GET posterior que devuelve lista SIN Ana
  cy.intercept({ method: 'GET', url: '**/admin/estudiantes*', times: 1 }, {
    statusCode: 200,
    body: [
      { id_usuario: 301, nombre: 'Andrés', apellido: 'Torres', numero_documento: '321', tipo_documento: 'CC', correo: 'andres.torres@test.com', grado: '11', curso: 'B', jornada: 'mañana', direccion: 'C/10', is_active: true },
      { id_usuario: 303, nombre: 'Pedro',  apellido: 'Santos',  numero_documento: '1002', tipo_documento: 'CC', correo: 'pedro.santos@test.com',  grado: '10', curso: 'B', jornada: 'tarde',  direccion: 'C/2',  is_active: true }
    ]
  }).as('getStudentsAfterDeleteAna')

  // 4) Visitar la página de estudiantes (asegura que las intercepts definidas arriba capten la primera petición)
  cy.visit('/dashboard/estudiantes')

  // 5) Esperar la carga inicial con Ana
  cy.wait('@getStudentsWithAna', { timeout: 10000 })
  cy.get('[data-cy="student-list"]', { timeout: 10000 }).should('exist')
  cy.contains('Ana', { timeout: 10000 }).should('be.visible')

  // 6) Click borrar en la fila de Ana
  cy.contains('Ana').closest('tr').within(() => {
    cy.get('[data-cy="btn-delete-row"]').click()
  })

  // 7) Confirm modal visible y confirmar
  cy.get('[data-cy="modal-confirm"]').should('be.visible')
  cy.get('[data-cy="btn-confirm"]').click()

  // 8) Esperar DELETE y GET posterior
  cy.wait('@deleteAna', { timeout: 10000 })
  cy.wait('@getStudentsAfterDeleteAna', { timeout: 10000 })

})





  it('Cambiar estado de estudiante', () => {
    // Mock GET con un estudiante activo
    cy.intercept('GET', '**/admin/estudiantes*', {
      statusCode: 200,
      body: [
        { id_usuario: 321, nombre: 'Andrés', apellido: 'Torres', numero_documento: '321', correo: 'andres@test.com', is_active: true }
      ]
    }).as('getStudentsForToggle')

    // Mock PUT para estado
    cy.intercept('PUT', '**/admin/estudiantes/*', {
      statusCode: 200,
      body: { message: 'Estado actualizado' }
    }).as('updateStatus')

    // Forzar lista y asegurar que Andrés esté visible
    cy.get('[data-cy="btn-search"]').click()
    cy.get('[data-cy="student-list"]').should('exist')
    cy.contains('Andrés').should('be.visible')

    // Hacer click en toggle en la fila (abrimos confirm modal)
    cy.contains('Andrés').closest('tr').within(() => {
      // el botón toggle tiene title 'Inactivar' cuando está activo
      cy.get('button[title="Inactivar"]').first().click({ force: true })
    })

    // aceptar confirm si aparece (tu componente muestra modal con Confirmar)
    cy.contains('Inactivar Estudiante').should('be.visible')
    cy.get('button').contains(/^Confirmar$/i).click({ force: true })

    // esperar petición y ver mensaje de éxito (toast) o cambio en UI
    cy.wait('@updateStatus')
    cy.contains(/inactivado|estado actualizado|reactivado|éxito/i, { timeout: 3000 }).should('exist')
  })
})
