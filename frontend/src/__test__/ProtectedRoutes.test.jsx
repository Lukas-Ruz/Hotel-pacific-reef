import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  
  return children
}

import { useAuth } from '../context/AuthContext'

const renderWithAuth = (user, initialRoute = '/admin') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthContext.Provider value={{ 
        user, 
        login: vi.fn(), 
        logout: vi.fn(),
        loading: false 
      }}>
        <Routes>
          <Route path="/login" element={<div>Página de Login</div>} />
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <div>Panel Admin</div>
            </PrivateRoute>
          } />
          <Route path="/employee" element={
            <PrivateRoute allowedRoles={['employee', 'admin']}>
              <div>Panel Empleado</div>
            </PrivateRoute>
          } />
          <Route path="/rooms" element={
            <PrivateRoute allowedRoles={['client', 'employee', 'admin']}>
              <div>Lista de Habitaciones</div>
            </PrivateRoute>
          } />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Rutas Protegidas', () => {
  it('redirige a login si no está autenticado', () => {
    renderWithAuth(null)
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  it('permite acceso a admin con rol admin', () => {
    renderWithAuth({ 
      id: 1, 
      email: 'admin@test.com', 
      role: 'admin', 
      first_name: 'Admin' 
    })
    expect(screen.getByText('Panel Admin')).toBeInTheDocument()
  })

  it('bloquea acceso a admin si es cliente', () => {
    renderWithAuth({ 
      id: 2, 
      email: 'client@test.com', 
      role: 'client', 
      first_name: 'Cliente' 
    })
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  it('permite acceso a empleado con rol employee', () => {
    renderWithAuth({ 
      id: 3, 
      email: 'emp@test.com', 
      role: 'employee', 
      first_name: 'Empleado' 
    }, '/employee')
    expect(screen.getByText('Panel Empleado')).toBeInTheDocument()
  })

  it('permite acceso a cliente en rutas públicas autenticadas', () => {
    renderWithAuth({ 
      id: 2, 
      email: 'client@test.com', 
      role: 'client', 
      first_name: 'Cliente' 
    }, '/rooms')
    expect(screen.getByText('Lista de Habitaciones')).toBeInTheDocument()
  })

  it('admin puede acceder a rutas de empleado también', () => {
    renderWithAuth({ 
      id: 1, 
      email: 'admin@test.com', 
      role: 'admin', 
      first_name: 'Admin' 
    }, '/employee')
    expect(screen.getByText('Panel Empleado')).toBeInTheDocument()
  })
})