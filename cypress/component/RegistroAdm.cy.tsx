/// <reference types="cypress" />

import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { mount } from 'cypress/react'   // 👈 CAMBIO: antes 'cypress/react18'

// Componente real
import RegistroAdm from '../../src/components/auth/RegisterForm'

// Montar el componente dentro de un Router de prueba
const montarPantallaRegistro = () => {
  mount(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<RegistroAdm />} />
        {/* Ruta fake para simular navegación al login */}
        <Route
          path="/login"
          element={<div data-testid="pantalla-login">Pantalla de login</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

// 🔹 Helper: llena el formulario dejando CIUDAD y DEPARTAMENTO vacíos
const llenarFormularioSinCiudadYDepto = () => {
  cy.get('input[name="nombre_institucion"]').type('Institución Educativa ZAVIRA', { delay: 80 })
  cy.get('input[name="codigo_dane"]').type('1234567890', { delay: 80 })
  // Ciudad y Departamento se dejan vacíos a propósito
  cy.get('input[name="direccion"]').type('Calle 123 #45-67', { delay: 80 })
  cy.get('input[name="telefono"]').type('3001234567', { delay: 80 })
  cy.get('input[name="correo"]').type('admin@zavira.edu.co', { delay: 80 })

  cy.contains('button', /Seleccione la jornada|Mañana|Tarde|Completa/i).click()
  cy.contains('li', 'Mañana').click()

  cy.get('input[name="password"]').type('secreto123', { delay: 80 })
  cy.get('input[name="confirm_password"]').type('secreto123', { delay: 80 })
}

describe('Pantalla <RegistroAdm />', () => {
  it('NO permite enviar si hay campos requeridos vacíos (ej: ciudad / departamento)', () => {
    montarPantallaRegistro()

    // Stub de fetch para asegurarnos de que NO se llama
    cy.window().then((win) => {
      cy.stub(win as any, 'fetch').as('fetchStub')
    })

    llenarFormularioSinCiudadYDepto()
    cy.wait(400) // sólo para ver el llenado en el runner

    cy.contains('button', 'Registrar Institución').click()

    // Como faltan campos required, el submit se bloquea y no se llama fetch
    cy.get('@fetchStub').should('not.have.been.called')

    // Extra: revisar que el navegador marca los campos como inválidos
    cy.get('input[name="ciudad"]').then(($input) => {
      const el = $input[0] as HTMLInputElement
      expect(el.checkValidity()).to.be.false
    })
    cy.get('input[name="departamento"]').then(($input) => {
      const el = $input[0] as HTMLInputElement
      expect(el.checkValidity()).to.be.false
    })
  })
})
