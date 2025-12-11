// src/tests/setupTest.ts
import '@testing-library/jest-dom'
import 'whatwg-fetch'

import { configure } from '@testing-library/react'
import { server } from './msw/server'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Usar data-cy como atributo de testId (igual que en Cypress)
configure({ testIdAttribute: 'data-cy' })

// MSW: servidor de mocks para peticiones HTTP (por si luego lo usas)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
