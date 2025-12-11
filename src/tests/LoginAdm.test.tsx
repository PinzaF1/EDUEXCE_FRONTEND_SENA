// src/tests/LoginAdm.test.tsx
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, beforeEach, expect, vi } from 'vitest'

import LoginForm from '@/components/auth/LoginForm'

// 🔹 Mock del hook useAuth para NO llamar a la API real
const mockLogin = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

// Helper: renderizar el login dentro de un MemoryRouter
const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )

// Helper: llenar el formulario y hacer submit
const llenarYEnviar = async (email: string, password: string) => {
  // 👇 aquí ponemos el delay global
  const user = userEvent.setup({ delay: 40 })

  // Gracias a configure({ testIdAttribute: 'data-cy' }) podemos usar getByTestId
  const emailInput = screen.getByTestId('input-email') as HTMLInputElement
  const passwordInput = screen.getByTestId('input-password') as HTMLInputElement
  const submitButton = screen.getByTestId('btn-login-submit') as HTMLButtonElement

  await user.clear(emailInput)
  await user.type(emailInput, email)

  await user.clear(passwordInput)
  await user.type(passwordInput, password)

  await user.click(submitButton)
}

describe('Login de Institución (<LoginForm />)', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    window.localStorage.clear()
  })

  it('muestra mensaje de error cuando las credenciales son inválidas (NO login exitoso)', async () => {
    renderLogin()

    // Simulamos que el hook useAuth.login lanza error
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'))

    await llenarYEnviar('admin@zavira.edu.co', 'clave-mala')

    // Se llamó al hook con los datos del formulario
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith('admin@zavira.edu.co', 'clave-mala')

    // El componente muestra el mensaje normalizado
    await waitFor(() => {
      const alerta = screen.getByRole('alert')
      expect(alerta).toHaveTextContent(/credenciales incorrectas/i)
    })
  })

  it('guarda token en localStorage cuando el login es exitoso', async () => {
    renderLogin()

    // Respuesta exitosa simulada del login
    mockLogin.mockResolvedValueOnce({
      token: 'token-de-prueba',
      institucion: {
        id_institucion: 123,
        nombre_institucion: 'Institución Educativa ZAVIRA',
      },
      rol: 'admin',
    })

    await llenarYEnviar('admin@zavira.edu.co', 'secreto123')

    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockLogin).toHaveBeenCalledWith('admin@zavira.edu.co', 'secreto123')

    // El componente intenta guardar el token si no existía
    await waitFor(() => {
      expect(window.localStorage.getItem('token')).toBe('token-de-prueba')
    })
  })
})
