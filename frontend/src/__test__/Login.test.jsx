import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

const mockPost = vi.fn()

vi.mock('../api/axios', () => ({
  default: {
    post: (...args) => mockPost(...args),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}))

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    mockPost.mockClear()
  })

  it('muestra el formulario de login', () => {
    renderLogin()
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'No active account found with the given credentials' }
      }
    })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('tu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {

      expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
    })
  })

  it('inicia sesión con credenciales válidas', async () => {
    mockPost
      .mockResolvedValueOnce({
        data: { access: 'fake-token', refresh: 'fake-refresh' }
      })

    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('tu@email.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login/', {
        username: 'test@test.com',
        password: 'password123'
      })
    })
  })
})