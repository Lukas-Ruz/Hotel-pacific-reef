import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RoomCard from '../components/RoomCard'

const mockRoom = {
  id: 1,
  name: 'Habitación Turista 201',
  category: 'tourist',
  price_daily: 80,
  capacity: 2,
  description: 'Habitación cómoda con vista al jardín',
  images: ['http://test.com/img.jpg'],
  features: ['WiFi', 'A/C']
}

describe('RoomCard', () => {
  it('renderiza información de la habitación', () => {
    render(
      <BrowserRouter>
        <RoomCard room={mockRoom} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Habitación Turista 201')).toBeInTheDocument()
    expect(screen.getByText('2 personas')).toBeInTheDocument()
    expect(screen.getByText('Ver detalles')).toBeInTheDocument()
  })

  it('muestra badge de categoría correcta', () => {
    render(
      <BrowserRouter>
        <RoomCard room={mockRoom} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Turista')).toBeInTheDocument()
  })
})