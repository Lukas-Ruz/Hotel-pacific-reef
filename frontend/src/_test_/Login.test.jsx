import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Login'

// Mock de la API
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn((url) => {
      if (url === '/auth/login/') {
        return Promise.resolve({
          data: { access: 'fake-token', refresh: 'fake-refresh' }
        })
      }
      if (url === '/auth/profile/') {
        return Promise.resolve({
          data: { id: 1, email: 'test@test.com', first_name: 'Test', role: 'client' }
        })
      }
    })
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
  it('muestra el formulario de login', () => {
    renderLogin()
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('muestra error con credenciales inválidas', async () => {
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('tu@email.com')
    const submitButton = screen.getByText('Iniciar sesión')
    
    fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/incorrectos/i)).toBeInTheDocument()
    })
  })
})