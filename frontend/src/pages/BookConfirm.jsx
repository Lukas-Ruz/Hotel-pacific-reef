import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BookingConfirm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Redirigir si no hay datos de reserva
  if (!state?.room) {
    navigate('/rooms');
    return null;
  }

  const { room, checkIn, checkOut, days, total } = state;
  const advance = total * 0.30;
  const balance = total - advance;

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulación de pasarela de pago (3 segundos)
      await new Promise(r => setTimeout(r, 2000));
      
      // Crear reserva en backend
      const response = await api.post('/reservations/create/', {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut
      });
      
      // Navegar a confirmación con QR
      navigate('/booking/success', {
        state: { reservation: response.data }
      });
      
    } catch (error) {
      alert('Error procesando reserva: ' + (error.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ocean-900 mb-6">Confirmar Reserva</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Detalles de la estadía</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Habitación</p>
            <p className="font-medium">{room.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Huésped</p>
            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Entrada</p>
            <p className="font-medium">{checkIn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Salida</p>
            <p className="font-medium">{checkOut}</p>
          </div>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>{days} noches x ${room.price_daily}</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Anticipo requerido (30%)</span>
            <span>${advance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Saldo al check-in (70%)</span>
            <span>${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Simulación de Pasarela de Pago */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">SIMULADO</span>
          Pago con Tarjeta
        </h3>
        
        <div className="space-y-4 opacity-75">
          <div>
            <label className="block text-sm font-medium mb-1">Número de tarjeta</label>
            <input type="text" value="**** **** **** 4242" disabled className="w-full p-2 border rounded bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vencimiento</label>
              <input type="text" value="12/25" disabled className="w-full p-2 border rounded bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input type="text" value="***" disabled className="w-full p-2 border rounded bg-white" />
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          * En producción esto conectaría con Stripe/PayPal. 
          Para el prototipo, haz clic en "Pagar" para simular un pago exitoso.
        </p>
      </div>

      <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full btn-primary py-4 text-lg flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Procesando...
          </>
        ) : (
          `Pagar Anticipo $${advance.toFixed(2)}`
        )}
      </button>
      
      <button 
        onClick={() => navigate(-1)}
        className="w-full mt-3 text-gray-600 hover:text-gray-800"
      >
        Cancelar y volver
      </button>
    </div>
  );
};

export default BookingConfirm;