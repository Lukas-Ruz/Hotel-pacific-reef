import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

// Mock de axios
const mockPost = vi.fn()
vi.mock('../api/axios', () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
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
    localStorage.clear()
  })

  it('muestra el formulario de login', () => {
    renderLogin()
    
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    
    // Botón con matcher case-insensitive
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    // Configurar mock para fallar
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
    
    // Esperar a que aparezca el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/incorrectos|inválidas|No active account/i)).toBeInTheDocument()
    })
  })
})