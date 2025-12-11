/// <reference types="cypress" />

// Support para Cypress Component Testing
import { mount } from 'cypress/react'

// ⬇⬇ IMPORTA LOS ESTILOS DE TU APP ⬇⬇
import '../../src/index.css'
import '../../src/App.css'
// si tienes más CSS global, impórtalo igual

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

// Registramos comando global `cy.mount`
Cypress.Commands.add('mount', mount)

export {}
