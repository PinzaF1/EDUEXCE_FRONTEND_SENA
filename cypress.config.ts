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
      apiUrl: 'https://zavira-v8.onrender.com',
      // Credenciales de prueba (cambiar por las reales para testing)
      testEmail: 'test@example.com',
      testPassword: 'test123456'
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})
