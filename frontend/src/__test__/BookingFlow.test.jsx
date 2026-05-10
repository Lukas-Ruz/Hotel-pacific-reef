import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'

const mockGet = vi.fn()

vi.mock('../api/axios', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}))

describe('Home', () => {
  beforeEach(() => {
    mockGet.mockClear()
  })

  it('carga habitaciones destacadas', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        { 
          id: 1, 
          name: 'Habitación Turista 201', 
          category: 'tourist', 
          price_daily: 80, 
          capacity: 2, 
          description: 'Habitación cómoda', 
          images: ['http://test.com/img.jpg'], 
          features: ['WiFi'] 
        }
      ]
    })

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Habitación Turista 201')).toBeInTheDocument()
    })
  })
})