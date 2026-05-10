import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../pages/Register'

const mockPost = vi.fn()

vi.mock('../api/axios', () => ({
  default: {
    post: (...args) => mockPost(...args),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

const fillForm = (data) => {
  fireEvent.change(screen.getByPlaceholderText('Juan'), { 
    target: { value: data.first_name || '' } 
  })
  fireEvent.change(screen.getByPlaceholderText('Pérez'), { 
    target: { value: data.last_name || '' } 
  })
  fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { 
    target: { value: data.email || '' } 
  })
  fireEvent.change(screen.getByPlaceholderText('+52 123 456 7890'), { 
    target: { value: data.phone || '' } 
  })
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { 
    target: { value: data.password || '' } 
  })
  fireEvent.change(screen.getByPlaceholderText('Repite tu contraseña'), { 
    target: { value: data.confirmPassword || '' } 
  })
}

describe('Registro - Validaciones', () => {
  beforeEach(() => {
    mockPost.mockClear()
  })

  it('muestra error si contraseñas no coinciden', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fillForm({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'test@test.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'otrapass123'
    })

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    })
  })

  it('muestra error si contraseña es muy corta', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fillForm({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'test@test.com',
      phone: '+123456789',
      password: '123',
      confirmPassword: '123'
    })

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('muestra error si email ya existe', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { email: ['Este correo ya está registrado'] }
      }
    })

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fillForm({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'existente@test.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'password123'
    })

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/ya está registrado/i)).toBeInTheDocument()
    })
  })

  it('muestra error si campos obligatorios faltan', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('tu@email.com')
      expect(emailInput).toBeInvalid()
    })
  })

  it('registro exitoso muestra mensaje de éxito', async () => {
    mockPost.mockResolvedValueOnce({
      status: 201,
      data: { id: 1, email: 'nuevo@test.com' }
    })

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    )

    fillForm({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'nuevo@test.com',
      phone: '+123456789',
      password: 'password123',
      confirmPassword: 'password123'
    })

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /registro exitoso/i })).toBeInTheDocument()
    })
  })
})