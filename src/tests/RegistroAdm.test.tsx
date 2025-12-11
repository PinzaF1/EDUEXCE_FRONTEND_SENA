// src/tests/RegistroAdm.test.tsx
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, afterEach, expect, vi } from 'vitest'

import RegistroAdm from '@/components/auth/RegisterForm'

// Render dentro de un router de memoria (como en los tests de Cypress)
const renderRegistro = () =>
  render(
    <MemoryRouter initialEntries={['/registro']}>
      <RegistroAdm />
    </MemoryRouter>
  )

// Rellena el formulario con datos válidos (igual que en el componente)
const llenarFormularioCompleto = async () => {
  const user = userEvent.setup()

  await user.type(
    screen.getByPlaceholderText(/Institución Educativa San José/i),
    'Institución Educativa ZAVIRA'
  )

  await user.type(screen.getByPlaceholderText(/111000100123/i), '1234567890')

  await user.type(screen.getByPlaceholderText(/Ej: Bogotá/i), 'Bogotá')

  await user.type(screen.getByPlaceholderText(/Ej: Cundinamarca/i), 'Cundinamarca')

  await user.type(screen.getByPlaceholderText(/Calle 123 #45-67/i), 'Calle 123 #45-67')

  await user.type(screen.getByPlaceholderText(/3001234567/i), '3001234567')

  await user.type(
    screen.getByPlaceholderText(/admin@institucion\.edu\.co/i),
    'admin@zavira.edu.co'
  )

  // Jornada
  await user.click(
    screen.getByRole('button', {
      name: /Seleccione la jornada|Mañana|Tarde|Completa/i,
    })
  )
  await user.click(screen.getByRole('option', { name: /Mañana/i }))
}

describe('Formulario de Registro de Institución (<RegistroAdm />)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('NO llama a la API cuando las contraseñas no coinciden y muestra mensaje de error', async () => {
    const user = userEvent.setup()

    const fetchMock = vi.fn()
    // Sobrescribimos fetch global SOLO en este test
    ;(globalThis as any).fetch = fetchMock

    renderRegistro()
    await llenarFormularioCompleto()

    // Contraseñas distintas
    await user.type(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), 'secreto123')
    await user.type(
      screen.getByPlaceholderText(/Repita la contraseña/i),
      'otroSecreto456'
    )

    await user.click(
      screen.getByRole('button', { name: /Registrar Institución/i })
    )

    // mensaje de error
    expect(
      await screen.findByText(/Las contraseñas no coinciden/i)
    ).toBeInTheDocument()

    // No se llama la API
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('Llama a la API y muestra mensaje de éxito cuando todo es válido', async () => {
    const user = userEvent.setup()

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        institucion: {
          nombre_institucion: 'Institución Educativa ZAVIRA',
          id_institucion: 123,
        },
      }),
    } as any)

    // Sobrescribimos fetch global SOLO aquí
    ;(globalThis as any).fetch = fetchMock

    renderRegistro()
    await llenarFormularioCompleto()

    await user.type(screen.getByPlaceholderText(/Mínimo 6 caracteres/i), 'secreto123')
    await user.type(
      screen.getByPlaceholderText(/Repita la contraseña/i),
      'secreto123'
    )

    await user.click(
      screen.getByRole('button', { name: /Registrar Institución/i })
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    expect(
      await screen.findByText(
        /✓ Institución registrada correctamente\. Redirigiendo al login/i
      )
    ).toBeInTheDocument()
  })
})
