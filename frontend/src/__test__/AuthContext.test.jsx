import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'

const mockPost = vi.fn()
const mockGet = vi.fn()

vi.mock('../api/axios', () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}))

// Mock de localStorage
const localStorageMock = {
  store: {},
  getItem(key) { return this.store[key] || null },
  setItem(key, value) { this.store[key] = value },
  removeItem(key) { delete this.store[key] },
  clear() { this.store = {} }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Componente de prueba
function TestComponent() {
  const { user, login, logout, loading } = useAuth()
  
  if (loading) return <div>Cargando...</div>
  
  return (
    <div>
      {user ? (
        <>
          <span data-testid="user-name">Logueado: {user.first_name}</span>
          <span data-testid="user-role">Rol: {user.role}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <span data-testid="no-user">No logueado</span>
          <button onClick={() => login('test@test.com', 'password123')}>
            Iniciar sesión
          </button>
        </>
      )}
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('inicia sin usuario autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('no-user')).toBeInTheDocument()
  })

  it('login exitoso almacena token y usuario', async () => {
    // Mock login
    mockPost.mockResolvedValueOnce({
      data: { access: 'fake-access-token', refresh: 'fake-refresh-token' }
    })
    
    // Mock perfil
    mockGet.mockResolvedValueOnce({
      data: { 
        id: 1, 
        email: 'test@test.com', 
        first_name: 'Juan', 
        last_name: 'Pérez',
        role: 'client' 
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    fireEvent.click(screen.getByText('Iniciar sesión'))

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Juan')
    })

    expect(screen.getByTestId('user-role')).toHaveTextContent('client')
    expect(localStorageMock.getItem('access_token')).toBe('fake-access-token')
  })

  it('logout limpia localStorage y estado', async () => {
    // Simular usuario logueado
    localStorageMock.setItem('access_token', 'existing-token')

    mockGet.mockResolvedValueOnce({
      data: { 
        id: 1, 
        email: 'test@test.com', 
        first_name: 'Juan', 
        role: 'client' 
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Juan')
    })

    fireEvent.click(screen.getByText('Cerrar sesión'))

    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument()
    })

    expect(localStorageMock.getItem('access_token')).toBeNull()
  })

  it('login fallido no loguea al usuario', async () => {
    // Mock de error
    mockPost.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: 'Credenciales inválidas' }
      }
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    fireEvent.click(screen.getByText('Iniciar sesión'))

    // Esperar a que se procese el error
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled()
    })

    // El usuario sigue sin loguear
    expect(screen.getByTestId('no-user')).toBeInTheDocument()
  })
})