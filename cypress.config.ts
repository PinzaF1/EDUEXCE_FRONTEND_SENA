import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
    // Configuración de timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Patrón de archivos de test
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Variables de entorno
    env: {
      // ⚠️ IMPORTANTE: Usar backend de TESTING, NO producción
      // Esta URL debe configurarse en .env.testing
      apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
      // ⚠️ CAMBIAR: Credenciales deben estar en variables de entorno
      testEmail: process.env.TEST_EMAIL || 'test@example.com',
      testPassword: process.env.TEST_PASSWORD || 'test123456'
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})
