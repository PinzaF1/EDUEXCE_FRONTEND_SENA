/// <reference types="cypress" />

// ***********************************************************
// Este archivo se carga automáticamente antes de los tests E2E.
// Buen lugar para configuración global y behavior de Cypress.
// ***********************************************************

// Importa comandos personalizados
import './commands'
import 'cypress-file-upload'

// Desactivar excepciones no capturadas para evitar falsos positivos
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})
