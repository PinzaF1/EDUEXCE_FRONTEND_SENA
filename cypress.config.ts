// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  // 🔹 TESTS E2E
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config
    },

    // Configuración de timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Patrón de archivos de test E2E
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Variables de entorno
    env: {
      // ⚠️ IMPORTANTE: Usar backend de TESTING, NO producción
      apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
      // ⚠️ Credenciales deben venir de variables de entorno
      testEmail: process.env.TEST_EMAIL || 'test@example.com',
      testPassword: process.env.TEST_PASSWORD || 'test123456',
    },

    // Soporte E2E (usa el archivo de abajo)
    supportFile: 'cypress/support/e2e.ts',
  },

  // 🔹 TESTS DE COMPONENTE (Cypress Component Testing + Vite)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',        // aquí es donde entra Vite
    },

    //  tamaño de la “pantalla” en Component Testing
    viewportWidth: 1280,
    viewportHeight: 720,

    // Carpeta para tus tests de componentes
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',

    // Soporte de component testing
    supportFile: 'cypress/support/component.ts',
  },
})
